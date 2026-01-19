/**
 * Shared TypeScript types for FloydChrome extension
 */

export type ToolName =
  | 'navigate'
  | 'read_page'
  | 'get_page_text'
  | 'find'
  | 'click'
  | 'type'
  | 'tabs_create'
  | 'get_tabs';

export interface ToolInput {
  url?: string;
  tabId?: number;
  query?: string;
  x?: number;
  y?: number;
  selector?: string;
  text?: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ToolMetadata {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
    }>;
    required?: string[];
  };
}

export interface MCPServerConfig {
  hostName: string;
  protocolVersion: string;
  capabilities: {
    tools: string[];
  };
}

export interface AgentMessage {
  type: 'task' | 'status' | 'response' | 'error';
  id?: string;
  content: string;
  data?: any;
}

export interface AgentStatus {
  isActive: boolean;
  isConnected: boolean;
  currentTask: AgentTask | null;
  historyLength: number;
  mode?: 'websocket' | 'standalone';
  port?: number | null;
}

export interface AgentTask {
  id: number;
  task: string;
  context: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  result?: string;
}

export interface WebSocketMCPConfig {
  url: string;  // ws://localhost:3000
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
