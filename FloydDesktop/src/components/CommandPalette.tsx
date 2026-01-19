/**
 * FloydDesktop - Command Palette Component
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Search, Settings, Folder, MessageSquare } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  category: string;
  icon: typeof Search;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSession?: () => void;
  onOpenProject?: () => void;
  onOpenSettings?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewSession,
  onOpenProject,
  onOpenSettings,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'new-session',
      label: 'New Session',
      category: 'Session',
      icon: MessageSquare,
      action: () => {
        onNewSession?.();
        onClose();
      },
      keywords: ['new', 'session', 'chat'],
    },
    {
      id: 'open-project',
      label: 'Open Project',
      category: 'Project',
      icon: Folder,
      action: () => {
        onOpenProject?.();
        onClose();
      },
      keywords: ['open', 'project', 'folder'],
    },
    {
      id: 'settings',
      label: 'Open Settings',
      category: 'Settings',
      icon: Settings,
      action: () => {
        onOpenSettings?.();
        onClose();
      },
      keywords: ['settings', 'preferences', 'config'],
    },
  ];

  const filteredCommands = query
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some((kw) => kw.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-1 text-xs bg-slate-700 rounded">Esc</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400">No commands found</div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors',
                      index === selectedIndex && 'bg-slate-700'
                    )}
                  >
                    <Icon className="w-5 h-5 text-slate-400" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-slate-100">{cmd.label}</div>
                      <div className="text-xs text-slate-400">{cmd.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
