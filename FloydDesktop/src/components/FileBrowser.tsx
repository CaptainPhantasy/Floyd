/**
 * FloydDesktop - File Browser Component
 * 
 * Tree view of project files with expand/collapse
 */

import { useState, useEffect } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { cn } from '../lib/utils';
import type { FileNode } from '../types';
import { File, Folder, FolderOpen, Search, Plus, Copy, ExternalLink } from 'lucide-react';

interface FileBrowserProps {
  projectPath?: string;
  onFileSelect?: (path: string) => void;
  onAddToContext?: (path: string) => void;
  onDragFile?: (path: string) => void;
}

export function FileBrowser({ projectPath, onFileSelect, onAddToContext, onDragFile }: FileBrowserProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (projectPath) {
      loadFileTree(projectPath);
    } else {
      setFileTree([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectPath]);

  const loadFileTree = async (dirPath: string) => {
    if (!window.floydAPI?.listFiles) return;
    
    try {
      const result = await window.floydAPI.listFiles(dirPath);
      if (result.success && result.files) {
        const files = result.files as FileNode[];
        // Add expanded flag and ensure children array exists for directories
        const tree = files.map((file) => ({
          ...file,
          expanded: false,
          children: file.type === 'directory' ? (file.children || []) : undefined,
        }));
        setFileTree(tree);
      } else {
        setFileTree([]);
      }
    } catch (error) {
      console.error('Failed to load file tree:', error);
      setFileTree([]);
    }
  };

  const loadDirectoryChildren = async (dirPath: string): Promise<FileNode[]> => {
    if (!window.floydAPI?.listFiles) return [];
    
    try {
      const result = await window.floydAPI.listFiles(dirPath);
      if (result.success && result.files) {
        return (result.files as FileNode[]).map((file) => ({
          ...file,
          expanded: false,
          children: file.type === 'directory' ? (file.children || []) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load directory children:', error);
    }
    return [];
  };

  const toggleExpand = async (nodePath: string) => {
    const isExpanded = expandedPaths.has(nodePath);
    
    if (!isExpanded) {
      // Expanding - load children if not already loaded
      setExpandedPaths((prev) => new Set(prev).add(nodePath));
      
      // Find the node and check if it needs children loaded
      const findAndLoadChildren = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.path === nodePath && node.type === 'directory') {
            // If children are empty array, load them
            if (node.children && node.children.length === 0 && window.floydAPI?.listFiles) {
              // Load children asynchronously
              loadDirectoryChildren(nodePath).then((children) => {
                setFileTree((prevTree) => {
                  const updateNodeChildren = (nodes: FileNode[]): FileNode[] => {
                    return nodes.map((n) => {
                      if (n.path === nodePath) {
                        return { ...n, children: children.length > 0 ? children : undefined };
                      }
                      if (n.children) {
                        return { ...n, children: updateNodeChildren(n.children) };
                      }
                      return n;
                    });
                  };
                  return updateNodeChildren(prevTree);
                });
              });
            }
            return node;
          }
          if (node.children) {
            return { ...node, children: findAndLoadChildren(node.children) };
          }
          return node;
        });
      };
      
      setFileTree(findAndLoadChildren(fileTree));
    } else {
      // Collapsing
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        next.delete(nodePath);
        return next;
      });
    }
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const handleOpenInSystem = (path: string) => {
    // TODO: Implement IPC handler to open file in system default app
    console.log('Open in system:', path);
  };

  const renderFileNode = (node: FileNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const indent = depth * 16;

    return (
      <ContextMenu.Root key={node.path}>
        <ContextMenu.Trigger asChild>
          <div
            className={cn(
              'group flex items-center gap-2 px-2 py-1 hover:bg-slate-700/50 rounded cursor-pointer',
              node.type === 'file' && 'hover:bg-sky-600/20'
            )}
            style={{ paddingLeft: `${8 + indent}px` }}
            onClick={async () => {
              if (node.type === 'directory') {
                await toggleExpand(node.path);
              } else {
                onFileSelect?.(node.path);
              }
            }}
            draggable={node.type === 'file'}
            onDragStart={(e) => {
              if (node.type === 'file') {
                e.dataTransfer.setData('text/plain', node.path);
                onDragFile?.(node.path);
              }
            }}
          >
            {node.type === 'directory' ? (
              <>
                {hasChildren ? (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await toggleExpand(node.path);
                    }}
                    className="p-0.5 hover:bg-slate-600 rounded"
                  >
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-sky-400" />
                    ) : (
                      <Folder className="w-4 h-4 text-sky-400" />
                    )}
                  </button>
                ) : (
                  <Folder className="w-4 h-4 text-slate-500" />
                )}
              </>
            ) : (
              <File className="w-4 h-4 text-slate-400 ml-5" />
            )}
            <span className="text-sm truncate flex-1">{node.name}</span>
            {node.type === 'file' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToContext?.(node.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-opacity"
                title="Add to context"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="min-w-[180px] bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1 z-50">
            {node.type === 'file' && (
              <>
                <ContextMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded cursor-pointer"
                  onClick={() => onAddToContext?.(node.path)}
                >
                  <Plus className="w-4 h-4" />
                  Add to context
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded cursor-pointer"
                  onClick={() => handleOpenInSystem(node.path)}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in system
                </ContextMenu.Item>
              </>
            )}
            <ContextMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded cursor-pointer"
              onClick={() => handleCopyPath(node.path)}
            >
              <Copy className="w-4 h-4" />
              Copy path
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
        {node.type === 'directory' && isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </ContextMenu.Root>
    );
  };

  const filteredTree = searchQuery
    ? filterTree(fileTree, searchQuery)
    : fileTree;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {!projectPath ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-slate-400">No project selected</p>
            <p className="text-xs text-slate-500 mt-1">
              Select a project to browse files
            </p>
          </div>
        ) : fileTree.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-slate-400">No files found</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredTree.map((node) => renderFileNode(node))}
          </div>
        )}
      </div>
    </div>
  );
}

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const lowerQuery = query.toLowerCase();
  const result: FileNode[] = [];

  for (const node of nodes) {
    const matches = node.name.toLowerCase().includes(lowerQuery);
    const filteredChildren =
      node.children && node.children.length > 0
        ? filterTree(node.children, query)
        : [];

    if (matches || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
        expanded: true, // Auto-expand filtered results
      });
    }
  }

  return result;
}
