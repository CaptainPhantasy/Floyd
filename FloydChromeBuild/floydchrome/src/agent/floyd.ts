/**
 * FLOYD Agent Integration for Chrome Extension
 *
 * This agent connects to the FloydDesktop or CLI via WebSocket MCP.
 * It provides browser automation capabilities to the FLOYD AI agent.
 *
 * Architecture:
 * - Chrome Extension (this file) acts as MCP client
 * - Connects via WebSocket to FloydDesktop's MCP server (port 3000)
 * - Falls back to Native Messaging if WebSocket unavailable
 */

import type {
  WebSocketMCPConfig,
  AgentStatus,
  AgentTask,
  ToolResult
} from '../types.js';

interface MCPMessage {
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
}

interface WebSocketConnection {
  send: (data: string) => void;
  close: () => void;
  readyState: number;
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
}

export class FloydAgent {
  private isActive: boolean = false;
  private currentTask: AgentTask | null = null;
  private history: AgentTask[] = [];
  private ws: WebSocketConnection | null = null;
  private messageId = 0;
  private pendingRequests: Map<number | string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();

  private config: WebSocketMCPConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private standaloneMode: boolean = false;
  private actualPort: number | null = null;

  // Standalone mode API configuration
  private standaloneApiConfig: {
    endpoint: string;
    apiKey: string | null;
  } = {
    endpoint: 'https://api.z.ai/api/anthropic', // Default GLM proxy
    apiKey: null
  };

  constructor(config?: Partial<WebSocketMCPConfig>) {
    this.config = {
      url: config?.url || 'ws://localhost:3000',
      reconnectInterval: config?.reconnectInterval || 3000,
      maxReconnectAttempts: config?.maxReconnectAttempts || 10
    };

    // Check for API key in environment for standalone mode (Node.js only)
    this.standaloneApiConfig.apiKey = (config as any)?.apiKey ||
      ((globalThis as any).process?.env?.ANTHROPIC_AUTH_TOKEN || (globalThis as any).process?.env?.GLM_API_KEY || null);
  }

  /**
   * Get the current operating mode
   */
  getMode(): 'websocket' | 'standalone' {
    return this.standaloneMode ? 'standalone' : 'websocket';
  }

  /**
   * Initialize FLOYD agent by connecting to WebSocket MCP server
   */
  async initialize(config?: Partial<WebSocketMCPConfig>): Promise<AgentStatus> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      await this.connect();
      this.isActive = true;

