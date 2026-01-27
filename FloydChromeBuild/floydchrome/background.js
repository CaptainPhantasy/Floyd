/**
 * Background Service Worker
 * Main entry point for FloydChrome extension
 *
 * Multi-Connection Architecture:
 * - CLI Connection: ws://localhost:3005 (MCP browser tools)
 * - Desktop Connection: ws://localhost:3000 (Floyd Desktop Web)
 * - Agent Connection: ws://localhost:3005 (Floyd Agent tasks)
 */

import { MCPServer } from './mcp/server.js';
import { FloydAgent } from './agent/floyd.js';

let mcpServer = null;
let floydAgent = null;

// Initialize on extension startup
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

async function initialize() {
  console.log('[FloydChrome] Initializing multi-connection system...');

  // Initialize MCP Server with multi-connection support
  mcpServer = new MCPServer();

  // Initialize connections to both CLI and Desktop
  const connectionResults = await mcpServer.initialize({
    cliPort: 3005,       // Floyd CLI MCP browser server
    desktopPort: 3000,   // Floyd Desktop Web (if available)
    enableCLI: true,
    enableDesktop: false // Disable until Desktop is ready
  });

  // Log connection results
  console.log('[FloydChrome] Connection results:', connectionResults);

  // Initialize FLOYD Agent (also on port 3005 for CLI)
  floydAgent = new FloydAgent();
  try {
    await floydAgent.initialize({ port: 3005 });
    console.log('[FloydChrome] Floyd Agent connected to CLI');
  } catch (err) {
    console.log('[FloydChrome] Floyd Agent waiting for CLI...');
  }

  // Set up side panel action
  chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
  });

  // Log final status
  const status = mcpServer.getStatus();
  console.log('[FloydChrome] Final connection status:', status);
}

// Handle messages from content scripts or side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get_mcp_status') {
    const status = mcpServer?.getStatus() || {};
    sendResponse({
      connected: mcpServer?.isConnected || false,
      connections: status
    });
    return true;
  }

  if (message.type === 'execute_task') {
    if (floydAgent && floydAgent.isActive) {
      floydAgent.processTask(message.task)
        .then(res => sendResponse(res))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }
    sendResponse({ success: false, error: 'Floyd agent not connected' });
    return true;
  }

  if (message.type === 'get_tool_metadata') {
    if (mcpServer) {
      const metadata = mcpServer.toolExecutor.getAllToolMetadata();
      sendResponse({ metadata });
      return true;
    }
    sendResponse({ metadata: {} });
    return true;
  }

  if (message.type === 'reconnect_desktop') {
    // Allow manual reconnection to Desktop
    if (mcpServer) {
      mcpServer.initialize({
        cliPort: 3005,
        desktopPort: message.port || 3000,
        enableCLI: false,  // Don't touch CLI
        enableDesktop: true // Enable Desktop
      }).then(results => {
        sendResponse({ success: true, results });
      }).catch(err => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }
    sendResponse({ success: false, error: 'MCP server not initialized' });
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

// Export for testing/debugging
if (typeof globalThis !== 'undefined') {
  globalThis.floydChrome = {
    mcpServer: () => mcpServer,
    floydAgent: () => floydAgent,
    connectionStatus: () => mcpServer?.getStatus() || {}
  };
}

