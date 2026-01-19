/**
 * FloydDesktop - Sessions Hook
 *
 * Hook for managing chat sessions.
 */

import { useState, useCallback, useEffect } from 'react';
import type { SessionData } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionData[]>([]);

  const loadSessionsList = useCallback(async () => {
    if (!window.floydAPI) {
      setSessions([]);
      return;
    }
    const sessionList = await window.floydAPI.listSessions();
    setSessions(sessionList);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessionsList();
  }, [loadSessionsList]);

  const createSession = useCallback(async (cwd?: string): Promise<SessionData> => {
    if (!window.floydAPI) {
      throw new Error('Floyd API is unavailable. Is the preload script running?');
    }
    // cwd is optional - IPC handler will use default if not provided
    const newSession = await window.floydAPI.createSession(cwd);
    setSessions((prev) => [newSession, ...prev]);
    return newSession;
  }, []);

  const loadSession = useCallback(async (id: string): Promise<SessionData | null> => {
    if (!window.floydAPI) {
      return null;
    }
    const session = await window.floydAPI.loadSession(id);
    return session;
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    if (!window.floydAPI) {
      return;
    }
    await window.floydAPI.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    sessions,
    createSession,
    loadSession,
    deleteSession,
    loadSessionsList,
  };
}
