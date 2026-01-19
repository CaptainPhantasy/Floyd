/**
 * Anthropic SDK LLM client
 *
 * For direct Anthropic API access (api.anthropic.com).
 * Uses the Anthropic SDK for native handling of the Anthropic messages format.
 */
import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_ANTHROPIC_CONFIG } from '../constants.js';
import { humanizeError, formatHumanizedError } from '../utils/error-humanizer.js';
export class AnthropicClient {
    client;
    model;
    maxTokens;
    baseURL;
    constructor(options) {
        this.baseURL = options.baseURL ?? DEFAULT_ANTHROPIC_CONFIG.endpoint;
        this.model = options.model ?? DEFAULT_ANTHROPIC_CONFIG.model;
        this.maxTokens = options.maxTokens ?? 8192;
        this.client = new Anthropic({
            apiKey: options.apiKey,
            baseURL: this.baseURL,
            defaultHeaders: options.defaultHeaders,
        });
    }
    getModel() {
        return this.model;
    }
    getBaseURL() {
        return this.baseURL;
    }
    async *chat(messages, tools, callbacks) {
        try {
            // Convert tools to Anthropic format
            const anthropicTools = tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            }));
            // Separate system message from other messages
            const systemMessage = messages.find((m) => m.role === 'system')?.content;
            const chatMessages = messages
                .filter((m) => m.role !== 'system')
                .map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            const stream = await this.client.messages.stream({
                model: this.model,
                max_tokens: this.maxTokens,
                system: systemMessage,
                messages: chatMessages,
                tools: anthropicTools.length > 0 ? anthropicTools : undefined,
            });
            let currentToolUse = null;
            for await (const event of stream) {
                if (event.type === 'content_block_start') {
                    if (event.content_block.type === 'tool_use') {
                        currentToolUse = {
                            id: event.content_block.id,
                            name: event.content_block.name,
                            input: '',
                        };
                        const toolStartChunk = {
                            tool_call_id: currentToolUse.id,
                            tool_call: {
                                id: currentToolUse.id,
                                name: currentToolUse.name,
                                input: {},
                            },
                        };
                        callbacks?.onToolStart?.(toolStartChunk.tool_call);
                        yield toolStartChunk;
                    }
                }
                else if (event.type === 'content_block_delta') {
                    if (event.delta.type === 'text_delta') {
                        const textChunk = {
                            token: event.delta.text,
                        };
                        callbacks?.onChunk?.(textChunk);
                        yield textChunk;
                    }
                    else if (event.delta.type === 'input_json_delta' && currentToolUse) {
                        currentToolUse.input += event.delta.partial_json;
                    }
                    else if (event.delta.type === 'thinking_delta') {
                        // Handle thinking/reasoning output
                        const thinkingChunk = {
                            thinking: event.delta.thinking,
                        };
                        yield thinkingChunk;
                    }
                }
                else if (event.type === 'content_block_stop' && currentToolUse) {
                    // Tool use complete
                    let parsedInput = {};
                    try {
                        parsedInput = JSON.parse(currentToolUse.input || '{}');
                    }
                    catch {
                        console.warn('[AnthropicClient] Failed to parse tool input:', currentToolUse.input);
                        parsedInput = { _parseError: true, _raw: currentToolUse.input };
                    }
                    const toolCompleteChunk = {
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
                }
                else if (event.type === 'message_stop') {
                    const finalMessage = await stream.finalMessage();
                    const doneChunk = {
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
        }
        catch (error) {
            const humanized = humanizeError(error instanceof Error ? error : String(error));
            const userMessage = formatHumanizedError(humanized, false);
            const errorChunk = {
                error: userMessage,
                done: true,
            };
            callbacks?.onError?.(new Error(userMessage));
            yield errorChunk;
        }
    }
}
//# sourceMappingURL=anthropic-client.js.map