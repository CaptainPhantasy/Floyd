/**
 * MCP Server Implementation for Native Messaging
 * Handles communication with FLOYD CLI via Chrome Native Messaging
 *
 * NOTE: This is the legacy implementation using Native Messaging.
 * The preferred approach is now WebSocket MCP (see websocket-client.ts)
 */

import { ToolExecutor } from '../tools/executor.js';
import { SafetyLayer } from '../safety/permissions.js';

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

export interface MCPValidationResult {
  valid: boolean;
  isRequest?: boolean;
  isResponse?: boolean;
  isNotification?: boolean;
  error?: string;
}

/**
 * MCP Message Handler
 * Validates and creates MCP JSON-RPC messages
 */
export class MCPMessageHandler {
  /**
   * Parse incoming message
   */
  parseMessage(data: any): JSONRPCMessage {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        throw new Error('Invalid JSON');
      }
    }
    return data;
  }

  /**
   * Validate JSON-RPC message
   */
  validateMessage(message: JSONRPCMessage): MCPValidationResult {
    if (!message || typeof message !== 'object') {
      return { valid: false, error: 'Message must be an object' };
    }

    if (message.jsonrpc !== '2.0') {
      return { valid: false, error: 'jsonrpc version must be "2.0"' };
    }

    const hasId = message.id !== undefined;
    const hasMethod = message.method !== undefined;
    const hasResult = message.result !== undefined;
    const hasError = message.error !== undefined;

    // Request: has method and id
    if (hasMethod && hasId) {
      return {
        valid: true,
        isRequest: true,
        isNotification: false,
        isResponse: false
      };
    }

    // Notification: has method but no id
    if (hasMethod && !hasId) {
      return {
        valid: true,
        isRequest: false,
        isNotification: true,
        isResponse: false
      };
    }

    // Response: has result or error and id
    if ((hasResult || hasError) && hasId) {
      return {
        valid: true,
        isRequest: false,
        isNotification: false,
        isResponse: true
      };
    }

    return {
      valid: false,
      error: 'Message does not match any JSON-RPC pattern'
    };
  }

  /**
   * Create a response message
   */
  createResponse(id: number | string, result: any, error?: { code: number; message: string; data?: any }): JSONRPCMessage {
    const message: JSONRPCMessage = {
      jsonrpc: '2.0',
      id
    };

    if (error) {
      message.error = error;
    } else {
      message.result = result;
    }

    return message;
  }

  /**
   * Create a notification message
   */
  createNotification(method: string, params?: any): JSONRPCMessage {
    return {
      jsonrpc: '2.0',
      method,
      params
    };
  }
}

/**
 * MCP Server for Native Messaging
 *
 * This class implements the server side of the MCP protocol
 * for communication with FLOYD CLI via Chrome Native Messaging.
 */
export class MCPServer {
  public isConnected = false;
  private messageHandler: MCPMessageHandler;
  private toolExecutor: ToolExecutor;
  private safetyLayer: SafetyLayer;
  private nativePort: chrome.runtime.Port | null = null;
  private attachedTabs = new Map<number, boolean>();

  constructor() {
    this.messageHandler = new MCPMessageHandler();
    this.toolExecutor = new ToolExecutor();
    this.safetyLayer = new SafetyLayer();
  }

  /**
   * Get tool executor (for background.js access)
   */
  get toolExecutorRef(): ToolExecutor {
    return this.toolExecutor;
  }

  /**
   * Initialize Native Messaging connection
   */
  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const hostName = 'com.floyd.chrome';
        this.nativePort = chrome.runtime.connectNative(hostName);

        this.nativePort.onMessage.addListener((message) => {
          this.handleIncomingMessage(message);
        });

        this.nativePort.onDisconnect.addListener(() => {
          this.handleDisconnect();
        });

        this.isConnected = true;
        console.log('[MCP] Connected to FLOYD CLI via Native Messaging');

