/**
 * File Snapshot Manager
 *
 * Creates and manages file snapshots for checkpoint/rewind functionality.
 *
 * @module rewind/file-snapshot
 */

import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * File snapshot containing original content and metadata
 */
export interface FileSnapshot {
  /** Absolute file path */
  path: string;

  /** File content at snapshot time */
  content: string;

  /** File size in bytes */
  size: number;

  /** SHA-256 hash of content */
  hash: string;

  /** Unix timestamp of snapshot creation */
  createdAt: number;

  /** File modification time at snapshot */
  mtime?: number;

  /** File permissions */
  mode?: number;
}

/**
 * Snapshot creation options
 */
export interface SnapshotOptions {
  /** Include file stats (mtime, mode) */
  includeStats?: boolean;

  /** Include content hash */
  includeHash?: boolean;

  /** Maximum file size to snapshot (bytes) */
  maxFileSize?: number;
}

// ============================================================================
// FILE SNAPSHOT MANAGER CLASS
// ============================================================================

/**
 * FileSnapshotManager - Create and manage file snapshots
 *
 * Provides file snapshot functionality for checkpoint creation.
 * Captures file contents and metadata at a point in time.
 */
export class FileSnapshotManager {
  private readonly options: Required<SnapshotOptions>;

  constructor(options: SnapshotOptions = {}) {
    this.options = {
      includeStats: options.includeStats ?? true,
      includeHash: options.includeHash ?? true,
      maxFileSize: options.maxFileSize ?? 10 * 1024 * 1024, // 10 MB default
    };
  }

  /**
   * Create a snapshot of a single file
   */
  async createSnapshot(filePath: string): Promise<FileSnapshot | null> {
    try {
      // Read file content
      const content = await readFile(filePath, 'utf-8');

      // Check file size
      const size = Buffer.byteLength(content, 'utf-8');
      if (size > this.options.maxFileSize) {
        logger.warn(`File too large to snapshot: ${filePath} (${formatBytes(size)})`);
        return null;
      }

      // Create base snapshot
      const snapshot: FileSnapshot = {
        path: filePath,
        content,
        size,
        hash: '',
        createdAt: Date.now(),
      };

      // Add hash if requested
      if (this.options.includeHash) {
        snapshot.hash = this.calculateHash(content);
      }

      // Add stats if requested
      if (this.options.includeStats) {
        try {
          const stats = await stat(filePath);
          snapshot.mtime = stats.mtimeMs;
          snapshot.mode = stats.mode;
        } catch {
          // Stats not available, continue without them
        }
      }

      return snapshot;
    } catch (error) {
      logger.debug(`Failed to create snapshot for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Create snapshots for multiple files
   */
  async createSnapshots(filePaths: string[]): Promise<FileSnapshot[]> {
    const snapshots: FileSnapshot[] = [];

    for (const filePath of filePaths) {
      const snapshot = await this.createSnapshot(filePath);
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }

    return snapshots;
  }

  /**
   * Calculate SHA-256 hash of content
   */
  calculateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Verify if a snapshot matches current file state
   */
  async verifySnapshot(snapshot: FileSnapshot): Promise<boolean> {
    try {
      const currentContent = await readFile(snapshot.path, 'utf-8');
      const currentHash = this.calculateHash(currentContent);
      return currentHash === snapshot.hash;
    } catch {
      return false;
    }
  }

  /**
   * Serialize snapshot to JSON
   */
  snapshotToJSON(snapshot: FileSnapshot): string {
    return JSON.stringify({
      ...snapshot,
      content: Buffer.from(snapshot.content).toString('base64'),
    });
  }

  /**
   * Deserialize snapshot from JSON
   */
  snapshotFromJSON(json: string): FileSnapshot {
    const data = JSON.parse(json);
    return {
      ...data,
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate total size of multiple snapshots
 */
export function calculateTotalSnapshotsSize(snapshots: FileSnapshot[]): number {
  return snapshots.reduce((total, snapshot) => total + snapshot.size, 0);
}

// ============================================================================
// DEFAULT INSTANCE
// ============================================================================

let defaultSnapshotManager: FileSnapshotManager | null = null;

/**
 * Get or create the default snapshot manager
 */
export function getDefaultSnapshotManager(
  options?: SnapshotOptions
): FileSnapshotManager {
  if (!defaultSnapshotManager) {
    defaultSnapshotManager = new FileSnapshotManager(options);
  }
  return defaultSnapshotManager;
}

export default FileSnapshotManager;
