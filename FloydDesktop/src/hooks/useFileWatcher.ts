/**
 * FloydDesktop - File Watcher Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { FileNode } from '../types';

interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
}

export function useFileWatcher(projectPath?: string) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [changes] = useState<FileChangeEvent[]>([]);

  const loadFileTree = useCallback(async () => {
    if (!projectPath || !window.floydAPI?.listFiles) return;

    try {
      const result = await window.floydAPI.listFiles(projectPath);
      if (result.success && result.files) {
        setFileTree(result.files as FileNode[]);
      }
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
  }, [projectPath]);

  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  // TODO: Listen for file change events from IPC
  // This would require IPC handlers for file watcher events

  return {
    fileTree,
    changes,
    reload: loadFileTree,
  };
}
