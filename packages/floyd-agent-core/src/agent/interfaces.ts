/**
 * Dependency interfaces for AgentEngine
 * 
 * These interfaces allow different implementations (CLI, Desktop, tests)
 * to provide their own session management, permissions, and config
 * while sharing the same AgentEngine core.
 * 
 * This follows the Dependency Inversion Principle - high-level modules
 * (AgentEngine) depend on abstractions (interfaces), not concrete implementations.
 */

import type { Message } from './types.js';

/**
 * Session data structure - shared across all implementations
 */
export interface SessionData {
  id: string;
  created: number;
  updated: number;
  title?: string;
  messages: Message[];
  workingDirectory: string;
}

/**
 * Session manager interface
 * 
 * Implementations:
 * - Core's SessionManager (file-based, .floyd/sessions/)
 * - CLI's Zustand-based store
 * - Future: SQLite, cloud sync, etc.
 */
export interface ISessionManager {
  createSession(cwd: string, title?: string): Promise<SessionData>;
  loadSession(id: string): Promise<SessionData | null>;
  saveSession(session: SessionData): Promise<void>;
  listSessions(): Promise<SessionData[]>;
  deleteSession?(id: string): Promise<void>;
}

/**
 * Permission level for tool execution
 */
export type PermissionLevel = 'ask' | 'allow' | 'deny';

/**
 * Permission manager interface
 * 
 * Implementations:
 * - Core's PermissionManager (in-memory with wildcard support)
 * - CLI's PermissionManager (with UI integration and risk classification)
 */
export interface IPermissionManager {
  checkPermission(toolName: string): Promise<PermissionLevel>;
  grantPermission?(toolName: string): void;
  denyPermission?(toolName: string): void;
}

/**
 * Configuration interface
 * 
 * Minimal interface that all config implementations must satisfy.
 * Implementations can have additional properties.
 */
export interface IConfig {
  systemPrompt: string;
  allowedTools?: string[];
  mcpServers?: Record<string, unknown>;
}
