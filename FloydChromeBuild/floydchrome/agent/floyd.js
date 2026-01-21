/**
 * FLOYD Agent Integration - WebSocket Client
 * Connects to the local Floyd Desktop Web server (ws://localhost:3000)
 */

export class FloydAgent {
  constructor() {
    this.isActive = false;
    this.currentTask = null;
    this.history = [];
    this.ws = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
    this.toolHandlers = new Map();
  }

  /**
   * Initialize connection to Floyd Desktop
   */
  async initialize(config = {}) {
    console.log('[FloydAgent] Connecting to Floyd Desktop...');
    const port = config.port || 3005;
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`ws://localhost:${port}`);
        
        this.ws.onopen = () => {
          console.log('[FloydAgent] Connected to Floyd Desktop');
          this.isActive = true;
          this.setupHandlers();
          resolve({ success: true, message: 'Connected to Floyd Desktop' });
        };
        
        this.ws.onerror = (err) => {
          console.error('[FloydAgent] Connection error:', err);
          this.isActive = false;
          // Don't reject here if it's a reconnection attempt, but for init we should
          reject(err);
        };
        
        this.ws.onclose = () => {
          console.log('[FloydAgent] Disconnected');
          this.isActive = false;
        };
        
      } catch (err) {
        reject(err);
      }
    });
  }

  setupHandlers() {
    this.ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle responses to our requests
        if (message.id && this.pendingRequests.has(message.id)) {
          const { resolve, reject } = this.pendingRequests.get(message.id);
          this.pendingRequests.delete(message.id);
          if (message.error) reject(new Error(message.error.message));
          else resolve(message.result);
          return;
        }
        
        // Handle tool calls FROM Floyd TO Browser
        // (The extension acts as an MCP Server here, executing tools for Floyd)
        if (message.method === 'tools/call') {
          await this.handleToolCall(message);
        }
        
      } catch (err) {
        console.error('[FloydAgent] Message handling error:', err);
      }
    };
  }

  async handleToolCall(message) {
    const { name, arguments: args } = message.params;
    const callId = message.id;
    
    try {
      // Execute the requested browser tool
      // NOTE: This assumes 'executor' is available globally or passed in context
      // In this architecture, we dispatch a custom event that the Background Script listens to
      const result = await this.executeTool(name, args);
      
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: callId,
        result: { content: [{ type: 'text', text: JSON.stringify(result) }] }
      }));
      
    } catch (err) {
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: callId,
        error: { code: -32603, message: err.message }
      }));
    }
  }

  async executeTool(name, args) {
    // Dispatch to the main tool executor
    // In the background script context, we likely have access to the executor
    if (globalThis.toolExecutor) {
      return await globalThis.toolExecutor.execute(name, args);
    }
    throw new Error('Tool executor not found in agent context');
  }

  /**
   * Process a task/query from the Extension UI
   * Sends it to Floyd as a user message
   */
  async processTask(task, context = {}) {
    if (!this.isActive) throw new Error('Not connected to Floyd');
    
    // Send message to Floyd via some API (likely HTTP for chat, WS for tools)
    // For now, we assume the WS protocol supports a 'chat' method or similar
    // Or we just use it for tools. 
    
    // For the "Task" input in the side panel, we probably want to POST to the chat API
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: task })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      currentTask: this.currentTask,
      historyLength: this.history.length
    };
  }
}