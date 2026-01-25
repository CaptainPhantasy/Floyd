/**
 * Floyd Mobile Bridge - Session Router
 *
 * Purpose: Route mobile commands to FloydAgentEngine
 *
 * Key Features:
 * - Execute user messages via FloydAgentEngine
 * - Stream tokens and tool results to mobile
 * - List and create sessions
 * - Integrate with existing floyd-wrapper infrastructure
 */

import { WebSocket } from 'ws';
import { FloydAgentEngine } from '../agent/execution-engine.js';
import { SessionManager } from '../persistence/session-manager.js';
import { loadConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type {
  MobileToBridgeMessage,
  BridgeToMobileMessage,
  SessionsListMessage,
  SessionCreatedMessage,
  ErrorMessage
} from './types.js';

/**
 * Session Router Configuration
 */
export interface SessionRouterConfig {
  /** Workspace root path for session storage */
  workspaceRoot: string;
}

/**
 * Streaming Callbacks
 * Called during agent execution to stream results to mobile
 */
export interface StreamingCallbacks {
  onToken: (token: string) => void;
  onToolUse: (toolUse: any) => void;
  onToolResult: (result: any) => void;
  onDone: (response: string) => void;
}

/**
 * Session Router
 *
 * Responsibilities:
 * - Route mobile messages to appropriate handlers
 * - Execute user messages via FloydAgentEngine
 * - Stream responses back to mobile
 * - Manage sessions (list, create)
 */
export class SessionRouter {
  private sessionManager: SessionManager;
  private engines: Map<string, FloydAgentEngine> = new Map();
  private config: Awaited<ReturnType<typeof loadConfig>> | null = null;

  constructor(config: SessionRouterConfig) {
    this.sessionManager = new SessionManager(config.workspaceRoot);
    logger.info('SessionRouter initialized', { workspaceRoot: config.workspaceRoot });
  }

  /**
   * Initialize config (lazy load)
   */
  private async ensureConfig(): Promise<void> {
    if (!this.config) {
      this.config = await loadConfig();
      logger.info('Config loaded for SessionRouter');
    }
  }

  /**
   * Handle message from mobile client
   *
   * @param sessionId - Floyd session ID
   * @param message - Message from mobile
   * @param ws - WebSocket connection to mobile
   */
  async handleMessage(
    sessionId: string,
    message: MobileToBridgeMessage,
    ws: WebSocket
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'message':
          await this.handleUserMessage(sessionId, message.data, ws);
          break;

        case 'command':
          await this.handleCommand(sessionId, message.data, ws);
          break;

        case 'list-sessions':
          await this.handleListSessions(ws);
          break;

        case 'create-session':
          await this.handleCreateSession(message.data, ws);
          break;

        default:
          this.sendError(ws, `Unknown message type: ${(message as any).type}`);
      }
    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle user message (execute with FloydAgentEngine)
   *
   * @param sessionId - Floyd session ID
   * @param data - Message data with content
   * @param ws - WebSocket connection
   */
  private async handleUserMessage(
    sessionId: string,
    data: { content: string },
    ws: WebSocket
  ): Promise<void> {
    if (!data || !data.content) {
      this.sendError(ws, 'Invalid message data');
      return;
    }

    logger.info(`[Mobile] User message for session ${sessionId}: "${data.content.substring(0, 50)}..."`);

    try {
      // Ensure config is loaded
      await this.ensureConfig();
      if (!this.config) {
        throw new Error('Configuration not loaded');
      }

      // Load or get session
      let session = this.sessionManager.loadSession(sessionId);
      if (!session) {
        // Create new session if not found
        session = this.sessionManager.createSession(`Mobile Session ${new Date().toISOString()}`);
        logger.info(`Created new session for mobile: ${session.id}`);
      }

      // Get or create FloydAgentEngine for this session
      let engine = this.engines.get(sessionId);

      if (!engine) {
        // Create new engine for this session
        engine = new FloydAgentEngine(this.config, {
          onToken: (token: string) => {
            // Stream token to mobile
            this.sendMessage(ws, {
              type: 'token',
              sessionId,
              data: { token }
            });
          },
          onToolStart: (tool: string, input: Record<string, unknown>) => {
            // Stream tool use to mobile
            this.sendMessage(ws, {
              type: 'tool-use',
              sessionId,
              data: { tool, input }
            });
          },
          onToolComplete: (tool: string, result: unknown) => {
            // Stream tool result to mobile
            this.sendMessage(ws, {
              type: 'tool-result',
              sessionId,
              data: { tool, output: result }
            });
          }
        }, this.sessionManager);

        this.engines.set(sessionId, engine);
        logger.info(`Created FloydAgentEngine for session: ${sessionId}`);
      }

      // Execute user message
      const response = await engine.execute(data.content);

      // Send done message
      this.sendMessage(ws, {
        type: 'done',
        sessionId,
        data: { response }
      });

      logger.info(`[Mobile] Execution complete for session: ${sessionId}`);

    } catch (error) {
      logger.error(`[Mobile] Error executing message for session ${sessionId}:`, error);
      this.sendError(ws, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle CLI command
   *
   * @param sessionId - Floyd session ID
   * @param data - Command data with command string
   * @param ws - WebSocket connection
   */
  private async handleCommand(
    _sessionId: string,
    data: { command: string },
    ws: WebSocket
  ): Promise<void> {
    if (!data || !data.command) {
      this.sendError(ws, 'Invalid command data');
      return;
    }

    console.log(`[Mobile] Command: "${data.command}"`);

    // TODO: Implement CLI command execution
    // This will depend on floyd-wrapper's command system

    this.sendError(ws, 'Commands not yet implemented');
  }

  /**
   * Handle list sessions request
   *
   * @param ws - WebSocket connection
   */
  private async handleListSessions(ws: WebSocket): Promise<void> {
    logger.info('[Mobile] List sessions requested');

    try {
      const sessions = this.sessionManager.listSessions();

      // Map Session type to expected mobile format
      const mobileSessions = sessions.map(session => ({
        id: session.id,
        title: session.name,
        createdAt: session.createdAt
      }));

      const message: SessionsListMessage = {
        type: 'sessions',
        data: { sessions: mobileSessions }
      };

      this.sendMessage(ws, message);
      logger.info(`[Mobile] Sent ${sessions.length} sessions to mobile`);
    } catch (error) {
      logger.error('[Mobile] Error listing sessions:', error);
      this.sendError(ws, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle create session request
   *
   * @param data - Optional session title
   * @param ws - WebSocket connection
   */
  private async handleCreateSession(
    data: { title?: string } | undefined,
    ws: WebSocket
  ): Promise<void> {
    const title = data?.title || `Mobile Session ${new Date().toISOString()}`;

    logger.info(`[Mobile] Create session: "${title}"`);

    try {
      const session = this.sessionManager.createSession(title);

      const message: SessionCreatedMessage = {
        type: 'session-created',
        data: { sessionId: session.id }
      };

      this.sendMessage(ws, message);
      logger.info(`[Mobile] Created session: ${session.id}`);
    } catch (error) {
      logger.error('[Mobile] Error creating session:', error);
      this.sendError(ws, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send message to mobile client
   *
   * @param ws - WebSocket connection
   * @param message - Message to send
   */
  private sendMessage(ws: WebSocket, message: BridgeToMobileMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn('[Mobile] WebSocket not ready, cannot send message');
    }
  }

  /**
   * Send error message to mobile client
   *
   * @param ws - WebSocket connection
   * @param error - Error message
   */
  private sendError(ws: WebSocket, error: string): void {
    const message: ErrorMessage = {
      type: 'error',
      data: { error }
    };

    this.sendMessage(ws, message);
    console.error(`[Mobile] Error: ${error}`);
  }
}
