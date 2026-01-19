// Agent Engine - Core AI agent orchestrator
// This is the shared agent core used by CLI, Desktop, and potentially other UIs

import Anthropic from '@anthropic-ai/sdk';
import type { MCPClientManager } from '../mcp/client-manager.js';
import type { ISessionManager, IPermissionManager, IConfig, SessionData } from './interfaces.js';
import type { Message, ToolCall, StreamChunk, AgentEvent } from './types.js';

// Re-export types from types.ts for convenience
export type { Message, ToolCall, StreamChunk, AgentEvent } from './types.js';
// Re-export interfaces for consumers
export type { ISessionManager, IPermissionManager, IConfig, SessionData } from './interfaces.js';

export interface AgentEngineOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  maxTurns?: number;
  // GLM-4.7 specific options
  defaultHeaders?: Record<string, string>;
  temperature?: number;
  enableThinkingMode?: boolean;
  outputFormat?: 'ansi' | 'plain' | 'markdown';
}

export interface AgentCallbacks {
  onChunk?: (chunk: string) => void;
  onToolStart?: (toolCall: ToolCall) => void;
  onToolComplete?: (toolCall: ToolCall) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

/**
 * AgentEngine - The core AI agent that manages conversations, tools, and streaming
 *
 * This class is UI-agnostic and can be used in:
 * - CLI applications (Ink)
 * - Desktop applications (Electron)
 * - Web applications
 * - Testing environments
 */
export class AgentEngine {
  private anthropic: Anthropic;
  private mcpManager: MCPClientManager;
  private sessionManager: ISessionManager;
  private permissionManager: IPermissionManager;
  private config: IConfig;
  private currentSession: SessionData | null = null;
  public history: Message[] = [];

  // Options
  private model: string;
  private maxTokens: number;
  private maxTurns: number;
  private temperature: number;
  private enableThinkingMode: boolean;
  private outputFormat: 'ansi' | 'plain' | 'markdown';

  constructor(
    options: AgentEngineOptions,
    mcpManager: MCPClientManager,
    sessionManager: ISessionManager,
    permissionManager: IPermissionManager,
    config: IConfig,
  ) {
    this.mcpManager = mcpManager;
    this.sessionManager = sessionManager;
    this.permissionManager = permissionManager;
    this.config = config;

    // Set options with defaults
    this.model = options.model ?? 'glm-4.7';
    this.maxTokens = options.maxTokens ?? 8192;
    this.maxTurns = options.maxTurns ?? 10;
    this.temperature = options.temperature ?? 0.2;
    this.enableThinkingMode = options.enableThinkingMode ?? true;
    this.outputFormat = options.outputFormat ?? 'plain';

    // Initialize Anthropic client with Zai GLM-4.7 API
    this.anthropic = new Anthropic({
      apiKey: options.apiKey,
      baseURL: options.baseURL ?? 'https://api.z.ai/api/paas/v4/chat/completions',
    });
  }

  /**
   * Initialize a new session or load an existing one
   */
  async initSession(cwd: string, sessionId?: string): Promise<SessionData> {
    if (sessionId) {
      this.currentSession = await this.sessionManager.loadSession(sessionId);
      if (this.currentSession) {
        this.history = this.currentSession.messages;
        return this.currentSession;
      }
    }

    // Create new session
    this.currentSession = await this.sessionManager.createSession(cwd);
    this.history = [{ role: 'system', content: this.config.systemPrompt }];
    return this.currentSession;
  }

  /**
   * Load an existing session by ID
   */
  async loadSession(sessionId: string): Promise<SessionData | null> {
    this.currentSession = await this.sessionManager.loadSession(sessionId);
    if (this.currentSession) {
      this.history = this.currentSession.messages;
    }
    return this.currentSession;
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  /**
   * Get message history
   */
  getHistory(): Message[] {
    return this.history;
  }

  /**
   * List all available sessions
   */
  async listSessions(): Promise<SessionData[]> {
    return this.sessionManager.listSessions();
  }

  /**
   * Save current session
   */
  async saveSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.messages = this.history;
      await this.sessionManager.saveSession(this.currentSession);
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (this.sessionManager.deleteSession) {
      await this.sessionManager.deleteSession(sessionId);
    }
    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
      this.history = [];
    }
  }

