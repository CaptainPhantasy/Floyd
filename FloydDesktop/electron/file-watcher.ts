/**
 * FloydDesktop - File Watcher
 * 
 * Watches project directories for file changes and notifies the renderer
 */

import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  stats?: {
    size: number;
    mtime: number;
  };
}

export class FileWatcher extends EventEmitter {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private watchedPaths: Set<string> = new Set();

  /**
   * Watch a directory for changes
   */
  watch(projectPath: string, options?: { ignored?: string[] }): void {
    if (this.watchedPaths.has(projectPath)) {
      return; // Already watching
    }

    const ignored = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.cache/**',
      ...(options?.ignored || []),
    ];

    const watcher = chokidar.watch(projectPath, {
      ignored,
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    });

    watcher
      .on('add', (filePath) => {
        this.emit('change', {
          type: 'add',
          path: filePath,
        } as FileChangeEvent);
      })
      .on('change', (filePath) => {
        this.emit('change', {
          type: 'change',
          path: filePath,
        } as FileChangeEvent);
      })
      .on('unlink', (filePath) => {
        this.emit('change', {
          type: 'unlink',
          path: filePath,
        } as FileChangeEvent);
      })
      .on('addDir', (dirPath) => {
        this.emit('change', {
          type: 'addDir',
          path: dirPath,
        } as FileChangeEvent);
      })
      .on('unlinkDir', (dirPath) => {
        this.emit('change', {
          type: 'unlinkDir',
          path: dirPath,
        } as FileChangeEvent);
      })
      .on('error', (error) => {
        console.error('[FileWatcher] Error watching path:', projectPath, error);
        this.emit('error', error);
      });

    this.watchers.set(projectPath, watcher);
    this.watchedPaths.add(projectPath);
  }

  /**
   * Stop watching a directory
   */
  unwatch(projectPath: string): void {
    const watcher = this.watchers.get(projectPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(projectPath);
      this.watchedPaths.delete(projectPath);
    }
  }

  /**
   * Stop watching all directories
   */
  unwatchAll(): void {
    for (const [_path, watcher] of this.watchers.entries()) {
      watcher.close();
    }
    this.watchers.clear();
    this.watchedPaths.clear();
  }

  /**
   * Check if a path is being watched
   */
  isWatching(projectPath: string): boolean {
    return this.watchedPaths.has(projectPath);
  }

  /**
   * Get all watched paths
   */
  getWatchedPaths(): string[] {
    return Array.from(this.watchedPaths);
  }
}
