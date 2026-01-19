// MCP Client Manager - Manages connections to MCP servers
// Supports stdio, WebSocket, and SSE transports
// Can load server configuration from .floyd/mcp.json or similar files

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { WebSocketConnectionTransport } from './websocket-transport.js';
import type { MCPTool, MCPResource, MCPCallResult, MCPServerConfig, MCPStdioConfig, MCPWebSocketConfig, MCPConfigFile } from './types.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import execa from 'execa';

export interface MCPClientConfig {
  name: string;
  version: string;
}

export interface StdioServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/**
 * Server status tracking (Bug #29 fix)
 */
export interface ServerStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected?: number;
  lastError?: string;
  toolCount: number;
  reconnectAttempts: number;
}

/**
 * MCP Manager Events
 */
export interface MCPManagerEvents {
  'server:connected': (name: string, toolCount: number) => void;
  'server:disconnected': (name: string, reason: string) => void;
  'server:error': (name: string, error: Error) => void;
  'server:reconnecting': (name: string, attempt: number) => void;
  'tools:changed': () => void;
}

/**
 * MCPClientManager manages multiple MCP client connections
 *
 * Responsibilities:
 * - Hosting a WebSocket server for external MCP clients (e.g., Chrome extension)
 * - Connecting to local MCP servers via stdio
 * - Aggregating tools from all connected clients
 * - Routing tool calls to the appropriate client
 * - Tracking server status (Bug #29 fix)
 * - Automatic reconnection (Bug #30 fix)
 */
export class MCPClientManager extends EventEmitter {
  private clients: Map<string, Client> = new Map();
  private wss: WebSocketServer | null = null;
  private toolToClientMap: Map<string, string> = new Map();
  
  // Bug #29: Server status tracking
  private serverStatus: Map<string, ServerStatus> = new Map();
  private serverConfigs: Map<string, MCPServerConfig> = new Map();
  
  // Bug #30: Reconnection settings
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  // Built-in server management (CLI feature)
  private serverProcesses: Map<string, ReturnType<typeof execa>> = new Map();
  private builtinServers: Record<string, MCPServerConfig> = {};

  constructor(builtinServers: Record<string, MCPServerConfig> = {}) {
    super();
    // Register built-in servers
    this.builtinServers = builtinServers;
    for (const [key, config] of Object.entries(builtinServers)) {
      this.serverConfigs.set(config.name, config);
    }
  }

  /**
   * Register a custom MCP server configuration
   */
  registerServer(config: MCPServerConfig): void {
    this.serverConfigs.set(config.name, config);
    if (config.modulePath) {
      this.builtinServers[config.name] = config;
    }
  }

  /**
   * Unregister a server configuration
   */
  unregisterServer(name: string): void {
    this.serverConfigs.delete(name);
    delete this.builtinServers[name];
  }

