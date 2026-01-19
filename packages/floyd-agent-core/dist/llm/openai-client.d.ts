/**
 * OpenAI-compatible LLM client
 *
 * Works with GLM (api.z.ai), OpenAI, DeepSeek, and other OpenAI-compatible APIs.
 * Uses the OpenAI SDK for consistent handling of the OpenAI chat completions format.
 */
import type { LLMClient, LLMClientOptions, LLMMessage, LLMTool, StreamChunk, LLMChatCallbacks } from './types.js';
export declare class OpenAICompatibleClient implements LLMClient {
    private client;
    private model;
    private maxTokens;
    private baseURL;
    private defaultHeaders;
    constructor(options: LLMClientOptions);
    getModel(): string;
    getBaseURL(): string;
    chat(messages: LLMMessage[], tools: LLMTool[], callbacks?: LLMChatCallbacks): AsyncGenerator<StreamChunk, void, unknown>;
}
//# sourceMappingURL=openai-client.d.ts.map