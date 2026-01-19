/**
 * FloydChrome Extension - TypeScript Source Entry Point
 *
 * Browser automation extension for FLOYD AI coding agent.
 *
 * Architecture:
 * - Background Service Worker (background.ts): Main entry point
 * - MCP Client (mcp/): WebSocket and Native Messaging MCP protocol support
 * - Agent (agent/): FLOYD agent integration
 * - Tools (tools/): Browser automation tools (navigate, click, type, etc.)
 * - Safety (safety/): Content sanitization and permission checks
 * - Side Panel (sidepanel/): User interface
 *
 * Two connection modes:
 * 1. WebSocket MCP (preferred): Connect to FloydDesktop on ws://localhost:3000
 * 2. Native Messaging (fallback): Connect to FLOYD CLI via Chrome native messaging
 */

// Re-export all modules
export * from './agent/index.js';
export * from './mcp/index.js';
export * from './safety/index.js';

// Export specific types to avoid ambiguity
export type { ToolInput, ToolResult, ToolMetadata } from './tools/types.js';

// Export all tool exports
export { NavigationTools, ReadingTools, InteractionTools, TabTools, ToolExecutor, getActiveTab, ensureDebuggerAttached } from './tools/index.js';
export type { ToolName, ToolFunction, ToolDefinition } from './tools/types.js';

// Export remaining types
export type {
  AgentStatus,
  AgentTask,
  AgentMessage,
  WebSocketMCPConfig
} from './types.js';