  /**
   * Start a WebSocket server for external MCP clients
   *
   * This is used by the Chrome extension to connect to Floyd.
   * The extension acts as an MCP server, and Floyd acts as the client.
   *
   * @param port - Port to listen on (default: 3000)
   */
  async startServer(port: number = 3000): Promise<void> {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', async (ws) => {
      const transport = new WebSocketConnectionTransport(ws);
      const clientId = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      // Bug #29: Initialize server status
      this.serverStatus.set(clientId, {
        name: clientId,
        status: 'connecting',
        toolCount: 0,
        reconnectAttempts: 0,
      });

      const client = new Client(
        {
          name: 'floyd-agent',
          version: '0.1.0',
        },
        {
          capabilities: {
            sampling: {},
          },
        },
      );

      try {
        await client.connect(transport);
        this.clients.set(clientId, client);

        // Cache tool mapping
        await this.updateToolCache(clientId);
        
        // Bug #29: Update status and emit event
        const toolCount = this.getToolCountForClient(clientId);
        this.serverStatus.set(clientId, {
          name: clientId,
          status: 'connected',
          lastConnected: Date.now(),
          toolCount,
          reconnectAttempts: 0,
        });
        this.emit('server:connected', clientId, toolCount);
        this.emit('tools:changed');

        // Bug #22: Handle disconnect properly
        ws.on('close', () => {
          this.handleDisconnect(clientId, 'WebSocket connection closed');
        });

        ws.on('error', (error) => {
          this.handleDisconnect(clientId, error.message);
        });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.serverStatus.set(clientId, {
          name: clientId,
          status: 'error',
          lastError: errorMsg,
          toolCount: 0,
          reconnectAttempts: 0,
        });
        this.emit('server:error', clientId, e instanceof Error ? e : new Error(errorMsg));
        ws.close();
      }
    });

    return new Promise((resolve) => {
      this.wss?.on('listening', () => resolve());
    });
  }

  /**
   * Bug #22: Handle disconnect with proper cleanup and event emission
   */
  private handleDisconnect(clientId: string, reason: string): void {
    this.clients.delete(clientId);
    this.clearToolCache(clientId);
    
    const status = this.serverStatus.get(clientId);
    if (status) {
      status.status = 'disconnected';
      this.serverStatus.set(clientId, status);
    }
    
    this.emit('server:disconnected', clientId, reason);
    this.emit('tools:changed');
    
    // Bug #30: Attempt reconnection if we have the config
    const config = this.serverConfigs.get(clientId);
    if (config) {
      this.attemptReconnect(clientId, config);
    }
  }

  /**
   * Bug #30: Attempt to reconnect to a server
   */
  private attemptReconnect(clientId: string, config: MCPServerConfig): void {
    const status = this.serverStatus.get(clientId);
    if (!status || status.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`[MCP] Max reconnect attempts reached for ${clientId}`);
      return;
    }
    
    // Clear any existing reconnect timer
    const existingTimer = this.reconnectTimers.get(clientId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Exponential backoff
    const delay = this.reconnectDelay * Math.pow(2, status.reconnectAttempts);
    
    status.status = 'connecting';
    status.reconnectAttempts++;
    this.serverStatus.set(clientId, status);
    
    this.emit('server:reconnecting', clientId, status.reconnectAttempts);
    
    const timer = setTimeout(async () => {
      try {
        await this.connectServer(config);
        console.log(`[MCP] Reconnected to ${clientId}`);
      } catch (error) {
        console.error(`[MCP] Reconnect failed for ${clientId}:`, error);
        // Will trigger another reconnect attempt via handleDisconnect
      }
    }, delay);
    
    this.reconnectTimers.set(clientId, timer);
  }

  /**
   * Bug #29: Get the status of all servers
   */
  getServerStatuses(): ServerStatus[] {
    return Array.from(this.serverStatus.values());
  }

  /**
   * Bug #29: Get status of a specific server
   */
  getServerStatus(name: string): ServerStatus | null {
    return this.serverStatus.get(name) || null;
  }

  /**
   * Get tool count for a specific client
   */
  private getToolCountForClient(clientId: string): number {
    let count = 0;
    for (const [, id] of this.toolToClientMap) {
      if (id === clientId) count++;
    }
    return count;
  }

  /**
   * Stop the WebSocket server
   */
  async stopServer(): Promise<void> {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }

  /**
   * Connect to an MCP server via stdio
   *
   * @param name - Unique identifier for this client
   * @param command - Command to start the server
   * @param args - Arguments to pass to the command
   * @param env - Optional environment variables
   * @param cwd - Optional working directory
   */
  async connectStdio(
    name: string,
    command: string,
    args: string[] = [],
    env?: Record<string, string>,
    cwd?: string
  ): Promise<void> {
    const transport = new StdioClientTransport({
      command,
      args,
      env,
      cwd,
    });

    const client = new Client(
      {
        name: 'floyd-agent',
        version: '0.1.0',
      },
      {
        capabilities: {
          sampling: {},
        },
      },
    );

    await client.connect(transport);
    this.clients.set(name, client);

    // Cache tool mapping
    await this.updateToolCache(name);
  }

  /**
   * Connect to MCP servers from configuration
   *
   * Takes an array of server configurations and connects to all enabled ones.
   * Skips servers with `enabled: false` and logs errors without throwing.
   *
   * @param servers - Array of MCP server configurations
   * @returns Object with connected and failed server counts
   */
  async connectFromConfig(servers: MCPServerConfig[]): Promise<{
    connected: number;
    failed: number;
    errors: Array<{ server: string; error: string }>;
  }> {
    const result = {
      connected: 0,
      failed: 0,
      errors: [] as Array<{ server: string; error: string }>,
    };

    for (const server of servers) {
      // Skip disabled servers
      if (server.enabled === false) {
        continue;
      }

      try {
        await this.connectServer(server);
        result.connected++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          server: server.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return result;
  }

  /**
   * Connect to a single MCP server from its configuration
   */
  private async connectServer(config: MCPServerConfig): Promise<void> {
    const { name, transport } = config;
    
    // Store config for potential reconnection
    this.serverConfigs.set(name, config);
    
    // Initialize status
    this.serverStatus.set(name, {
      name,
      status: 'connecting',
      toolCount: 0,
      reconnectAttempts: this.serverStatus.get(name)?.reconnectAttempts || 0,
    });

    if (!config.transport) {
      throw new Error(`Server ${name} has no transport configured`);
    }

    switch (config.transport.type) {
      case 'stdio': {
        const stdioConfig = config.transport as MCPStdioConfig;
        await this.connectStdio(
          name,
          stdioConfig.command,
          stdioConfig.args || [],
          stdioConfig.env,
          stdioConfig.cwd
        );
        break;
      }

      case 'websocket': {
        // WebSocket client connection (different from hosting a server)
        // This connects TO a WebSocket MCP server
        const wsConfig = config.transport as MCPWebSocketConfig;
        await this.connectWebSocket(name, wsConfig.url, wsConfig.headers);
        break;
      }

      default:
        throw new Error(`Unsupported transport type: ${(config.transport as any).type}`);
    }
    
    // Update status on success
    const toolCount = this.getToolCountForClient(name);
    this.serverStatus.set(name, {
      name,
      status: 'connected',
      lastConnected: Date.now(),
      toolCount,
      reconnectAttempts: 0,
    });
    this.emit('server:connected', name, toolCount);
    this.emit('tools:changed');
  }

  /**
   * Connect to an MCP server via WebSocket (as a client)
   *
   * @param name - Unique identifier for this client
   * @param url - WebSocket URL to connect to
   * @param headers - Optional headers to include
   */
  async connectWebSocket(name: string, url: string, headers?: Record<string, string>): Promise<void> {
    const WebSocket = await import('ws');
    const ws = new WebSocket.default(url, { headers });

    const transport = new WebSocketConnectionTransport(ws as any);

    const client = new Client(
      {
        name: 'floyd-agent',
        version: '0.1.0',
      },
      {
        capabilities: {
          sampling: {},
        },
      },
    );

    await client.connect(transport);
    this.clients.set(name, client);

    // Cache tool mapping
    await this.updateToolCache(name);
  }

  /**
   * Disconnect a client
   */
  async disconnect(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (client) {
      await client.close();
      this.clients.delete(clientId);
      this.clearToolCache(clientId);
    }
  }

  /**
   * List all tools from all connected clients
   */
  async listTools(): Promise<MCPTool[]> {
    let allTools: MCPTool[] = [];

    for (const [clientId, client] of this.clients.entries()) {
      try {
        const result = (await client.listTools()) as ListToolsResult;
        for (const tool of result.tools) {
          this.toolToClientMap.set(tool.name, clientId);
        }
        allTools = [...allTools, ...result.tools];
      } catch (e) {
        // Skip failed clients
      }
    }

    return allTools;
  }

  /**
   * Call a tool on the appropriate client
   */
  async callTool(name: string, args: Record<string, any>): Promise<MCPCallResult> {
    // Find the client that has this tool
    const clientId = this.toolToClientMap.get(name);

    if (clientId) {
      const client = this.clients.get(clientId);
      if (client) {
        return await client.callTool({
          name,
          arguments: args,
        }) as MCPCallResult;
      }
    }

    // Fallback: search all clients
    for (const client of this.clients.values()) {
      try {
        const tools = (await client.listTools()) as ListToolsResult;
        if (tools.tools.find(t => t.name === name)) {
          const result = await client.callTool({
            name,
            arguments: args,
          });
          // Cache for next time
          this.toolToClientMap.set(name, Array.from(this.clients.entries()).find(
            ([, c]) => c === client
          )?.[0] || '');
          return result as MCPCallResult;
        }
      } catch (e) {
        // Continue searching
      }
    }

    throw new Error(`Tool ${name} not found in any connected MCP client`);
  }

  /**
   * List resources from all clients
   */
  async listResources(): Promise<MCPResource[]> {
    let allResources: MCPResource[] = [];

    for (const client of this.clients.values()) {
      try {
        const result = await client.listResources();
        allResources = [...allResources, ...(result.resources || [])];
      } catch (e) {
        // Skip clients that don't support resources
      }
    }

    return allResources;
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<any> {
    for (const client of this.clients.values()) {
      try {
        const result = await client.readResource({ uri });
        return result;
      } catch (e) {
        // Try next client
      }
    }

    throw new Error(`Resource ${uri} not found`);
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Check if server is running
   */
  isServerRunning(): boolean {
    return this.wss !== null;
  }

  /**
   * Update the tool-to-client cache
   */
  private async updateToolCache(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const result = (await client.listTools()) as ListToolsResult;
      for (const tool of result.tools) {
        this.toolToClientMap.set(tool.name, clientId);
      }
    } catch (e) {
      // Client might not support tools
    }
  }

  /**
   * Clear cached tool mappings for a client
   */
  private clearToolCache(clientId: string): void {
    for (const [toolName, id] of this.toolToClientMap.entries()) {
      if (id === clientId) {
        this.toolToClientMap.delete(toolName);
      }
    }
  }

  /**
   * Load MCP configuration from .floyd/mcp.json or similar locations
   */
  loadMCPConfig(projectRoot: string = process.cwd()): MCPConfigFile {
    const configPaths = [
      '.floyd/mcp.json',
      '.floyd/mcp.config.json',
      'mcp.config.json',
    ];

    for (const relativePath of configPaths) {
      const fullPath = join(projectRoot, relativePath);
      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          return JSON.parse(content) as MCPConfigFile;
        } catch {
          // Continue to next path
        }
      }
    }

    return { version: '1.0', servers: [] };
  }

  /**
   * Connect to external MCP servers from configuration file
   */
  async connectExternalServers(projectRoot: string = process.cwd()): Promise<{
    connected: number;
    failed: number;
    errors: Array<{ server: string; error: string }>;
  }> {
    const config = this.loadMCPConfig(projectRoot);
    return this.connectFromConfig(config.servers);
  }

  // ==========================================================================
  // BUILT-IN SERVER MANAGEMENT (CLI feature)
  // ==========================================================================

  /**
   * Start a built-in MCP server as a subprocess
   */
  async startBuiltinServer(serverName: string): Promise<boolean> {
    const config = this.builtinServers[serverName];
    if (!config || !config.enabled) {
      console.warn(`Server ${serverName} not found or disabled`);
      return false;
    }

    if (this.serverProcesses.has(serverName)) {
      console.log(`Server ${serverName} already running`);
      return true;
    }

    try {
      const args = config.modulePath ? [config.modulePath] : config.args || [];

      // Connect to the server via stdio using tsx
      await this.connectStdio(`builtin-${serverName}`, 'npx', ['tsx', ...args]);

      console.log(`Started built-in MCP server: ${serverName}`);
      return true;
    } catch (error) {
      console.error(`Failed to start server ${serverName}:`, error);
      return false;
    }
  }

  /**
   * Stop a running built-in server
   */
  async stopBuiltinServer(serverName: string): Promise<boolean> {
    const process = this.serverProcesses.get(serverName);
    if (!process) {
      return false;
    }

    try {
      process.kill();
      this.serverProcesses.delete(serverName);
      this.clients.delete(`builtin-${serverName}`);
      console.log(`Stopped built-in server: ${serverName}`);
      return true;
    } catch (error) {
      console.error(`Failed to stop server ${serverName}:`, error);
      return false;
    }
  }

  /**
   * Start all enabled built-in servers
   */
  async startBuiltinServers(): Promise<void> {
    for (const [name, config] of Object.entries(this.builtinServers)) {
      if (config.enabled && config.modulePath) {
        await this.startBuiltinServer(name);
      }
    }
  }

  /**
   * Stop all running built-in servers
   */
  async stopAllBuiltinServers(): Promise<void> {
    const serverNames = Array.from(this.serverProcesses.keys());
    for (const name of serverNames) {
      await this.stopBuiltinServer(name);
    }
  }

  /**
   * Get list of registered servers with their status
   */
  getServers(): Array<{
    name: string;
    description?: string;
    enabled: boolean;
    running: boolean;
  }> {
    return Array.from(this.serverConfigs.values()).map(config => ({
      name: config.name,
      description: config.description,
      enabled: config.enabled ?? false,
      running: this.serverProcesses.has(config.name) || this.clients.has(config.name),
    }));
  }

  /**
   * Cleanup when shutting down
   */
  async shutdown(): Promise<void> {
    await this.stopAllBuiltinServers();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.clients.clear();
    this.toolToClientMap.clear();
  }
}
