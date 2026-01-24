/**
 * Execution Engine - Floyd Wrapper
 *
 * Agentic "run until completion" loop with conversation history,
 * tool execution, and turn limiting.
 */

import type { FloydConfig, ConversationHistory, StreamEvent } from '../types.js';
import { GLMClient } from '../llm/glm-client.js';
import { StreamHandler } from '../streaming/stream-handler.js';
import { toolRegistry, registerCoreTools } from '../tools/index.js';
import { permissionManager } from '../permissions/permission-manager.js';
import { logger } from '../utils/logger.js';
import { buildSystemPrompt } from '../prompts/system/index.js';
import type { SessionManager } from '../persistence/session-manager.js';

// ============================================================================
// Engine Callbacks
// ============================================================================

/**
 * Callbacks for engine events
 */
export interface EngineCallbacks {
  /** Called when each token is generated */
  onToken?: (token: string) => void;
  /** Called when a tool execution starts */
  onToolStart?: (tool: string, input: Record<string, unknown>) => void;
  /** Called when a tool execution completes */
  onToolComplete?: (tool: string, result: unknown) => void;
  /** Called when the model starts thinking (before LLM API call) */
  onThinkingStart?: () => void;
  /** Called when the model finishes thinking (after LLM API call completes) */
  onThinkingComplete?: () => void;
}

// ============================================================================
// Floyd Agent Engine
// ============================================================================

/**
 * Agentic execution engine that runs "until completion"
 *
 * Features:
 * - Multi-turn conversation loop with turn limiting
 * - Automatic tool execution and result feeding
 * - Completion detection (no tool use = done)
 * - Streaming response support
 * - Conversation history management
 */
export class FloydAgentEngine {
  private history: ConversationHistory;
  private glmClient: GLMClient;
  private streamHandler: StreamHandler;
  private maxTurns: number;
  private callbacks: EngineCallbacks;
  private sessionManager?: SessionManager;
  private executionLock: Promise<unknown> = Promise.resolve(); // Mutex for concurrent execution prevention

  constructor(
    config: FloydConfig,
    callbacks?: EngineCallbacks,
    sessionManager?: SessionManager
  ) {
    // Register all core tools
    registerCoreTools();

    this.sessionManager = sessionManager;
    this.glmClient = new GLMClient(config);
    this.streamHandler = new StreamHandler();
    this.maxTurns = config.maxTurns;
    this.callbacks = callbacks || {};

    // Set ignore patterns if provided
    if (config.floydIgnorePatterns) {
      toolRegistry.setIgnorePatterns(config.floydIgnorePatterns);
    }

    // Initialize history
    // If we have a session manager with an active session, load its history
    const existingHistory = this.sessionManager?.getHistory();

    if (existingHistory && existingHistory.length > 0) {
      this.history = {
        messages: existingHistory,
        turnCount: Math.floor(existingHistory.length / 2), // Rough estimate
        tokenCount: 0, // We'd need to recalculate or store this
      };
      logger.info('Restored conversation history from session', {
        messageCount: existingHistory.length
      });
    } else {
      // New session or no persistent history, start fresh
      const systemPrompt = buildSystemPrompt({
        workingDirectory: config.cwd,
        projectContext: config.projectContext,
      });

      this.history = {
        messages: [
          {
            role: 'system',
            content: systemPrompt,
            timestamp: Date.now(),
          },
        ],
        turnCount: 0,
        tokenCount: 0,
      };

      // Persist the initial system prompt if we have a session
      if (this.sessionManager) {
        this.sessionManager.saveMessage('system', systemPrompt).catch(err => {
          logger.error('Failed to save system prompt', err);
        });
      }
    }

    logger.debug('FloydAgentEngine initialized', {
      maxTurns: this.maxTurns,
      toolCount: toolRegistry.getAll().length,
      historyLength: this.history.messages.length
    });
  }

