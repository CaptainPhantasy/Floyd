/**
 * GLM Client - Floyd Wrapper
 *
 * GLM-4.7 API client with streaming support and SSE parsing.
 */

import type { FloydConfig, FloydMessage, StreamEvent } from '../types.js';
import { logger } from '../utils/logger.js';
import { GLMAPIError, StreamError } from '../utils/errors.js';

// ============================================================================
// GLM Stream Options
// ============================================================================

/**
 * Token usage metadata
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Options for streaming chat completion
 */
export interface GLMStreamOptions {
  /** Conversation messages */
  messages: FloydMessage[];
  /** Tool definitions for function calling */
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Temperature (0-2) */
  temperature?: number;
  /** Callback for each token received */
  onToken?: (token: string) => void;
  /** Callback when tool use is detected */
  onToolUse?: (toolUse: unknown) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback on completion with token usage */
  onComplete?: (usage: TokenUsage) => void;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial retry delay in ms (default: 1000) */
  retryDelay?: number;
}

// ============================================================================
// GLM Client Class
// ============================================================================

/**
 * GLM-4.7 API client with streaming support
 */
export class GLMClient {
  private apiKey: string;
  private apiEndpoint: string;
  private model: string;
  private config: FloydConfig;
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;
  // Track streaming tool calls by index
  private pendingToolCalls: Map<number, { id?: string; name?: string; argumentsBuffer: string }> = new Map();

  constructor(config: FloydConfig) {
    this.config = config;
    this.apiKey = config.glmApiKey;
    this.apiEndpoint = config.glmApiEndpoint;
    this.model = config.glmModel;

    if (!this.apiKey) {
      throw new GLMAPIError('GLM API key is not configured', 401);
    }

    logger.debug('GLMClient initialized', {
      endpoint: this.apiEndpoint,
      model: this.model,
    });
  }

  /**
   * Get current token usage statistics
   */
  getTokenUsage(): TokenUsage {
    return {
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      totalTokens: this.totalInputTokens + this.totalOutputTokens,
    };
  }

  /**
   * Reset token usage counters
   */
  resetTokenUsage(): void {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    logger.debug('Token usage counters reset');
  }

