// MCP Client Manager - Manages connections to MCP servers
// Supports stdio, WebSocket, and SSE transports
// Can load server configuration from .floyd/mcp.json or similar files

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import { WebSocketServer } from 'ws';
import { WebSocketConnectionTransport } from './websocket-transport.js';
import type { MCPTool, MCPResource, MCPCallResult, MCPServerConfig, MCPStdioConfig, MCPWebSocketConfig, MCPConfigFile } from './types.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
 * MCPClientManager manages multiple MCP client connections
 *
 * Responsibilities:
 * - Hosting a WebSocket server for external MCP clients (e.g., Chrome extension)
 * - Connecting to local MCP servers via stdio
 * - Aggregating tools from all connected clients
 * - Routing tool calls to the appropriate client
 */
export class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private wss: WebSocketServer | null = null;
  private toolToClientMap: Map<string, string> = new Map();

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

        ws.on('close', () => {
          this.clients.delete(clientId);
          this.clearToolCache(clientId);
        });
      } catch (e) {
        ws.close();
      }
    });

    return new Promise((resolve) => {
      this.wss?.on('listening', () => resolve());
    });
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

    switch (transport.type) {
      case 'stdio': {
        const stdioConfig = transport as MCPStdioConfig;
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
        const wsConfig = transport as MCPWebSocketConfig;
        await this.connectWebSocket(name, wsConfig.url, wsConfig.headers);
        break;
      }

      default:
        throw new Error(`Unsupported transport type: ${(transport as any).type}`);
    }
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
}
