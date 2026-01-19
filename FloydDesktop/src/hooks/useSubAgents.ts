/**
 * FloydDesktop - Sub-Agents Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { SubAgent } from '../types';

export function useSubAgents() {
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSubAgents = useCallback(async () => {
    if (!window.floydAPI?.listSubAgents) return;

    setIsLoading(true);
    try {
      const result = await window.floydAPI.listSubAgents();
      if (result.success && result.subAgents) {
        setSubAgents(result.subAgents as SubAgent[]);
      }
    } catch (error) {
      console.error('Failed to load sub-agents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubAgents();
    const interval = setInterval(loadSubAgents, 1000);
    return () => clearInterval(interval);
  }, [loadSubAgents]);

  const spawnSubAgent = useCallback(async (type: SubAgent['type'], task: string) => {
    if (!window.floydAPI?.spawnSubAgent) return null;

    try {
      const result = await window.floydAPI.spawnSubAgent(type, task);
      if (result.success && result.subAgent) {
        await loadSubAgents();
        return result.subAgent;
      }
    } catch (error) {
      console.error('Failed to spawn sub-agent:', error);
    }
    return null;
  }, [loadSubAgents]);

  const cancelSubAgent = useCallback(async (id: string) => {
    if (!window.floydAPI?.cancelSubAgent) return;

    try {
      await window.floydAPI.cancelSubAgent(id);
      await loadSubAgents();
    } catch (error) {
      console.error('Failed to cancel sub-agent:', error);
    }
  }, [loadSubAgents]);

  return {
    subAgents,
    isLoading,
    spawnSubAgent,
    cancelSubAgent,
    reload: loadSubAgents,
  };
}
