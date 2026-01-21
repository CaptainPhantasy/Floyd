/**
 * MCP Server Implementation - WebSocket Client Version
 * Connects to Floyd Desktop Web (ws://localhost:3005)
 */

import { MCPMessageHandler } from './messages.js';
import { ToolExecutor } from '../tools/executor.js';
import { SafetyLayer } from '../safety/permissions.js';

export class MCPServer {
  constructor() {
    this.messageHandler = new MCPMessageHandler();
    this.toolExecutor = new ToolExecutor();
    this.safetyLayer = new SafetyLayer();
    this.ws = null;
    this.isConnected = false;
    this.attachedTabs = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 50;
  }

  /**
   * Initialize WebSocket connection to Floyd Desktop
   */
  async connect(port = 3005) {
    return new Promise((resolve) => {
      try {
        console.log(`[MCP] Connecting to Floyd Desktop on port ${port}...`);
        this.ws = new WebSocket(`ws://localhost:${port}`);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('[MCP] Connected to Floyd Desktop');
          
          // Send initialization notification
          this.sendNotification('initialized', {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: this.toolExecutor.listTools()
            }
          });
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (err) {
            console.error('[MCP] Parse error:', err);
          }
        };

        this.ws.onclose = () => {
          this.handleDisconnect();
          this.attemptReconnect(port);
        };

        this.ws.onerror = (err) => {
          console.error('[MCP] WebSocket error:', err);
          this.isConnected = false;
          resolve(false);
        };

      } catch (error) {
        console.error('[MCP] Connection failed:', error);
        this.isConnected = false;
        resolve(false);
      }
    });
  }

  attemptReconnect(port) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[MCP] Reconnecting attempt ${this.reconnectAttempts}...`);
      setTimeout(() => this.connect(port), 5000);
    }
  }

  /**
   * Handle incoming messages from FLOYD CLI
   */
  async handleIncomingMessage(message) {
    try {
      const parsed = this.messageHandler.parseMessage(message);
      
      // If it's a tool call
      if (parsed.method === 'tools/call') {
        await this.handleRequest(parsed);
        return;
      }

      // If it's a notification
      if (!parsed.id && parsed.method) {
        await this.handleNotification(parsed);
        return;
      }

    } catch (error) {
      console.error('[MCP] Error handling message:', error);
    }
  }

  /**
   * Handle JSON-RPC request
   */
  async handleRequest(message) {
    const { id, method, params } = message;
    // In our new architecture, the method name is inside params for tools/call
    const toolName = message.params?.name || method;
    const toolArgs = message.params?.arguments || params;

    try {
      // Safety check
      const safetyCheck = await this.safetyLayer.checkAction(toolName, toolArgs);
      if (!safetyCheck.allowed) {
        this.sendError(id, -32000, 'Safety check failed', safetyCheck.reason);
        return;
      }

      // Execute tool
      const result = await this.toolExecutor.execute(toolName, toolArgs);
      
      // Log action
      await this.logAction(toolName, toolArgs, result);

      this.sendResponse(id, result);
    } catch (error) {
      console.error(`[MCP] Error executing ${toolName}:`, error);
      this.sendError(id, -32603, 'Internal error', error.message);
    }
  }

  /**
   * Handle JSON-RPC notification
   */
  async handleNotification(message) {
    const { method } = message;
    switch (method) {
      case 'ping':
        this.sendNotification('pong', { timestamp: Date.now() });
        break;
      default:
        console.warn(`[MCP] Unknown notification: ${method}`);
    }
  }

  /**
   * Send JSON-RPC response
   */
  sendResponse(id, result) {
    if (!this.isConnected || !this.ws) return;

    this.ws.send(JSON.stringify({
      jsonrpc: '2.0',
      id,
      result: {
        content: [{ type: 'text', text: JSON.stringify(result) }]
      }
    }));
  }

  /**
   * Send JSON-RPC error
   */
  sendError(id, code, message, data = null) {
    if (!this.isConnected || !this.ws) return;

    this.ws.send(JSON.stringify({
      jsonrpc: '2.0',
      id,
      error: { code, message, data }
    }));
  }

  /**
   * Send JSON-RPC notification
   */
  sendNotification(method, params = {}) {
    if (!this.isConnected || !this.ws) return;

    this.ws.send(JSON.stringify({
      jsonrpc: '2.0',
      method,
      params
    }));
  }

  /**
   * Handle disconnection
   */
  handleDisconnect() {
    this.isConnected = false;
    
    // Detach debugger from all tabs
    for (const tabId of this.attachedTabs.keys()) {
      chrome.debugger.detach({ tabId }).catch(() => {});
    }
    this.attachedTabs.clear();

    console.log('[MCP] Disconnected from Floyd Desktop');
  }

  async logAction(method, params, result) {
    const logEntry = {
      timestamp: Date.now(),
      method,
      params,
      success: !!result
    };
    const { actionLog = [] } = await chrome.storage.local.get('actionLog');
    actionLog.push(logEntry);
    if (actionLog.length > 100) actionLog.shift();
    await chrome.storage.local.set({ actionLog });
  }
}