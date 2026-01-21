/**
 * KeyboardShortcuts Hook - Updated for Phase 3, Task 3.1
 * Global keyboard shortcuts for the application
 */

import { useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export interface ShortcutActions {
  onNewChat: () => void;
  onFocusInput: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  onSearch: () => void; // Phase 3, Task 3.1
}

export interface Shortcut {
  key: string;
  description: string;
  action: string;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  // New Chat: ⌘⇧N / Ctrl+Shift+N
  useHotkeys('meta+shift+n, ctrl+shift+n', (e) => {
    e.preventDefault();
    actions.onNewChat();
  }, { enableOnFormTags: true });

  // Focus Input: ⌘L / Ctrl+L
  useHotkeys('meta+l, ctrl+l', (e) => {
    e.preventDefault();
    actions.onFocusInput();
  }, { enableOnFormTags: true });

  // Export: ⌘S / Ctrl+S
  useHotkeys('meta+s, ctrl+s', (e) => {
    e.preventDefault();
    actions.onExport();
  }, { enableOnFormTags: true });

  // Settings: ⌘, / Ctrl+,
  useHotkeys('meta+,, ctrl+,', (e) => {
    e.preventDefault();
    actions.onOpenSettings();
  }, { enableOnFormTags: true });

  // Search: ⌘K / Ctrl+K (Phase 3, Task 3.1)
  useHotkeys('meta+k, ctrl+k', (e) => {
    e.preventDefault();
    actions.onSearch();
  }, { enableOnFormTags: true });

  const shortcuts: Shortcut[] = [
    { key: '⌘K / Ctrl+K', description: 'Search conversations', action: 'onSearch' },
    { key: '⌘⇧N / Ctrl+Shift+N', description: 'New chat', action: 'onNewChat' },
    { key: '⌘L / Ctrl+L', description: 'Focus input', action: 'onFocusInput' },
    { key: '⌘S / Ctrl+S', description: 'Export chat', action: 'onExport' },
    { key: '⌘, / Ctrl+,', description: 'Open settings', action: 'onOpenSettings' },
  ];

  return { shortcuts };
}
