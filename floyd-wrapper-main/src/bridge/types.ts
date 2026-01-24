/**
 * Floyd Mobile Bridge - Type Definitions
 *
 * Purpose: Type definitions for the mobile bridge server
 * Architecture: NGROK-tunneled remote control for floyd-wrapper-main
 */

/**
 * QR Code Handshake Data
 * Encoded in QR code for mobile scanning
 */
export interface QRHandshakeData {
  ngrokUrl: string;      // NGROK tunnel URL (https://...)
  sessionId: string;     // Floyd session UUID
  token: string;         // JWT auth token
  expiresAt: number;     // Unix timestamp (milliseconds)
}

/**
 * JWT Token Payload
 * Decoded from JWT token
 */
export interface TokenPayload {
  deviceId: string;      // Mobile device UUID
  sessionId: string;     // Floyd session ID
  deviceName: string;    // Human-readable device name
  iat: number;           // Issued at (Unix timestamp)
  exp: number;           // Expiration (Unix timestamp)
}

/**
 * Bridge Server Configuration
 */
export interface BridgeConfig {
  port: number;          // HTTP/WebSocket server port (default: 4000)
  ngrokAuthToken?: string; // NGROK authtoken (from env)
  ngrokDomain?: string;  // Reserved NGROK domain (optional)
  jwtSecret: string;     // JWT signing secret (from env)
  qrTTLMinutes: number;  // QR code expiry time (default: 5)
}

/**
 * WebSocket Message Types
 * Messages between mobile app and bridge server
 */
export type WebSocketMessage =
  | MobileToBridgeMessage
  | BridgeToMobileMessage;

/**
 * Messages from Mobile to Bridge
 */
export interface MobileToBridgeMessage {
  type: 'message' | 'command' | 'list-sessions' | 'create-session';
  data?: any;
}

/**
 * Messages from Bridge to Mobile
 */
export interface BridgeToMobileMessage {
  type: 'token' | 'tool-use' | 'tool-result' | 'done' | 'error' | 'sessions' | 'session-created';
  sessionId?: string;
  data?: any;
}

/**
 * Session Message (from mobile)
 */
export interface SessionMessage {
  type: 'message';
  data: {
    content: string;
  };
}

/**
 * Command Message (from mobile)
 */
export interface CommandMessage {
  type: 'command';
  data: {
    command: string;
  };
}

/**
 * List Sessions Message (from mobile)
 */
export interface ListSessionsMessage {
  type: 'list-sessions';
}

/**
 * Create Session Message (from mobile)
 */
export interface CreateSessionMessage {
  type: 'create-session';
  data?: {
    title?: string;
  };
}

/**
 * Token Stream Message (to mobile)
 */
export interface TokenMessage {
  type: 'token';
  sessionId: string;
  data: {
    token: string;
  };
}

/**
 * Tool Use Message (to mobile)
 */
export interface ToolUseMessage {
  type: 'tool-use';
  sessionId: string;
  data: {
    tool: string;
    input: any;
  };
}

/**
 * Tool Result Message (to mobile)
 */
export interface ToolResultMessage {
  type: 'tool-result';
  sessionId: string;
  data: {
    tool: string;
    output: any;
  };
}

/**
 * Done Message (to mobile)
 */
export interface DoneMessage {
  type: 'done';
  sessionId: string;
  data: {
    response: string;
  };
}

/**
 * Error Message (to mobile)
 */
export interface ErrorMessage {
  type: 'error';
  data: {
    error: string;
  };
}

/**
 * Sessions List Message (to mobile)
 */
export interface SessionsListMessage {
  type: 'sessions';
  data: {
    sessions: Array<{
      id: string;
      title: string;
      createdAt: number;
    }>;
  };
}

/**
 * Session Created Message (to mobile)
 */
export interface SessionCreatedMessage {
  type: 'session-created';
  data: {
    sessionId: string;
  };
}

/**
 * Project Map Structure
 * Sent to mobile for file browser
 */
export interface ProjectMap {
  root: string;
  structure: ProjectNode[];
}

/**
 * Project Node (file or directory)
 */
export interface ProjectNode {
  path: string;
  type: 'file' | 'directory';
  children?: ProjectNode[];
}
