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
  // Will integrate with FloydAgentEngine and SessionManager
  // For now, placeholder configuration
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
  private config: SessionRouterConfig;

  constructor(config: SessionRouterConfig = {}) {
    this.config = config;
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

    console.log(`[Mobile] User message: "${data.content.substring(0, 50)}..."`);

    // TODO: Integrate with FloydAgentEngine
    // This will require:
    // 1. Loading session from SessionManager
    // 2. Creating/using FloydAgentEngine instance
    // 3. Executing message with streaming callbacks
    // 4. Streaming tokens, tool use, tool results, and done message

    // Placeholder: Send a test response
    this.sendMessage(ws, {
      type: 'token',
      sessionId,
      data: { token: 'Hello' }
    });

    this.sendMessage(ws, {
      type: 'token',
      sessionId,
      data: { token: ' from' }
    });

    this.sendMessage(ws, {
      type: 'token',
      sessionId,
      data: { token: ' Floyd' }
    });

    this.sendMessage(ws, {
      type: 'done',
      sessionId,
      data: { response: 'Hello from Floyd' }
    });

    console.log(`[Mobile] Response sent to session: ${sessionId}`);
  }

  /**
   * Handle CLI command
   *
   * @param sessionId - Floyd session ID
   * @param data - Command data with command string
   * @param ws - WebSocket connection
   */
  private async handleCommand(
    sessionId: string,
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
    console.log('[Mobile] List sessions requested');

    // TODO: Integrate with SessionManager
    // This will load sessions from database

    // Placeholder: Send empty list
    const message: SessionsListMessage = {
      type: 'sessions',
      data: { sessions: [] }
    };

    this.sendMessage(ws, message);
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
    const title = data?.title || 'Mobile Session';

    console.log(`[Mobile] Create session: "${title}"`);

    // TODO: Integrate with SessionManager
    // This will create a new session in the database

    // Placeholder: Generate fake session ID
    const sessionId = `session-${Date.now()}`;

    const message: SessionCreatedMessage = {
      type: 'session-created',
      data: { sessionId }
    };

    this.sendMessage(ws, message);
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
