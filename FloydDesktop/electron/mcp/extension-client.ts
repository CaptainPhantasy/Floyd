/**
 * FloydDesktop - Extension MCP Client
 *
 * WebSocket MCP client for connecting to the FloydChrome extension
 * as a fallback when the desktop's MCP server is unavailable.
 */

import { WebSocket } from 'ws';

/**
 * JSON-RPC 2.0 Message format
 */
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
 * Tool definition from extension
 */
export interface ExtensionTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/**
 * Configuration for extension client
 */
export interface ExtensionClientConfig {
  /** Port where extension WebSocket server is running */
  port: number;
  /** Host (default: localhost) */
  host?: string;
  /** Connection timeout in milliseconds (default: 5000) */
  connectionTimeout?: number;
  /** Request timeout in milliseconds (default: 30000) */
  requestTimeout?: number;
}

/**
 * Extension MCP Client
 *
 * Connects to the FloydChrome extension's WebSocket server
 * and provides tool execution capabilities as a fallback.
 */
export class ExtensionMCPClient {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private port: number;
  private host: string;
  private connectionTimeout: number;
  private requestTimeout: number;
  private connected = false;
  private initialized = false;

  // Tools cache from extension
  private toolsCache: ExtensionTool[] = [];

  constructor(config: ExtensionClientConfig) {
    this.port = config.port;
    this.host = config.host ?? 'localhost';
    this.connectionTimeout = config.connectionTimeout ?? 5000;
    this.requestTimeout = config.requestTimeout ?? 30000;
  }

  /**
   * Connect to the extension's WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.host}:${this.port}`;
      console.log(`[ExtensionClient] Connecting to ${url}...`);

      // Set connection timeout
      const timeout = setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, this.connectionTimeout);

      this.ws = new WebSocket(url);

      this.ws.on('open', async () => {
        console.log(`[ExtensionClient] Connected to extension on port ${this.port}`);
        this.connected = true;
        clearTimeout(timeout);

        // Initialize the session
        try {
          await this.initialize();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.ws.on('error', (error) => {
        clearTimeout(timeout);
        console.error('[ExtensionClient] WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('[ExtensionClient] Disconnected from extension');
        this.connected = false;
        this.initialized = false;
      });
    });
  }

  /**
   * Initialize the MCP session with the extension
   */
  private async initialize(): Promise<void> {
    const response = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: 'FloydDesktop',
        version: '0.1.0',
      },
    });

    // Send initialized notification
    this.sendNotification('notifications/initialized', {});

    // Cache available tools
    if (response.capabilities?.tools) {
      await this.refreshTools();
    }

    this.initialized = true;
    console.log('[ExtensionClient] Initialized with extension');
  }

  /**
   * Refresh the tools cache from the extension
   */
  private async refreshTools(): Promise<void> {
    try {
      const response = await this.sendRequest('tools/list', {});
      this.toolsCache = response.tools || [];
      console.log(`[ExtensionClient] Loaded ${this.toolsCache.length} tools from extension`);
    } catch (error) {
      console.error('[ExtensionClient] Failed to refresh tools:', error);
    }
  }

  /**
   * Send a request and wait for response
   */
  private async sendRequest(
    method: string,
    params?: Record<string, unknown>
  ): Promise<any> {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      // Set request timeout
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout: ${method}`));
      }, this.requestTimeout);

      // Set up one-time message handler for the response
      const messageHandler = (data: Buffer) => {
        try {
          const response: JSONRPCMessage = JSON.parse(data.toString());

          // Check if this is the response to our request
          if (response.id === id) {
            clearTimeout(timeout);
            ws.removeListener('message', messageHandler);

            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          clearTimeout(timeout);
          ws.removeListener('message', messageHandler);
          reject(error);
        }
      };

      ws.on('message', messageHandler);

      // Send the request
      const message: JSONRPCMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      ws.send(JSON.stringify(message));
    });
  }

  /**
   * Send a notification (no response expected)
   */
  private sendNotification(
    method: string,
    params?: Record<string, unknown>
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[ExtensionClient] Cannot send notification: not connected');
      return;
    }

    const message: JSONRPCMessage = {
      jsonrpc: '2.0',
      method,
      params,
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * List available tools from the extension
   */
  async listTools(): Promise<ExtensionTool[]> {
    if (!this.initialized) {
      throw new Error('Client not initialized');
    }
    return [...this.toolsCache];
  }

  /**
   * Call a tool on the extension
   */
  async callTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<{ result: unknown }> {
    return await this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
  }

  /**
   * Get agent status from the extension
   */
  async getAgentStatus(): Promise<{
    connected: boolean;
    model: string;
    isProcessing: boolean;
  }> {
    try {
      const response = await this.sendRequest('agent/status', {});
      return response;
    } catch (error) {
      return {
        connected: this.connected,
        model: 'unknown',
        isProcessing: false,
      };
    }
  }

  /**
   * Check if connected to the extension
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.initialized;
  }

  /**
   * Disconnect from the extension
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.initialized = false;
    console.log('[ExtensionClient] Disconnected');
  }

  /**
   * Get the port this client is connected to
   */
  getPort(): number {
    return this.port;
  }
}
