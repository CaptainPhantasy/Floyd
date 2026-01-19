// Session/Conversation storage for the Floyd agent
// Stores conversation history as JSON files in .floyd/sessions/

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../agent/types.js';

export interface SessionData {
  id: string;
  created: number;
  updated: number;
  title?: string;
  messages: Message[];
  workingDirectory: string;
}

export interface SessionManagerOptions {
  sessionsDir?: string;
}

/**
 * SessionManager handles persistence of conversation sessions
 *
 * Sessions are stored as JSON files in the .floyd/sessions directory.
 * Each session contains the full message history and metadata.
 */
export class SessionManager {
  private sessionsDir: string;
  private initialized = false;
  private initPromise: Promise<void>;

  constructor(options: SessionManagerOptions = {}) {
    this.sessionsDir = options.sessionsDir || path.join(process.cwd(), '.floyd', 'sessions');
    // Bug #69 fix: Use initPromise pattern to avoid race condition
    this.initPromise = this.doInit();
  }

  private async doInit(): Promise<void> {
    await this.ensureDir();
    this.initialized = true;
  }

  private async waitForInit(): Promise<void> {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(this.sessionsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  }

  /**
   * Create a new session
   */
  async createSession(cwd: string, title?: string): Promise<SessionData> {
    await this.waitForInit();  // Bug #69 fix: Wait for initialization
    const id = uuidv4();
    const session: SessionData = {
      id,
      created: Date.now(),
      updated: Date.now(),
      title: title || 'New Chat',
      messages: [],
      workingDirectory: cwd,
    };
    await this.saveSession(session);
    return session;
  }

  /**
   * Save a session
   */
  async saveSession(session: SessionData): Promise<void> {
    await this.waitForInit();  // Bug #69 fix: Wait for initialization
    await this.ensureDir();
    session.updated = Date.now();
    const filePath = path.join(this.sessionsDir, `${session.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
  }

  /**
   * Load a session by ID
   */
  async loadSession(id: string): Promise<SessionData | null> {
    await this.waitForInit();  // Bug #69 fix: Wait for initialization
    try {
      const filePath = path.join(this.sessionsDir, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as SessionData;
    } catch {
      return null;
    }
  }

  /**
   * List all sessions, sorted by most recently updated
   */
  async listSessions(): Promise<SessionData[]> {
    await this.waitForInit();  // Bug #69 fix: Wait for initialization
    await this.ensureDir();
    try {
      const files = await fs.readdir(this.sessionsDir);
      const sessions: SessionData[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.sessionsDir, file);
            const data = await fs.readFile(filePath, 'utf-8');
            const session = JSON.parse(data) as SessionData;
            sessions.push(session);
          } catch {
            // Skip corrupted files
          }
        }
      }

      return sessions.sort((a, b) => b.updated - a.updated);
    } catch {
      return [];
    }
  }

  /**
   * Get the most recent session
   */
  async getLastSession(): Promise<SessionData | null> {
    const sessions = await this.listSessions();
    return sessions.length > 0 ? sessions[0] : null;
  }

  /**
   * Delete a session
   */
  async deleteSession(id: string): Promise<void> {
    await this.waitForInit();  // Bug #69 fix: Wait for initialization
    try {
      const filePath = path.join(this.sessionsDir, `${id}.json`);
      await fs.unlink(filePath);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Update session title
   */
  async updateTitle(id: string, title: string): Promise<void> {
    await this.waitForInit();  // Bug #69 fix: Wait for initialization
    const session = await this.loadSession(id);
    if (session) {
      session.title = title;
      await this.saveSession(session);
    }
  }

  /**
   * Get the sessions directory path
   */
  getSessionsDir(): string {
    return this.sessionsDir;
  }
}
