/**
 * Anthropic SDK LLM client
 * 
 * For direct Anthropic API access (api.anthropic.com).
 * Uses the Anthropic SDK for native handling of the Anthropic messages format.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMClient, LLMClientOptions, LLMMessage, LLMTool, StreamChunk, LLMChatCallbacks } from './types.js';
import { DEFAULT_ANTHROPIC_CONFIG } from '../constants.js';
import { humanizeError, formatHumanizedError } from '../utils/error-humanizer.js';

export class AnthropicClient implements LLMClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private baseURL: string;

  constructor(options: LLMClientOptions) {
    this.baseURL = options.baseURL ?? DEFAULT_ANTHROPIC_CONFIG.endpoint;
    this.model = options.model ?? DEFAULT_ANTHROPIC_CONFIG.model;
    this.maxTokens = options.maxTokens ?? 8192;

    this.client = new Anthropic({
      apiKey: options.apiKey,
      baseURL: this.baseURL,
      defaultHeaders: options.defaultHeaders,
    });
  }

  getModel(): string {
    return this.model;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  async *chat(
    messages: LLMMessage[],
    tools: LLMTool[],
    callbacks?: LLMChatCallbacks
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      // Convert tools to Anthropic format
      const anthropicTools: Anthropic.Tool[] = tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
      }));

      // Separate system message from other messages
      const systemMessage = messages.find((m) => m.role === 'system')?.content;
      const chatMessages: Anthropic.MessageParam[] = messages
        .filter((m) => m.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemMessage,
        messages: chatMessages,
        tools: anthropicTools.length > 0 ? anthropicTools : undefined,
      });

      let currentToolUse: {
        id: string;
        name: string;
        input: string;
      } | null = null;

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolUse = {
              id: event.content_block.id,
              name: event.content_block.name,
              input: '',
            };

            const toolStartChunk: StreamChunk = {
              tool_call_id: currentToolUse.id,
              tool_call: {
                id: currentToolUse.id,
                name: currentToolUse.name,
                input: {},
              },
            };
            callbacks?.onToolStart?.(toolStartChunk.tool_call!);
            yield toolStartChunk;
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            const textChunk: StreamChunk = {
              token: event.delta.text,
            };
            callbacks?.onChunk?.(textChunk);
            yield textChunk;
          } else if (event.delta.type === 'input_json_delta' && currentToolUse) {
            currentToolUse.input += event.delta.partial_json;
          } else if (event.delta.type === 'thinking_delta') {
            // Handle thinking/reasoning output
            const thinkingChunk: StreamChunk = {
              thinking: (event.delta as { thinking?: string }).thinking,
            };
            yield thinkingChunk;
          }
        } else if (event.type === 'content_block_stop' && currentToolUse) {
          // Tool use complete
          let parsedInput: Record<string, unknown> = {};
          try {
            parsedInput = JSON.parse(currentToolUse.input || '{}');
          } catch {
            console.warn('[AnthropicClient] Failed to parse tool input:', currentToolUse.input);
            parsedInput = { _parseError: true, _raw: currentToolUse.input };
          }

          const toolCompleteChunk: StreamChunk = {
            tool_call_id: currentToolUse.id,
            tool_call: {
              id: currentToolUse.id,
              name: currentToolUse.name,
              input: parsedInput,
            },
            tool_use_complete: true,
          };
          yield toolCompleteChunk;
          currentToolUse = null;
        } else if (event.type === 'message_stop') {
          const finalMessage = await stream.finalMessage();
          
          const doneChunk: StreamChunk = {
            done: true,
            stop_reason: finalMessage.stop_reason ?? undefined,
            usage: {
              inputTokens: finalMessage.usage.input_tokens,
              outputTokens: finalMessage.usage.output_tokens,
            },
          };
          callbacks?.onDone?.();
          yield doneChunk;
        }
      }
    } catch (error) {
      const humanized = humanizeError(error instanceof Error ? error : String(error));
      const userMessage = formatHumanizedError(humanized, false);
      const errorChunk: StreamChunk = {
        error: userMessage,
        done: true,
      };
      callbacks?.onError?.(new Error(userMessage));
      yield errorChunk;
    }
  }
}
