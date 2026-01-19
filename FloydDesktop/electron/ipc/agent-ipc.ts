/**
 * FloydDesktop - Agent IPC Bridge
 *
 * Bridges the renderer process with the AgentEngine from floyd-agent-core.
 * Handles all IPC communication for agent operations.
 *
 * Includes Chrome extension fallback: when the desktop MCP server fails,
 * attempts to use the FloydChrome extension's MCP server instead.
 */

import { ipcMain, BrowserWindow, dialog, Notification } from 'electron';
import { AgentEngine, type Message } from 'floyd-agent-core';
import { MCPClientManager } from 'floyd-agent-core/mcp';
import { SessionManager } from 'floyd-agent-core/store';
import { PermissionManager } from 'floyd-agent-core/permissions';
import { Config } from 'floyd-agent-core/utils';
import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { ExtensionMCPClient } from '../mcp/extension-client.js';
import { ExtensionDetector } from '../mcp/extension-detector.js';
import { ProjectManager } from '../project-manager.js';
import { FileWatcher } from '../file-watcher.js';

/**
 * Settings persisted to disk
 */
interface PersistedSettings {
  provider?: 'anthropic' | 'openai' | 'deepseek';
  apiKey?: string;
  apiEndpoint?: string;
  model?: string;
  systemPrompt?: string;
  workingDirectory?: string;
  allowedTools?: string[];
  mcpServers?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Extension fallback status
 */
export interface ExtensionFallbackStatus {
  enabled: boolean;
  available: boolean;
  connected: boolean;
  port?: number;
  toolCount?: number;
  error?: string;
}

interface AgentIPCOptions {
  apiKey: string;
  apiEndpoint?: string;
  model?: string;
}

/**
 * AgentIPC manages communication between the renderer and AgentEngine
 * with Chrome extension fallback support
 */
export class AgentIPC {
  private agentEngine: AgentEngine | null = null;
  private mcpManager: MCPClientManager | null = null;
  private sessionManager: SessionManager | null = null;
  private permissionManager: PermissionManager | null = null;
  private config: Config | null = null;
  private isProcessing = false;
  private activeSessionId: string | null = null;
  private settingsFilePath: string;
  // Store API configuration separately
  private provider: 'anthropic' | 'openai' | 'deepseek' = 'anthropic';
  private apiKey: string;
  private apiEndpoint: string;
  private model: string;

  // Extension fallback support
  private extensionClient: ExtensionMCPClient | null = null;
  private extensionDetector: ExtensionDetector;
  private extensionFallbackEnabled = false;
  private extensionFallbackStatus: ExtensionFallbackStatus = {
    enabled: false,
    available: false,
    connected: false,
  };

  // Project management
  private projectManager: ProjectManager;
  private fileWatcher: FileWatcher;

  constructor(options: AgentIPCOptions) {
    this.apiKey = options.apiKey;
    this.provider = 'anthropic'; // Default to Anthropic
    this.apiEndpoint = options.apiEndpoint ?? 'https://api.anthropic.com';
    this.model = options.model ?? 'claude-sonnet-4-20250514';
    this.settingsFilePath = path.join(app.getPath('userData'), 'settings.json');
    this.extensionDetector = new ExtensionDetector();
    this.projectManager = new ProjectManager();
    this.fileWatcher = new FileWatcher();
    
    // Forward file watcher events to renderer
    this.fileWatcher.on('change', (event) => {
      const windows = BrowserWindow.getAllWindows();
      const mainWindow = windows[0];
      if (mainWindow) {
        mainWindow.webContents.send('floyd:file-change', event);
      }
    });
  }

  /**
   * Load settings from disk
   */
  private async loadSettings(): Promise<void> {
    try {
      const data = await fs.readFile(this.settingsFilePath, 'utf-8');
      const settings: PersistedSettings = JSON.parse(data);

      // Load API configuration
      if (settings.provider !== undefined) {
        this.provider = settings.provider;
      }
      if (settings.apiKey !== undefined) {
        this.apiKey = settings.apiKey;
      }
      if (settings.apiEndpoint !== undefined) {
        this.apiEndpoint = settings.apiEndpoint;
      }
      if (settings.model !== undefined) {
        this.model = settings.model;
      }

      // Apply loaded settings to config
      if (this.config && settings) {
        if (settings.systemPrompt !== undefined) {
          this.config.systemPrompt = settings.systemPrompt;
        }
        if (settings.workingDirectory !== undefined) {
          this.config.setWorkingDirectory(settings.workingDirectory);
        }
        if (settings.allowedTools !== undefined) {
          this.config.allowedTools = settings.allowedTools;
        }
        if (settings.mcpServers !== undefined) {
          this.config.mcpServers = settings.mcpServers as any; // Config accepts Record<string, any>
        }
      }

      console.log('[AgentIPC] Settings loaded from disk');
    } catch {
      // File doesn't exist or is invalid - use defaults
      console.log('[AgentIPC] No existing settings found, using defaults');
    }
  }

