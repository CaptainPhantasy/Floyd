/**
 * Sandbox Manager - Floyd Wrapper
 *
 * Provides isolated execution environments for YOLO mode.
 * Supports directory-based sandboxing (copy project to temp) and
 * optional Docker container sandboxing.
 *
 * @module sandbox/sandbox-manager
 */

import { mkdir, cp, rm, readdir, readFile } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Sandbox type
 */
export type SandboxType = 'directory' | 'docker' | 'dryrun';

/**
 * Sandbox state
 */
export type SandboxState = 'inactive' | 'active' | 'committed' | 'discarded';

/**
 * File change in sandbox
 */
export interface SandboxFileChange {
  /** Original path in real project */
  originalPath: string;
  /** Path in sandbox */
  sandboxPath: string;
  /** Type of change */
  changeType: 'created' | 'modified' | 'deleted';
  /** Timestamp of change */
  timestamp: number;
}

/**
 * Sandbox session info
 */
export interface SandboxSession {
  /** Unique session ID */
  id: string;
  /** Sandbox type */
  type: SandboxType;
  /** Project root being sandboxed */
  projectRoot: string;
  /** Sandbox root directory */
  sandboxRoot: string;
  /** Current state */
  state: SandboxState;
  /** File changes tracked */
  changes: SandboxFileChange[];
  /** Created timestamp */
  createdAt: number;
  /** Updated timestamp */
  updatedAt: number;
}

/**
 * Sandbox options
 */
export interface SandboxOptions {
  /** Sandbox type */
  type?: SandboxType;
  /** Custom sandbox root (default: system temp) */
  sandboxRoot?: string;
  /** Patterns to exclude from sandbox copy */
  excludePatterns?: string[];
  /** Auto-cleanup on discard */
  autoCleanup?: boolean;
}

/**
 * Commit result
 */
export interface CommitResult {
  /** Files committed */
  committed: string[];
  /** Files that failed to commit */
  failed: string[];
  /** Whether commit was successful */
  success: boolean;
}

// ============================================================================
// DEFAULT EXCLUDE PATTERNS
// ============================================================================

const DEFAULT_EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.floyd',
  'dist',
  'build',
  '.next',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  'venv',
  '.venv',
  'target',
  'vendor',
];

// ============================================================================
// SANDBOX MANAGER CLASS
// ============================================================================

/**
 * SandboxManager - Isolated execution environment
 *
 * Provides a sandboxed copy of the project where YOLO mode can
 * execute freely. Changes can be reviewed and committed back
 * to the real project or discarded.
 */
export class SandboxManager {
  private session: SandboxSession | null = null;
  private options: Required<SandboxOptions>;

  constructor(options: SandboxOptions = {}) {
    this.options = {
      type: options.type ?? 'directory',
      sandboxRoot: options.sandboxRoot ?? join(tmpdir(), 'floyd-sandbox'),
      excludePatterns: options.excludePatterns ?? DEFAULT_EXCLUDE_PATTERNS,
      autoCleanup: options.autoCleanup ?? true,
    };
  }

  /**
   * Check if sandbox is active
   */
  isActive(): boolean {
    return this.session?.state === 'active';
  }

  /**
   * Get current session
   */
  getSession(): SandboxSession | null {
    return this.session;
  }

