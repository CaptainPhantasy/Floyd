// Shared types for the agent system
// These types are used across CLI, Desktop, and other UIs

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | any[];
  tool_call_id?: string;
  name?: string;
};

export type ToolCall = {
  id: string;
  name: string;
  input: Record<string, any>;
  output?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
};

export type StreamChunk = {
  token?: string;
  toolCall?: ToolCall;
  toolUseComplete?: boolean;
  done?: boolean;
  error?: Error;
};

export type AgentEvent =
  | { type: 'chunk'; token: string }
  | { type: 'tool_start'; toolCall: ToolCall }
  | { type: 'tool_complete'; toolCall: ToolCall }
  | { type: 'done' }
  | { type: 'error'; error: Error };
