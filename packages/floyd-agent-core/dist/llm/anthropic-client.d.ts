/**
 * Anthropic SDK LLM client
 *
 * For direct Anthropic API access (api.anthropic.com).
 * Uses the Anthropic SDK for native handling of the Anthropic messages format.
 */
import type { LLMClient, LLMClientOptions, LLMMessage, LLMTool, StreamChunk, LLMChatCallbacks } from './types.js';
export declare class AnthropicClient implements LLMClient {
    private client;
    private model;
    private maxTokens;
    private baseURL;
    constructor(options: LLMClientOptions);
    getModel(): string;
    getBaseURL(): string;
    chat(messages: LLMMessage[], tools: LLMTool[], callbacks?: LLMChatCallbacks): AsyncGenerator<StreamChunk, void, unknown>;
}
//# sourceMappingURL=anthropic-client.d.ts.map