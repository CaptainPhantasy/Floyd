import type { MCPClientManager } from '../mcp/client-manager.js';
import type { ISessionManager, IPermissionManager, IConfig, SessionData } from './interfaces.js';
import type { Message, ToolCall } from './types.js';
import { type Provider } from '../constants.js';
export type { Message, ToolCall, AgentEvent } from './types.js';
export type { StreamChunk } from '../llm/types.js';
export type { ISessionManager, IPermissionManager, IConfig, SessionData } from './interfaces.js';
export interface AgentEngineOptions {
    apiKey: string;
    baseURL?: string;
    model?: string;
    maxTokens?: number;
    maxTurns?: number;
    defaultHeaders?: Record<string, string>;
    temperature?: number;
    enableThinkingMode?: boolean;
    outputFormat?: 'ansi' | 'plain' | 'markdown';
    provider?: Provider;
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
 *
 * Now uses unified LLMClient abstraction to support multiple providers:
 * - GLM (api.z.ai) - OpenAI-compatible format
 * - OpenAI (api.openai.com) - OpenAI format
 * - Anthropic (api.anthropic.com) - Anthropic format
 * - DeepSeek (api.deepseek.com) - OpenAI-compatible format
 */
export declare class AgentEngine {
    private llmClient;
    private mcpManager;
    private sessionManager;
    private permissionManager;
    private config;
    private currentSession;
    history: Message[];
    private model;
    private maxTokens;
    private maxTurns;
    private temperature;
    private enableThinkingMode;
    private outputFormat;
    private provider;
    private baseURL;
    constructor(options: AgentEngineOptions, mcpManager: MCPClientManager, sessionManager: ISessionManager, permissionManager: IPermissionManager, config: IConfig);
    /**
     * Initialize a new session or load an existing one
     */
    initSession(cwd: string, sessionId?: string): Promise<SessionData>;
    /**
     * Load an existing session by ID
     */
    loadSession(sessionId: string): Promise<SessionData | null>;
    /**
     * Get current session
     */
    getCurrentSession(): SessionData | null;
    /**
     * Get message history
     */
    getHistory(): Message[];
    /**
     * List all available sessions
     */
    listSessions(): Promise<SessionData[]>;
    /**
     * Save current session
     */
    saveSession(): Promise<void>;
    /**
     * Delete a session
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * ⚠️ DO NOT MODIFY - Tool role conversion (CRITICAL for multi-turn conversations)
     * Convert internal history to LLM messages format
     *
     * BREAKING CHANGE: Modifying this will break multi-turn tool conversations
     * VERIFIED WORKING: 2026-01-25 - 4-turn conversation with tools tested
     */
    private convertHistoryToLLMMessages;
    /**
     * Send a message and get a streaming response
     *
     * This is the main method for interacting with the agent.
     * It yields chunks of the response as they arrive.
     */
    sendMessage(content: string, callbacks?: AgentCallbacks): AsyncGenerator<string, void, unknown>;
    /**
     * Truncate large output to prevent context window overflow
     */
    private truncateOutput;
    /**
     * Send a message without streaming (returns complete response)
     */
    sendMessageComplete(content: string): Promise<string>;
    /**
     * List available tools
     */
    listTools(): Promise<any[]>;
    /**
     * Call a tool directly
     */
    callTool(name: string, input: Record<string, any>): Promise<any>;
    /**
     * Clear history (keep system prompt)
     */
    clearHistory(): void;
    /**
     * Reset to a fresh state
     */
    reset(): Promise<void>;
    /**
     * Get the current model name
     */
    getModel(): string;
    /**
     * Get the current base URL
     */
    getBaseURL(): string;
    /**
     * Get the current provider
     */
    getProvider(): Provider;
}
//# sourceMappingURL=AgentEngine.d.ts.map