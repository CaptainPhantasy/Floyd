/**
 * WebSocket MCP Client for Chrome Extension
 *
 * This implements the MCP (Model Context Protocol) client over WebSocket.
 * The Chrome extension can connect to FloydDesktop's MCP server as a client.
 */

export type JSONRPCMessage = {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
};

export interface MCPClientOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPCallResult {
  content: Array<{
    type: string;
    text?: string;
    data?: any;
  }>;
  isError?: boolean;
}

/**
 * WebSocket MCP Client
 *
 * Connects to an MCP server over WebSocket and provides:
 * - Tool listing and calling
 * - Resource access
 * - Prompt management
 */
export class WebSocketMCPClient {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private pendingRequests: Map<number | string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();

  private toolsCache: MCPTool[] = [];
  private initialized = false;

  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private options: MCPClientOptions) {}

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.options.url);

        this.ws.onopen = async () => {
          console.log('[MCP] Connected to', this.options.url);
          this.reconnectAttempts = 0;

          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }

          // Initialize the connection
          await this.initialize();
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error: Event) => {
          console.error('[MCP] WebSocket error:', error);
        };

        this.ws.onclose = () => {
          console.log('[MCP] Disconnected from server');
          this.ws = null;
          this.initialized = false;

          if (this.options.reconnect !== false) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Initialize the MCP session
   */
  private async initialize(): Promise<void> {
    const response = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {}
      },
      clientInfo: {
        name: 'floydchrome',
        version: '2.0.0'
      }
    });

    // Send initialized notification
    this.sendNotification('notifications/initialized', {});

    // Cache available tools
    if (response.capabilities?.tools) {
      await this.refreshTools();
    }

    this.initialized = true;
  }

  /**
   * Refresh the tools cache
   */
  private async refreshTools(): Promise<void> {
    const response = await this.sendRequest('tools/list', {});
    this.toolsCache = response.tools || [];
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    const maxAttempts = this.options.maxReconnectAttempts || 10;

    if (this.reconnectAttempts >= maxAttempts) {
      console.error('[MCP] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const interval = this.options.reconnectInterval || 3000;

    console.log(`[MCP] Reconnection attempt ${this.reconnectAttempts}/${maxAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[MCP] Reconnection failed:', error);
      });
    }, interval);
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message: JSONRPCMessage = JSON.parse(data);

      // Handle response to a request
      if (message.id !== undefined && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);

        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message.result);
        }
        return;
      }

      // Handle notification from server
      if (message.method && !message.id) {
        this.handleNotification(message);
      }
    } catch (error) {
      console.error('[MCP] Error handling message:', error);
    }
  }

  /**
   * Handle notification from server
   */
  private handleNotification(message: JSONRPCMessage): void {
    const { method, params } = message;

    switch (method) {
      case 'notifications/tools/list_changed':
        this.refreshTools().catch(console.error);
        break;
      case 'notifications/resources/list_changed':
        // Handle resource list changes
        break;
      default:
        console.log('[MCP] Received notification:', method, params);
    }
  }

  /**
   * Send a request and wait for response
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: (value: any) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      const message: JSONRPCMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.ws!.send(JSON.stringify(message));
    });
  }

  /**
   * Send notification (no response expected)
   */
  private sendNotification(method: string, params?: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[MCP] Cannot send notification: not connected');
      return;
    }

    const message: JSONRPCMessage = {
      jsonrpc: '2.0',
      method,
      params
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * List available tools from the server
   */
  async listTools(): Promise<MCPTool[]> {
    if (!this.initialized) {
      throw new Error('Client not initialized');
    }
    return [...this.toolsCache];
  }

  /**
   * Call a tool on the server
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<MCPCallResult> {
    return await this.sendRequest('tools/call', {
      name,
      arguments: args
    });
  }

  /**
   * List available resources
   */
  async listResources(): Promise<any[]> {
    return await this.sendRequest('resources/list', {});
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<any> {
    return await this.sendRequest('resources/read', { uri });
  }

  /**
   * List available prompts
   */
  async listPrompts(): Promise<any[]> {
    return await this.sendRequest('prompts/list', {});
  }

  /**
   * Get a prompt
   */
  async getPrompt(name: string, args?: Record<string, unknown>): Promise<any> {
    return await this.sendRequest('prompts/get', {
      name,
      arguments: args
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.initialized;
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Send cancel request for any pending requests
    for (const id of this.pendingRequests.keys()) {
      this.sendNotification('notifications/cancelled', { requestId: id });
    }
    this.pendingRequests.clear();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.initialized = false;
  }
}
