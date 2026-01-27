/**
 * MCP Server Implementation - Multi-Connection Version
 * Supports connections from both CLI (port 3005) and Desktop (port 3000)
 */

import { MCPMessageHandler } from './messages.js';
import { ToolExecutor } from '../tools/executor.js';
import { SafetyLayer } from '../safety/permissions.js';
import { ConnectionManager } from './connection-manager.js';

export class MCPServer {
  constructor() {
    this.messageHandler = new MCPMessageHandler();
    this.toolExecutor = new ToolExecutor();
    this.safetyLayer = new SafetyLayer();
    this.connectionManager = new ConnectionManager();
    this.attachedTabs = new Map();

    // Register message handler for MCP connections
    this.connectionManager.registerHandler('mcp', (message, connectionName) => {
      this.handleIncomingMessage(message, connectionName);
    });
  }

  /**
   * Initialize connections to CLI and Desktop
   * @param {Object} config - Configuration with ports
   */
  async initialize(config = {}) {
    const {
      cliPort = 3005,
      desktopPort = 3000,
      enableCLI = true,
      enableDesktop = true
    } = config;

    console.log('[MCP] Initializing multi-connection MCP server...');

    const results = {};

    // Connect to CLI (Floyd CLI)
    if (enableCLI) {
      results.cli = await this.connectionManager.connect(
        'cli',
        cliPort,
        'mcp',
        {
          autoReconnect: true,
          reconnectInterval: 5000,
          maxReconnectAttempts: 50
        }
      );

      if (results.cli) {
        console.log('[MCP] Connected to Floyd CLI');
        this.sendInitialization('cli');
      } else {
        console.log('[MCP] Floyd CLI not available');
      }
    }

    // Connect to Desktop (Floyd Desktop Web)
    if (enableDesktop) {
      results.desktop = await this.connectionManager.connect(
        'desktop',
        desktopPort,
        'mcp',
        {
          autoReconnect: true,
          reconnectInterval: 5000,
          maxReconnectAttempts: 50
        }
      );

      if (results.desktop) {
        console.log('[MCP] Connected to Floyd Desktop');
        this.sendInitialization('desktop');
      } else {
        console.log('[MCP] Floyd Desktop not available');
      }
    }

    return results;
  }

  /**
   * Send initialization notification
   */
  sendInitialization(connectionName) {
    this.sendNotification(connectionName, 'initialized', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: this.toolExecutor.listTools()
      },
      serverInfo: {
        name: 'floyd-chrome',
        version: '1.0.0'
      }
    });
  }

  /**
   * Handle incoming messages from CLI or Desktop
   */
  async handleIncomingMessage(message, connectionName) {
    try {
      const parsed = this.messageHandler.parseMessage(message);

      // If it's a tool call
      if (parsed.method === 'tools/call') {
        await this.handleRequest(parsed, connectionName);
        return;
      }

      // If it's a notification
      if (!parsed.id && parsed.method) {
        await this.handleNotification(parsed, connectionName);
        return;
      }

    } catch (error) {
      console.error(`[MCP] Error handling message from ${connectionName}:`, error);
    }
  }

  /**
   * Handle JSON-RPC request
   */
  async handleRequest(message, connectionName) {
    const { id, method, params } = message;
    // In our new architecture, the method name is inside params for tools/call
    const toolName = message.params?.name || method;
    const toolArgs = message.params?.arguments || params;

    try {
      // Safety check
      const safetyCheck = await this.safetyLayer.checkAction(toolName, toolArgs);
      if (!safetyCheck.allowed) {
        this.sendError(connectionName, id, -32000, 'Safety check failed', safetyCheck.reason);
        return;
      }

      // Execute tool
      const result = await this.toolExecutor.execute(toolName, toolArgs);

      // Log action with connection source
      await this.logAction(toolName, toolArgs, result, connectionName);

      this.sendResponse(connectionName, id, result);
    } catch (error) {
      console.error(`[MCP] Error executing ${toolName}:`, error);
      this.sendError(connectionName, id, -32603, 'Internal error', error.message);
    }
  }

  /**
   * Handle JSON-RPC notification
   */
  async handleNotification(message, connectionName) {
    const { method } = message;
    switch (method) {
      case 'ping':
        this.sendNotification(connectionName, 'pong', { timestamp: Date.now() });
        break;
      default:
        console.warn(`[MCP] Unknown notification from ${connectionName}: ${method}`);
    }
  }

  /**
   * Send JSON-RPC response
   */
  sendResponse(connectionName, id, result) {
    if (!this.connectionManager.isConnected(connectionName)) {
      console.warn(`[MCP] Cannot send response - ${connectionName} not connected`);
      return;
    }

    this.connectionManager.send(connectionName, {
      jsonrpc: '2.0',
      id,
      result: {
        content: [{ type: 'text', text: JSON.stringify(result) }]
      }
    });
  }

  /**
   * Send JSON-RPC error
   */
  sendError(connectionName, id, code, message, data = null) {
    if (!this.connectionManager.isConnected(connectionName)) {
      return;
    }

    this.connectionManager.send(connectionName, {
      jsonrpc: '2.0',
      id,
      error: { code, message, data }
    });
  }

  /**
   * Send JSON-RPC notification
   */
  sendNotification(connectionName, method, params = {}) {
    if (!this.connectionManager.isConnected(connectionName)) {
      return;
    }

    this.connectionManager.send(connectionName, {
      jsonrpc: '2.0',
      method,
      params
    });
  }

  /**
   * Handle disconnection of a specific connection
   */
  handleDisconnect(connectionName) {
    console.log(`[MCP] ${connectionName} disconnected`);

    // If all connections are gone, detach debugger
    const status = this.connectionManager.getStatus();
    const anyConnected = Object.values(status).some(s => s.connected);

    if (!anyConnected) {
      // Detach debugger from all tabs
      for (const tabId of this.attachedTabs.keys()) {
        chrome.debugger.detach({ tabId }).catch(() => {});
      }
      this.attachedTabs.clear();
    }
  }

  /**
   * Check if any connection is active
   */
  get isConnected() {
    const status = this.connectionManager.getStatus();
    return Object.values(status).some(s => s.connected);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return this.connectionManager.getStatus();
  }

  async logAction(method, params, result, source) {
    const logEntry = {
      timestamp: Date.now(),
      method,
      params,
      success: !!result,
      source // 'cli' or 'desktop'
    };
    const { actionLog = [] } = await chrome.storage.local.get('actionLog');
    actionLog.push(logEntry);
    if (actionLog.length > 100) actionLog.shift();
    await chrome.storage.local.set({ actionLog });
  }
}