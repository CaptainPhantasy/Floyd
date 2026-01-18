// Nested TSX Generator - supports hierarchical layouts with children
// This handles specs with nested children arrays for complex layouts

interface NestedNode {
  id: string;
  name: string;
  type: string;
  rect: { x: number; y: number; w: number; h: number };
  style: {
    border: boolean;
    borderStyle: 'single' | 'round' | 'double' | 'bold';
    padding: number;
    color: string;
  };
  content?: { title?: string };
  children?: NestedNode[];
}

interface NestedSpec {
  meta: { name: string; cols: number; rows: number };
  theme: { preset: string };
  nodes: NestedNode[];
}

function getContentPlaceholder(type: string, name: string): string {
  switch (type) {
    case 'list':
      return `<Text dimColor>• Item 1\\n• Item 2\\n• Item 3</Text>`;
    case 'table':
      return `<Text dimColor>ID   STATUS    LAST\\n001  Working   00:42:14\\n002  Idle      00:41:59</Text>`;
    case 'log':
      return `<Text dimColor>[00:42:11] event.started\\n[00:42:12] tool.requested\\n[00:42:13] worker.state</Text>`;
    case 'input':
      return `<Text color="gray">Press Enter to interact...</Text>`;
    case 'header':
      return `<Text bold color="magenta">${name.toUpperCase()}</Text>`;
    case 'status':
      return `<Text>CPU 18% • MEM 7.2GB • Load 0.58</Text>`;
    default:
      return `<Text dimColor>${type.toUpperCase()}</Text>`;
  }
}

function renderNode(node: NestedNode, parentX: number = 0, parentY: number = 0, indent: string = '      '): string {
  const absX = parentX + node.rect.x;
  const absY = parentY + node.rect.y;
  
  // If this is a container (no border, has children), render children directly
  if (!node.style.border && node.children && node.children.length > 0) {
    // Container node - just render children with offset
    let out = `${indent}{/* ${node.name} */}\n`;
    out += `${indent}<Box flexDirection="column" width={${node.rect.w}} height={${node.rect.h}}>\n`;
    
    // Group children by Y position for row layout
    const rows = groupByRows(node.children);
    
    rows.forEach((rowNodes, rowIdx) => {
      const rowHeight = Math.max(...rowNodes.map(n => n.rect.h));
      
      if (rowNodes.length === 1) {
        // Single node in row
        out += renderNode(rowNodes[0], 0, 0, indent + '  ');
      } else {
        // Multiple nodes in row - use flexDirection="row"
        out += `${indent}  <Box flexDirection="row" height={${rowHeight}}>\n`;
        let currentX = 0;
        rowNodes.forEach(child => {
          // Add spacer if needed
          const gap = child.rect.x - currentX;
          if (gap > 0) {
            out += `${indent}    <Box width={${gap}} />\n`;
          }
          out += renderNode(child, 0, 0, indent + '    ');
          currentX = child.rect.x + child.rect.w;
        });
        out += `${indent}  </Box>\n`;
      }
    });
    
    out += `${indent}</Box>\n`;
    return out;
  }
  
  // Leaf node or bordered node - render as Frame
  const hasBorder = node.style.border;
  const title = node.content?.title || '';
  
  let out = `${indent}<Frame\n`;
  out += `${indent}  title="${title}"\n`;
  out += `${indent}  width={${node.rect.w}}\n`;
  out += `${indent}  height={${node.rect.h}}\n`;
  out += `${indent}  color="${node.style.color}"\n`;
  out += `${indent}  border={${hasBorder}}\n`;
  out += `${indent}  borderStyle="${node.style.borderStyle}"\n`;
  out += `${indent}  padding={${node.style.padding}}\n`;
  out += `${indent}>\n`;
  
  // Add content placeholder or recurse into children
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      out += renderNode(child, 0, 0, indent + '  ');
    });
  } else {
    out += `${indent}  ${getContentPlaceholder(node.type, node.name)}\n`;
  }
  
  out += `${indent}</Frame>\n`;
  return out;
}

function groupByRows(nodes: NestedNode[]): NestedNode[][] {
  // Sort by Y then X
  const sorted = [...nodes].sort((a, b) => {
    if (a.rect.y === b.rect.y) return a.rect.x - b.rect.x;
    return a.rect.y - b.rect.y;
  });
  
  const rows: NestedNode[][] = [];
  let currentRow: NestedNode[] = [];
  let currentYEnd = -1;
  
  sorted.forEach(node => {
    if (currentRow.length === 0) {
      currentRow.push(node);
      currentYEnd = node.rect.y + node.rect.h;
    } else if (node.rect.y < currentYEnd) {
      // Overlaps with current row
      currentRow.push(node);
      currentYEnd = Math.max(currentYEnd, node.rect.y + node.rect.h);
    } else {
      // New row
      rows.push(currentRow);
      currentRow = [node];
      currentYEnd = node.rect.y + node.rect.h;
    }
  });
  
  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
}

export function emitNestedTsx(spec: NestedSpec): string {
  const { nodes, meta } = spec;
  
  let out = `import React from 'react';
import { Box, Text } from 'ink';
import { Frame } from './ui/Frame';

/**
 * Generated from: ${meta.name}
 * Dimensions: ${meta.cols}x${meta.rows}
 */
export const MonitorDashboard: React.FC = () => {
  return (
    <Box flexDirection="column" width={${meta.cols}} height={${meta.rows}}>
`;

  // Group top-level nodes by rows
  const rows = groupByRows(nodes);
  
  rows.forEach((rowNodes, rowIdx) => {
    const rowHeight = Math.max(...rowNodes.map(n => n.rect.h));
    
    if (rowNodes.length === 1) {
      out += renderNode(rowNodes[0], 0, 0, '      ');
    } else {
      out += `      <Box flexDirection="row" height={${rowHeight}}>\n`;
      rowNodes.forEach(node => {
        out += renderNode(node, 0, 0, '        ');
      });
      out += `      </Box>\n`;
    }
  });

  out += `    </Box>
  );
};
`;

  return out;
}
