/**
 * FloydDesktop - Shared Types
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  timestamp?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
}

export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface StreamChunk {
  token: string;
  done: boolean;
  tool_call?: ToolCall | null;
  tool_use_complete?: boolean;
  output?: string;
  stop_reason?: string;
  error?: Error;
  usage?: UsageInfo;
}

export interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
}

export interface AgentStatus {
  connected: boolean;
  model: string;
  isProcessing: boolean;
  sessionId?: string;
  /** Extension fallback status (if applicable) */
  extensionFallback?: ExtensionFallbackStatus;
}

export interface SessionData {
  id: string;
  created: number;
  updated: number;
  title: string;
  working_dir: string;
  messages: Message[];
}

export interface FloydSettings {
  provider?: 'glm' | 'anthropic' | 'openai' | 'deepseek';
  apiKey: string;
  apiEndpoint: string;
  model: string;
  systemPrompt?: string;
  workingDirectory?: string;
  allowedTools?: string[];
  mcpServers?: Record<string, unknown>;
  theme?: 'dark' | 'light' | 'system';
  language?: string;
  autoSave?: boolean;
  fontSize?: number;
  showTokenCount?: boolean;
  showTimestamps?: boolean;
  streamResponses?: boolean;
  confirmDestructive?: boolean;
  maxContextFiles?: number;
  extensionAutoConnect?: boolean;
  extensionPort?: number;
  shortcuts?: Record<string, string>;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  created: number;
  updated: number;
  sessions: string[];
  contextFiles: string[];
  mcpServers: string[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  autoSave?: boolean;
  watchFiles?: boolean;
}

export interface MCPServerUIConfig {
  id: string;
  name: string;
  type: 'stdio' | 'websocket' | 'sse';
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  toolCount?: number;
}

export interface SubAgent {
  id: string;
  type: 'research' | 'code' | 'review' | 'test';
  task: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  output?: string;
  startedAt: number;
  completedAt?: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: number;
  children?: FileNode[];
  expanded?: boolean;
}

export interface BrowserTab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
}

/**
 * Chrome extension fallback status
 * Provides information about the Chrome extension fallback availability and state
 */
export interface ExtensionFallbackStatus {
  /** Whether extension fallback is currently enabled */
  enabled: boolean;
  /** Whether the Chrome extension is detected as available */
  available: boolean;
  /** Whether we are connected to the extension */
  connected: boolean;
  /** Port the extension is listening on (if connected) */
  port?: number;
  /** Number of tools available from the extension */
  toolCount?: number;
  /** Error message if fallback failed */
  error?: string;
}
