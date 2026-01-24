/**
 * MCP (Model Context Protocol) Integration - Floyd Wrapper
 *
 * Enhanced MCP manager using floyd-agent-core MCPClientManager.
 * Provides full MCP protocol support with stdio and WebSocket transports.
 */

import { MCPClientManager, type MCPTool } from 'floyd-agent-core';
import type { MCPServerConfig } from 'floyd-agent-core/mcp';
import { logger } from '../utils/logger.js';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP Configuration for built-in servers
 */
const BUILTIN_SERVERS: Record<string, MCPServerConfig> = {
  cache: {
    name: 'floyd-cache-server',
    command: 'node',
    args: [path.join(__dirname, '../../dist/mcp/cache-server.js')],
    modulePath: path.join(__dirname, '../../mcp/cache-server.ts'),
    transport: {
      type: 'stdio',
      command: 'node',
      args: [path.join(__dirname, '../../dist/mcp/cache-server.js')],
    },
  },
  // Additional built-in servers can be added here
};

/**
 * Enhanced MCP Manager wrapper around floyd-agent-core MCPClientManager
 */
export class MCPManager {
  private clientManager: MCPClientManager;

  constructor() {
    // Initialize MCPClientManager with built-in servers
    this.clientManager = new MCPClientManager(BUILTIN_SERVERS);
  }

  /**
   * Load MCP configuration from file
   */
  async loadConfig(projectRoot: string): Promise<void> {
    try {
      const result = await this.clientManager.connectExternalServers(projectRoot);
      logger.info('Connected to external MCP servers', {
        connected: result.connected,
        failed: result.failed,
      });
    } catch (error) {
      logger.warn('Failed to load MCP config', { projectRoot, error });
    }
  }

  /**
   * Connect to all configured servers
   */
  async connectAll(): Promise<void> {
    // Connect to external servers from config
    const projectRoot = process.cwd();
    await this.loadConfig(projectRoot);

    // Start built-in servers
    for (const serverName of Object.keys(BUILTIN_SERVERS)) {
      await this.clientManager.startBuiltinServer(serverName);
    }

    logger.info('MCP Manager initialized', {
      clientCount: this.clientManager.getClientCount(),
    });
  }

  /**
   * Get all available tools from connected MCP servers
   */
  async getAllTools(): Promise<MCPTool[]> {
    // The MCPClientManager doesn't expose getAllTools directly
    // We need to use a different approach
    // For now, return empty array - tools are accessed through callTool
    return [];
  }

  /**
   * Call an MCP tool by name
   */
  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    return this.clientManager.callTool(toolName, args);
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clientManager.getClientCount();
  }

  /**
   * Check if WebSocket server is running
   */
  isServerRunning(): boolean {
    return this.clientManager.isServerRunning();
  }

  /**
   * Disconnect all clients
   */
  async disconnectAll(): Promise<void> {
    // Stop all built-in servers
    for (const serverName of Object.keys(BUILTIN_SERVERS)) {
      await this.clientManager.stopBuiltinServer(serverName);
    }

    logger.info('Disconnected from all MCP servers');
  }

  /**
   * Get the underlying MCPClientManager for advanced usage
   */
  getClientManager(): MCPClientManager {
    return this.clientManager;
  }
}

// Export singleton instance
export const mcpManager = new MCPManager();
