// Agent Engine - Core AI agent orchestrator
// This is the shared agent core used by CLI, Desktop, and potentially other UIs
import { createLLMClient } from '../llm/index.js';
import { PROVIDER_DEFAULTS, inferProviderFromEndpoint } from '../constants.js';
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
export class AgentEngine {
    llmClient;
    mcpManager;
    sessionManager;
    permissionManager;
    config;
    currentSession = null;
    history = [];
    // Options
    model;
    maxTokens;
    maxTurns;
    temperature;
    enableThinkingMode;
    outputFormat;
    provider;
    baseURL;
    constructor(options, mcpManager, sessionManager, permissionManager, config) {
        this.mcpManager = mcpManager;
        this.sessionManager = sessionManager;
        this.permissionManager = permissionManager;
        this.config = config;
        // Determine provider from options or endpoint
        this.provider = options.provider ?? inferProviderFromEndpoint(options.baseURL ?? '');
        const defaults = PROVIDER_DEFAULTS[this.provider];
        // Set options with defaults from provider
        this.baseURL = options.baseURL ?? defaults.endpoint;
        this.model = options.model ?? defaults.model;
        this.maxTokens = options.maxTokens ?? 8192;
        this.maxTurns = options.maxTurns ?? 10;
        this.temperature = options.temperature ?? 0.2;
        this.enableThinkingMode = options.enableThinkingMode ?? true;
        this.outputFormat = options.outputFormat ?? 'plain';
        // Create LLM client using factory
        this.llmClient = createLLMClient({
            apiKey: options.apiKey,
            baseURL: this.baseURL,
            model: this.model,
            maxTokens: this.maxTokens,
            temperature: this.temperature,
            defaultHeaders: options.defaultHeaders,
            provider: this.provider,
        });
    }
    /**
     * Initialize a new session or load an existing one
     */
    async initSession(cwd, sessionId) {
        if (sessionId) {
            this.currentSession = await this.sessionManager.loadSession(sessionId);
            if (this.currentSession) {
                this.history = this.currentSession.messages;
                return this.currentSession;
            }
        }
        // Create new session
        this.currentSession = await this.sessionManager.createSession(cwd);
        this.history = [{ role: 'system', content: this.config.systemPrompt }];
        return this.currentSession;
    }
    /**
     * Load an existing session by ID
     */
    async loadSession(sessionId) {
        this.currentSession = await this.sessionManager.loadSession(sessionId);
        if (this.currentSession) {
            this.history = this.currentSession.messages;
        }
        return this.currentSession;
    }
    /**
     * Get current session
     */
    getCurrentSession() {
        return this.currentSession;
    }
    /**
     * Get message history
     */
    getHistory() {
        return this.history;
    }
    /**
     * List all available sessions
     */
    async listSessions() {
        return this.sessionManager.listSessions();
    }
    /**
     * Save current session
     */
    async saveSession() {
        if (this.currentSession) {
            this.currentSession.messages = this.history;
            await this.sessionManager.saveSession(this.currentSession);
        }
    }
    /**
     * Delete a session
     */
    async deleteSession(sessionId) {
        if (this.sessionManager.deleteSession) {
            await this.sessionManager.deleteSession(sessionId);
        }
        if (this.currentSession?.id === sessionId) {
            this.currentSession = null;
            this.history = [];
        }
    }
    /**
     * Convert internal history to LLM messages format
     */
    convertHistoryToLLMMessages() {
        return this.history.map((msg) => {
            // Handle complex content (tool_use, tool_result)
            let content;
            if (typeof msg.content === 'string') {
                content = msg.content;
            }
            else if (Array.isArray(msg.content)) {
                // Extract text from content blocks
                content = msg.content
                    .filter((block) => block.type === 'text' || block.type === 'tool_result')
                    .map((block) => {
                    if (block.type === 'text')
                        return block.text;
                    if (block.type === 'tool_result')
                        return `[Tool Result for ${block.tool_use_id}]: ${block.content}`;
                    return '';
                })
                    .join('\n');
            }
            else {
                content = String(msg.content);
            }
            return {
                role: msg.role,
                content,
            };
        });
    }
    /**
     * Send a message and get a streaming response
     *
     * This is the main method for interacting with the agent.
     * It yields chunks of the response as they arrive.
     */
    async *sendMessage(content, callbacks) {
        // Add user message to history
        this.history.push({ role: 'user', content });
        // Save session with user message
        if (this.currentSession) {
            this.currentSession.messages = this.history;
            await this.sessionManager.saveSession(this.currentSession);
        }
        let currentTurnDone = false;
        let turns = 0;
        while (!currentTurnDone && turns < this.maxTurns) {
            turns++;
            // Get available tools from MCP
            const mcpTools = await this.mcpManager.listTools();
            // Transform MCP tools to LLM format
            const tools = mcpTools.map(tool => ({
                name: tool.name,
                description: tool.description || '',
                inputSchema: {
                    type: 'object',
                    ...tool.inputSchema,
                },
            }));
            // Convert history to LLM messages
            const messages = this.convertHistoryToLLMMessages();
            let assistantContent = '';
            let toolCalls = [];
            let currentToolId = null;
            // Stream from LLM client
            try {
                for await (const chunk of this.llmClient.chat(messages, tools)) {
                    // Handle text tokens
                    if (chunk.token) {
                        assistantContent += chunk.token;
                        yield chunk.token;
                        callbacks?.onChunk?.(chunk.token);
                    }
                    // Handle tool call start
                    if (chunk.tool_call && !chunk.tool_use_complete) {
                        currentToolId = chunk.tool_call.id;
                        // Tool call will be finalized when tool_use_complete is true
                    }
                    // Handle tool call complete
                    if (chunk.tool_call && chunk.tool_use_complete) {
                        const toolCall = {
                            id: chunk.tool_call.id,
                            name: chunk.tool_call.name,
                            input: chunk.tool_call.input,
                            status: 'pending',
                        };
                        toolCalls.push(toolCall);
                    }
                    // Handle errors
                    if (chunk.error) {
                        const error = new Error(chunk.error);
                        callbacks?.onError?.(error);
                        yield `\n[Error: ${chunk.error}]\n`;
                    }
                    // Handle completion
                    if (chunk.done) {
                        // Finalize this turn
                    }
                }
            }
            catch (error) {
                const errorMessage = error?.message || String(error);
                callbacks?.onError?.(error instanceof Error ? error : new Error(errorMessage));
                yield `\n[Error: ${errorMessage}]\n`;
                currentTurnDone = true;
                continue;
            }
            // Build assistant message
            const assistantMessage = {
                role: 'assistant',
                content: assistantContent,
            };
            if (toolCalls.length > 0) {
                // Store tool calls in message for history
                assistantMessage.content = [
                    { type: 'text', text: assistantContent },
                    ...toolCalls.map(tc => ({
                        type: 'tool_use',
                        id: tc.id,
                        name: tc.name,
                        input: tc.input,
                    })),
                ];
            }
            // Add assistant message to history
            this.history.push(assistantMessage);
            if (this.currentSession) {
                this.currentSession.messages = this.history;
                await this.sessionManager.saveSession(this.currentSession);
            }
            // Process tool calls if any
            if (toolCalls.length > 0) {
                for (const tc of toolCalls) {
                    yield `\n[Requesting tool: ${tc.name}]\n`;
                    // Permission check
                    const permission = await this.permissionManager.checkPermission(tc.name);
                    if (permission === 'deny') {
                        yield `\n[Permission denied for tool: ${tc.name}]\n`;
                        this.history.push({
                            role: 'user',
                            content: [
                                {
                                    type: 'tool_result',
                                    tool_use_id: tc.id,
                                    content: 'Error: Permission denied by user configuration.',
                                },
                            ],
                        });
                        continue;
                    }
                    // Execute tool
                    callbacks?.onToolStart?.(tc);
                    try {
                        const result = await this.mcpManager.callTool(tc.name, tc.input);
                        const toolResultMessage = {
                            role: 'user',
                            content: [
                                {
                                    type: 'tool_result',
                                    tool_use_id: tc.id,
                                    content: typeof result === 'string' ? result : JSON.stringify(result),
                                },
                            ],
                        };
                        this.history.push(toolResultMessage);
                        tc.status = 'completed';
                        tc.output = typeof result === 'string' ? result : JSON.stringify(result);
                        callbacks?.onToolComplete?.(tc);
                    }
                    catch (error) {
                        this.history.push({
                            role: 'user',
                            content: [
                                {
                                    type: 'tool_result',
                                    tool_use_id: tc.id,
                                    content: `Error: ${error.message}`,
                                },
                            ],
                        });
                        tc.status = 'failed';
                        tc.error = error.message;
                        callbacks?.onToolComplete?.(tc);
                    }
                }
            }
            else {
                currentTurnDone = true;
            }
        }
        callbacks?.onDone?.();
    }
    /**
     * Send a message without streaming (returns complete response)
     */
    async sendMessageComplete(content) {
        let fullResponse = '';
        for await (const chunk of this.sendMessage(content)) {
            fullResponse += chunk;
        }
        return fullResponse;
    }
    /**
     * List available tools
     */
    async listTools() {
        const tools = await this.mcpManager.listTools();
        return tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
        }));
    }
    /**
     * Call a tool directly
     */
    async callTool(name, input) {
        return this.mcpManager.callTool(name, input);
    }
    /**
     * Clear history (keep system prompt)
     */
    clearHistory() {
        const systemMsg = this.history.find(m => m.role === 'system');
        this.history = systemMsg ? [systemMsg] : [];
    }
    /**
     * Reset to a fresh state
     */
    async reset() {
        this.history = [];
        this.currentSession = null;
    }
    /**
     * Get the current model name
     */
    getModel() {
        return this.model;
    }
    /**
     * Get the current base URL
     */
    getBaseURL() {
        return this.baseURL;
    }
    /**
     * Get the current provider
     */
    getProvider() {
        return this.provider;
    }
}
//# sourceMappingURL=AgentEngine.js.map