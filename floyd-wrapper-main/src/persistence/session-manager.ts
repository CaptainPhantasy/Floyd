/**
 * Session Manager - Floyd Wrapper
 * 
 * Manages persistent sessions, interaction history, and state checkpoints
 * using SQLite storage.
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import fs from 'fs-extra';
import { initializeSchema } from './schema.js';
import { logger } from '../utils/logger.js';
import type { Session, SessionMetadata, FloydMessage } from '../types.js';

export class SessionManager {
    private db: Database.Database;
    private currentSessionId: string | null = null;
    private readonly dbPath: string;

    constructor(workspaceRoot: string) {
        const floydDir = path.join(workspaceRoot, '.floyd');
        fs.ensureDirSync(floydDir);

        this.dbPath = path.join(floydDir, 'floyd.db');

        try {
            this.db = new Database(this.dbPath);
            initializeSchema(this.db);
            logger.debug('SessionManager initialized', { dbPath: this.dbPath });
        } catch (error) {
            logger.error('Failed to initialize SQLite database', error);
            throw error;
        }
    }

    /**
     * Create a new session
     */
    createSession(name: string, metadata: SessionMetadata = {}): Session {
        const id = uuidv4();
        const now = Date.now();

        const stmt = this.db.prepare(`
      INSERT INTO sessions (id, name, created_at, updated_at, metadata_json)
      VALUES (?, ?, ?, ?, ?)
    `);

        stmt.run(id, name, now, now, JSON.stringify(metadata));

        this.currentSessionId = id;
        logger.info('Created new session', { sessionId: id, name });

        return {
            id,
            name,
            createdAt: now,
            updatedAt: now,
            metadata
        };
    }

    /**
     * List all sessions
     */
    listSessions(): Session[] {
        const stmt = this.db.prepare(`
      SELECT * FROM sessions ORDER BY updated_at DESC
    `);

        const rows = stmt.all() as any[];

        return rows.map(row => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            metadata: JSON.parse(row.metadata_json || '{}')
        }));
    }

    /**
     * Load a session by ID or name
     */
    loadSession(idOrName: string): Session | null {
        // Try by ID first
        let stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?');
        let row = stmt.get(idOrName) as any;

        // Then by name
        if (!row) {
            stmt = this.db.prepare('SELECT * FROM sessions WHERE name = ?');
            row = stmt.get(idOrName) as any;
        }

        if (!row) {
            return null;
        }

        this.currentSessionId = row.id;

        return {
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            metadata: JSON.parse(row.metadata_json || '{}')
        };
    }

    /**
     * Save a message to the history
     */
    async saveMessage(role: string, content: string, toolUseId?: string): Promise<void> {
        if (!this.currentSessionId) {
            // logger.warn('Attempted to save message without active session');
            return;
        }

        const id = uuidv4();
        const now = Date.now();

        // Redaction logic would go here
        const redactedContent = this.redactSecrets(content);

        const stmt = this.db.prepare(`
      INSERT INTO history (id, session_id, role, content, timestamp, tool_use_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, this.currentSessionId, role, redactedContent, now, toolUseId);

        // Update session updated_at
        this.touchSession();
    }

    /**
     * Get interaction history for the current session
     */
    getHistory(): FloydMessage[] {
        if (!this.currentSessionId) {
            return [];
        }

        const stmt = this.db.prepare(`
      SELECT * FROM history 
      WHERE session_id = ? 
      ORDER BY timestamp ASC
    `);

        const rows = stmt.all(this.currentSessionId) as any[];

        return rows.map(row => ({
            role: row.role,
            content: row.content,
            timestamp: row.timestamp,
            toolUseId: row.tool_use_id || undefined
        }));
    }

    /**
     * Delete a session
     */
    deleteSession(id: string): void {
        const stmt = this.db.prepare('DELETE FROM sessions WHERE id = ?');
        stmt.run(id);

        if (this.currentSessionId === id) {
            this.currentSessionId = null;
        }
    }

    /**
     * Update session timestamp
     */
    private touchSession(): void {
        if (!this.currentSessionId) return;

        const stmt = this.db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?');
        stmt.run(Date.now(), this.currentSessionId);
    }

    /**
     * Redact secrets from content (Placeholder)
     */
    private redactSecrets(content: string): string {
        // TODO: Implement actual regex replacement for API keys
        return content;
    }

    /**
     * Get history summary with message counts and timestamps
     */
    getHistorySummary(): { total: number; byRole: Record<string, number>; firstMessage?: number; lastMessage?: number } {
        if (!this.currentSessionId) {
            return { total: 0, byRole: {} };
        }

        const countStmt = this.db.prepare(`
            SELECT role, COUNT(*) as count FROM history 
            WHERE session_id = ? 
            GROUP BY role
        `);
        const counts = countStmt.all(this.currentSessionId) as { role: string; count: number }[];

        const byRole: Record<string, number> = {};
        let total = 0;
        for (const row of counts) {
            byRole[row.role] = row.count;
            total += row.count;
        }

        const timeStmt = this.db.prepare(`
            SELECT MIN(timestamp) as first, MAX(timestamp) as last FROM history 
            WHERE session_id = ?
        `);
        const times = timeStmt.get(this.currentSessionId) as { first: number | null; last: number | null };

        return {
            total,
            byRole,
            firstMessage: times?.first ?? undefined,
            lastMessage: times?.last ?? undefined
        };
    }

    /**
     * Compact history by removing old messages, keeping only recent ones
     * Returns the number of messages removed
     */
    compactHistory(keepCount: number = 20): number {
        if (!this.currentSessionId) {
            return 0;
        }

        // Get IDs of messages to keep (most recent)
        const keepStmt = this.db.prepare(`
            SELECT id FROM history 
            WHERE session_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        `);
        const keepIds = keepStmt.all(this.currentSessionId, keepCount) as { id: string }[];
        const keepIdSet = new Set(keepIds.map(r => r.id));

        // Count messages before deletion
        const countBefore = this.getHistorySummary().total;

        if (keepIdSet.size === 0) {
            return 0;
        }

        // Delete messages not in keep list
        const placeholders = Array(keepIdSet.size).fill('?').join(',');
        const deleteStmt = this.db.prepare(`
            DELETE FROM history 
            WHERE session_id = ? AND id NOT IN (${placeholders})
        `);
        deleteStmt.run(this.currentSessionId, ...Array.from(keepIdSet));

        const countAfter = this.getHistorySummary().total;
        const removed = countBefore - countAfter;

        if (removed > 0) {
            logger.info('Compacted history', { removed, remaining: countAfter });
        }

        return removed;
    }

    /**
     * Get current session ID
     */
    getCurrentSessionId(): string | null {
        return this.currentSessionId;
    }

    /**
     * Create a checkpoint for a file before modification
     */
    createCheckpoint(filePath: string, content: Buffer | string, description: string, triggerEvent: string = 'manual'): string {
        if (!this.currentSessionId) {
            throw new Error('No active session for checkpoint');
        }

        const id = uuidv4();
        const now = Date.now();
        const contentBuffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

        const stmt = this.db.prepare(`
            INSERT INTO checkpoints (id, session_id, description, file_path, content_blob, timestamp, trigger_event)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, this.currentSessionId, description, filePath, contentBuffer, now, triggerEvent);
        logger.info('Created checkpoint', { id, filePath, triggerEvent });

        return id;
    }

    /**
     * List checkpoints for the current session
     */
    listCheckpoints(): Array<{ id: string; filePath: string; description: string; timestamp: number; triggerEvent: string }> {
        if (!this.currentSessionId) {
            return [];
        }

        const stmt = this.db.prepare(`
            SELECT id, file_path, description, timestamp, trigger_event 
            FROM checkpoints 
            WHERE session_id = ? 
            ORDER BY timestamp DESC
        `);

        const rows = stmt.all(this.currentSessionId) as any[];

        return rows.map(row => ({
            id: row.id,
            filePath: row.file_path,
            description: row.description,
            timestamp: row.timestamp,
            triggerEvent: row.trigger_event
        }));
    }

    /**
     * Get checkpoint content by ID
     */
    getCheckpointContent(checkpointId: string): { filePath: string; content: Buffer } | null {
        const stmt = this.db.prepare(`
            SELECT file_path, content_blob FROM checkpoints WHERE id = ?
        `);

        const row = stmt.get(checkpointId) as any;

        if (!row) {
            return null;
        }

        return {
            filePath: row.file_path,
            content: row.content_blob
        };
    }

    /**
     * Delete a checkpoint by ID
     */
    deleteCheckpoint(checkpointId: string): void {
        const stmt = this.db.prepare('DELETE FROM checkpoints WHERE id = ?');
        stmt.run(checkpointId);
    }

    /**
     * Clean up old checkpoints, keeping only the most recent N per file
     */
    cleanupCheckpoints(keepPerFile: number = 5): number {
        if (!this.currentSessionId) {
            return 0;
        }

        // Get all file paths with checkpoints
        const filesStmt = this.db.prepare(`
            SELECT DISTINCT file_path FROM checkpoints WHERE session_id = ?
        `);
        const files = filesStmt.all(this.currentSessionId) as { file_path: string }[];

        let totalRemoved = 0;

        for (const { file_path } of files) {
            // Get checkpoints to keep (most recent)
            const keepStmt = this.db.prepare(`
                SELECT id FROM checkpoints 
                WHERE session_id = ? AND file_path = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            `);
            const keepIds = keepStmt.all(this.currentSessionId, file_path, keepPerFile) as { id: string }[];
            const keepIdSet = new Set(keepIds.map(r => r.id));

            if (keepIdSet.size === 0) continue;

            // Count before
            const countStmt = this.db.prepare(`
                SELECT COUNT(*) as count FROM checkpoints 
                WHERE session_id = ? AND file_path = ?
            `);
            const countBefore = (countStmt.get(this.currentSessionId, file_path) as any).count;

            // Delete old ones
            const placeholders = Array(keepIdSet.size).fill('?').join(',');
            const deleteStmt = this.db.prepare(`
                DELETE FROM checkpoints 
                WHERE session_id = ? AND file_path = ? AND id NOT IN (${placeholders})
            `);
            deleteStmt.run(this.currentSessionId, file_path, ...Array.from(keepIdSet));

            const countAfter = (countStmt.get(this.currentSessionId, file_path) as any).count;
            totalRemoved += countBefore - countAfter;
        }

        if (totalRemoved > 0) {
            logger.info('Cleaned up checkpoints', { removed: totalRemoved });
        }

        return totalRemoved;
    }
}
