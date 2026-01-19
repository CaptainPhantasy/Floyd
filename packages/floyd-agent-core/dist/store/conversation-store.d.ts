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
export declare class SessionManager {
    private sessionsDir;
    private initialized;
    private initPromise;
    constructor(options?: SessionManagerOptions);
    private doInit;
    private waitForInit;
    private ensureDir;
    /**
     * Create a new session
     */
    createSession(cwd: string, title?: string): Promise<SessionData>;
    /**
     * Save a session
     */
    saveSession(session: SessionData): Promise<void>;
    /**
     * Load a session by ID
     */
    loadSession(id: string): Promise<SessionData | null>;
    /**
     * List all sessions, sorted by most recently updated
     */
    listSessions(): Promise<SessionData[]>;
    /**
     * Get the most recent session
     */
    getLastSession(): Promise<SessionData | null>;
    /**
     * Delete a session
     */
    deleteSession(id: string): Promise<void>;
    /**
     * Update session title
     */
    updateTitle(id: string, title: string): Promise<void>;
    /**
     * Get the sessions directory path
     */
    getSessionsDir(): string;
}
//# sourceMappingURL=conversation-store.d.ts.map