  /**
   * Sanitize content to prevent control characters from breaking the terminal
   * Removes dangerous control characters while preserving safe whitespace
   */
  private sanitizeContent(content: string): string {
    // Remove all control characters except:
    // \x0A (LF/Enter), \x0D (CR), \x09 (Tab) - safe whitespace
    // Also remove \x04 (EOT/EOF), \x03 (Ctrl+C), \x1A (SUB), etc.
    return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Calculate exponential backoff delay (optimized for speed)
   */
  private calculateBackoff(attempt: number, baseDelay: number): number {
    // Faster backoff: 500ms, 1000ms, 2000ms (capped)
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.2 * exponentialDelay; // Reduced jitter to 20%
    return Math.min(exponentialDelay + jitter, 5000); // Cap at 5 seconds instead of 30
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stream chat completion with SSE parsing and retry logic
   */
  async *streamChat(options: GLMStreamOptions): AsyncGenerator<StreamEvent> {
    const {
      messages,
      tools = [],
      maxTokens = this.config.maxTokens,
      temperature = this.config.temperature,
      onToken,
      onToolUse,
      onError,
      onComplete,
      maxRetries = 2,  // Reduced from 3 to save ~4.5s
      retryDelay = 500,  // Reduced from 1000ms to fail faster
    } = options;

    logger.debug('Starting GLM stream', {
      messageCount: messages.length,
      toolCount: tools.length,
      maxTokens,
      temperature,
    });

    let lastError: Error | undefined;
    let attempt = 0;

    // Retry loop with exponential backoff
    while (attempt <= maxRetries) {
      try {
        // Build request URL - GLM Coding API uses /chat/completions
        const url = `${this.apiEndpoint}/chat/completions`;

        // Build request body
        const body = {
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          tools: tools.length > 0 ? tools : undefined,
          max_tokens: maxTokens,
          temperature,
          stream: true,
        };

        logger.debug('Sending request to GLM API', {
          url,
          model: this.model,
          attempt: attempt + 1,
        });

        // Make POST request
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
        });

        // Handle HTTP errors with retry
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');

          logger.error('GLM API request failed', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            attempt: attempt + 1,
            url,
          });

          // Retry on rate limit (429) or server errors (5xx)
          if (response.status === 429 || response.status >= 500) {
            if (attempt < maxRetries) {
              const backoffDelay = this.calculateBackoff(attempt, retryDelay);
              logger.warn(`Retrying after ${backoffDelay}ms...`, {
                attempt: attempt + 1,
                maxRetries,
              });
              await this.sleep(backoffDelay);
              attempt++;
              continue;
            }
          }

          throw new GLMAPIError(
            `GLM API returned ${response.status}: ${response.statusText} - ${errorText}`,
            response.status
          );
        }

        // Parse streaming response
        const reader = response.body?.getReader();

        if (!reader) {
          throw new StreamError('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let currentOutputTokens = 0;
        let inputTokens = 0;
        let outputTokens = 0;

        logger.debug('Starting to parse SSE stream');

        // Read SSE stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            logger.debug('SSE stream ended');
            break;
          }

          // Decode chunk
          buffer += decoder.decode(value, { stream: true });

          // Split into lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          // Process each line
          for (const line of lines) {
            if (!line.trim()) continue;
            if (!line.startsWith('data: ')) continue;

            // Extract data part
            const data = line.slice(6).trim();

            // Check for end of stream (OpenAI-style)
            if (data === '[DONE]') {
              logger.debug('Received [DONE] signal');

              // Update token usage
              this.totalInputTokens += inputTokens;
              this.totalOutputTokens += outputTokens || currentOutputTokens;
              const usage = this.getTokenUsage();
              onComplete?.(usage);

              logger.debug('Token usage', usage);
              yield { type: 'done', content: '' };
              return;
            }

            // Parse JSON
            try {
              const parsed = JSON.parse(data);

              // Extract token usage from GLM response (OpenAI-style format)
              if (parsed.usage) {
                const usage = parsed.usage as Record<string, unknown>;
                inputTokens = (usage.prompt_tokens as number) || inputTokens;
                outputTokens = (usage.completion_tokens as number) || outputTokens;
                logger.debug('Token usage from API', { inputTokens, outputTokens });
              }

              // Process the event and check for completion
              for await (const event of this.processSSEEvent(parsed, {
                onToken,
                onToolUse,
              })) {
                yield event;

                // Check if this is a completion event
                if (event.type === 'done') {
                  this.totalInputTokens += inputTokens;
                  this.totalOutputTokens += outputTokens || currentOutputTokens;
                  const finalUsage = this.getTokenUsage();
                  onComplete?.(finalUsage);

                  logger.debug('Token usage', finalUsage);
                  return;
                }
              }

              currentOutputTokens++;
            } catch (parseError) {
              logger.warn('Failed to parse SSE event', { line, error: parseError });
            }
          }
        }

        // Final token usage update
        this.totalInputTokens += inputTokens;
        this.totalOutputTokens += outputTokens || currentOutputTokens;
        const usage = this.getTokenUsage();
        onComplete?.(usage);

        logger.debug('Token usage', usage);
        yield { type: 'done', content: '' };
        return; // Success - exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.error('GLM stream attempt failed', {
          error: lastError.message,
          attempt: attempt + 1,
        });

        // Retry on network errors or rate limits
        if (attempt < maxRetries) {
          const shouldRetry =
            lastError.message.includes('fetch failed') ||
            lastError.message.includes('ECONNREFUSED') ||
            lastError.message.includes('ETIMEDOUT') ||
            (lastError instanceof GLMAPIError && lastError.statusCode === 429);

          if (shouldRetry) {
            const backoffDelay = this.calculateBackoff(attempt, retryDelay);
            logger.warn(`Retrying after ${backoffDelay}ms...`, {
              attempt: attempt + 1,
              maxRetries,
              reason: lastError.message,
            });
            await this.sleep(backoffDelay);
            attempt++;
            continue;
          }
        }

        // Notify error callback
        if (onError) {
          onError(lastError);
        }

        // Yield error event
        yield {
          type: 'error',
          content: '',
          error: lastError.message,
        };

        throw lastError;
      }
    }

    // If we've exhausted retries, throw the last error
    if (lastError) {
      throw lastError;
    }
  }

  /**
   * Process a single SSE event (GLM Coding API uses OpenAI-style format)
   */
  private async *processSSEEvent(
    event: unknown,
    _callbacks: { onToken?: (token: string) => void; onToolUse?: (toolUse: unknown) => void }
  ): AsyncGenerator<StreamEvent> {
    // Type guard for SSE events
    if (!event || typeof event !== 'object') {
      return;
    }

    const parsed = event as Record<string, unknown>;

    // GLM Coding API uses OpenAI-style format: choices[0].delta
    const choices = parsed.choices as Array<Record<string, unknown>> | undefined;

    if (choices && choices.length > 0) {
      const choice = choices[0];
      const delta = choice.delta as Record<string, unknown> | undefined;
      const finishReason = choice.finish_reason as string | undefined;

      // Extract content and tool calls from delta
      if (delta) {
        // Check for tool_calls first (OpenAI/GLM format)
        const toolCalls = delta.tool_calls as Array<Record<string, unknown>> | undefined;

        if (toolCalls && toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            const index = toolCall.index as number | undefined;
            const id = toolCall.id as string | undefined;
            const function_ = toolCall.function as Record<string, unknown> | undefined;

            if (index !== undefined) {
              // Get or create pending tool call
              let pending = this.pendingToolCalls.get(index);

              if (!pending) {
                pending = { argumentsBuffer: '' };
                this.pendingToolCalls.set(index, pending);
              }

              // Update ID if provided
              if (id) {
                pending.id = id;
              }

              // Update name if provided
              if (function_) {
                const name = function_.name as string | undefined;
                const args = function_.arguments as string | undefined;

                if (name) {
                  pending.name = name;
                }

                if (args) {
                  pending.argumentsBuffer += args;
                }
              }

              // Try to parse arguments when we have name and buffer
              if (pending.name && pending.argumentsBuffer) {
                try {
                  const input = JSON.parse(pending.argumentsBuffer);

                  logger.debug('Tool call complete', {
                    id: pending.id,
                    name: pending.name,
                    index,
                  });

                  // Emit tool_use event
                  yield {
                    type: 'tool_use',
                    content: '',
                    toolUse: {
                      id: pending.id || `tool_${Date.now()}_${index}`,
                      name: pending.name,
                      input,
                    },
                  };

                  // Clear pending tool call
                  this.pendingToolCalls.delete(index);
                } catch (parseError) {
                  // Arguments not complete yet, continue buffering
                  logger.debug('Tool call arguments incomplete, buffering...', {
                    name: pending.name,
                    bufferLength: pending.argumentsBuffer.length,
                  });
                }
              }
            }
          }
        } else {
          // No tool calls, process content
          // GLM returns content in 'content' or 'reasoning_content' field
          // We MUST filter out reasoning_content to prevent CoT exposure
          const content = (delta.content as string | undefined);

          // Explicitly ignore reasoning_content field
          if (content) {
            // Sanitize content to prevent control characters from breaking the terminal
            const sanitizedContent = this.sanitizeContent(content);
            yield { type: 'token', content: sanitizedContent };
          }
        }
      }

      // Check for stream completion
      if (finishReason && finishReason !== 'null' && finishReason !== null) {
        logger.debug('Stream completed with reason:', finishReason);

        // Clear any pending tool calls
        this.pendingToolCalls.clear();

        // Emit done event when stream completes
        yield { type: 'done', content: '' };
      }
    }

    // Extract usage info if present
    if (parsed.usage) {
      const usage = parsed.usage as Record<string, unknown>;
      logger.debug('Usage info', {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
      });
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.debug('Testing GLM API connection...');

      // GLM Coding API uses /chat/completions endpoint
      const response = await fetch(`${this.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }],
          stream: false,
        }),
      });

      if (!response.ok) {
        logger.error('API connection test failed', {
          status: response.status,
        });
        return false;
      }

      logger.debug('API connection test successful');
      return true;
    } catch (error) {
      logger.error('API connection test failed', error as Error);
      return false;
    }
  }
}
