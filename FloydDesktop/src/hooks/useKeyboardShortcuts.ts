/**
 * FloydDesktop - Keyboard Shortcuts Hook
 */

import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const isCtrlOrCmd = shortcut.ctrlOrCmd
          ? (navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey)
          : !e.metaKey && !e.ctrlKey;
        const isShift = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const isAlt = shortcut.alt ? e.altKey : !e.altKey;
        const isKey = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (isCtrlOrCmd && isShift && isAlt && isKey) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
