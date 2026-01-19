/**
 * FloydDesktop - Tools Panel Component
 * 
 * Lists available MCP tools grouped by server
 */

import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import type { Tool } from '../types';
import { Wrench, ChevronRight, ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ToolsPanelProps {
  onToolSelect?: (toolName: string) => void;
}

interface ToolGroup {
  server: string;
  tools: Tool[];
  status: 'connected' | 'disconnected' | 'error';
}

export function ToolsPanel({ onToolSelect }: ToolsPanelProps) {
  const [toolGroups, setToolGroups] = useState<ToolGroup[]>([]);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    if (!window.floydAPI?.getToolsByServer) return;

    try {
      const result = await window.floydAPI.getToolsByServer();
      if (result.success && result.toolGroups) {
        const groups = (result.toolGroups as Array<{ server: string; tools: Tool[]; status: string }>).map((group) => ({
          server: group.server,
          tools: group.tools,
          status: group.status as ToolGroup['status'],
        }));
        setToolGroups(groups);
        
        // Auto-expand first server
        if (groups.length > 0 && expandedServers.size === 0) {
          setExpandedServers(new Set([groups[0].server]));
        }
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const toggleServer = (server: string) => {
    setExpandedServers((prev) => {
      const next = new Set(prev);
      if (next.has(server)) {
        next.delete(server);
      } else {
        next.add(server);
      }
      return next;
    });
  };

  const getStatusIcon = (status: ToolGroup['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold">Available Tools</h3>
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-2">
        {toolGroups.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-slate-400">No tools available</p>
            <p className="text-xs text-slate-500 mt-1">
              Configure MCP servers in settings
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {toolGroups.map((group) => {
              const isExpanded = expandedServers.has(group.server);

              return (
                <div key={group.server} className="space-y-1">
                  {/* Server Header */}
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                    onClick={() => toggleServer(group.server)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    {getStatusIcon(group.status)}
                    <span className="text-sm font-medium flex-1 truncate">
                      {group.server}
                    </span>
                    <span className="text-xs text-slate-500">
                      {group.tools.length}
                    </span>
                  </div>

                  {/* Tools under server */}
                  {isExpanded && (
                    <div className="ml-6 space-y-0.5">
                      {group.tools.map((tool) => (
                        <div
                          key={tool.name}
                          className={cn(
                            'px-2 py-1.5 rounded cursor-pointer transition-colors',
                            selectedTool === tool.name
                              ? 'bg-sky-600/20 text-sky-300'
                              : 'hover:bg-slate-700/50 text-slate-300'
                          )}
                          onClick={() => {
                            setSelectedTool(tool.name);
                            onToolSelect?.(tool.name);
                          }}
                        >
                          <div className="text-xs font-medium">{tool.name}</div>
                          {tool.description && (
                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                              {tool.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
