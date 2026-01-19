// Session/Conversation storage for the Floyd agent
// Stores conversation history as JSON files in .floyd/sessions/
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
/**
 * SessionManager handles persistence of conversation sessions
 *
 * Sessions are stored as JSON files in the .floyd/sessions directory.
 * Each session contains the full message history and metadata.
 */
export class SessionManager {
    sessionsDir;
    initialized = false;
    initPromise;
    constructor(options = {}) {
        this.sessionsDir = options.sessionsDir || path.join(process.cwd(), '.floyd', 'sessions');
        // Bug #69 fix: Use initPromise pattern to avoid race condition
        this.initPromise = this.doInit();
    }
    async doInit() {
        await this.ensureDir();
        this.initialized = true;
    }
    async waitForInit() {
        if (!this.initialized) {
            await this.initPromise;
        }
    }
    async ensureDir() {
        try {
            await fs.mkdir(this.sessionsDir, { recursive: true });
        }
        catch {
            // Directory might already exist
        }
    }
    /**
     * Create a new session
     */
    async createSession(cwd, title) {
        await this.waitForInit(); // Bug #69 fix: Wait for initialization
        const id = uuidv4();
        const session = {
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
    async saveSession(session) {
        await this.waitForInit(); // Bug #69 fix: Wait for initialization
        await this.ensureDir();
        session.updated = Date.now();
        const filePath = path.join(this.sessionsDir, `${session.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(session, null, 2));
    }
    /**
     * Load a session by ID
     */
    async loadSession(id) {
        await this.waitForInit(); // Bug #69 fix: Wait for initialization
        try {
            const filePath = path.join(this.sessionsDir, `${id}.json`);
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    /**
     * List all sessions, sorted by most recently updated
     */
    async listSessions() {
        await this.waitForInit(); // Bug #69 fix: Wait for initialization
        await this.ensureDir();
        try {
            const files = await fs.readdir(this.sessionsDir);
            const sessions = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const filePath = path.join(this.sessionsDir, file);
                        const data = await fs.readFile(filePath, 'utf-8');
                        const session = JSON.parse(data);
                        sessions.push(session);
                    }
                    catch {
                        // Skip corrupted files
                    }
                }
            }
            return sessions.sort((a, b) => b.updated - a.updated);
        }
        catch {
            return [];
        }
    }
    /**
     * Get the most recent session
     */
    async getLastSession() {
        const sessions = await this.listSessions();
        return sessions.length > 0 ? sessions[0] : null;
    }
    /**
     * Delete a session
     */
    async deleteSession(id) {
        await this.waitForInit(); // Bug #69 fix: Wait for initialization
        try {
            const filePath = path.join(this.sessionsDir, `${id}.json`);
            await fs.unlink(filePath);
        }
        catch {
            // Ignore errors
        }
    }
    /**
     * Update session title
     */
    async updateTitle(id, title) {
        await this.waitForInit(); // Bug #69 fix: Wait for initialization
        const session = await this.loadSession(id);
        if (session) {
            session.title = title;
            await this.saveSession(session);
        }
    }
    /**
     * Get the sessions directory path
     */
    getSessionsDir() {
        return this.sessionsDir;
    }
}
//# sourceMappingURL=conversation-store.js.map