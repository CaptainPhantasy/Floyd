/**
 * Floyd Persistence Schema
 * 
 * Defines the SQLite schema for persistent sessions, interaction history,
 * and state checkpoints.
 */

import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';

export const SCHEMA_VERSION = 1;

/**
 * Initialize the database with the required schema
 */
export function initializeSchema(db: Database.Database): void {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create sessions table
    db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      metadata_json TEXT DEFAULT '{}'
    )
  `);

    // Create history table (messages)
    db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      tool_use_id TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

    // Create checkpoints table
    db.exec(`
    CREATE TABLE IF NOT EXISTS checkpoints (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      description TEXT NOT NULL,
      file_path TEXT NOT NULL,
      content_blob BLOB NOT NULL,
      timestamp INTEGER NOT NULL,
      trigger_event TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

    // Create indexes for performance
    db.exec(`CREATE INDEX IF NOT EXISTS idx_history_session_id ON history(session_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_checkpoints_session_id ON checkpoints(session_id)`);

    logger.debug('Database schema initialized');
}