  /**
   * Send a message and get a streaming response
   *
   * This is the main method for interacting with the agent.
   * It yields chunks of the response as they arrive.
   */
  async *sendMessage(content: string, callbacks?: AgentCallbacks): AsyncGenerator<string, void, unknown> {
    // Add user message to history
    this.history.push({ role: 'user', content });

    // Save session with user message
    if (this.currentSession) {
      this.currentSession.messages = this.history;
      await this.sessionManager.saveSession(this.currentSession);
    }

    let currentTurnDone = false;
    let turns = 0;

    while (!currentTurnDone && turns < this.maxTurns) {
      turns++;

      // Get available tools from MCP
      const tools = await this.mcpManager.listTools();

      // Transform MCP tools to Anthropic format
      const anthropicTools = tools.map(tool => ({
        name: tool.name,
        description: tool.description || '',
        input_schema: {
          type: 'object',
          ...tool.inputSchema,
        } as any,
      }));

      // Separate system prompt from history for Anthropic API
      const systemMessage = this.history.find(m => m.role === 'system');
      const conversationHistory = this.history.filter(m => m.role !== 'system');

      // Create the streaming request
      const stream = await this.anthropic.messages.create({
        model: this.model,
        messages: conversationHistory as any[],
        system: systemMessage?.content as string || this.config.systemPrompt,
        tools: anthropicTools.length > 0 ? anthropicTools : undefined,
        stream: true,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      let assistantContent = '';
      let toolCalls: ToolCall[] = [];
      let currentBlock: any = null;

      // Process streaming chunks
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_start') {
          if (chunk.content_block?.type === 'tool_use') {
            currentBlock = {
              id: chunk.content_block.id,
              name: chunk.content_block.name,
              input: '',
            };
          }
        }

        if (chunk.type === 'content_block_delta') {
          if (chunk.delta?.type === 'text_delta') {
            assistantContent += chunk.delta.text;
            yield chunk.delta.text;
            callbacks?.onChunk?.(chunk.delta.text);
          } else if (chunk.delta?.type === 'input_json_delta' && currentBlock) {
            currentBlock.input += chunk.delta.partial_json;
          }
        }

        if (chunk.type === 'content_block_stop' && currentBlock?.name) {
          // Safely parse tool input - handle malformed JSON gracefully (Bug #63)
          let parsedInput: Record<string, unknown> = {};
          try {
            parsedInput = JSON.parse(currentBlock.input || '{}');
          } catch (parseError) {
            console.warn('[AgentEngine] Malformed JSON in tool input:', parseError);
            parsedInput = { _parseError: true, _raw: currentBlock.input };
          }

          const toolCall: ToolCall = {
            id: currentBlock.id,
            name: currentBlock.name,
            input: parsedInput,
            status: 'pending',
          };
          toolCalls.push(toolCall);
          currentBlock = null;
        }
      }

      // Build assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
      };

      if (toolCalls.length > 0) {
        // Build content array with tool_use blocks
        assistantMessage.content = [
          { type: 'text', text: assistantContent },
          ...toolCalls.map(tc => ({
            type: 'tool_use',
            id: tc.id,
            name: tc.name,
            input: tc.input,
          })),
        ] as any;
      }

      // Add assistant message to history
      this.history.push(assistantMessage);
      if (this.currentSession) {
        this.currentSession.messages = this.history;
        await this.sessionManager.saveSession(this.currentSession);
      }

      // Process tool calls if any
      if (toolCalls.length > 0) {
        for (const tc of toolCalls) {
          yield `\n[Requesting tool: ${tc.name}]\n`;

          // Permission check
          const permission = await this.permissionManager.checkPermission(tc.name);
          if (permission === 'deny') {
            yield `\n[Permission denied for tool: ${tc.name}]\n`;
            this.history.push({
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: tc.id,
                  content: 'Error: Permission denied by user configuration.',
                },
              ],
            });
            continue;
          }

          // Execute tool
          callbacks?.onToolStart?.(tc);

          try {
            const result = await this.mcpManager.callTool(tc.name, tc.input);

            const toolResultMessage: Message = {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: tc.id,
                  content: typeof result === 'string' ? result : JSON.stringify(result),
                },
              ],
            };

            this.history.push(toolResultMessage);

            tc.status = 'completed';
            tc.output = typeof result === 'string' ? result : JSON.stringify(result);
            callbacks?.onToolComplete?.(tc);
          } catch (error: any) {
            this.history.push({
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: tc.id,
                  content: `Error: ${error.message}`,
                },
              ],
            });

            tc.status = 'failed';
            tc.error = error.message;
            callbacks?.onToolComplete?.(tc);
          }
        }
      } else {
        currentTurnDone = true;
      }
    }

    callbacks?.onDone?.();
  }

  /**
   * Send a message without streaming (returns complete response)
   */
  async sendMessageComplete(content: string): Promise<string> {
    let fullResponse = '';
    for await (const chunk of this.sendMessage(content)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any[]> {
    const tools = await this.mcpManager.listTools();
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  /**
   * Call a tool directly
   */
  async callTool(name: string, input: Record<string, any>): Promise<any> {
    return this.mcpManager.callTool(name, input);
  }

  /**
   * Clear history (keep system prompt)
   */
  clearHistory(): void {
    const systemMsg = this.history.find(m => m.role === 'system');
    this.history = systemMsg ? [systemMsg] : [];
  }

  /**
   * Reset to a fresh state
   */
  async reset(): Promise<void> {
    this.history = [];
    this.currentSession = null;
  }
}
