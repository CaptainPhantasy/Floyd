/**
 * FloydDesktop - Extension Panel Component
 * 
 * Chrome extension status and controls
 */

import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import type { ExtensionFallbackStatus, BrowserTab } from '../types';
import { Chrome, CheckCircle, XCircle, RefreshCw, Camera, FileText, Navigation } from 'lucide-react';

interface ExtensionPanelProps {
  // Props kept for future IPC integration
}

export function ExtensionPanel({}: ExtensionPanelProps) {
  const [status, setStatus] = useState<ExtensionFallbackStatus | null>(null);
  const [activeTab, setActiveTab] = useState<BrowserTab | null>(null);
  const [tabs, setTabs] = useState<BrowserTab[]>([]);

  useEffect(() => {
    loadExtensionStatus();
    const interval = setInterval(loadExtensionStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadExtensionStatus = async () => {
    if (!window.floydAPI?.getExtensionStatus) return;

    try {
      const extStatus = await window.floydAPI.getExtensionStatus();
      setStatus(extStatus);

      if (window.floydAPI.listBrowserTabs) {
        const tabsResult = await window.floydAPI.listBrowserTabs();
        if (tabsResult.success && tabsResult.tabs) {
          const browserTabs = tabsResult.tabs as BrowserTab[];
          const active = browserTabs.find((t) => t.active) || null;
          setTabs(browserTabs);
          setActiveTab(active);
        }
      }
    } catch (error) {
      console.error('Failed to load extension status:', error);
    }
  };

  const handleNavigate = async () => {
    const url = prompt('Enter URL to navigate:');
    if (url && window.floydAPI) {
      // TODO: Implement IPC handler for extension navigation
      console.log('Navigate to:', url);
      await loadExtensionStatus();
    }
  };

  const handleScreenshot = async () => {
    // TODO: Implement IPC handler for extension screenshot
    console.log('Take screenshot');
  };

  const handleReadPage = async () => {
    // TODO: Implement IPC handler for extension read page
    console.log('Read page');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Chrome className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold">Chrome Extension</h3>
          </div>
          <button
            onClick={loadExtensionStatus}
            className="p-1 hover:bg-slate-700 rounded"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="p-3 border-b border-slate-700 space-y-2">
        {status ? (
          <>
            <div className="flex items-center gap-2">
              {status.connected ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                {status.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {status.toolCount !== undefined && (
              <div className="text-xs text-slate-400">
                {status.toolCount} tools available
              </div>
            )}
            {status.error && (
              <div className="text-xs text-red-400 mt-1">{status.error}</div>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-400">Extension not detected</div>
        )}
      </div>

      {/* Active Tab */}
      {activeTab && (
        <div className="p-3 border-b border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Active Tab</div>
          <div className="flex items-center gap-2">
            {activeTab.favIconUrl && (
              <img
                src={activeTab.favIconUrl}
                alt=""
                className="w-4 h-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{activeTab.title}</div>
              <div className="text-xs text-slate-400 truncate">{activeTab.url}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-3 space-y-2">
        <div className="text-xs text-slate-400 mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleNavigate}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
            disabled={!status?.connected}
          >
            <Navigation className="w-3 h-3" />
            Navigate
          </button>
          <button
            onClick={handleScreenshot}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
            disabled={!status?.connected}
          >
            <Camera className="w-3 h-3" />
            Screenshot
          </button>
          <button
            onClick={handleReadPage}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors col-span-2"
            disabled={!status?.connected}
          >
            <FileText className="w-3 h-3" />
            Read Page
          </button>
        </div>
      </div>

      {/* Tabs List */}
      {tabs.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3 border-t border-slate-700">
          <div className="text-xs text-slate-400 mb-2">All Tabs</div>
          <div className="space-y-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  'px-2 py-1.5 rounded text-xs',
                  tab.active
                    ? 'bg-sky-600/20 text-sky-300'
                    : 'hover:bg-slate-700/50 text-slate-300'
                )}
              >
                <div className="font-medium truncate">{tab.title}</div>
                <div className="text-slate-400 truncate text-xs mt-0.5">
                  {tab.url}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