  /**
   * Save current settings to disk
   */
  private async saveSettings(): Promise<void> {
    if (!this.config) {
      return;
    }

    const settings: PersistedSettings = {
      provider: this.provider,
      apiKey: this.apiKey,
      apiEndpoint: this.apiEndpoint,
      model: this.model,
      systemPrompt: this.config.systemPrompt,
      workingDirectory: this.config.getWorkingDirectory(),
      allowedTools: this.config.allowedTools,
      mcpServers: this.config.mcpServers as Record<string, unknown>,
    };

    try {
      // Ensure directory exists
      const dir = path.dirname(this.settingsFilePath);
      await fs.mkdir(dir, { recursive: true });

      // Write settings to file
      await fs.writeFile(this.settingsFilePath, JSON.stringify(settings, null, 2));
      console.log('[AgentIPC] Settings saved to disk');
    } catch (error) {
      console.error('[AgentIPC] Failed to save settings:', error);
    }
  }

  /**
   * Retry a function with exponential backoff
   *
   * @param fn - Function to retry
   * @param maxRetries - Maximum number of retries (default: 3)
   * @param baseDelay - Base delay in ms (default: 1000)
   * @returns Result of the function
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on auth errors
        if (this.isAuthError(error)) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[AgentIPC] Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms`);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is an authentication error
   */
  private isAuthError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const stack = error.stack?.toLowerCase() || '';
      // Check for common authentication error indicators
      return (
        message.includes('401') ||
        message.includes('403') ||
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('authentication') ||
        message.includes('api key') ||
        message.includes('invalid key') ||
        message.includes('auth failed') ||
        stack.includes('401') ||
        stack.includes('403')
      );
    }
    return false;
  }

  /**
   * Show error dialog based on error type
   */
  private showErrorDialog(error: unknown, context: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (this.isAuthError(error)) {
      // Show blocking error dialog for authentication failures
      dialog.showErrorBox(
        'Authentication Failed',
        `Could not authenticate with the Floyd API.\n\n` +
        `Please check that your API key is valid and has the required permissions.\n\n` +
        `You can update your API key in Settings.\n\n` +
        `Error details: ${errorMessage}`
      );
    } else {
      // Show non-blocking notification for other errors
      if (Notification.isSupported()) {
        new Notification({
          title: 'FloydDesktop Error',
          body: `${context}: ${errorMessage}`,
          urgency: 'normal',
        }).show();
      } else {
        // Fallback to console if notifications aren't supported
        console.error(`[AgentIPC] ${context}:`, errorMessage);
      }
    }
  }

  /**
   * Initialize the agent engine and dependencies
   */
  async initialize(): Promise<void> {
    // Initialize configuration
    this.config = new Config({
      workingDirectory: app.getPath('home'),
    });

    // Load persisted settings
    await this.loadSettings();

    // Initialize session manager
    const sessionsDir = app.getPath('userData');
    this.sessionManager = new SessionManager({
      sessionsDir: sessionsDir,
    });

    // Initialize MCP client manager
    this.mcpManager = new MCPClientManager();

    // Initialize permission manager
    this.permissionManager = new PermissionManager();

    // Initialize AgentEngine
    this.agentEngine = this.buildAgentEngine();

    // Initialize a default session
    await this.agentEngine.initSession(process.cwd());

    // Register IPC handlers
    this.registerHandlers();

    console.log('[AgentIPC] Agent engine initialized');
  }

  private buildAgentEngine(): AgentEngine {
    if (!this.mcpManager || !this.sessionManager || !this.permissionManager || !this.config) {
      throw new Error('Agent dependencies not initialized');
    }
    if (!this.apiKey) {
      console.warn('[AgentIPC] API key is missing. Requests may fail until it is configured.');
    }
    
    return new AgentEngine(
      {
        apiKey: this.apiKey,
        baseURL: this.apiEndpoint,
        model: this.model,
        maxTokens: 8192,
        maxTurns: 10,
      },
      this.mcpManager,
      this.sessionManager,
      this.permissionManager,
      this.config
    );
  }

  private async rebuildAgentEngine(): Promise<void> {
    if (!this.mcpManager || !this.sessionManager || !this.permissionManager || !this.config) {
      return;
    }
    this.agentEngine = this.buildAgentEngine();
    const workingDirectory = this.config.getWorkingDirectory() || process.cwd();
    if (this.activeSessionId) {
      await this.agentEngine.initSession(workingDirectory, this.activeSessionId);
    } else {
      await this.agentEngine.initSession(workingDirectory);
    }
  }

  /**
   * Attempt to enable extension fallback
   * Call this when the desktop MCP server fails
   */
  async enableExtensionFallback(): Promise<boolean> {
    console.log('[AgentIPC] Attempting to enable Chrome extension fallback...');

    try {
      // Detect if extension is available
      const detectionResult = await this.extensionDetector.detect();

      if (!detectionResult.available || !detectionResult.port) {
        console.log('[AgentIPC] Extension not available:', detectionResult.error);
        this.extensionFallbackStatus = {
          enabled: false,
          available: false,
          connected: false,
        };
        return false;
      }

      // Create extension client
      this.extensionClient = new ExtensionMCPClient({
        port: detectionResult.port,
        connectionTimeout: 5000,
      });

      // Connect to extension
      await this.extensionClient.connect();

      // Get tools from extension
      const tools = await this.extensionClient.listTools();

      this.extensionFallbackEnabled = true;
      this.extensionFallbackStatus = {
        enabled: true,
        available: true,
        connected: true,
        port: detectionResult.port,
        toolCount: tools.length,
      };

      console.log(`[AgentIPC] Extension fallback enabled on port ${detectionResult.port} with ${tools.length} tools`);

      // Notify renderer about fallback status
      this.broadcastFallbackStatus();

      return true;
    } catch (error) {
      console.error('[AgentIPC] Failed to enable extension fallback:', error);
      this.extensionFallbackStatus = {
        enabled: false,
        available: false,
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      };
      return false;
    }
  }

  /**
   * Disable extension fallback
   */
  disableExtensionFallback(): void {
    if (this.extensionClient) {
      this.extensionClient.disconnect();
      this.extensionClient = null;
    }
    this.extensionFallbackEnabled = false;
    this.extensionFallbackStatus = {
      enabled: false,
      available: false,
      connected: false,
    };
    console.log('[AgentIPC] Extension fallback disabled');
    this.broadcastFallbackStatus();
  }

  /**
   * Get extension fallback status
   */
  getExtensionFallbackStatus(): ExtensionFallbackStatus {
    return { ...this.extensionFallbackStatus };
  }

  /**
   * Broadcast fallback status to all renderer windows
   */
  private broadcastFallbackStatus(): void {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      win.webContents.send('floyd:extension-fallback-status', this.extensionFallbackStatus);
    }
  }

  /**
   * Call a tool via the extension fallback
   */
  private async callToolViaExtension(
    name: string,
    args: Record<string, unknown>
  ): Promise<{ success: true; result: string } | { success: false; error: string; isAuthError: boolean }> {
    if (!this.extensionClient || !this.extensionClient.isConnected()) {
      return {
        success: false,
        error: 'Extension not connected',
        isAuthError: false,
      };
    }

    try {
      const result = await this.extensionClient.callTool(name, args);
      return {
        success: true,
        result: typeof result === 'string' ? result : JSON.stringify(result),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        isAuthError: false,
      };
    }
  }

  /**
   * Register all IPC handlers
   */
  private registerHandlers(): void {
    // Message handlers
    ipcMain.handle('floyd:send-message', async (_, message: string) => {
      return this.sendMessage(message);
    });

    ipcMain.on('floyd:send-streamed', async (_, message: string) => {
      await this.streamMessage(message);
    });

    // Tool handlers
    ipcMain.handle('floyd:list-tools', async () => {
      return this.listTools();
    });

    ipcMain.handle('floyd:call-tool', async (_, name: string, args: Record<string, unknown>) => {
      return this.callTool(name, args);
    });

    // Session handlers
    ipcMain.handle('floyd:list-sessions', async () => {
      return this.listSessions();
    });

    ipcMain.handle('floyd:load-session', async (_, id: string) => {
      return this.loadSession(id);
    });

    ipcMain.handle('floyd:save-session', async (_, session) => {
      return this.saveSession(session);
    });

    ipcMain.handle('floyd:delete-session', async (_, id: string) => {
      return this.deleteSession(id);
    });

    ipcMain.handle('floyd:create-session', async (_, cwd?: string) => {
      return this.createSession(cwd);
    });

    // Status handler
    ipcMain.handle('floyd:agent-status', async () => {
      return this.getStatus();
    });

    // Settings handlers
    ipcMain.handle('floyd:get-settings', async () => {
      return this.getSettings();
    });

    ipcMain.handle('floyd:set-setting', async (_, key: string, value: unknown) => {
      console.log(`[AgentIPC] IPC floyd:set-setting received: ${key}`);
      try {
        await this.setSetting(key, value);
        return { success: true };
      } catch (error) {
        console.error('[AgentIPC] setSetting error:', error);
        return { success: false, error: String(error) };
      }
    });

    // Extension fallback handlers
    ipcMain.handle('floyd:enable-extension-fallback', async () => {
      return this.enableExtensionFallback();
    });

    ipcMain.handle('floyd:disable-extension-fallback', async () => {
      this.disableExtensionFallback();
      return { success: true };
    });

    ipcMain.handle('floyd:get-extension-fallback-status', async () => {
      return this.getExtensionFallbackStatus();
    });

    // Project handlers
    ipcMain.handle('floyd:create-project', async (_, name: string, projectPath: string) => {
      return this.createProject(name, projectPath);
    });

    ipcMain.handle('floyd:list-projects', async () => {
      return this.listProjects();
    });

    ipcMain.handle('floyd:load-project', async (_, id: string) => {
      return this.loadProject(id);
    });

    ipcMain.handle('floyd:delete-project', async (_, id: string) => {
      return this.deleteProject(id);
    });

    ipcMain.handle('floyd:add-context-file', async (_, projectId: string, filePath: string) => {
      return this.addContextFile(projectId, filePath);
    });

    ipcMain.handle('floyd:remove-context-file', async (_, projectId: string, filePath: string) => {
      return this.removeContextFile(projectId, filePath);
    });

    ipcMain.handle('floyd:watch-project-files', async (_, projectPath: string) => {
      return this.watchProjectFiles(projectPath);
    });

    ipcMain.handle('floyd:unwatch-project-files', async (_, projectPath: string) => {
      return this.unwatchProjectFiles(projectPath);
    });

    // File handlers
    ipcMain.handle('floyd:list-files', async (_, dirPath: string) => {
      return this.listFiles(dirPath);
    });

    // Tools handlers (enhanced)
    ipcMain.handle('floyd:get-tools-by-server', async () => {
      return this.getToolsByServer();
    });

    // Extension handlers
    ipcMain.handle('floyd:get-extension-status', async () => {
      return this.getExtensionStatus();
    });

    ipcMain.handle('floyd:list-browser-tabs', async () => {
      return this.listBrowserTabs();
    });

    // Sub-agent handlers (placeholder for Browork)
    ipcMain.handle('floyd:spawn-subagent', async (_, type: string, task: string) => {
      return this.spawnSubAgent(type, task);
    });

    ipcMain.handle('floyd:list-subagents', async () => {
      return this.listSubAgents();
    });

    ipcMain.handle('floyd:cancel-subagent', async (_, id: string) => {
      return this.cancelSubAgent(id);
    });

    console.log('[AgentIPC] IPC handlers registered');
  }

  /**
   * Send a message to the agent (non-streaming)
   */
  private async sendMessage(message: string): Promise<{ success: true; response: string } | { success: false; error: string; isAuthError: boolean }> {
    const agentEngine = this.agentEngine;
    if (!agentEngine) {
      const error = 'Agent engine not initialized';
      this.showErrorDialog(error, 'Send Message');
      return { success: false, error, isAuthError: false };
    }

    this.isProcessing = true;

    try {
      // Wrap the message sending in retry logic
      const response = await this.retryWithBackoff(async () => {
        return await agentEngine.sendMessageComplete(message);
      });

      // Auto-save session after message
      await agentEngine.saveSession();

      return { success: true, response };
    } catch (error) {
      // Show user-facing error dialog
      this.showErrorDialog(error, 'Send Message');

      // Return error information to renderer
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        isAuthError: this.isAuthError(error)
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send a message with streaming response
   */
  private async streamMessage(message: string): Promise<void> {
    const agentEngine = this.agentEngine;
    if (!agentEngine) {
      const error = new Error('Agent engine not initialized');
      this.showErrorDialog(error, 'Stream Message');
      // Send error to renderer
      const windows = BrowserWindow.getAllWindows();
      const mainWindow = windows[0];
      if (mainWindow) {
        mainWindow.webContents.send('floyd:stream-chunk', {
          error: error.message,
          isAuthError: false,
          done: true,
        });
      }
      return;
    }

    this.isProcessing = true;

    // Wrap streaming in retry logic for transient network errors
    await this.retryWithBackoff(async () => {
      // Get the current window
      const windows = BrowserWindow.getAllWindows();
      const mainWindow = windows[0];
      if (!mainWindow) return;

      // Stream the response with callbacks
      for await (const _chunk of agentEngine.sendMessage(message, {
        onChunk: (token: string) => {
          mainWindow.webContents.send('floyd:stream-chunk', {
            token,
            done: false,
          });
        },
        onToolStart: (toolCall) => {
          mainWindow.webContents.send('floyd:stream-chunk', {
            tool_call: toolCall,
            done: false,
          });
        },
        onToolComplete: (toolCall) => {
          mainWindow.webContents.send('floyd:stream-chunk', {
            tool_call: toolCall,
            tool_use_complete: true,
            done: false,
          });
        },
        onDone: () => {
          mainWindow.webContents.send('floyd:stream-chunk', {
            token: '',
            done: true,
          });
          this.isProcessing = false;
        },
        onError: (error: Error) => {
          // Show user-facing error dialog
          this.showErrorDialog(error, 'Stream Message');

          mainWindow.webContents.send('floyd:stream-chunk', {
            error: error.message,
            isAuthError: this.isAuthError(error),
            done: true,
          });
          this.isProcessing = false;
        },
      })) {
        // Chunks are sent via callbacks
      }

      // Auto-save session after message
      await agentEngine.saveSession();
    });

    this.isProcessing = false;
  }

  /**
   * List available tools
   */
  private async listTools(): Promise<Array<{ name: string; description: string; input_schema: Record<string, unknown> }>> {
    if (!this.agentEngine) {
      return [];
    }

    return await this.agentEngine.listTools();
  }

  /**
   * Call a specific tool
   * Uses extension fallback when enabled and agent engine tool fails
   */
  private async callTool(name: string, args: Record<string, unknown>): Promise<{ success: true; result: string } | { success: false; error: string; isAuthError: boolean }> {
    const agentEngine = this.agentEngine;
    if (!agentEngine) {
      const error = 'Agent engine not initialized';
      this.showErrorDialog(error, 'Call Tool');
      return { success: false, error, isAuthError: false };
    }

    try {
      // Wrap the tool call in retry logic for transient errors
      const result = await this.retryWithBackoff(async () => {
        return await agentEngine.callTool(name, args);
      });
      return { success: true, result: typeof result === 'string' ? result : JSON.stringify(result) };
    } catch (err) {
      // Try extension fallback if enabled
      if (this.extensionFallbackEnabled && this.extensionClient?.isConnected()) {
        console.log(`[AgentIPC] Tool call failed, trying extension fallback: ${name}`);
        const extensionResult = await this.callToolViaExtension(name, args);
        if (extensionResult.success) {
          return extensionResult;
        }
      }

      this.showErrorDialog(err, 'Call Tool');
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: errorMessage,
        isAuthError: this.isAuthError(err)
      };
    }
  }

  /**
   * List all sessions
   */
  private async listSessions(): Promise<Array<{
    id: string;
    created: number;
    updated: number;
    title: string;
    working_dir: string;
    messages: unknown[];
  }>> {
    if (!this.sessionManager) {
      return [];
    }

    const sessions = await this.sessionManager.listSessions();
    return sessions.map(s => ({
      id: s.id,
      created: s.created,
      updated: s.updated,
      title: s.title || 'Untitled Session',
      working_dir: s.workingDirectory,
      messages: s.messages,
    }));
  }

  /**
   * Load a specific session
   */
  private async loadSession(id: string): Promise<{
    id: string;
    created: number;
    updated: number;
    title: string;
    working_dir: string;
    messages: unknown[];
  } | null> {
    if (!this.sessionManager || !this.agentEngine) {
      return null;
    }

    const session = await this.sessionManager.loadSession(id);
    if (!session) return null;

    this.activeSessionId = id;
    await this.agentEngine.loadSession(id);

    return {
      id: session.id,
      created: session.created,
      updated: session.updated,
      title: session.title || 'Untitled Session',
      working_dir: session.workingDirectory,
      messages: session.messages,
    };
  }

  /**
   * Save a session
   */
  private async saveSession(session: {
    id: string;
    created: number;
    updated: number;
    title: string;
    working_dir: string;
    messages: unknown[];
  }): Promise<void> {
    if (!this.sessionManager) {
      return;
    }

    await this.sessionManager.saveSession({
      id: session.id,
      created: session.created,
      updated: Date.now(),
      title: session.title,
      messages: session.messages as Message[],
      workingDirectory: session.working_dir,
    });
  }

  /**
   * Delete a session
   */
  private async deleteSession(id: string): Promise<void> {
    if (!this.sessionManager) {
      return;
    }

    await this.sessionManager.deleteSession(id);
  }

  /**
   * Create a new session
   */
  private async createSession(cwd?: string): Promise<{
    success: true;
    session: {
      id: string;
      created: number;
      updated: number;
      title: string;
      working_dir: string;
      messages: unknown[];
    };
  } | { success: false; error: string; isAuthError: boolean }> {
    if (!this.sessionManager || !this.agentEngine) {
      const error = 'Session manager not initialized';
      this.showErrorDialog(error, 'Create Session');
      return { success: false, error, isAuthError: false };
    }

    try {
      const session = await this.sessionManager.createSession(cwd || process.cwd());
      this.activeSessionId = session.id;
      await this.agentEngine.initSession(cwd || process.cwd(), session.id);

      return {
        success: true,
        session: {
          id: session.id,
          created: session.created,
          updated: session.updated,
          title: session.title || 'New Chat',
          working_dir: session.workingDirectory,
          messages: session.messages,
        }
      };
    } catch (err) {
      this.showErrorDialog(err, 'Create Session');
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: errorMessage,
        isAuthError: this.isAuthError(err)
      };
    }
  }

  /**
   * Get agent status
   */
  private getStatus(): {
    connected: boolean;
    model: string;
    isProcessing: boolean;
    sessionId: string | null;
    extensionFallback?: ExtensionFallbackStatus;
  } {
    return {
      connected: !!this.agentEngine,
      model: this.model,
      isProcessing: this.isProcessing,
      sessionId: this.activeSessionId,
      extensionFallback: this.extensionFallbackStatus,
    };
  }

  /**
   * Get settings
   */
  private getSettings(): Record<string, unknown> {
    if (!this.config) {
      return {
        provider: this.provider,
        apiKey: this.apiKey,
        apiEndpoint: this.apiEndpoint,
        model: this.model,
      };
    }

    return {
      provider: this.provider,
      apiKey: this.apiKey,
      apiEndpoint: this.apiEndpoint,
      model: this.model,
      systemPrompt: this.config.systemPrompt,
      allowedTools: this.config.allowedTools,
      mcpServers: this.config.mcpServers,
      workingDirectory: this.config.getWorkingDirectory(),
    };
  }

  /**
   * Set a setting
   */
  private async setSetting(key: string, value: unknown): Promise<void> {
    console.log(`[AgentIPC] setSetting called: ${key} = ${typeof value === 'string' && key === 'apiKey' ? '***' : value}`);
    
    if (!this.config) {
      console.error('[AgentIPC] setSetting failed: config not initialized');
      return;
    }

    let changed = false;
    let requiresAgentRebuild = false;

    switch (key) {
      case 'provider':
        this.provider = value as 'anthropic' | 'openai' | 'deepseek';
        changed = true;
        requiresAgentRebuild = true;
        break;
      case 'apiKey':
        this.apiKey = value as string;
        changed = true;
        requiresAgentRebuild = true;
        break;
      case 'apiEndpoint':
        this.apiEndpoint = value as string;
        changed = true;
        requiresAgentRebuild = true;
        break;
      case 'model':
        this.model = value as string;
        changed = true;
        requiresAgentRebuild = true;
        break;
      case 'systemPrompt':
        this.config.systemPrompt = value as string;
        changed = true;
        break;
      case 'workingDirectory':
        this.config.setWorkingDirectory(value as string);
        changed = true;
        break;
      case 'allowedTools':
        this.config.allowedTools = value as string[];
        changed = true;
        break;
      case 'mcpServers':
        this.config.mcpServers = value as any; // Config accepts Record<string, any>
        changed = true;
        break;
      default:
        // Store unknown settings for persistence (cast to unknown to allow dynamic property)
        if (this.config) {
          (this.config as unknown as Record<string, unknown>)[key] = value;
          changed = true;
        }
        break;
    }

    // Persist settings to disk after any change
    if (changed) {
      console.log(`[AgentIPC] Setting changed, saving to disk...`);
      await this.saveSettings();
      console.log(`[AgentIPC] Settings saved. requiresAgentRebuild: ${requiresAgentRebuild}`);
      if (requiresAgentRebuild) {
        console.log('[AgentIPC] Rebuilding agent engine...');
        await this.rebuildAgentEngine();
        console.log('[AgentIPC] Agent engine rebuilt');
      }
    } else {
      console.log(`[AgentIPC] Setting ${key} not recognized or unchanged`);
    }
  }

  /**
   * Project management methods
   */
  private async createProject(name: string, projectPath: string) {
    try {
      const project = await this.projectManager.createProject(name, projectPath);
      return { success: true, project };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  private async listProjects() {
    try {
      const projects = await this.projectManager.listProjects();
      return { success: true, projects };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage, projects: [] };
    }
  }

  private async loadProject(id: string) {
    try {
      const project = await this.projectManager.getProject(id);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      return { success: true, project };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  private async deleteProject(id: string) {
    try {
      const deleted = await this.projectManager.deleteProject(id);
      return { success: deleted };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  private async addContextFile(projectId: string, filePath: string) {
    try {
      const success = await this.projectManager.addContextFile(projectId, filePath);
      return { success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  private async removeContextFile(projectId: string, filePath: string) {
    try {
      const success = await this.projectManager.removeContextFile(projectId, filePath);
      return { success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  private async watchProjectFiles(projectPath: string) {
    try {
      this.fileWatcher.watch(projectPath);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  private async unwatchProjectFiles(projectPath: string) {
    try {
      this.fileWatcher.unwatch(projectPath);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * File system methods
   */
  private async listFiles(dirPath: string) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);
          return {
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtimeMs,
            children: entry.isDirectory() ? [] : undefined,
          };
        })
      );
      return { success: true, files };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage, files: [] };
    }
  }

  /**
   * Tools methods (enhanced)
   */
  private async getToolsByServer() {
    try {
      const tools = await this.listTools();

      // Group tools by server (placeholder - actual implementation would use MCP manager)
      const toolGroups: Array<{ server: string; tools: unknown[]; status: string }> = [];
      if (this.mcpManager && tools.length > 0) {
        // TODO: Get actual server info from MCP manager
        toolGroups.push({
          server: 'default',
          tools: tools,
          status: 'connected',
        });
      }
      return { success: true, toolGroups };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage, toolGroups: [] };
    }
  }

  /**
   * Extension methods
   */
  private async getExtensionStatus() {
    return this.getExtensionFallbackStatus();
  }

  private async listBrowserTabs() {
    // Placeholder - would need Chrome extension integration
    return { success: true, tabs: [] };
  }

  /**
   * Sub-agent methods (Browork - real implementation)
   */
  private subAgents: Map<string, {
    id: string;
    type: string;
    task: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    startedAt: number;
    engine?: AgentEngine;
    result?: string;
    error?: string;
  }> = new Map();

  private async spawnSubAgent(type: string, task: string) {
    const id = `subagent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create isolated AgentEngine instance for sub-agent
    let engine: AgentEngine | undefined;
    try {
      if (this.mcpManager && this.sessionManager && this.permissionManager && this.config) {
        engine = new AgentEngine(
          {
            apiKey: this.apiKey,
            baseURL: this.apiEndpoint,
            model: this.model,
            temperature: 0.2,
            enableThinkingMode: true,
          },
          this.mcpManager,
          this.sessionManager,
          this.permissionManager,
          this.config
        );
        await engine.initSession(process.cwd(), `subagent-${id}`);
      }
    } catch (err) {
      console.error('[Browork] Failed to create sub-agent engine:', err);
    }

    const subAgent = {
      id,
      type,
      task,
      status: 'pending' as const,
      progress: 0,
      startedAt: Date.now(),
      engine,
    };
    this.subAgents.set(id, subAgent);
    
    // Run sub-agent in background
    this.runSubAgent(id).catch(err => {
      console.error(`[Browork] Sub-agent ${id} failed:`, err);
      const agent = this.subAgents.get(id);
      if (agent) {
        agent.status = 'failed';
        agent.error = err instanceof Error ? err.message : String(err);
        this.emitSubAgentUpdate(id);
      }
    });

    return { success: true, subAgent: { id, type, task, status: 'pending', progress: 0 } };
  }

  private async runSubAgent(id: string): Promise<void> {
    const agent = this.subAgents.get(id);
    if (!agent || !agent.engine) {
      throw new Error('Sub-agent or engine not found');
    }

    agent.status = 'running';
    this.emitSubAgentUpdate(id);

    try {
      let result = '';
      for await (const chunk of agent.engine.sendMessage(agent.task)) {
        result += chunk;
        agent.progress = Math.min(agent.progress + 2, 95);
        this.emitSubAgentUpdate(id);
      }
      agent.status = 'completed';
      agent.progress = 100;
      agent.result = result;
    } catch (err) {
      agent.status = 'failed';
      agent.error = err instanceof Error ? err.message : String(err);
    }
    this.emitSubAgentUpdate(id);
  }

  private emitSubAgentUpdate(id: string): void {
    const agent = this.subAgents.get(id);
    if (!agent) return;

    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows[0];
    if (!mainWindow) return;

    mainWindow.webContents.send('subagent:update', {
      id: agent.id,
      type: agent.type,
      status: agent.status,
      progress: agent.progress,
      result: agent.result,
      error: agent.error,
    });
  }

  private async listSubAgents() {
    return { success: true, subAgents: Array.from(this.subAgents.values()) };
  }

  private async cancelSubAgent(id: string) {
    const agent = this.subAgents.get(id);
    if (agent) {
      agent.status = 'failed';
      this.subAgents.set(id, agent);
      return { success: true };
    }
    return { success: false, error: 'Sub-agent not found' };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Disconnect extension client if connected
    if (this.extensionClient) {
      this.extensionClient.disconnect();
      this.extensionClient = null;
    }

    if (this.mcpManager) {
      // Stop WebSocket server if running
      if (this.mcpManager.isServerRunning()) {
        this.mcpManager.stopServer();
      }
    }

    // Remove all IPC handlers
    ipcMain.removeHandler('floyd:send-message');
    ipcMain.removeHandler('floyd:list-tools');
    ipcMain.removeHandler('floyd:call-tool');
    ipcMain.removeHandler('floyd:list-sessions');
    ipcMain.removeHandler('floyd:load-session');
    ipcMain.removeHandler('floyd:save-session');
    ipcMain.removeHandler('floyd:delete-session');
    ipcMain.removeHandler('floyd:create-session');
    ipcMain.removeHandler('floyd:agent-status');
    ipcMain.removeHandler('floyd:get-settings');
    ipcMain.removeHandler('floyd:set-setting');
    ipcMain.removeHandler('floyd:enable-extension-fallback');
    ipcMain.removeHandler('floyd:disable-extension-fallback');
    ipcMain.removeHandler('floyd:get-extension-fallback-status');
    ipcMain.removeHandler('floyd:create-project');
    ipcMain.removeHandler('floyd:list-projects');
    ipcMain.removeHandler('floyd:load-project');
    ipcMain.removeHandler('floyd:delete-project');
    ipcMain.removeHandler('floyd:add-context-file');
    ipcMain.removeHandler('floyd:remove-context-file');
    ipcMain.removeHandler('floyd:list-files');
    ipcMain.removeHandler('floyd:get-tools-by-server');
    ipcMain.removeHandler('floyd:get-extension-status');
    ipcMain.removeHandler('floyd:list-browser-tabs');
    ipcMain.removeHandler('floyd:spawn-subagent');
    ipcMain.removeHandler('floyd:list-subagents');
    ipcMain.removeHandler('floyd:cancel-subagent');
    ipcMain.removeHandler('floyd:watch-project-files');
    ipcMain.removeHandler('floyd:unwatch-project-files');
    
    // Clean up file watcher
    this.fileWatcher.unwatchAll();

    console.log('[AgentIPC] Disposed');
  }
}
