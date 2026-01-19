# Handoff: FloydDesktop Launch Error

**Date:** 2026-01-19
**Status:** BLOCKED - App crashes on launch with Floating UI error
**Priority:** CRITICAL

---

## The Error

Minified Floating UI autoUpdate function error. Called by Radix UI components (Tabs, DropdownMenu). Fails because observe() is called on null/undefined element.

## Critical Context

- **Before today:** App launched, had bugs but OPENED
- **After today:** App crashes immediately, never reaches main UI
- **Tests pass (24/24)** but error is Electron-specific

## CRITICAL MISTAKE MADE

**I kept packaging the app instead of testing in dev server.**

The next agent MUST:
1. Run `cd /Volumes/Storage/FLOYD_CLI/FloydDesktop && npm run dev`
2. Test in browser at localhost:5173 with full error stack traces
3. Only package AFTER confirming dev server works

## Most Likely Culprits

1. **main.tsx** - Added ResizeObserver wrapper and DOM-ready check (REMOVE THESE)
2. **App.tsx** - Changed rendering flow with LoadingState/WelcomeScreen conditionals
3. **SettingsModal rendered too early** - Uses Radix Tabs

## Recommended Fix

Revert main.tsx to simple version:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Then test in DEV SERVER before packaging.

## Files Changed This Session

- electron/project-manager.ts
- packages/floyd-agent-core/src/* (LLMClient, constants, error-humanizer)
- FloydDesktop/electron/main.ts, agent-ipc.ts
- FloydDesktop/src/main.tsx (LIKELY CULPRIT)
- FloydDesktop/src/App.tsx (LIKELY CULPRIT)
- FloydDesktop/src/components/SettingsModal.tsx
- FloydDesktop/src/components/WelcomeScreen.tsx (NEW)
- FloydDesktop/src/components/LoadingState.tsx (NEW)
- FloydDesktop/src/components/ErrorBoundary.tsx (NEW)

## What NOT To Do

- Don't add more defensive code
- Don't package without testing dev server first
- Don't make bulk changes

## Build Commands

```bash
cd /Volumes/Storage/FLOYD_CLI/FloydDesktop
npm run dev            # TEST HERE FIRST
npm run package        # Only after dev works
```
