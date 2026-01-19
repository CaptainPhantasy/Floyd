/**
 * OpenAI-compatible LLM client
 * 
 * Works with GLM (api.z.ai), OpenAI, DeepSeek, and other OpenAI-compatible APIs.
 * Uses the OpenAI SDK for consistent handling of the OpenAI chat completions format.
 */

import OpenAI from 'openai';
import type { LLMClient, LLMClientOptions, LLMMessage, LLMTool, StreamChunk, LLMChatCallbacks } from './types.js';
import { DEFAULT_GLM_CONFIG } from '../constants.js';
import { humanizeError, formatHumanizedError } from '../utils/error-humanizer.js';

export class OpenAICompatibleClient implements LLMClient {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(options: LLMClientOptions) {
    this.baseURL = options.baseURL ?? DEFAULT_GLM_CONFIG.endpoint;
    this.model = options.model ?? DEFAULT_GLM_CONFIG.model;
    this.maxTokens = options.maxTokens ?? 8192;
    this.defaultHeaders = options.defaultHeaders ?? {};

    this.client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: this.baseURL,
      defaultHeaders: this.defaultHeaders,
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
      // Convert tools to OpenAI format
      const openaiTools: OpenAI.ChatCompletionTool[] = tools.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      }));

      // Convert messages to OpenAI format
      const openaiMessages: OpenAI.ChatCompletionMessageParam[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: openaiMessages,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
        max_tokens: this.maxTokens,
        stream: true,
      });

      let currentToolCall: {
        id: string;
        name: string;
        arguments: string;
      } | null = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        // Handle text content
        if (delta?.content) {
          const streamChunk: StreamChunk = {
            token: delta.content,
          };
          callbacks?.onChunk?.(streamChunk);
          yield streamChunk;
        }

        // Handle tool calls
        if (delta?.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            if (toolCall.function?.name) {
              // New tool call starting
              currentToolCall = {
                id: toolCall.id || `call_${Date.now()}`,
                name: toolCall.function.name,
                arguments: toolCall.function.arguments || '',
              };

              const toolStartChunk: StreamChunk = {
                tool_call_id: currentToolCall.id,
                tool_call: {
                  id: currentToolCall.id,
                  name: currentToolCall.name,
                  input: {},
                },
              };
              callbacks?.onToolStart?.(toolStartChunk.tool_call!);
              yield toolStartChunk;
            } else if (toolCall.function?.arguments && currentToolCall) {
              // Accumulate arguments
              currentToolCall.arguments += toolCall.function.arguments;
            }
          }
        }

        // Handle finish reason
        if (chunk.choices[0]?.finish_reason) {
          // If we have a pending tool call, finalize it
          if (currentToolCall) {
            let parsedInput: Record<string, unknown> = {};
            try {
              parsedInput = JSON.parse(currentToolCall.arguments || '{}');
            } catch {
              console.warn('[OpenAIClient] Failed to parse tool arguments:', currentToolCall.arguments);
              parsedInput = { _parseError: true, _raw: currentToolCall.arguments };
            }

            const toolCompleteChunk: StreamChunk = {
              tool_call_id: currentToolCall.id,
              tool_call: {
                id: currentToolCall.id,
                name: currentToolCall.name,
                input: parsedInput,
              },
              tool_use_complete: true,
            };
            yield toolCompleteChunk;
            currentToolCall = null;
          }

          const doneChunk: StreamChunk = {
            done: true,
            stop_reason: chunk.choices[0].finish_reason,
          };

          // Include usage if available
          if (chunk.usage) {
            doneChunk.usage = {
              inputTokens: chunk.usage.prompt_tokens,
              outputTokens: chunk.usage.completion_tokens,
            };
          }

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
