/**
 * Checkpoint Manager
 *
 * Creates, manages, and restores checkpoints for undo/redo operations.
 * Auto-checkpoints before dangerous tool executions.
 *
 * @module rewind/checkpoint-manager
 */

import { mkdir, writeFile, readFile, readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { FileSnapshot } from './file-snapshot.js';
import { FileSnapshotManager, calculateTotalSnapshotsSize, formatBytes } from './file-snapshot.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Checkpoint metadata
 */
export interface Checkpoint {
  /** Unique checkpoint ID */
  id: string;

  /** Checkpoint name */
  name: string;

  /** Checkpoint description */
  description?: string;

  /** File snapshots */
  snapshots: FileSnapshot[];

  /** Timestamp */
  createdAt: Date;

  /** Total size in bytes */
  size: number;

  /** Number of files */
  fileCount: number;

  /** Checkpoint tags */
  tags: string[];

  /** Automatic checkpoint (created before dangerous operation) */
  automatic: boolean;

  /** Tool that triggered automatic checkpoint */
  triggerTool?: string;

  /** Session ID this checkpoint belongs to */
  sessionId?: string;
}

/**
 * Checkpoint creation options
 */
export interface CheckpointOptions {
  /** Checkpoint name */
  name?: string;

  /** Checkpoint description */
  description?: string;

  /** Checkpoint tags */
  tags?: string[];

  /** Automatic checkpoint */
  automatic?: boolean;

  /** Tool that triggered the checkpoint */
  triggerTool?: string;

  /** Session ID */
  sessionId?: string;
}

/**
 * Checkpoint storage options
 */
export interface CheckpointStorageOptions {
  /** Checkpoints directory */
  checkpointsDir?: string;

  /** Maximum checkpoints to keep */
  maxCheckpoints?: number;

  /** Maximum total storage size in bytes */
  maxStorageSize?: number;

  /** Auto-checkpoint before dangerous tools */
  autoCheckpointEnabled?: boolean;
}

/**
 * Tools that trigger automatic checkpoints
 */
export const DANGEROUS_TOOLS = [
  'delete_file',
  'move_file',
  'write_file',
  'edit_file',
  'replace_in_file',
  'git_reset',
  'git_merge',
  'git_rebase',
  'execute_command',
  'bash',
];

// ============================================================================
// CHECKPOINT MANAGER CLASS
// ============================================================================

/**
 * CheckpointManager - Create and manage checkpoints
 *
 * Provides checkpoint functionality for undo/redo operations.
 * Checkpoints capture file states at a point in time.
 * Automatically creates checkpoints before dangerous operations.
 */
export class CheckpointManager {
  private readonly storageDir: string;
  private readonly options: Required<CheckpointStorageOptions>;
  private readonly snapshotManager: FileSnapshotManager;
  private readonly checkpoints: Map<string, Checkpoint> = new Map();
  private initialized: boolean = false;

  constructor(options: CheckpointStorageOptions = {}) {
    this.storageDir = options.checkpointsDir ||
      join(homedir(), '.floyd', 'checkpoints');

    this.options = {
      checkpointsDir: this.storageDir,
      maxCheckpoints: options.maxCheckpoints ?? 50,
      maxStorageSize: options.maxStorageSize ?? 500 * 1024 * 1024, // 500 MB
      autoCheckpointEnabled: options.autoCheckpointEnabled ?? true,
    };

    this.snapshotManager = new FileSnapshotManager({
      includeStats: true,
      includeHash: true,
    });
  }

  /**
   * Initialize checkpoint manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Create checkpoints directory
    await mkdir(this.storageDir, { recursive: true });

    // Load existing checkpoints
    await this.loadCheckpoints();

    this.initialized = true;
    logger.debug('CheckpointManager initialized', {
      checkpointCount: this.checkpoints.size,
      storageDir: this.storageDir,
    });
  }

  /**
   * Check if a tool should trigger an auto-checkpoint
   */
  shouldAutoCheckpoint(toolName: string): boolean {
    if (!this.options.autoCheckpointEnabled) {
      return false;
    }
    return DANGEROUS_TOOLS.includes(toolName);
  }

  /**
   * Create an automatic checkpoint before a dangerous tool execution
   */
  async createAutoCheckpoint(
    toolName: string,
    affectedPaths: string[],
    sessionId?: string
  ): Promise<Checkpoint | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (affectedPaths.length === 0) {
      logger.debug('No affected paths for auto-checkpoint');
      return null;
    }

    try {
      const checkpoint = await this.createCheckpoint(affectedPaths, {
        name: `Auto: before ${toolName}`,
        description: `Automatic checkpoint created before ${toolName} execution`,
        tags: ['auto', toolName],
        automatic: true,
        triggerTool: toolName,
        sessionId,
      });

      logger.info('Auto-checkpoint created', {
        checkpointId: checkpoint.id,
        toolName,
        fileCount: checkpoint.fileCount,
      });

      return checkpoint;
    } catch (error) {
      logger.warn('Failed to create auto-checkpoint', { toolName, error });
      return null;
    }
  }

  /**
   * Create a checkpoint
   */
  async createCheckpoint(
    paths: string[],
    options: CheckpointOptions = {}
  ): Promise<Checkpoint> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Generate checkpoint ID
    const id = this.generateCheckpointId();

    // Create snapshots
    const snapshots = await this.snapshotManager.createSnapshots(paths);

    if (snapshots.length === 0) {
      throw new Error('No files were snapshotted');
    }

    // Calculate size
    const size = calculateTotalSnapshotsSize(snapshots);

    // Create checkpoint
    const checkpoint: Checkpoint = {
      id,
      name: options.name || `checkpoint-${id.slice(0, 8)}`,
      description: options.description,
      snapshots,
      createdAt: new Date(),
      size,
      fileCount: snapshots.length,
      tags: options.tags || [],
      automatic: options.automatic ?? false,
      triggerTool: options.triggerTool,
      sessionId: options.sessionId,
    };

    // Save checkpoint
    await this.saveCheckpoint(checkpoint);

    // Add to memory
    this.checkpoints.set(id, checkpoint);

    // Cleanup old checkpoints
    await this.cleanup();

    logger.debug('Checkpoint created', {
      id: checkpoint.id,
      name: checkpoint.name,
      fileCount: checkpoint.fileCount,
      size: formatBytes(checkpoint.size),
    });

    return checkpoint;
  }

  /**
   * Restore a checkpoint
   */
  async restoreCheckpoint(checkpointId: string): Promise<{
    restored: string[];
    failed: string[];
  }> {
    const checkpoint = this.checkpoints.get(checkpointId);

    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    const restored: string[] = [];
    const failed: string[] = [];

    // Restore each file
    for (const snapshot of checkpoint.snapshots) {
      try {
        await writeFile(snapshot.path, snapshot.content, 'utf-8');
        restored.push(snapshot.path);
      } catch (error) {
        logger.error(`Failed to restore ${snapshot.path}:`, error);
        failed.push(snapshot.path);
      }
    }

    logger.info('Checkpoint restored', {
      checkpointId,
      restored: restored.length,
      failed: failed.length,
    });

    return { restored, failed };
  }

  /**
   * Restore specific files from a checkpoint
   */
  async restoreFiles(
    checkpointId: string,
    filePaths: string[]
  ): Promise<{ restored: string[]; failed: string[] }> {
    const checkpoint = this.checkpoints.get(checkpointId);

    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    // Find snapshots for requested files
    const snapshotsToRestore = checkpoint.snapshots.filter(s =>
      filePaths.includes(s.path)
    );

    if (snapshotsToRestore.length === 0) {
      throw new Error('No matching files found in checkpoint');
    }

    const restored: string[] = [];
    const failed: string[] = [];

    // Restore files
    for (const snapshot of snapshotsToRestore) {
      try {
        await writeFile(snapshot.path, snapshot.content, 'utf-8');
        restored.push(snapshot.path);
      } catch (error) {
        logger.error(`Failed to restore ${snapshot.path}:`, error);
        failed.push(snapshot.path);
      }
    }

    return { restored, failed };
  }

  /**
   * Delete a checkpoint
   */
  async deleteCheckpoint(checkpointId: string): Promise<boolean> {
    const checkpoint = this.checkpoints.get(checkpointId);

    if (!checkpoint) {
      return false;
    }

    // Delete checkpoint file
    try {
      const checkpointPath = join(this.storageDir, `${checkpointId}.json`);
      await unlink(checkpointPath);
    } catch {
      // Ignore if file doesn't exist
    }

    // Remove from memory
    this.checkpoints.delete(checkpointId);

    logger.debug('Checkpoint deleted', { checkpointId });

    return true;
  }

  /**
   * Get a checkpoint by ID
   */
  getCheckpoint(checkpointId: string): Checkpoint | undefined {
    return this.checkpoints.get(checkpointId);
  }

  /**
   * Get all checkpoints
   */
  getAllCheckpoints(): Checkpoint[] {
    return Array.from(this.checkpoints.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get checkpoints by session
   */
  getCheckpointsBySession(sessionId: string): Checkpoint[] {
    return this.getAllCheckpoints().filter(c => c.sessionId === sessionId);
  }

  /**
   * Get checkpoints by tag
   */
  getCheckpointsByTag(tag: string): Checkpoint[] {
    return this.getAllCheckpoints().filter(c => c.tags.includes(tag));
  }

  /**
   * Get automatic checkpoints
   */
  getAutomaticCheckpoints(): Checkpoint[] {
    return this.getAllCheckpoints().filter(c => c.automatic);
  }

  /**
   * Get latest checkpoint
   */
  getLatestCheckpoint(): Checkpoint | undefined {
    const checkpoints = this.getAllCheckpoints();
    return checkpoints[0];
  }

  /**
   * Get checkpoint statistics
   */
  getStats(): {
    totalCheckpoints: number;
    automaticCheckpoints: number;
    manualCheckpoints: number;
    totalSize: number;
    totalFiles: number;
    oldestCheckpoint?: Date;
    newestCheckpoint?: Date;
  } {
    const checkpoints = this.getAllCheckpoints();
    const automatic = checkpoints.filter(c => c.automatic).length;
    const manual = checkpoints.length - automatic;
    const totalSize = checkpoints.reduce((sum, c) => sum + c.size, 0);
    const totalFiles = checkpoints.reduce((sum, c) => sum + c.fileCount, 0);

    return {
      totalCheckpoints: checkpoints.length,
      automaticCheckpoints: automatic,
      manualCheckpoints: manual,
      totalSize,
      totalFiles,
      oldestCheckpoint: checkpoints[checkpoints.length - 1]?.createdAt,
      newestCheckpoint: checkpoints[0]?.createdAt,
    };
  }

  /**
   * Clear all checkpoints
   */
  async clearAll(): Promise<void> {
    const checkpointIds = Array.from(this.checkpoints.keys());

    for (const id of checkpointIds) {
      await this.deleteCheckpoint(id);
    }

    logger.info('All checkpoints cleared');
  }

  /**
   * Save checkpoint to disk
   */
  private async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    const checkpointPath = join(this.storageDir, `${checkpoint.id}.json`);

    // Convert snapshots to JSON format
    const checkpointData = {
      ...checkpoint,
      createdAt: checkpoint.createdAt.toISOString(),
      snapshots: checkpoint.snapshots.map(s =>
        this.snapshotManager.snapshotToJSON(s)
      ),
    };

    await writeFile(checkpointPath, JSON.stringify(checkpointData, null, 2), 'utf-8');
  }

  /**
   * Load checkpoints from disk
   */
  private async loadCheckpoints(): Promise<void> {
    try {
      const files = await readdir(this.storageDir);

      for (const file of files) {
        if (!file.endsWith('.json')) {
          continue;
        }

        try {
          const checkpointPath = join(this.storageDir, file);
          const content = await readFile(checkpointPath, 'utf-8');
          const data = JSON.parse(content);

          // Parse snapshots back from JSON
          const snapshots = data.snapshots.map((s: string) =>
            this.snapshotManager.snapshotFromJSON(s)
          );

          // Create checkpoint
          const checkpoint: Checkpoint = {
            ...data,
            snapshots,
            createdAt: new Date(data.createdAt),
          };

          this.checkpoints.set(checkpoint.id, checkpoint);
        } catch (error) {
          logger.error(`Failed to load checkpoint from ${file}:`, error);
        }
      }
    } catch {
      // Directory doesn't exist yet
    }
  }

  /**
   * Cleanup old checkpoints
   */
  private async cleanup(): Promise<void> {
    const checkpoints = this.getAllCheckpoints();
    const stats = this.getStats();

    // Check max checkpoints limit
    if (checkpoints.length > this.options.maxCheckpoints) {
      // Remove oldest automatic checkpoints first
      const toRemove = checkpoints
        .filter(c => c.automatic)
        .slice(this.options.maxCheckpoints);

      for (const checkpoint of toRemove) {
        await this.deleteCheckpoint(checkpoint.id);
      }
    }

    // Check storage size limit
    if (stats.totalSize > this.options.maxStorageSize) {
      // Remove oldest checkpoints until under limit
      const sortedCheckpoints = this.getAllCheckpoints();
      let currentSize = stats.totalSize;

      for (const checkpoint of sortedCheckpoints.reverse()) {
        if (currentSize <= this.options.maxStorageSize) {
          break;
        }

        await this.deleteCheckpoint(checkpoint.id);
        currentSize -= checkpoint.size;
      }
    }
  }

  /**
   * Generate checkpoint ID
   */
  private generateCheckpointId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `cp-${timestamp}-${random}`;
  }
}

// ============================================================================
// DEFAULT INSTANCE
// ============================================================================

let defaultCheckpointManager: CheckpointManager | null = null;

/**
 * Get or create the default checkpoint manager
 */
export function getCheckpointManager(
  options?: CheckpointStorageOptions
): CheckpointManager {
  if (!defaultCheckpointManager) {
    defaultCheckpointManager = new CheckpointManager(options);
  }
  return defaultCheckpointManager;
}

/**
 * Reset the default checkpoint manager (useful for testing)
 */
export function resetCheckpointManager(): void {
  defaultCheckpointManager = null;
}

export { formatBytes };
export default CheckpointManager;