  /**
   * Execute a user message and run until completion
   *
   * @param userMessage - User's input message
   * @returns Final assistant response
   */
  async execute(userMessage: string): Promise<string> {
    // Create a unique execution lock for this call
    const currentExecution = this.executionLock.then(async () => {
      // Reset turn count for new execution
      this.history.turnCount = 0;

      logger.info('Starting execution', {
        turnCount: this.history.turnCount,
        messageLength: userMessage.length,
      });

      // Add user message to history
      this.history.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      // Persist user message
      if (this.sessionManager) {
        await this.sessionManager.saveMessage('user', userMessage);
      }

      // Main agentic loop
      let finalResponse = '';

      while (this.history.turnCount < this.maxTurns) {
        logger.debug('Starting turn', {
          turn: this.history.turnCount + 1,
          maxTurns: this.maxTurns,
        });

        this.history.turnCount++;

        // Notify that thinking is starting (for spinner)
        this.callbacks.onThinkingStart?.();

        let result: {
          assistantMessage: string;
          toolResults: Array<{ toolUseId: string; result: unknown }>;
        };

        try {
          // Call GLM-4.7 with streaming
          const stream = this.glmClient.streamChat({
            messages: this.history.messages,
            tools: this.buildToolDefinitions(),
            onToken: this.callbacks.onToken,
            onComplete: (usage) => {
              // Update token count in history
              this.history.tokenCount += usage.totalTokens;
              logger.debug('Updated token count', {
                tokenCount: this.history.tokenCount,
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
              });
            },
          });

          // Process stream
          result = await this.processStream(stream);
        } catch (error) {
          logger.error('Error during stream processing', error);
          // Return empty result on error to allow graceful recovery
          result = {
            assistantMessage: `I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
            toolResults: [],
          };
        } finally {
          // Always notify that thinking is complete (stop spinner)
          // This ensures we don't get stuck in "thinking" state
          this.callbacks.onThinkingComplete?.();
        }

        logger.debug('Stream result received', {
          assistantMessageLength: result.assistantMessage.length,
          toolResultsCount: result.toolResults.length,
        });

        // Add assistant message to history
        this.history.messages.push({
          role: 'assistant',
          content: result.assistantMessage,
          timestamp: Date.now(),
        });

        // Persist assistant message
        if (this.sessionManager) {
          await this.sessionManager.saveMessage('assistant', result.assistantMessage);
        }

        // Check for completion (no tool use detected)
        if (result.toolResults.length === 0) {
          logger.info('No tool use detected - execution complete');
          finalResponse = result.assistantMessage;
          break;
        }

        // Add tool results to history
        for (const toolResult of result.toolResults) {
          this.history.messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult.result),
            timestamp: Date.now(),
            toolUseId: toolResult.toolUseId,
          });

          // Persist tool result
          if (this.sessionManager) {
            await this.sessionManager.saveMessage(
              'tool',
              JSON.stringify(toolResult.result),
              toolResult.toolUseId
            );
          }
        }

        // Continue to next turn
        logger.debug('Continuing to next turn', {
          toolCount: result.toolResults.length,
        });
      }

      // Check if we hit turn limit
      if (this.history.turnCount >= this.maxTurns) {
        logger.warn('Maximum turn limit reached', {
          turnCount: this.history.turnCount,
          maxTurns: this.maxTurns,
        });
      }

      // Return final response
      const lastAssistantMessage = this.history.messages
        .filter(m => m.role === 'assistant')
        .pop();

      return lastAssistantMessage?.content || finalResponse;
    });

    // Update the execution lock for next call (chaining)
    this.executionLock = currentExecution;

    // Wait for THIS execution to complete and return its result
    return await currentExecution;
  }

  /**
   * Process a stream from GLM and collect results
   *
   * @param stream - Async generator of stream events
   * @returns Assistant message and tool results
   */
  private async processStream(
    stream: AsyncGenerator<StreamEvent>
  ): Promise<{
    assistantMessage: string;
    toolResults: Array<{ toolUseId: string; result: unknown }>;
  }> {
    let assistantMessage = '';
    const toolResults: Array<{ toolUseId: string; result: unknown }> = [];

    // Get current mode
    const mode = (process.env.FLOYD_MODE as 'ask' | 'yolo' | 'plan' | 'auto') || 'ask';

    await this.streamHandler.processStream(
      stream,
      {
        onToken: (token: string) => {
          assistantMessage += token;
          this.callbacks.onToken?.(token);
        },
        onToolStart: async (toolName: string, input: Record<string, unknown>) => {
          logger.info('Executing tool', { toolName, input, mode });

          // Notify callback
          this.callbacks.onToolStart?.(toolName, input);

          // Get tool definition to check permission level
          const toolDef = toolRegistry.get(toolName);
          const permissionLevel = toolDef?.permission || 'moderate';

          // Mode-based Permission Logic
          let permissionGranted = false;

          if (mode === 'plan') {
            // PLAN mode: Only allow read-only tools (permission: 'none')
            if (permissionLevel === 'none') {
              permissionGranted = true;
            } else {
              logger.info(`Blocked tool execution in PLAN mode: ${toolName}`);
              // We don't ask, we just block
              permissionGranted = false;
            }
          } else if (mode === 'yolo') {
            // YOLO mode: Auto-approve 'none' and 'moderate' permissions
            if (permissionLevel === 'none' || permissionLevel === 'moderate') {
              permissionGranted = true;
              logger.info(`Auto-approving tool in YOLO mode: ${toolName}`);
            } else {
              // Still ask for dangerous tools
              permissionGranted = await permissionManager.requestPermission(toolName, input);
            }
          } else {
            // ASK / AUTO mode: Default behavior, ask unless it's 'none'
            // (Assuming permissionManager handles 'none' auto-approval internally, checking...)
            // Actually permissionManager always asks currently.
            // Let's optimize: We can auto-approve 'none' here too if we want,
            // but for safety let's rely on permissionManager.
            permissionGranted = await permissionManager.requestPermission(toolName, input);
          }

          // If permission denied, return error and skip execution
          if (!permissionGranted) {
            const isPlanBlock = mode === 'plan' && permissionLevel !== 'none';
            const logMsg = isPlanBlock
              ? `Tool execution blocked in PLAN mode: ${toolName}`
              : `Permission denied for tool: ${toolName}`;

            logger.warn(logMsg);

            const errorResult = {
              success: false,
              error: {
                code: isPlanBlock ? 'PLAN_MODE_BLOCK' : 'PERMISSION_DENIED',
                message: isPlanBlock
                  ? `Tool execution blocked. You are in PLAN mode, which permits only read-only operations.`
                  : `Permission denied for tool "${toolName}"`,
              },
            };

            // Store error result for later
            const pendingToolUse = this.streamHandler.getPendingToolUse();
            if (pendingToolUse) {
              toolResults.push({
                toolUseId: pendingToolUse.id as string,
                result: errorResult,
              });
            }

            // Notify callback
            this.callbacks.onToolComplete?.(toolName, errorResult);
            return;
          }

          // Execute tool through registry with granted permission
          const result = await toolRegistry.execute(toolName, input, {
            permissionGranted: true,
          });

          // Store result for later
          const pendingToolUse = this.streamHandler.getPendingToolUse();
          if (pendingToolUse) {
            toolResults.push({
              toolUseId: pendingToolUse.id as string,
              result,
            });
          }

          // Notify callback
          this.callbacks.onToolComplete?.(toolName, result);
        },
        onError: (error: string) => {
          logger.error('Stream error', new Error(error));
        },
      }
    );

    logger.debug('Stream processing complete', {
      assistantMessageLength: assistantMessage.length,
      toolResultsCount: toolResults.length,
    });

    return { assistantMessage, toolResults };
  }

  /**
   * Build tool definitions for GLM-4.7 API
   *
   * GLM API expects OpenAI-style format:
   * {
   *   type: "function",
   *   function: {
   *     name: "...",
   *     description: "...",
   *     parameters: {...}  // JSON Schema format
   *   }
   * }
   *
   * @returns Array of tool definitions in GLM API format
   */
  private buildToolDefinitions(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }> {
    const tools = toolRegistry.getAll();

    logger.debug('Building tool definitions', {
      toolCount: tools.length,
    });

    return tools.map((tool) => {
      // Convert Zod schema to JSON Schema format
      const zodSchema = tool.inputSchema;
      const jsonSchema = this.zodToJsonSchema(zodSchema);

      return {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: jsonSchema,
        },
      };
    });
  }

  /**
   * Convert Zod schema to JSON Schema format
   * This is a simplified conversion for basic schemas
   */
  private zodToJsonSchema(zodSchema: unknown): Record<string, unknown> {
    // Get the Zod schema definition (using any for Zod internals)
    const schema = zodSchema as any;

    // Check if it's a ZodObject
    if (schema._def?.typeName === 'ZodObject') {
      const shape = schema._def?.shape() as Record<string, any> | undefined;

      if (!shape) {
        return { type: 'object', properties: {} };
      }

      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const fieldSchema = value as any;
        const jsonSchema = this.convertZodTypeToJsonSchema(fieldSchema);
        properties[key] = jsonSchema;

        // Check if field is optional (has _def typeName ZodOptional)
        const isOptional = fieldSchema._def?.typeName === 'ZodOptional' ||
          fieldSchema._def?.typeName === 'ZodDefault';

        if (!isOptional) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    // Fallback for other types
    return { type: 'object', properties: {} };
  }

  /**
   * Convert individual Zod type to JSON Schema type
   */
  private convertZodTypeToJsonSchema(zodType: any): Record<string, unknown> {
    const typeName = zodType._def?.typeName as string | undefined;

    // Handle optional/default wrappers
    if (typeName === 'ZodOptional' || typeName === 'ZodDefault') {
      const innerType = zodType._def?.innerType as any;
      if (innerType) {
        return this.convertZodTypeToJsonSchema(innerType);
      }
    }

    // Handle basic types
    switch (typeName) {
      case 'ZodString':
        return { type: 'string' };
      case 'ZodNumber':
        return { type: 'number' };
      case 'ZodBoolean':
        return { type: 'boolean' };
      case 'ZodArray':
        return {
          type: 'array',
          items: this.convertZodTypeToJsonSchema(zodType._def?.type),
        };
      case 'ZodObject':
        return this.zodToJsonSchema(zodType);
      case 'ZodEnum':
        return { type: 'string', enum: zodType._def?.values || [] };
      case 'ZodLiteral':
        return { const: zodType._def?.value };
      case 'ZodUnion':
        const options = zodType._def?.options as any[];
        if (options && options.length > 0) {
          return this.convertZodTypeToJsonSchema(options[0]);
        }
        return { type: 'string' };
      default:
        // Fallback for unknown types
        return { type: 'string' };
    }
  }

  /**
   * Get current conversation history
   *
   * @returns Current conversation history
   */
  getHistory(): ConversationHistory {
    return this.history;
  }

  /**
   * Get token usage statistics
   */
  getTokenStatistics() {
    return this.glmClient.getTokenUsage();
  }

  /**
   * Reset conversation history
   */
  reset(): void {
    this.history = {
      messages: [],
      turnCount: 0,
      tokenCount: 0,
    };

    logger.debug('Conversation history reset');
  }
}
