/**
 * Stream Handler - Floyd Wrapper
 *
 * Process streaming responses from GLM-4.7 with event emission.
 */

import { EventEmitter } from 'events';
import type { StreamEvent } from '../types.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// Stream Callbacks
// ============================================================================

/**
 * Callbacks for stream events
 */
export interface StreamCallbacks {
  /** Called when each token is received */
  onToken?: (token: string) => void;
  /** Called when a tool use starts */
  onToolStart?: (tool: string, input: Record<string, unknown>) => void;
  /** Called when a tool use completes */
  onToolComplete?: (tool: string, result: unknown) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Called when stream is done */
  onDone?: () => void;
}

// ============================================================================
// Stream Handler Class
// ============================================================================

/**
 * Handles streaming responses with event emission
 */
export class StreamHandler extends EventEmitter {
  private buffer = '';
  private pendingToolUse: Record<string, unknown> | null = null;

  /**
   * Process a stream of events
   */
  async processStream(
    stream: AsyncIterable<StreamEvent>,
    callbacks: StreamCallbacks
  ): Promise<string> {
    let fullResponse = '';
    this.buffer = '';
    this.pendingToolUse = null;

    logger.debug('Starting stream processing');

    for await (const event of stream) {
      switch (event.type) {
        case 'token':
          // Append token to buffer
          this.buffer += event.content;
          fullResponse += event.content;

          // Emit token event
          callbacks.onToken?.(event.content);
          this.emit('token', event.content);
          break;

        case 'tool_use':
          // Store pending tool use
          if (event.toolUse) {
            this.pendingToolUse = event.toolUse;

            logger.debug('Tool use detected', {
              toolName: event.toolUse.name,
            });

            // Emit tool start event (await if async)
            const toolStartPromise = callbacks.onToolStart?.(
              event.toolUse.name,
              event.toolUse.input
            );
            if (toolStartPromise) {
              await toolStartPromise;
            }
            this.emit('toolStart', event.toolUse);
          }
          break;

        case 'tool_result':
          // Emit tool complete event
          if (this.pendingToolUse) {
            logger.debug('Tool result received', {
              toolName: this.pendingToolUse.name,
            });

            callbacks.onToolComplete?.(
              this.pendingToolUse.name as string,
              event.content
            );
            this.emit('toolComplete', {
              tool: this.pendingToolUse.name as string,
              result: event.content,
            });

            this.pendingToolUse = null;
          }
          break;

        case 'error':
          // Emit error event
          logger.error('Stream error', new Error(event.error));

          callbacks.onError?.(event.error || 'Unknown error');
          this.emit('error', event.error);
          break;

        case 'done':
          // Emit done event
          logger.debug('Stream processing complete');

          callbacks.onDone?.();
          this.emit('done');
          break;
      }
    }

    logger.debug('Stream processing finished', {
      responseLength: fullResponse.length,
    });

    return fullResponse;
  }

  /**
   * Get current buffer contents
   */
  getCurrentBuffer(): string {
    return this.buffer;
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.buffer = '';
  }

  /**
   * Get pending tool use
   */
  getPendingToolUse(): Record<string, unknown> | null {
    return this.pendingToolUse;
  }

  /**
   * Reset handler state
   */
  reset(): void {
    this.buffer = '';
    this.pendingToolUse = null;
    this.removeAllListeners();
  }
}