        // Send initialization notification
        this.sendNotification('initialized', {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: this.toolExecutor.listTools()
          }
        });

        resolve(true);
      } catch (error) {
        console.error('[MCP] Connection failed:', error);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from FLOYD CLI
   */
  async handleIncomingMessage(message: any): Promise<void> {
    try {
      const parsed = this.messageHandler.parseMessage(message);
      const validation = this.messageHandler.validateMessage(parsed);

      if (!validation.valid) {
        this.sendError(parsed.id ?? null, -32600, 'Invalid Request', validation.error);
        return;
      }

      if (validation.isNotification) {
        await this.handleNotification(parsed);
        return;
      }

      if (validation.isRequest) {
        await this.handleRequest(parsed);
        return;
      }

      if (validation.isResponse) {
        this.handleResponse(parsed);
        return;
      }
    } catch (error) {
      console.error('[MCP] Error handling message:', error);
      this.sendError(null, -32700, 'Parse error', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle JSON-RPC request
   */
  async handleRequest(message: JSONRPCMessage): Promise<void> {
    const { id, method, params } = message;

    if (id === undefined) return;

    if (method === undefined) {
      this.sendError(id, -32600, 'Invalid Request', 'Method is required');
      return;
    }

    try {
      // Safety check
      const safetyCheck = await this.safetyLayer.checkAction(method, params ?? {});
      if (!safetyCheck.allowed) {
        this.sendError(id, -32000, 'Safety check failed', safetyCheck.reason ?? 'Unknown reason');
        return;
      }

      // Execute tool
      const result = await this.toolExecutor.execute(method, params ?? {});

      // Log action
      await this.logAction(method, params ?? {}, result);

      this.sendResponse(id, result);
    } catch (error) {
      console.error(`[MCP] Error executing ${method}:`, error);
      this.sendError(id, -32603, 'Internal error', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle JSON-RPC notification
   */
  async handleNotification(message: JSONRPCMessage): Promise<void> {
    const { method, params } = message;

    switch (method) {
      case 'ping':
        this.sendNotification('pong', { timestamp: Date.now() });
        break;
      default:
        console.warn(`[MCP] Unknown notification: ${method}`);
    }
  }

  /**
   * Handle JSON-RPC response
   */
  handleResponse(message: JSONRPCMessage): void {
    console.log('[MCP] Received response:', message);
  }

  /**
   * Send JSON-RPC response
   */
  sendResponse(id: number | string, result: any): void {
    if (!this.isConnected || !this.nativePort) return;

    const response = this.messageHandler.createResponse(id, result);
    this.sendMessage(response);
  }

  /**
   * Send JSON-RPC error
   */
  sendError(id: number | string | null, code: number, message: string, data: any = null): void {
    if (!this.isConnected || !this.nativePort) return;

    // Use empty string for null id in createResponse
    const responseId = id ?? '';
    const response = this.messageHandler.createResponse(responseId, null, {
      code,
      message,
      data
    });
    this.sendMessage(response);
  }

  /**
   * Send JSON-RPC notification
   */
  sendNotification(method: string, params: any = {}): void {
    if (!this.isConnected || !this.nativePort) return;

    const notification = this.messageHandler.createNotification(method, params);
    this.sendMessage(notification);
  }

  /**
   * Send message to native host
   */
  sendMessage(message: JSONRPCMessage): void {
    if (!this.nativePort) {
      console.error('[MCP] Cannot send message: not connected');
      return;
    }

    try {
      this.nativePort.postMessage(message);
    } catch (error) {
      console.error('[MCP] Failed to send message:', error);
      this.handleDisconnect();
    }
  }

  /**
   * Handle disconnection
   */
  handleDisconnect(): void {
    this.isConnected = false;
    this.nativePort = null;

    // Detach debugger from all tabs
    for (const tabId of this.attachedTabs.keys()) {
      this.detachDebugger(tabId).catch(console.error);
    }
    this.attachedTabs.clear();

    console.log('[MCP] Disconnected from FLOYD CLI');
  }

  /**
   * Attach debugger to tab (required for some tools)
   */
  async attachDebugger(tabId: number): Promise<boolean> {
    if (this.attachedTabs.has(tabId)) {
      return true;
    }

    try {
      await chrome.debugger.attach({ tabId }, '1.3');
      this.attachedTabs.set(tabId, true);
      return true;
    } catch (error) {
      console.error(`[MCP] Failed to attach debugger to tab ${tabId}:`, error);
      return false;
    }
  }

  /**
   * Detach debugger from tab
   */
  async detachDebugger(tabId: number): Promise<boolean> {
    if (!this.attachedTabs.has(tabId)) {
      return true;
    }

    try {
      await chrome.debugger.detach({ tabId });
      this.attachedTabs.delete(tabId);
      return true;
    } catch (error) {
      console.error(`[MCP] Failed to detach debugger from tab ${tabId}:`, error);
      return false;
    }
  }

  /**
   * Log action for audit trail
   */
  async logAction(method: string, params: any, result: any): Promise<void> {
    const logEntry = {
      timestamp: Date.now(),
      method,
      params,
      result: result ? { success: true } : { success: false }
    };

    // Store in chrome.storage.local (last 1000 actions)
    const { actionLog = [] } = await chrome.storage.local.get('actionLog');
    actionLog.push(logEntry);

    // Keep only last 1000 entries
    if (actionLog.length > 1000) {
      (actionLog as any).shift();
    }

    await chrome.storage.local.set({ actionLog });
  }
}
