/**
 * ShortcutsModal Component - Phase 2, Task 2.4
 * 
 * Modal displaying all available keyboard shortcuts.
 */

import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shortcut {
  key: string;
  description: string;
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

export function ShortcutsModal({ isOpen, onClose, shortcuts }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-crush-elevated border border-crush-overlay rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-crush-overlay">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-crush-secondary" />
            <h2 className="text-lg font-semibold text-crush-text-primary">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-crush-overlay transition-colors text-crush-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-crush-base border border-crush-overlay hover:border-crush-tertiary transition-colors"
            >
              <span className="text-sm text-crush-text-primary">{shortcut.description}</span>
              <kbd 
                className={cn(
                  "px-2 py-1 text-xs font-mono rounded",
                  "bg-crush-elevated border border-crush-overlay",
                  "text-crush-text-secondary"
                )}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-crush-overlay bg-crush-base rounded-b-lg">
          <p className="text-xs text-crush-text-subtle text-center">
            Press <kbd className="px-1 py-0.5 bg-crush-elevated border border-crush-overlay rounded">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
