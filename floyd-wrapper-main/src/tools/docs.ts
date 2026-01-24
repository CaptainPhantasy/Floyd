/**
 * Tool Documentation System
 *
 * Generates markdown documentation from tool schemas and definitions.
 */

import type { ToolDefinition, ToolCategory } from '../types.js';
import { toolRegistry } from './index.js';

// ============================================================================
// Documentation Types
// ============================================================================

/**
 * Tool documentation format
 */
export interface ToolDocumentation {
  name: string;
  description: string;
  category: string;
  permission: string;
  inputSchema: unknown;
  example?: string;
  relatedTools: string[];
}

// ============================================================================
// Documentation Generator
// ============================================================================

/**
 * Generate documentation for a single tool
 */
export function generateToolDocumentation(tool: ToolDefinition): string {
  const lines: string[] = [];

  // Header
  lines.push(`### \`${tool.name}\``);
  lines.push('');

  // Description
  lines.push(`**Description:** ${tool.description}`);
  lines.push('');

  // Metadata
  lines.push('**Metadata:**');
  lines.push(`- **Category:** ${tool.category}`);
  lines.push(`- **Permission:** ${tool.permission}`);
  lines.push('');

  // Input Schema
  lines.push('**Input Schema:**');
  lines.push('```json');
  lines.push(JSON.stringify(tool.inputSchema, null, 2));
  lines.push('```');
  lines.push('');

  // Example usage (if available)
  if (tool.example) {
    lines.push('**Example Usage:**');
    lines.push('```typescript');
    lines.push(`await toolRegistry.execute('${tool.name}', ${JSON.stringify(tool.example, null, 2)});`);
    lines.push('```');
    lines.push('');
  }

  // Related tools
  const relatedTools = toolRegistry.getByCategory(tool.category)
    .filter(t => t.name !== tool.name)
    .slice(0, 5)
    .map(t => t.name);

  if (relatedTools.length > 0) {
    lines.push('**Related Tools:**');
    relatedTools.forEach(name => {
      lines.push(`- \`${name}\``);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate documentation for all tools in a category
 */
export function generateCategoryDocumentation(category: string): string {
  const tools = toolRegistry.getByCategory(category as ToolCategory);

  if (tools.length === 0) {
    return `## ${category}\n\nNo tools found in this category.\n`;
  }

  const lines: string[] = [];

  // Category header
  lines.push(`## ${category}`);
  lines.push('');
  lines.push(`**Tools in this category:** ${tools.length}`);
  lines.push('');

  // Tool list
  tools.forEach(tool => {
    lines.push(generateToolDocumentation(tool));
  });

  return lines.join('\n');
}

/**
 * Generate documentation for all tools
 */
export function generateAllToolsDocumentation(): string {
  const tools = toolRegistry.getAll();
  const categories = [...new Set(tools.map(t => t.category))];

  const lines: string[] = [];

  // Title
  lines.push('# Floyd Wrapper - Tool Documentation');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`**Total Tools:** ${tools.length}`);
  lines.push('');
  lines.push(`**Categories:** ${categories.length}`);
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('');
  categories.forEach(category => {
    const toolsInCategory = tools.filter(t => t.category === category);
    lines.push(`- [${category}](#${category.toLowerCase().replace(/\s+/g, '-')}) (${toolsInCategory.length} tools)`);
  });
  lines.push('');

  // Category sections
  categories.forEach(category => {
    lines.push(generateCategoryDocumentation(category));
  });

  // Appendix
  lines.push('---');
  lines.push('');
  lines.push('## Appendix');
  lines.push('');

  // Permission Levels
  lines.push('### Permission Levels');
  lines.push('');
  lines.push('- **`none`** - Always allowed, no user confirmation required');
  lines.push('- **`moderate`** - Ask user once per session');
  lines.push('- **`dangerous`** - Ask user for every execution');
  lines.push('');

  // Tool Categories
  lines.push('### Tool Categories');
  lines.push('');
  categories.forEach(category => {
    const toolsInCategory = tools.filter(t => t.category === category);
    lines.push(`- **${category}** (${toolsInCategory.length} tools)`);
  });
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate tool summary as a table
 */
export function generateToolTable(): string {
  const tools = toolRegistry.getAll();

  const lines: string[] = [];

  lines.push('# Available Tools');
  lines.push('');
  lines.push('| Tool | Description | Category | Permission |');
  lines.push('|------|-------------|----------|------------|');

  tools.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  tools.forEach(tool => {
    const description = tool.description.split('\n')[0].slice(0, 60);
    lines.push(
      `| \`${tool.name}\` | ${description} | ${tool.category} | ${tool.permission} |`
    );
  });

  lines.push('');

  return lines.join('\n');
}

/**
 * Generate tool documentation in JSON format
 */
export function generateToolsJSON(): string {
  const tools = toolRegistry.getAll();

  const toolsJSON = tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    category: tool.category,
    permission: tool.permission,
    inputSchema: tool.inputSchema,
    example: tool.example,
  }));

  return JSON.stringify(toolsJSON, null, 2);
}

// ============================================================================
// CLI Helpers
// ============================================================================

/**
 * Format tool list for CLI output
 */
export function formatToolList(category?: string): string {
  const tools = category
    ? toolRegistry.getByCategory(category as ToolCategory)
    : toolRegistry.getAll();

  if (tools.length === 0) {
    return category
      ? `No tools found in category: ${category}`
      : 'No tools registered';
  }

  const lines: string[] = [];

  // Group by category
  if (!category) {
    const categories = [...new Set(tools.map(t => t.category))];
    categories.forEach(cat => {
      const catTools = tools.filter(t => t.category === cat);
      lines.push(`\n${cat}:`);
      catTools.forEach(tool => {
        lines.push(`  ${tool.name.padEnd(30)} ${tool.description.slice(0, 50)}`);
      });
    });
  } else {
    tools.forEach(tool => {
      lines.push(`  ${tool.name.padEnd(30)} ${tool.description.slice(0, 50)}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format single tool details for CLI output
 */
export function formatToolDetails(toolName: string): string {
  const tool = toolRegistry.get(toolName);

  if (!tool) {
    return `Tool not found: ${toolName}`;
  }

  const lines: string[] = [];

  lines.push(`Tool: ${tool.name}`);
  lines.push('');
  lines.push(`Description: ${tool.description}`);
  lines.push(`Category: ${tool.category}`);
  lines.push(`Permission: ${tool.permission}`);
  lines.push('');
  lines.push('Input Schema:');
  lines.push(JSON.stringify(tool.inputSchema, null, 2));

  if (tool.example) {
    lines.push('');
    lines.push('Example:');
    lines.push(JSON.stringify(tool.example, null, 2));
  }

  return lines.join('\n');
}

/**
 * Get list of all categories
 */
export function getCategories(): string[] {
  const tools = toolRegistry.getAll();
  return [...new Set(tools.map(t => t.category))];
}

/**
 * Get statistics about tools
 */
export function getToolStats(): {
  totalTools: number;
  totalCategories: number;
  byCategory: Record<string, number>;
  byPermission: Record<string, number>;
} {
  const tools = toolRegistry.getAll();
  const categories = getCategories();

  const byCategory: Record<string, number> = {};
  const byPermission: Record<string, number> = {};

  tools.forEach(tool => {
    byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
    byPermission[tool.permission] = (byPermission[tool.permission] || 0) + 1;
  });

  return {
    totalTools: tools.length,
    totalCategories: categories.length,
    byCategory,
    byPermission,
  };
}
