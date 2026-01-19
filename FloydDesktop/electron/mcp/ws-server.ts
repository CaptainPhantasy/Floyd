/**
 * FloydDesktop - WebSocket MCP Server
 *
 * Provides a WebSocket-based MCP server for the Chrome extension
 * to connect to and use the Desktop's agent capabilities.
 *
 * The Chrome extension connects to ws://localhost:3000 and can
 * request tool execution and agent services.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { AgentIPC } from '../ipc/agent-ipc.js';
import { createServer } from 'net';

/**
 * Check if a port is available
 */
function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, host);
  });
}

interface MCPServerConfig {
  port: number;
  host?: string;
  agentIPC: AgentIPC;
}

interface JSONRPCMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * WebSocket MCP Server for Chrome extension connectivity
 */
export class WebSocketMCPServer {
  private server: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private port: number;
  private host: string;
  private agentIPC: AgentIPC;
  private actualPort: number | null = null;
  private readonly maxPortAttempts = 10;

  constructor(config: MCPServerConfig) {
    this.port = config.port;
    this.host = config.host || 'localhost';
    this.agentIPC = config.agentIPC;
  }

  /**
   * Start the WebSocket server
   * Tries multiple ports starting from the configured port (default 3000)
   * up to maxPortAttempts (default 10) to find an available port.
   *
   * @returns Promise<number> The actual port the server is listening on
   */
  async start(): Promise<number> {
    // Try each port in sequence
    for (let attempt = 0; attempt < this.maxPortAttempts; attempt++) {
      const candidatePort = this.port + attempt;

      // Check if port is available first
      const available = await isPortAvailable(candidatePort, this.host);
      if (!available) {
        console.log(`[MCP-WS] Port ${candidatePort} is busy, trying next port...`);
        continue;
      }

      // Try to start the WebSocket server on this port
      try {
        const serverStarted = await this.tryStartServer(candidatePort);
        if (serverStarted) {
          this.actualPort = candidatePort;
          console.log(`[MCP-WS] Server successfully started on ws://${this.host}:${this.actualPort}`);
          return this.actualPort;
        }
      } catch (error) {
        // Port might have been taken between check and bind, continue to next
        console.log(`[MCP-WS] Failed to bind to port ${candidatePort}, trying next port...`);
        continue;
      }
    }

    throw new Error(
      `[MCP-WS] Could not find an available port between ${this.port} and ${this.port + this.maxPortAttempts - 1}`
    );
  }

  /**
   * Attempt to start the WebSocket server on a specific port
   */
  private tryStartServer(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.server = new WebSocketServer({ port, host: this.host });

        this.server.on('connection', (ws, req) => {
          console.log(`[MCP-WS] Client connected from ${req.socket.remoteAddress}`);
          this.clients.add(ws);

          ws.on('message', (data) => {
            this.handleMessage(ws, data);
          });

          ws.on('close', () => {
            console.log('[MCP-WS] Client disconnected');
            this.clients.delete(ws);
          });

          ws.on('error', (error) => {
            console.error('[MCP-WS] Client error:', error);
          });

          // Send initialized notification
          this.sendNotification(ws, 'initialized', {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'FloydDesktop',
              version: '0.1.0',
            },
            capabilities: {
              tools: {},
            },
          });
        });

        this.server.on('error', (error) => {
          console.error('[MCP-WS] Server error:', error);
          reject(error);
        });

        // Server started successfully
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get the actual port the server is listening on
   * Returns null if the server hasn't been started yet
   */
  getActualPort(): number | null {
    return this.actualPort;
  }

  /**
   * Stop the WebSocket server
   */
  stop(): void {
    // Close all client connections
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();

    // Close the server
    this.server?.close();
    this.server = null;

    console.log('[MCP-WS] Server stopped');
  }

