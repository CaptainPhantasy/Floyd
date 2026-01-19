/**
 * FloydDesktop - MCP Servers Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { MCPServerUIConfig } from '../types';

export function useMCPServers() {
  const [servers, setServers] = useState<MCPServerUIConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadServers = useCallback(async () => {
    if (!window.floydAPI?.getSettings) return;

    setIsLoading(true);
    try {
      const settings = await window.floydAPI.getSettings();
      const mcpServers = (settings.mcpServers as Record<string, unknown>) || {};
      
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  return {
    servers,
    isLoading,
    reload: loadServers,
  };
}
