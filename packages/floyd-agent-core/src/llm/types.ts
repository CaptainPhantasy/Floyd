/**
 * Unified LLM types
 * Single source of truth for streaming events and client interfaces
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/**
 * Unified stream chunk type
 * 
 * CRITICAL: This type includes tool_call_id which is required for
 * correctly mapping tool outputs to their calls (Bug #4 fix)
 */
export interface StreamChunk {
  // Text content
  token?: string;

  // Tool calls - includes tool_call_id for proper mapping
  tool_call_id?: string;
  tool_call?: {
    id: string;
    name: string;
    input: Record<string, unknown>;
  };
  tool_use_complete?: boolean;
  output?: string;

  // Thinking/reasoning (for models that support it)
  thinking?: string;

  // Completion
  done?: boolean;
  stop_reason?: string;

  // Errors
  error?: string;

  // Usage
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMClientOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  defaultHeaders?: Record<string, string>;
  enableThinkingMode?: boolean;
}

export interface LLMChatCallbacks {
  onChunk?: (chunk: StreamChunk) => void;
  onToolStart?: (tool: NonNullable<StreamChunk['tool_call']>) => void;
  onToolComplete?: (tool: NonNullable<StreamChunk['tool_call']> & { output: string }) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Unified LLM client interface
 * 
 * All provider-specific clients implement this interface,
 * normalizing the differences between Anthropic and OpenAI formats.
 */
export interface LLMClient {
  /**
   * Send a chat message and stream the response
   */
  chat(
    messages: LLMMessage[],
    tools: LLMTool[],
    callbacks?: LLMChatCallbacks
  ): AsyncGenerator<StreamChunk, void, unknown>;

  /**
   * Get the model name
   */
  getModel(): string;

  /**
   * Get the base URL
   */
  getBaseURL(): string;
}
