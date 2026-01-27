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
import { buildHardenedSystemPrompt } from '../prompts/hardened/index.js';
import type { SessionManager } from '../persistence/session-manager.js';
import { getSandboxManager } from '../sandbox/index.js';
import * as path from 'node:path';

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
  /** FIX #3: Called when an auto-checkpoint is created before a dangerous tool */
  onCheckpointCreated?: (checkpointId: string, fileCount: number, toolName: string) => void;
  /** FIX #2: Called when AUTO mode adapts its behavior */
  onModeAdapt?: (fromMode: string, toMode: string, toolName: string) => void;
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
  private config: FloydConfig; // Store config to rebuild system prompt later
  private sandboxManager = getSandboxManager();

  constructor(
    config: FloydConfig,
    callbacks?: EngineCallbacks,
    sessionManager?: SessionManager
  ) {
    // Register all core tools
    registerCoreTools();

    this.config = config; // Store config
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
      // Use hardened prompt system if feature flag is enabled
      const systemPrompt = config.useHardenedPrompt
        ? buildHardenedSystemPrompt({
            workingDirectory: config.cwd,
            projectContext: config.projectContext,
            enablePreservedThinking: config.enablePreservedThinking,
            enableTurnLevelThinking: config.enableTurnLevelThinking,
            maxTurns: config.maxTurns,
            useJsonPlanning: config.useJsonPlanning,
          })
        : buildSystemPrompt({
            workingDirectory: config.cwd,
            projectContext: config.projectContext,
          });
      
      logger.info('System prompt loaded', {
        hardened: config.useHardenedPrompt,
        preservedThinking: config.enablePreservedThinking,
        turnLevelThinking: config.enableTurnLevelThinking,
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
    const mode = (process.env.FLOYD_MODE as 'ask' | 'yolo' | 'plan' | 'auto' | 'dialogue' | 'fuckit') || 'ask';

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

          // GAP #5 FIX: Extract target for audit logging
          const target = this.extractTarget(input);

          // Mode-based Permission Logic
          let permissionGranted = false;

          if (mode === 'fuckit') {
            // FUCKIT mode: NO RESTRICTIONS. ALL PERMISSIONS GRANTED.
            // This mode bypasses ALL permission checks - use at your own risk!
            permissionGranted = true;
            logger.info(`[PERMIT] ${toolName}:${target} - AUTO-APPROVED (FUCKIT mode)`);
          } else if (mode === 'yolo') {
            // YOLO mode: Auto-approve safe tools (permission: none or moderate)
            // but still require permission for dangerous tools (delete_file, git_commit, etc.)
            if (permissionLevel === 'dangerous') {
              logger.info(`YOLO mode: Dangerous tool ${toolName} requires explicit permission`);
              permissionGranted = await permissionManager.requestPermission(toolName, input);
            } else {
              permissionGranted = true;
              logger.info(`[PERMIT] ${toolName}:${target} - AUTO-APPROVED (YOLO mode, safe tool)`);
            }
          } else if (mode === 'plan') {
            // PLAN mode: Only allow read-only tools (permission: 'none')
            if (permissionLevel === 'none') {
              permissionGranted = true;
              logger.debug(`[PERMIT] ${toolName}:${target} - AUTO-APPROVED (PLAN mode, read-only)`);
            } else {
              // GAP #5 FIX: Clear PLAN mode block message
              logger.warn(`[PERMIT] ${toolName}:${target} - DENIED (PLAN mode blocks writes)`);
              permissionGranted = false;
            }
          } else if (mode === 'auto') {
            // FIX #2: AUTO mode - Adapt behavior based on request complexity
            const isComplex = this.assessComplexity(toolName, input, permissionLevel);
            if (isComplex) {
              // Complex task: Switch to PLAN mode behavior temporarily
              logger.info(`AUTO mode: Complex task detected, switching to PLAN mode behavior for ${toolName}`);
              // Notify user about mode adaptation
              if (this.callbacks.onModeAdapt) {
                this.callbacks.onModeAdapt('auto', 'plan', toolName);
              }
              // Use PLAN mode logic: only allow read-only tools
              if (permissionLevel === 'none') {
                permissionGranted = true;
                logger.info(`[PERMIT] ${toolName}:${target} - AUTO-APPROVED (AUTO→PLAN mode, read-only)`);
              } else {
                logger.warn(`[PERMIT] ${toolName}:${target} - DENIED (AUTO→PLAN mode blocks writes)`);
                permissionGranted = false;
              }
            } else {
              // Simple task: Use ASK mode behavior with auto-approval for safe tools
              if (permissionLevel === 'none' || permissionLevel === 'moderate') {
                permissionGranted = true;
                logger.info(`[PERMIT] ${toolName}:${target} - AUTO-APPROVED (AUTO mode, simple task)`);
              } else {
                // Dangerous tools in AUTO mode always ask, even for simple tasks
                permissionGranted = await permissionManager.requestPermission(toolName, input);
              }
            }
          } else {
            // ASK / DIALOGUE mode: Default behavior, ask unless it's 'none'
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

          // GAP #8 FIX: Working directory enforcement for file operations
          const validationError = this.validateWorkingDirectory(toolName, input);
          if (validationError) {
            logger.warn(`Working directory violation: ${toolName}`, { input, cwd: this.config.cwd });

            const errorResult = {
              success: false,
              error: {
                code: 'WORKING_DIRECTORY_VIOLATION',
                message: validationError,
              },
            };

            const pendingToolUse = this.streamHandler.getPendingToolUse();
            if (pendingToolUse) {
              toolResults.push({
                toolUseId: pendingToolUse.id as string,
                result: errorResult,
              });
            }

            this.callbacks.onToolComplete?.(toolName, errorResult);
            return;
          }

          // FIX #3: Execute tool through registry with auto-checkpoint
          // This creates a checkpoint before dangerous operations
          const resultWithCheckpoint = await toolRegistry.executeWithAutoCheckpoint(toolName, input, {
            permissionGranted: true,
            sessionId: this.sessionManager?.getCurrentSessionId() ?? undefined,
          });

          // FIX #3: Show checkpoint notification to user
          if (resultWithCheckpoint.checkpoint) {
            const cp = resultWithCheckpoint.checkpoint;
            logger.info(`📦 Auto-checkpoint created before ${toolName}`, {
              checkpointId: cp.id.slice(0, 12),
              fileCount: cp.fileCount,
            });
            // Notify user via callback
            this.callbacks.onCheckpointCreated?.(cp.id.slice(0, 12), cp.fileCount, toolName);
          }

          // Extract the base result (without checkpoint) for compatibility
          const { checkpoint, ...result } = resultWithCheckpoint;

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
   * GAP #5 FIX: Extract target from input for audit logging
   * Shows what the tool is acting on (file path, URL, etc.)
   */
  private extractTarget(input: Record<string, unknown>): string {
    // Try common target field names
    const targetFields = ['file_path', 'path', 'filePath', 'url', 'command', 'query', 'pattern'];
    for (const field of targetFields) {
      if (input[field] && typeof input[field] === 'string') {
        const value = input[field] as string;
        // Truncate long values for readability
        return value.length > 50 ? value.substring(0, 47) + '...' : value;
      }
    }
    // Fallback to tool name if no target found
    return '(no target)';
  }

  /**
   * FIX #2: Assess task complexity for AUTO mode
   * Determines if a tool execution is "complex" based on:
   * - Tool permission level (dangerous = complex)
   * - Number of files affected (arrays of paths)
   * - Input size (large inputs = complex)
   *
   * @param toolName - Name of the tool being executed
   * @param input - Tool input parameters
   * @param permissionLevel - Permission level of the tool
   * @returns true if task is complex, false if simple
   */
  private assessComplexity(toolName: string, input: Record<string, unknown>, permissionLevel: string): boolean {
    // Dangerous tools are always complex
    if (permissionLevel === 'dangerous') {
      return true;
    }

    // Check for batch operations (arrays of files/paths)
    const inputObj = input as Record<string, unknown>;
    const arrayFields = ['paths', 'files', 'file_paths', 'targets', 'queries', 'patterns'];
    for (const field of arrayFields) {
      if (Array.isArray(inputObj[field]) && (inputObj[field] as unknown[]).length > 1) {
        return true; // Multiple items = complex
      }
    }

    // Check input size (large JSON inputs might be complex)
    const inputSize = JSON.stringify(input).length;
    if (inputSize > 1000) {
      return true; // Large input = complex
    }

    // Specific tools that are inherently complex
    const complexTools = ['search_replace', 'search_and_replace', 'refactor', 'apply_unified_diff', 'batch_edit'];
    if (complexTools.some(ct => toolName.includes(ct))) {
      return true;
    }

    // Default to simple for read operations and basic tools
    return false;
  }

  /**
   * GAP #8 FIX: Validate that file operations stay within working directory
   * Returns an error message if validation fails, null if valid
   */
  private validateWorkingDirectory(toolName: string, input: Record<string, unknown>): string | null {
    // Only validate file-related tools
    const fileTools = ['write', 'edit_file', 'search_replace', 'move_file', 'delete_file', 'apply_unified_diff', 'edit_range', 'insert_at', 'delete_range'];
    if (!fileTools.includes(toolName)) {
      return null; // Not a file tool, skip validation
    }

    // Get the working directory (resolve to absolute path)
    const cwd = this.config.cwd;
    const resolvedCwd = path.resolve(cwd);

    // Extract file paths from input
    const paths: string[] = [];
    const pathFields = ['file_path', 'path', 'filePath', 'target', 'destination', 'source', 'from', 'to', 'file', 'filename'];
    for (const field of pathFields) {
      const value = input[field];
      if (typeof value === 'string') {
        paths.push(value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') {
            paths.push(item);
          }
        }
      }
    }

    // Validate each path
    for (const pathStr of paths) {
      const resolvedPath = path.resolve(resolvedCwd, pathStr);
      const normalizedPath = path.normalize(resolvedPath);

      // Check if the path is within the working directory
      if (!normalizedPath.startsWith(resolvedCwd + path.sep) && normalizedPath !== resolvedCwd) {
        return `Path "${pathStr}" is outside the working directory (${cwd}). Use relative paths or stay within the project directory.`;
      }
    }

    return null; // All paths valid
  }

  /**
   * Update the system prompt in conversation history
   *
   * Rebuilds the system prompt with current mode and updates the
   * first message in history. Call this when mode changes.
   */
  updateSystemPrompt(): void {
    // Rebuild system prompt with current mode
    const newSystemPrompt = this.config.useHardenedPrompt
      ? buildHardenedSystemPrompt({
          workingDirectory: this.config.cwd,
          projectContext: this.config.projectContext,
          enablePreservedThinking: this.config.enablePreservedThinking,
          enableTurnLevelThinking: this.config.enableTurnLevelThinking,
          maxTurns: this.config.maxTurns,
          useJsonPlanning: this.config.useJsonPlanning,
        })
      : buildSystemPrompt({
          workingDirectory: this.config.cwd,
          projectContext: this.config.projectContext,
        });

    // Update the first message in history if it's a system message
    if (this.history.messages.length > 0 && this.history.messages[0].role === 'system') {
      this.history.messages[0].content = newSystemPrompt;
      this.history.messages[0].timestamp = Date.now();
      logger.info('System prompt updated', {
        mode: process.env.FLOYD_MODE || 'ask',
      });
    } else {
      logger.warn('No system message found in history to update');
    }

    // Persist updated system prompt if we have a session manager
    if (this.sessionManager) {
      // Note: Session manager doesn't have a direct "update system message" method,
      // so we just log here. The updated prompt will be used for current session.
      logger.debug('System prompt updated in memory for current session');
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
   * Get sandbox status for display
   *
   * @returns Sandbox status string for display in terminal
   */
  getSandboxStatus(): { active: boolean; text: string } {
    if (!this.sandboxManager.isActive()) {
      return { active: false, text: '' };
    }

    const summary = this.sandboxManager.getChangesSummary();

    return {
      active: true,
      text: ` | 🔒sandbox:${summary.total}changes`,
    };
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