  /**
   * Start a new sandbox session
   */
  async start(projectRoot: string): Promise<SandboxSession> {
    if (this.session?.state === 'active') {
      throw new Error('Sandbox already active. Commit or discard first.');
    }

    // Generate unique sandbox ID
    const id = `sandbox-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;

    // Create sandbox directory
    const sandboxRoot = join(this.options.sandboxRoot, id);
    await mkdir(sandboxRoot, { recursive: true });

    // Copy project to sandbox (excluding patterns)
    await this.copyProjectToSandbox(projectRoot, sandboxRoot);

    // Create session
    this.session = {
      id,
      type: this.options.type,
      projectRoot,
      sandboxRoot,
      state: 'active',
      changes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    logger.info('Sandbox started', {
      id: this.session.id,
      projectRoot,
      sandboxRoot,
    });

    return this.session;
  }

  /**
   * Translate a real path to sandbox path
   */
  translatePath(realPath: string): string {
    if (!this.session || this.session.state !== 'active') {
      throw new Error('No active sandbox session');
    }

    const relativePath = relative(this.session.projectRoot, realPath);

    // If path is outside project root, return as-is
    if (relativePath.startsWith('..') || relativePath.startsWith('/')) {
      return realPath;
    }

    return join(this.session.sandboxRoot, relativePath);
  }

  /**
   * Translate a sandbox path back to real path
   */
  translateToReal(sandboxPath: string): string {
    if (!this.session || this.session.state !== 'active') {
      throw new Error('No active sandbox session');
    }

    const relativePath = relative(this.session.sandboxRoot, sandboxPath);

    // If path is outside sandbox root, return as-is
    if (relativePath.startsWith('..') || relativePath.startsWith('/')) {
      return sandboxPath;
    }

    return join(this.session.projectRoot, relativePath);
  }

  /**
   * Track a file change in sandbox
   */
  trackChange(
    sandboxPath: string,
    changeType: 'created' | 'modified' | 'deleted'
  ): void {
    if (!this.session || this.session.state !== 'active') {
      return;
    }

    const originalPath = this.translateToReal(sandboxPath);

    // Check if change already tracked
    const existingIndex = this.session.changes.findIndex(
      c => c.sandboxPath === sandboxPath
    );

    if (existingIndex >= 0) {
      // Update existing change
      this.session.changes[existingIndex].changeType = changeType;
      this.session.changes[existingIndex].timestamp = Date.now();
    } else {
      // Add new change
      this.session.changes.push({
        originalPath,
        sandboxPath,
        changeType,
        timestamp: Date.now(),
      });
    }

    this.session.updatedAt = Date.now();
  }

  /**
   * Get all tracked changes
   */
  getChanges(): SandboxFileChange[] {
    return this.session?.changes ?? [];
  }

  /**
   * Get changes summary
   */
  getChangesSummary(): {
    created: number;
    modified: number;
    deleted: number;
    total: number;
  } {
    const changes = this.getChanges();

    return {
      created: changes.filter(c => c.changeType === 'created').length,
      modified: changes.filter(c => c.changeType === 'modified').length,
      deleted: changes.filter(c => c.changeType === 'deleted').length,
      total: changes.length,
    };
  }

  /**
   * Commit sandbox changes to real project
   */
  async commit(): Promise<CommitResult> {
    if (!this.session || this.session.state !== 'active') {
      throw new Error('No active sandbox session to commit');
    }

    const committed: string[] = [];
    const failed: string[] = [];

    for (const change of this.session.changes) {
      try {
        switch (change.changeType) {
          case 'created':
          case 'modified':
            // Copy file from sandbox to real project
            await this.copyFile(change.sandboxPath, change.originalPath);
            committed.push(change.originalPath);
            break;

          case 'deleted':
            // Delete file from real project
            await rm(change.originalPath, { force: true });
            committed.push(change.originalPath);
            break;
        }
      } catch (error) {
        logger.error(`Failed to commit change: ${change.originalPath}`, error);
        failed.push(change.originalPath);
      }
    }

    const success = failed.length === 0;

    // Update session state
    this.session.state = 'committed';
    this.session.updatedAt = Date.now();

    // Cleanup sandbox
    if (this.options.autoCleanup) {
      await this.cleanup();
    }

    logger.info('Sandbox committed', {
      committed: committed.length,
      failed: failed.length,
    });

    return { committed, failed, success };
  }

  /**
   * Discard sandbox changes
   */
  async discard(): Promise<void> {
    if (!this.session) {
      return;
    }

    // Capture session info before cleanup
    const sessionId = this.session.id;

    this.session.state = 'discarded';
    this.session.updatedAt = Date.now();

    // Cleanup sandbox (sets this.session to null)
    if (this.options.autoCleanup) {
      await this.cleanup();
    }

    logger.info('Sandbox discarded', { id: sessionId });
  }

  /**
   * Cleanup sandbox directory
   */
  async cleanup(): Promise<void> {
    if (!this.session) {
      return;
    }

    try {
      await rm(this.session.sandboxRoot, { recursive: true, force: true });
      logger.debug('Sandbox cleaned up', { sandboxRoot: this.session.sandboxRoot });
    } catch (error) {
      logger.warn('Failed to cleanup sandbox', { error });
    }

    this.session = null;
  }

  /**
   * Get diff of a specific file
   */
  async getFileDiff(sandboxPath: string): Promise<{
    original: string | null;
    modified: string | null;
  }> {
    if (!this.session || this.session.state !== 'active') {
      throw new Error('No active sandbox session');
    }

    const originalPath = this.translateToReal(sandboxPath);

    let original: string | null = null;
    let modified: string | null = null;

    try {
      original = await readFile(originalPath, 'utf-8');
    } catch {
      // File doesn't exist in original
    }

    try {
      modified = await readFile(sandboxPath, 'utf-8');
    } catch {
      // File doesn't exist in sandbox
    }

    return { original, modified };
  }

  /**
   * Copy project to sandbox, excluding patterns
   */
  private async copyProjectToSandbox(
    projectRoot: string,
    sandboxRoot: string
  ): Promise<void> {
    const entries = await readdir(projectRoot, { withFileTypes: true });

    for (const entry of entries) {
      // Check exclude patterns
      if (this.shouldExclude(entry.name)) {
        continue;
      }

      const srcPath = join(projectRoot, entry.name);
      const destPath = join(sandboxRoot, entry.name);

      if (entry.isDirectory()) {
        await mkdir(destPath, { recursive: true });
        await this.copyProjectToSandbox(srcPath, destPath);
      } else if (entry.isFile()) {
        await this.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Check if path should be excluded
   */
  private shouldExclude(name: string): boolean {
    return this.options.excludePatterns.some(pattern => {
      // Simple pattern matching (could be enhanced with minimatch)
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(name);
      }
      return name === pattern;
    });
  }

  /**
   * Copy a single file
   */
  private async copyFile(src: string, dest: string): Promise<void> {
    // Ensure destination directory exists
    await mkdir(dirname(dest), { recursive: true });
    await cp(src, dest);
  }
}

// ============================================================================
// DRY RUN SANDBOX
// ============================================================================

/**
 * DryRunSandbox - Virtual sandbox that only tracks changes
 *
 * Does not actually copy files. Instead, tracks all changes
 * in memory and provides a preview of what would happen.
 */
export class DryRunSandbox {
  private virtualChanges: Map<string, {
    content: string;
    changeType: 'created' | 'modified' | 'deleted';
  }> = new Map();

  private projectRoot: string = '';
  private active: boolean = false;

  /**
   * Start dry run mode
   */
  start(projectRoot: string): void {
    this.projectRoot = projectRoot;
    this.active = true;
    this.virtualChanges.clear();

    logger.info('Dry run sandbox started');
  }

  /**
   * Check if dry run is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Simulate a file write
   */
  writeFile(path: string, content: string): void {
    if (!this.active) return;

    const relativePath = relative(this.projectRoot, path);
    this.virtualChanges.set(relativePath, {
      content,
      changeType: this.virtualChanges.has(relativePath) ? 'modified' : 'created',
    });
  }

  /**
   * Simulate a file delete
   */
  deleteFile(path: string): void {
    if (!this.active) return;

    const relativePath = relative(this.projectRoot, path);
    this.virtualChanges.set(relativePath, {
      content: '',
      changeType: 'deleted',
    });
  }

  /**
   * Get virtual file content
   */
  readFile(path: string): string | null {
    const relativePath = relative(this.projectRoot, path);
    const change = this.virtualChanges.get(relativePath);

    if (change?.changeType === 'deleted') {
      return null;
    }

    return change?.content ?? null;
  }

  /**
   * Get all changes
   */
  getChanges(): Array<{
    path: string;
    changeType: 'created' | 'modified' | 'deleted';
    preview: string;
  }> {
    const changes: Array<{
      path: string;
      changeType: 'created' | 'modified' | 'deleted';
      preview: string;
    }> = [];

    this.virtualChanges.forEach((change, path) => {
      changes.push({
        path,
        changeType: change.changeType,
        preview: change.content.substring(0, 100) + (change.content.length > 100 ? '...' : ''),
      });
    });

    return changes;
  }

  /**
   * End dry run
   */
  end(): void {
    this.active = false;
    this.virtualChanges.clear();

    logger.info('Dry run sandbox ended');
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let sandboxManager: SandboxManager | null = null;
let dryRunSandbox: DryRunSandbox | null = null;

/**
 * Get or create the global sandbox manager
 */
export function getSandboxManager(options?: SandboxOptions): SandboxManager {
  if (!sandboxManager) {
    sandboxManager = new SandboxManager(options);
  }
  return sandboxManager;
}

/**
 * Get or create the dry run sandbox
 */
export function getDryRunSandbox(): DryRunSandbox {
  if (!dryRunSandbox) {
    dryRunSandbox = new DryRunSandbox();
  }
  return dryRunSandbox;
}

/**
 * Reset sandbox instances (for testing)
 */
export function resetSandbox(): void {
  sandboxManager = null;
  dryRunSandbox = null;
}

export default SandboxManager;
