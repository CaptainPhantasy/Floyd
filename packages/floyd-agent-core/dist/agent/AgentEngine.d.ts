import type { MCPClientManager } from '../mcp/client-manager.js';
import type { ISessionManager, IPermissionManager, IConfig, SessionData } from './interfaces.js';
import type { Message, ToolCall } from './types.js';
export type { Message, ToolCall, StreamChunk, AgentEvent } from './types.js';
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
 */
export declare class AgentEngine {
    private anthropic;
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
     * Send a message and get a streaming response
     *
     * This is the main method for interacting with the agent.
     * It yields chunks of the response as they arrive.
     */
    sendMessage(content: string, callbacks?: AgentCallbacks): AsyncGenerator<string, void, unknown>;
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
}
//# sourceMappingURL=AgentEngine.d.ts.map