      // Send initialize notification
      this.sendNotification('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: this.getAvailableTools()
        }
      });

      return this.getStatus();
    } catch (error) {
      console.error('[FloydAgent] Initialization failed:', error);
      throw new Error(`Failed to connect to FLOYD: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Switch to standalone mode (direct API calls when Desktop unavailable)
   */
  private switchToStandaloneMode(): void {
    this.standaloneMode = true;
    this.isActive = true; // Still active, just using direct API
    console.log('[FloydAgent] Switched to standalone mode (direct API calls)');
    console.log('[FloydAgent] Endpoint:', this.standaloneApiConfig.endpoint);

    // Clear any pending WebSocket requests
    for (const [id, { reject }] of this.pendingRequests) {
      reject(new Error('Switched to standalone mode'));
    }
    this.pendingRequests.clear();
  }

  /**
   * Make a direct API call in standalone mode
   */
  private async standaloneApiCall(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.standaloneApiConfig.apiKey) {
      throw new Error('API key required for standalone mode. Set ANTHROPIC_AUTH_TOKEN or GLM_API_KEY environment variable.');
    }

    const response = await fetch(this.standaloneApiConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.standaloneApiConfig.apiKey,
      },
      body: JSON.stringify({
        model: 'claude-opus-4',
        messages,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content || data.choices?.[0]?.message?.content || 'No response content';
  }

  /**
   * Try to connect to a specific port
   * Returns the WebSocket if successful, null otherwise
   */
  private async tryConnect(port: number): Promise<WebSocketConnection | null> {
    return new Promise((resolve) => {
      const WebSocket = (globalThis as any).WebSocket;
      const wsUrl = `ws://localhost:${port}`;

      try {
        const ws = new WebSocket(wsUrl);
        let resolved = false;

        // Connection timeout
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            ws.close();
            console.log(`[FloydAgent] Connection timeout on port ${port}`);
            resolve(null);
          }
        }, 3000);

        ws.onopen = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);

            // Set up message handler for this connection
            ws.onmessage = (event: MessageEvent) => {
              this.handleMessage(event.data);
            };

            ws.onclose = () => {
              console.log('[FloydAgent] WebSocket disconnected');
              this.ws = null;
              this.attemptReconnect();
            };

            ws.onerror = (error: Event) => {
              console.error('[FloydAgent] WebSocket error:', error);
            };

            console.log(`[FloydAgent] WebSocket connected to ${wsUrl}`);
            resolve(ws);
          }
        };

        ws.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.log(`[FloydAgent] Connection failed on port ${port}`);
            resolve(null);
          }
        };
      } catch (error) {
        console.log(`[FloydAgent] Exception on port ${port}:`, error);
        resolve(null);
      }
    });
  }

  /**
   * Connect to WebSocket MCP server
   * Tries multiple ports (3000-3009) to find available Desktop server
   * Falls back to standalone mode if all connection attempts fail
   */
  private async connect(): Promise<void> {
    const startPort = parseInt(this.config.url.split(':').pop() || '3000', 10);
    const maxPortAttempts = 10;

    for (let portAttempt = 0; portAttempt < maxPortAttempts; portAttempt++) {
      const candidatePort = startPort + portAttempt;
      console.log(`[FloydAgent] Attempting connection to port ${candidatePort} (${portAttempt + 1}/${maxPortAttempts})`);

      const ws = await this.tryConnect(candidatePort);

      if (ws) {
        // Connection successful
        this.ws = ws;
        this.actualPort = candidatePort;
        this.config.url = `ws://localhost:${candidatePort}`;
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.standaloneMode = false; // Connected via WebSocket
        return;
      }
    }

    // All ports failed - switch to standalone mode
    console.error('[FloydAgent] All WebSocket connection attempts failed, switching to standalone mode');
    this.switchToStandaloneMode();
  }

  /**
   * Attempt to reconnect to WebSocket server
   * Switches to standalone mode after max reconnection attempts
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('[FloydAgent] Max reconnection attempts reached, switching to standalone mode');
      this.switchToStandaloneMode();
      return;
    }

    this.reconnectAttempts++;
    console.log(`[FloydAgent] Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[FloydAgent] Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message: MCPMessage = JSON.parse(data);

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

      // Handle incoming request from server
      if (message.method) {
        this.handleRequest(message);
      }
    } catch (error) {
      console.error('[FloydAgent] Error handling message:', error);
    }
  }

  /**
   * Handle incoming request from server
   */
  private async handleRequest(message: MCPMessage): Promise<void> {
    const { method, params, id } = message;

    if (!method || id === undefined) return;

    try {
      // This will be handled by tool executor
      // For now, acknowledge the request
      this.sendResponse(id, { status: 'received' });
    } catch (error) {
      this.sendError(id, -32603, 'Internal error', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send a request and wait for response
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== 1) {
      throw new Error('WebSocket not connected');
    }

    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const message: MCPMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.ws!.send(JSON.stringify(message));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Send response to a request
   */
  private sendResponse(id: number | string, result: any): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== 1) return;

    const message: MCPMessage = {
      jsonrpc: '2.0',
      id,
      result
    };

    ws.send(JSON.stringify(message));
  }

  /**
   * Send error response
   */
  private sendError(id: number | string, code: number, message: string, data?: any): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== 1) return;

    const response: MCPMessage = {
      jsonrpc: '2.0',
      id,
      error: { code, message, data }
    };

    ws.send(JSON.stringify(response));
  }

  /**
   * Send notification (no response expected)
   */
  private sendNotification(method: string, params?: any): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== 1) return;

    const message: MCPMessage = {
      jsonrpc: '2.0',
      method,
      params
    };

    ws.send(JSON.stringify(message));
  }

  /**
   * Process a task/query using the FLOYD agent
   * Streams response via callback
   * Uses WebSocket MCP when available, falls back to standalone API
   */
  async processTask(
    task: string,
    context: Record<string, unknown> = {},
    onChunk?: (chunk: string) => void
  ): Promise<AgentTask> {
    if (!this.isActive) {
      await this.initialize();
    }

    const taskObj: AgentTask = {
      id: Date.now(),
      task,
      context,
      status: 'processing',
      timestamp: new Date().toISOString()
    };

    this.currentTask = taskObj;

    try {
      if (this.standaloneMode) {
        // Use direct API calls in standalone mode
        console.log('[FloydAgent] Processing task in standalone mode');

        // Build message history from context or use simple single message
        const messages = [
          {
            role: 'user',
            content: task
          }
        ];

        const result = await this.standaloneApiCall(messages);

        taskObj.status = 'completed';
        taskObj.result = result;

        // Simulate streaming by sending chunks
        if (onChunk) {
          const chunkSize = 50;
          for (let i = 0; i < result.length; i += chunkSize) {
            onChunk(result.slice(i, i + chunkSize));
          }
        }

        this.history.push(taskObj);
        return taskObj;
      } else {
        // Send task to FLOYD via WebSocket MCP
        const response = await this.sendRequest('tasks/process', {
          task,
          context,
          stream: !!onChunk
        });

        taskObj.status = 'completed';
        taskObj.result = response.result || response.content;

        // Handle streaming if available
        if (onChunk && response.streamUrl) {
          // Could set up streaming connection here
        }

        this.history.push(taskObj);
        return taskObj;
      }
    } catch (error) {
      taskObj.status = 'failed';
      taskObj.result = error instanceof Error ? error.message : String(error);
      this.history.push(taskObj);
      throw error;
    }
  }

  /**
   * Execute a tool directly
   * In standalone mode, indicates that tools must be executed locally by the extension
   */
  async executeTool(name: string, input: Record<string, unknown>): Promise<ToolResult> {
    if (!this.isActive) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    if (this.standaloneMode) {
      // In standalone mode, tools are executed by the extension's browser automation
      return {
        success: false,
        error: 'Tool execution in standalone mode requires local browser automation implementation'
      };
    }

    try {
      const response = await this.sendRequest('tools/call', {
        name,
        arguments: input
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get agent status
   */
  getStatus(): AgentStatus {
    return {
      isActive: this.isActive,
      isConnected: this.ws?.readyState === 1,
      currentTask: this.currentTask,
      historyLength: this.history.length,
      mode: this.getMode(),
      port: this.actualPort
    };
  }

  /**
   * Get the actual port the WebSocket is connected to
   * Returns null if not connected or in standalone mode
   */
  getActualPort(): number | null {
    return this.actualPort;
  }

  /**
   * Get execution history
   */
  getHistory(limit = 100): AgentTask[] {
    return this.history.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory(): { success: boolean } {
    this.history = [];
    return { success: true };
  }

  /**
   * Get available tools
   */
  getAvailableTools(): string[] {
    return [
      'navigate',
      'read_page',
      'get_page_text',
      'find',
      'click',
      'type',
      'tabs_create',
      'get_tabs'
    ];
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isActive = false;
    this.pendingRequests.clear();
  }
}
