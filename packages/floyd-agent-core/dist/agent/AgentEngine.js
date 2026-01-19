// Agent Engine - Core AI agent orchestrator
// This is the shared agent core used by CLI, Desktop, and potentially other UIs
import Anthropic from '@anthropic-ai/sdk';
/**
 * AgentEngine - The core AI agent that manages conversations, tools, and streaming
 *
 * This class is UI-agnostic and can be used in:
 * - CLI applications (Ink)
 * - Desktop applications (Electron)
 * - Web applications
 * - Testing environments
 */
export class AgentEngine {
    anthropic;
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
    constructor(options, mcpManager, sessionManager, permissionManager, config) {
        this.mcpManager = mcpManager;
        this.sessionManager = sessionManager;
        this.permissionManager = permissionManager;
        this.config = config;
        // Set options with defaults
        this.model = options.model ?? 'glm-4.7';
        this.maxTokens = options.maxTokens ?? 8192;
        this.maxTurns = options.maxTurns ?? 10;
        this.temperature = options.temperature ?? 0.2;
        this.enableThinkingMode = options.enableThinkingMode ?? true;
        this.outputFormat = options.outputFormat ?? 'plain';
        // Initialize Anthropic client with Zai GLM-4.7 API
        this.anthropic = new Anthropic({
            apiKey: options.apiKey,
            baseURL: options.baseURL ?? 'https://api.z.ai/api/paas/v4/chat/completions',
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
            const tools = await this.mcpManager.listTools();
            // Transform MCP tools to Anthropic format
            const anthropicTools = tools.map(tool => ({
                name: tool.name,
                description: tool.description || '',
                input_schema: {
                    type: 'object',
                    ...tool.inputSchema,
                },
            }));
            // Separate system prompt from history for Anthropic API
            const systemMessage = this.history.find(m => m.role === 'system');
            const conversationHistory = this.history.filter(m => m.role !== 'system');
            // Create the streaming request
            const stream = await this.anthropic.messages.create({
                model: this.model,
                messages: conversationHistory,
                system: systemMessage?.content || this.config.systemPrompt,
                tools: anthropicTools.length > 0 ? anthropicTools : undefined,
                stream: true,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
            });
            let assistantContent = '';
            let toolCalls = [];
            let currentBlock = null;
            // Process streaming chunks
            for await (const chunk of stream) {
                if (chunk.type === 'content_block_start') {
                    if (chunk.content_block?.type === 'tool_use') {
                        currentBlock = {
                            id: chunk.content_block.id,
                            name: chunk.content_block.name,
                            input: '',
                        };
                    }
                }
                if (chunk.type === 'content_block_delta') {
                    if (chunk.delta?.type === 'text_delta') {
                        assistantContent += chunk.delta.text;
                        yield chunk.delta.text;
                        callbacks?.onChunk?.(chunk.delta.text);
                    }
                    else if (chunk.delta?.type === 'input_json_delta' && currentBlock) {
                        currentBlock.input += chunk.delta.partial_json;
                    }
                }
                if (chunk.type === 'content_block_stop' && currentBlock?.name) {
                    // Safely parse tool input - handle malformed JSON gracefully (Bug #63)
                    let parsedInput = {};
                    try {
                        parsedInput = JSON.parse(currentBlock.input || '{}');
                    }
                    catch (parseError) {
                        console.warn('[AgentEngine] Malformed JSON in tool input:', parseError);
                        parsedInput = { _parseError: true, _raw: currentBlock.input };
                    }
                    const toolCall = {
                        id: currentBlock.id,
                        name: currentBlock.name,
                        input: parsedInput,
                        status: 'pending',
                    };
                    toolCalls.push(toolCall);
                    currentBlock = null;
                }
            }
            // Build assistant message
            const assistantMessage = {
                role: 'assistant',
                content: assistantContent,
            };
            if (toolCalls.length > 0) {
                // Build content array with tool_use blocks
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
}
//# sourceMappingURL=AgentEngine.js.map