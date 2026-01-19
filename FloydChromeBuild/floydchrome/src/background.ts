/**
 * Background Service Worker
 * Main entry point for FloydChrome extension
 *
 * The extension supports two modes:
 * 1. WebSocket MCP: Connects to FloydDesktop on ws://localhost:3000
 * 2. Native Messaging: Legacy fallback to FLOYD CLI
 */

import { MCPServer } from './mcp/server.js';
import { FloydAgent } from './agent/floyd.js';
import { WebSocketMCPClient } from './mcp/websocket-client.js';

let mcpServer: MCPServer | null = null;
let floydAgent: FloydAgent | null = null;
let wsClient: WebSocketMCPClient | null = null;

// Configuration
const WS_SERVER_URL = 'ws://localhost:3000';

// Initialize on extension startup
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

async function initialize() {
  console.log('[FloydChrome] Initializing...');

  // Initialize MCP Server for Native Messaging fallback
  mcpServer = new MCPServer();

  // Initialize FLOYD Agent (will use WebSocket or Native Messaging)
  floydAgent = new FloydAgent({
    url: WS_SERVER_URL
  });

  // Try WebSocket connection first (preferred)
  try {
    wsClient = new WebSocketMCPClient({ url: WS_SERVER_URL });
    await wsClient.connect();
    console.log('[FloydChrome] WebSocket MCP connected to FloydDesktop');
  } catch (error) {
    console.log('[FloydChrome] WebSocket not available, falling back to Native Messaging');

    // Fallback to Native Messaging
    const connected = await mcpServer.connect();
    if (connected) {
      console.log('[FloydChrome] Native Messaging MCP connected to FLOYD CLI');
    } else {
      console.log('[FloydChrome] MCP Server waiting for FLOYD CLI connection');
    }
  }

  // Set up side panel action
  chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
  });
}

// Handle messages from content scripts or side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get_mcp_status') {
    sendResponse({
      connected: wsClient?.isConnected() || mcpServer?.isConnected || false,
      mode: wsClient?.isConnected() ? 'websocket' : 'native-messaging'
    });
    return true;
  }

  if (message.type === 'get_tool_metadata') {
    if (mcpServer) {
      const metadata = mcpServer.toolExecutorRef.getAllToolMetadata();
      sendResponse({ metadata });
      return true;
    }
    sendResponse({ metadata: {} });
    return true;
  }

  if (message.type === 'agent_initialize') {
    if (floydAgent) {
      floydAgent.initialize(message.config)
        .then(status => sendResponse({ success: true, status }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
    sendResponse({ success: false, error: 'Agent not initialized' });
    return true;
  }

  if (message.type === 'agent_process_task') {
    if (floydAgent) {
      floydAgent.processTask(message.task, message.context)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    }
    sendResponse({ success: false, error: 'Agent not initialized' });
    return true;
  }

  if (message.type === 'agent_status') {
    if (floydAgent) {
      sendResponse({ success: true, status: floydAgent.getStatus() });
      return true;
    }
    sendResponse({ success: false, error: 'Agent not initialized' });
    return true;
  }

  return false;
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    // Connection closed
  });
});

// Handle extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  console.log('[FloydChrome] Suspending...');

  // Disconnect WebSocket client
  if (wsClient) {
    wsClient.disconnect();
  }

  // Disconnect agent
  if (floydAgent) {
    floydAgent.disconnect();
  }
});

// Export for testing/debugging
if (typeof globalThis !== 'undefined') {
  (globalThis as any).floydChrome = {
    mcpServer: () => mcpServer,
    floydAgent: () => floydAgent,
    wsClient: () => wsClient
  };
}
