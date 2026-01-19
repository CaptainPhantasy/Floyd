/**
 * FloydDesktop - MCP Settings Component
 * 
 * UI for managing MCP server configurations
 */

import { useState, useEffect } from 'react';
import type { MCPServerUIConfig } from '../types';
import { Plus, X, CheckCircle, XCircle, AlertCircle, Play, Settings } from 'lucide-react';

interface MCPSettingsProps {
  onClose?: () => void;
}

export function MCPSettings({ onClose }: MCPSettingsProps) {
  const [servers, setServers] = useState<MCPServerUIConfig[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServer, setNewServer] = useState<Partial<MCPServerUIConfig>>({
    name: '',
    type: 'stdio',
    enabled: true,
    status: 'disconnected',
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    if (!window.floydAPI?.getSettings) return;

    try {
      const settings = await window.floydAPI.getSettings();
      const mcpServers = (settings.mcpServers as Record<string, unknown>) || {};
      
      // Convert to UI config format
      const serverList: MCPServerUIConfig[] = Object.entries(mcpServers).map(([id, config]: [string, unknown]) => {
        const cfg = config as any;
        return {
          id,
          name: cfg.name || id,
          type: cfg.transport?.type || 'stdio',
          enabled: cfg.enabled !== false,
          status: 'disconnected' as const,
          command: cfg.transport?.command,
          args: cfg.transport?.args,
          url: cfg.transport?.url,
          env: cfg.transport?.env,
        };
      });

      setServers(serverList);
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    }
  };

  const handleAddServer = async () => {
    if (!newServer.name || !window.floydAPI?.setSetting) return;

    try {
      const id = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const serverConfig: MCPServerUIConfig = {
        id,
        name: newServer.name!,
        type: newServer.type || 'stdio',
        enabled: newServer.enabled !== false,
        status: 'disconnected',
        command: newServer.command,
        args: newServer.args,
        url: newServer.url,
        env: newServer.env,
      };

      // Save to settings
      const settings = await window.floydAPI.getSettings();
      const mcpServers = (settings.mcpServers as Record<string, unknown>) || {};
      
      mcpServers[id] = {
        name: serverConfig.name,
        enabled: serverConfig.enabled,
        transport: {
          type: serverConfig.type,
          ...(serverConfig.type === 'stdio' && {
            command: serverConfig.command,
            args: serverConfig.args,
            env: serverConfig.env,
          }),
          ...(serverConfig.type === 'websocket' && {
            url: serverConfig.url,
          }),
        },
      };

      await window.floydAPI.setSetting('mcpServers', mcpServers);
      setServers([...servers, serverConfig]);
      setShowAddDialog(false);
      setNewServer({ name: '', type: 'stdio', enabled: true, status: 'disconnected' });
    } catch (error) {
      console.error('Failed to add MCP server:', error);
    }
  };

  const handleToggleServer = async (id: string) => {
    if (!window.floydAPI?.setSetting) return;

    try {
      const server = servers.find((s) => s.id === id);
      if (!server) return;

      const settings = await window.floydAPI.getSettings();
      const mcpServers = (settings.mcpServers as Record<string, unknown>) || {};
      
      if (mcpServers[id]) {
        (mcpServers[id] as any).enabled = !server.enabled;
        await window.floydAPI.setSetting('mcpServers', mcpServers);
        
        setServers(servers.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
      }
    } catch (error) {
      console.error('Failed to toggle MCP server:', error);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (!window.floydAPI?.setSetting) return;

    try {
      const settings = await window.floydAPI.getSettings();
      const mcpServers = (settings.mcpServers as Record<string, unknown>) || {};
      
      delete mcpServers[id];
      await window.floydAPI.setSetting('mcpServers', mcpServers);
      
      setServers(servers.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to delete MCP server:', error);
    }
  };

  const handleTestConnection = async (id: string) => {
    // TODO: Implement connection test
    const server = servers.find((s) => s.id === id);
    if (server) {
      setServers(servers.map((s) => 
        s.id === id ? { ...s, status: 'connected' as const } : s
      ));
    }
  };

  const getStatusIcon = (status: MCPServerUIConfig['status']) => {
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
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold">MCP Server Management</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Server
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 rounded-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Add Server Dialog */}
      {showAddDialog && (
        <div className="p-4 border-b border-slate-700 space-y-3 bg-slate-800/50">
          <div className="text-sm font-medium">Add MCP Server</div>
          <input
            type="text"
            placeholder="Server name"
            value={newServer.name || ''}
            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={newServer.type || 'stdio'}
            onChange={(e) => setNewServer({ ...newServer, type: e.target.value as MCPServerUIConfig['type'] })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="stdio">stdio</option>
            <option value="websocket">WebSocket</option>
            <option value="sse">SSE</option>
          </select>
          {newServer.type === 'stdio' && (
            <>
              <input
                type="text"
                placeholder="Command (e.g., npx @modelcontextprotocol/server-filesystem)"
                value={newServer.command || ''}
                onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </>
          )}
          {newServer.type === 'websocket' && (
            <input
              type="text"
              placeholder="WebSocket URL"
              value={newServer.url || ''}
              onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddServer}
              disabled={!newServer.name}
              className="flex-1 px-3 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddDialog(false);
                setNewServer({ name: '', type: 'stdio', enabled: true, status: 'disconnected' });
              }}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Servers List */}
      <div className="flex-1 overflow-y-auto p-4">
        {servers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400 mb-2">No MCP servers configured</p>
            <p className="text-xs text-slate-500">Add a server to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {servers.map((server) => (
              <div
                key={server.id}
                className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(server.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{server.name}</div>
                      <div className="text-xs text-slate-400">
                        {server.type} • {server.toolCount || 0} tools
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(server.id)}
                      className="p-1.5 hover:bg-slate-700 rounded"
                      title="Test connection"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={server.enabled}
                        onChange={() => handleToggleServer(server.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                    <button
                      onClick={() => handleDeleteServer(server.id)}
                      className="p-1.5 hover:bg-red-600 rounded"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {server.command && (
                  <div className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
                    {server.command} {server.args?.join(' ')}
                  </div>
                )}
                {server.url && (
                  <div className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">
                    {server.url}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