  /**
   * Handle incoming message from a client
   */
  private async handleMessage(ws: WebSocket, data: Buffer | ArrayBuffer | Buffer[]): Promise<void> {
    try {
      let buffer: Buffer;
      if (Buffer.isBuffer(data)) {
        buffer = data;
      } else if (Array.isArray(data)) {
        buffer = Buffer.concat(data);
      } else {
        buffer = Buffer.from(data);
      }
      const message: JSONRPCMessage = JSON.parse(buffer.toString());
      const { id, method, params } = message;

      if (!method) {
        this.sendError(ws, id || 0, -32600, 'Invalid Request', 'Method is required');
        return;
      }

      // Handle request
      if (id !== undefined) {
        await this.handleRequest(ws, method, params, id);
      } else {
        // Handle notification (no response expected)
        await this.handleNotification(method, params);
      }
    } catch (error) {
      console.error('[MCP-WS] Error handling message:', error);
      this.sendError(ws, null, -32700, 'Parse error', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle JSON-RPC request
   */
  private async handleRequest(
    ws: WebSocket,
    method: string,
    params: Record<string, unknown> | undefined,
    id: number | string
  ): Promise<void> {
    try {
      let result: unknown;

      switch (method) {
        case 'tools/list':
          result = await this.handleListTools();
          break;

        case 'tools/call':
          result = await this.handleToolCall(params);
          break;

        case 'agent/status':
          result = await this.handleAgentStatus();
          break;

        case 'agent/chat':
          result = await this.handleAgentChat(params);
          break;

        case 'ping':
          result = { pong: true, timestamp: Date.now() };
          break;

        default:
          this.sendError(ws, id, -32601, 'Method not found', `Unknown method: ${method}`);
          return;
      }

      this.sendResponse(ws, id, result);
    } catch (error) {
      console.error(`[MCP-WS] Error executing ${method}:`, error);
      this.sendError(ws, id, -32603, 'Internal error', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle JSON-RPC notification
   */
  private async handleNotification(method: string, _params?: Record<string, unknown>): Promise<void> {
    switch (method) {
      case 'initialize':
        console.log('[MCP-WS] Client initialized');
        break;

      default:
        console.warn(`[MCP-WS] Unknown notification: ${method}`);
    }
  }

  /**
   * Handle tools/list request
   */
  private async handleListTools(): Promise<{ tools: unknown }> {
    const tools = await this.agentIPC['listTools']();
    return { tools };
  }

  /**
   * Handle tools/call request
   */
  private async handleToolCall(params?: Record<string, unknown>): Promise<{ result: unknown }> {
    if (!params) {
      throw new Error('Missing parameters');
    }

    const { name, arguments: args } = params as { name?: string; arguments?: Record<string, unknown> };

    if (!name) {
      throw new Error('Tool name is required');
    }

    const result = await this.agentIPC['callTool'](name, args || {});
    return { result };
  }

  /**
   * Handle agent/status request
   */
  private async handleAgentStatus(): Promise<unknown> {
    return this.agentIPC['getStatus']();
  }

  /**
   * Handle agent/chat request
   */
  private async handleAgentChat(params?: Record<string, unknown>): Promise<{ content: string }> {
    if (!params) {
      throw new Error('Missing parameters');
    }

    const { message } = params as { message?: string };

    if (!message) {
      throw new Error('Message is required');
    }

    const result = await this.agentIPC['sendMessage'](message as string);
    if (result.success) {
      return { content: result.response };
    } else {
      throw new Error(result.error);
    }
  }

  /**
   * Send JSON-RPC response
   */
  private sendResponse(ws: WebSocket, id: number | string, result: unknown): void {
    const response: JSONRPCMessage = {
      jsonrpc: '2.0',
      id,
      result,
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response));
    }
  }

  /**
   * Send JSON-RPC error
   */
  private sendError(
    ws: WebSocket,
    id: number | string | null,
    code: number,
    message: string,
    data?: unknown
  ): void {
    const response: JSONRPCMessage = {
      jsonrpc: '2.0',
      id: id ?? '',
      error: { code, message, data },
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response));
    }
  }

  /**
   * Send JSON-RPC notification
   */
  private sendNotification(ws: WebSocket, method: string, params?: Record<string, unknown>): void {
    const notification: JSONRPCMessage = {
      jsonrpc: '2.0',
      method,
      params,
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  }

  /**
   * Broadcast a notification to all connected clients
   */
  broadcast(method: string, params?: Record<string, unknown>): void {
    for (const client of this.clients) {
      this.sendNotification(client, method, params);
    }
  }

  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }
}
