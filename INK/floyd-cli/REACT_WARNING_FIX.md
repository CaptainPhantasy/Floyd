# React getSnapshot Warning Fix

## Problem

The Floyd CLI was showing a React warning:

```
Warning: The result of getSnapshot should be cached to avoid an infinite loop
    at App (file:///Volumes/Storage/FLOYD_CLI/INK/floyd-cli/dist/app.js:81:31)
```

## Root Cause

The warning was caused by inline Zustand store selectors being recreated on every render:

```typescript
// BEFORE (inline selectors - recreated every render)
const storeMessages = useFloydStore(state => state.messages);
const streamingContent = useFloydStore(state => state.streamingContent);
const addMessage = useFloydStore(state => state.addMessage);
// ... etc
```

Each time the component re-rendered, new arrow function references were created, causing React to detect potential infinite loops in the `getSnapshot` function used by Zustand.

## Solution

Wrapped all Zustand selectors in `useCallback` to create stable references:

```typescript
// AFTER (stable selectors - cached across renders)
const selectMessages = useCallback((state: any) => state.messages, []);
const selectStreamingContent = useCallback((state: any) => state.streamingContent, []);
const selectAddMessage = useCallback((state: any) => state.addMessage, []);
const selectUpdateMessage = useCallback((state: any) => state.updateMessage, []);
const selectAppendStreamingContent = useCallback((state: any) => state.appendStreamingContent, []);
const selectClearStreamingContent = useCallback((state: any) => state.clearStreamingContent, []);
const selectSetStatus = useCallback((state: any) => state.setStatus, []);
const selectSafetyMode = useCallback((state: any) => state.safetyMode, []);
const selectToggleSafetyMode = useCallback((state: any) => state.toggleSafetyMode, []);
const selectShowHelp = useCallback((state: any) => state.showHelp, []);
const selectShowMonitor = useCallback((state: any) => state.showMonitor, []);

const storeMessages = useFloydStore(selectMessages);
const streamingContent = useFloydStore(selectStreamingContent);
// ... etc
```

## Changes Made

**File**: `/Volumes/Storage/FLOYD_CLI/INK/floyd-cli/src/app.tsx`

**Lines Changed**: 150-188

**Key Changes**:
1. Created stable selector functions using `useCallback` with empty dependency arrays
2. Applied stable selectors to all Zustand store accesses
3. Preserved existing `useCallback` wrappers for overlay state setters

## Verification

1. **Build Status**: ✅ Successful
   - No TypeScript errors
   - No compilation errors
   - Output generated correctly

2. **Compiled Output**: ✅ Verified
   - All selectors wrapped in `useCallback` in dist/app.js
   - Stable references confirmed

3. **Warning Status**: ✅ Resolved
   - Test script confirms no getSnapshot warning
   - Selectors now use stable references

## Testing

Run the test script to verify the fix:
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
node test-warning-fix.js
```

Expected output:
```
✅ TEST PASSED: No getSnapshot warning detected
The selectors are now using stable references via useCallback
```

## Impact

- **Performance**: Improved (fewer re-renders)
- **Stability**: Enhanced (no infinite loop risk)
- **Maintainability**: Clear pattern for future selectors

## Best Practice Going Forward

When using Zustand with React 18+:
```typescript
// ✅ CORRECT: Stable selector
const selectValue = useCallback((state) => state.value, []);
const value = useFloydStore(selectValue);

// ❌ AVOID: Inline selector
const value = useFloydStore(state => state.value);

// ✅ CORRECT: For functions
const action = useFloydStore(state => state.action); // Functions are stable
```

## Date

2026-01-23

## Author

Implementation Agent
