/**
 * FloydDesktop - Context Panel Component
 * 
 * Right sidebar with tabs for Files, Tools, Extension, Browork
 */

import { useState } from 'react';
import { cn } from '../lib/utils';
import { FileBrowser } from './FileBrowser';
import { ToolsPanel } from './ToolsPanel';
import { ExtensionPanel } from './ExtensionPanel';
import { BroworkPanel } from './BroworkPanel';
import { Files, Wrench, Chrome, Users, X } from 'lucide-react';

interface ContextPanelProps {
  currentProjectPath?: string;
  onClose: () => void;
}

type TabId = 'files' | 'tools' | 'extension' | 'browork';

export function ContextPanel({ currentProjectPath, onClose }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('files');

  const tabs: Array<{ id: TabId; label: string; icon: typeof Files }> = [
    { id: 'files', label: 'Files', icon: Files },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'extension', label: 'Extension', icon: Chrome },
    { id: 'browork', label: 'Browork', icon: Users },
  ];

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                )}
                aria-label={tab.label}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded"
          aria-label="Close context panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'files' && <FileBrowser projectPath={currentProjectPath} />}
        {activeTab === 'tools' && <ToolsPanel />}
        {activeTab === 'extension' && <ExtensionPanel />}
        {activeTab === 'browork' && <BroworkPanel />}
      </div>
    </div>
  );
}
