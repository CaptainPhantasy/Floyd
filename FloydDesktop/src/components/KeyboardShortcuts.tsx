/**
 * FloydDesktop - Keyboard Shortcuts Help Modal
 */

import { X } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Cmd', 'N'], action: 'New session' },
    { keys: ['Cmd', 'O'], action: 'Open project' },
    { keys: ['Cmd', ','], action: 'Settings' },
    { keys: ['Cmd', 'K'], action: 'Command palette' },
    { keys: ['Cmd', '/'], action: 'Toggle sidebar' },
    { keys: ['Cmd', '.'], action: 'Toggle context panel' },
    { keys: ['Esc'], action: 'Close modal/cancel' },
    { keys: ['Cmd', 'Enter'], action: 'Send message' },
    { keys: ['Shift', 'Enter'], action: 'New line in input' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="text-sm text-slate-300">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs bg-slate-700 rounded border border-slate-600">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-slate-500">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
          Tip: On Windows/Linux, use Ctrl instead of Cmd
        </div>
      </div>
    </div>
  );
}
