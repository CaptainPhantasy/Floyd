/**
 * MCP module exports for Chrome extension
 */

export { WebSocketMCPClient } from './websocket-client.js';
export type { JSONRPCMessage, MCPClientOptions, MCPTool, MCPCallResult } from './websocket-client.js';

// Re-export native messaging server for backward compatibility
// The extension can use either WebSocket (preferred) or Native Messaging
export { MCPServer } from './server.js';
