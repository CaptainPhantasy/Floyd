/**
 * FloydDesktop - Extension Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { ExtensionFallbackStatus, BrowserTab } from '../types';

export function useExtension() {
  const [status, setStatus] = useState<ExtensionFallbackStatus | null>(null);
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!window.floydAPI?.getExtensionStatus) return;

    setIsLoading(true);
    try {
      const extStatus = await window.floydAPI.getExtensionStatus();
      setStatus(extStatus);

      if (window.floydAPI.listBrowserTabs) {
        const tabsResult = await window.floydAPI.listBrowserTabs();
        if (tabsResult.success && tabsResult.tabs) {
          setTabs(tabsResult.tabs as BrowserTab[]);
        }
      }
    } catch (error) {
      console.error('Failed to load extension status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 2000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  return {
    status,
    tabs,
    isLoading,
    reload: loadStatus,
  };
}
