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
  /** Enable automatic reconnection (default: true) */
  autoReconnect?: boolean;
  /** Maximum reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Reconnection delay in milliseconds (default: 1000, with exponential backoff) */
  reconnectDelay?: number;
  /** Status change callback */
  onStatusChange?: (status: ExtensionConnectionStatus) => void;
}

/**
 * Connection status for extension client (Bug #48 fix)
 */
export interface ExtensionConnectionStatus {
  connected: boolean;
  connecting: boolean;
  initialized: boolean;
  reconnectAttempts: number;
  toolCount: number;
  error?: string;
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
  private connecting = false;

  // Bug #49: Reconnection settings
  private autoReconnect: boolean;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // Bug #48: Status change callback
  private onStatusChange?: (status: ExtensionConnectionStatus) => void;

  // Tools cache from extension
  private toolsCache: ExtensionTool[] = [];

  constructor(config: ExtensionClientConfig) {
    this.port = config.port;
    this.host = config.host ?? 'localhost';
    this.connectionTimeout = config.connectionTimeout ?? 5000;
    this.requestTimeout = config.requestTimeout ?? 30000;
    this.autoReconnect = config.autoReconnect ?? true;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
    this.reconnectDelay = config.reconnectDelay ?? 1000;
    this.onStatusChange = config.onStatusChange;
  }

  /**
   * Bug #48: Emit status change
   */
  private emitStatusChange(error?: string): void {
    if (this.onStatusChange) {
      this.onStatusChange({
        connected: this.connected,
        connecting: this.connecting,
        initialized: this.initialized,
        reconnectAttempts: this.reconnectAttempts,
        toolCount: this.toolsCache.length,
        error,
      });
    }
  }

  /**
   * Connect to the extension's WebSocket server
   */
  async connect(): Promise<void> {
    // Cancel any pending reconnect
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.connecting = true;
    this.emitStatusChange();
    
    return new Promise((resolve, reject) => {
      const url = `ws://${this.host}:${this.port}`;
      console.log(`[ExtensionClient] Connecting to ${url}...`);

      // Set connection timeout
      const timeout = setTimeout(() => {
        if (!this.connected) {
          this.connecting = false;
          this.emitStatusChange('Connection timeout');
          reject(new Error('Connection timeout'));
        }
      }, this.connectionTimeout);

      this.ws = new WebSocket(url);

      this.ws.on('open', async () => {
        console.log(`[ExtensionClient] Connected to extension on port ${this.port}`);
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0; // Reset on successful connection
        clearTimeout(timeout);

        // Initialize the session
        try {
          await this.initialize();
          this.emitStatusChange();
          resolve();
        } catch (error) {
          this.emitStatusChange(error instanceof Error ? error.message : String(error));
          reject(error);
        }
      });

      this.ws.on('error', (error) => {
        clearTimeout(timeout);
        this.connecting = false;
        console.error('[ExtensionClient] WebSocket error:', error);
        this.emitStatusChange(error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('[ExtensionClient] Disconnected from extension');
        const wasConnected = this.connected;
        this.connected = false;
        this.initialized = false;
        this.connecting = false;
        this.emitStatusChange('Disconnected');
        
        // Bug #49: Attempt reconnection if enabled and was previously connected
        if (this.autoReconnect && wasConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      });
    });
  }

  /**
   * Bug #49: Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`[ExtensionClient] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect();
        console.log('[ExtensionClient] Reconnected successfully');
      } catch (error) {
        console.error('[ExtensionClient] Reconnect failed:', error);
        // The close handler will schedule another attempt if appropriate
      }
    }, delay);
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
    // Cancel any pending reconnect
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Disable auto-reconnect for explicit disconnect
    const prevAutoReconnect = this.autoReconnect;
    this.autoReconnect = false;
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.initialized = false;
    this.connecting = false;
    this.reconnectAttempts = 0;
    
    this.emitStatusChange();
    console.log('[ExtensionClient] Disconnected');
    
    // Restore auto-reconnect setting
    this.autoReconnect = prevAutoReconnect;
  }

  /**
   * Bug #48: Get current connection status
   */
  getStatus(): ExtensionConnectionStatus {
    return {
      connected: this.connected,
      connecting: this.connecting,
      initialized: this.initialized,
      reconnectAttempts: this.reconnectAttempts,
      toolCount: this.toolsCache.length,
    };
  }

  /**
   * Get the port this client is connected to
   */
  getPort(): number {
    return this.port;
  }
}
