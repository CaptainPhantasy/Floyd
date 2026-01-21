# Floyd CLI - TDD Fix Plan for All 25 Issues

**Date:** 2026-01-20
**Approach:** Test-Driven Development (TDD)
**Test Framework:** AVA + ink-testing-library

---

## Issue Summary

| Priority | Count | Issues                     |
|----------|-------|----------------------------|
| Critical | 8     | Hotkey conflicts, height calc errors, input blocking |
| Major    | 11    | State duplication, missing validations, debug code |
| Minor    | 7     | Cosmetic issues, hints, minor UX |

---

## PHASE 0: Test Infrastructure (1 task)

### Task 0.1: Fix Test Configuration

**Problem:** Tests fail due to ts-node/esm loader misconfiguration

**Test:**

```typescript
// src/__tests__/test-config.test.ts
import test from 'ava';

test('tests can run', t => {
    t.true(true);
});
```

**Fix:** Update `package.json` ava configuration

```json
{
  "ava": {
    "extensions": { "ts": "module", "tsx": "module" },
    "nodeArguments": ["--loader=ts-node/esm"]
  }
}
```

**Verification:**

```bash
npm test
# Expected: PASS (no loader errors)
```

---

## PHASE 1: Critical Hotkey Fixes (7 tasks)

### Task 1.1: Create Global Hotkey Manager

**Problem:** 28+ useInput hooks competing with no coordination

**Test-First:**

```typescript
// src/hotkey/__tests__/HotkeyManager.test.ts
import test from 'ava';
import { HotkeyManager } from '../HotkeyManager.js';

test('registers handlers with priority', t => {
    const manager = new HotkeyManager();
    const handler1 = { key: 'escape', priority: 1, action: () => 'first' };
    const handler2 = { key: 'escape', priority: 2, action: () => 'second' };
    manager.register(handler1);
    manager.register(handler2);
    const result = manager.handle('escape', { escape: true });
    t.is(result, 'first'); // Priority 1 wins
});

test('prevents propagation when handled', t => {
    const manager = new HotkeyManager();
    let handled = false;
    manager.register({
        key: 'escape',
        priority: 1,
        action: () => { handled = true; return true; }
    });
    const shouldPropagate = manager.handle('escape', { escape: true });
    t.true(handled);
    t.false(shouldPropagate);
});

test('respects context conditions', t => {
    const manager = new HotkeyManager();
    manager.register({
        key: '?',
        condition: (ctx) => ctx.inputEmpty,
        priority: 1,
        action: () => 'help'
    });
    const result = manager.handle('?', { inputKey: '?' }, { inputEmpty: true });
    t.is(result, 'help');
});
```

**Implementation:**

```typescript
// src/hotkey/HotkeyManager.ts
export interface HotkeyHandler {
    key: string;
    priority: number;
    condition?: (context: Record<string, unknown>) => boolean;
    action: (input: string, key: any, context: any) => boolean | void;
}

export class HotkeyManager {
    private handlers: Map<string, HotkeyHandler[]> = new Map();

    register(handler: HotkeyHandler): void {
        const key = handler.key;
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
        }
        this.handlers.get(key)!.push(handler);
        this.handlers.get(key)!.sort((a, b) => a.priority - b.priority);
    }

    handle(input: string, key: any, context: any = {}): boolean {
        const handlers = this.handlers.get(input) || [];
        for (const handler of handlers) {
            if (handler.condition && !handler.condition(context)) continue;
            const result = handler.action(input, key, context);
            if (result === true || result === undefined) return false; // Handled
        }
        return true; // Not handled, propagate
    }

    unregister(key: string, priority: number): void {
        const handlers = this.handlers.get(key);
        if (handlers) {
            this.handlers.set(key, handlers.filter(h => h.priority !== priority));
        }
    }
}
```

**Verification:**

```bash
npm test -- HotkeyManager.test.ts
# Expected: 3/3 tests pass
```

**Files:**
- New: `INK/floyd-cli/src/hotkey/HotkeyManager.ts`
- New: `INK/floyd-cli/src/hotkey/__tests__/HotkeyManager.test.ts`

---

### Task 1.2: Fix Esc Key Conflicts

**Problem:** app.tsx exits even when MainLayout has overlays open

**Test-First:**

```typescript
// src/hotkey/__tests__/esc-key.test.ts
import test from 'ava';
import { render } from 'ink-testing-library';
import MainLayout from '../layouts/MainLayout.js';

test('Esc closes help overlay', t => {
    const { rerender, lastFrame } = render(
        <MainLayout showHelp={true} />
    );
    // Simulate Esc key
    // Check help is closed
});

test('Esc closes prompt library', t => {
    // Test promptLibrary overlay closes
});

test('Esc closes agent builder', t => {
    // Test agentBuilder overlay closes
});

test('Esc exits when no overlays', t => {
    // Test exit is called
});
```

**Implementation:**

1. Remove Esc handler from app.tsx (lines 415-425)
2. Ensure MainLayout.tsx Esc handler (lines 891-905) checks ALL overlays
3. Move overlay state to Zustand for single source of truth

**Verification:**

```bash
npm run build
node dist/cli.js
# Press Esc with help open -> help closes
# Press Esc with no overlays -> exits cleanly
```

**Files:** `INK/floyd-cli/src/app.tsx:415-425`, `INK/floyd-cli/src/ui/layouts/MainLayout.tsx:891-905`

---

### Task 1.3: Fix Ctrl+/ Duplicate Handlers

**Problem:** Both app.tsx and MainLayout.tsx handle Ctrl+/

**Test-First:**

```typescript
test('Ctrl+/ toggles help consistently', t => {
    const { toggleHelp } = setupTest();
    simulateCtrlSlash();
    t.is(toggleHelp.callCount, 1); // Should only fire once
});
```

**Implementation:**

1. Move `showHelp` state to Zustand store
2. Keep only ONE Ctrl+/ handler (in MainLayout.tsx)
3. Remove duplicate from app.tsx

**Verification:**

```bash
npm test -- ctrl-slash.test.ts
npm run build && node dist/cli.js
# Press Ctrl+/ multiple times -> help toggles consistently
```

**Files:** `INK/floyd-cli/src/app.tsx:429-433`, `INK/floyd-cli/src/store/floyd-store.ts`

---

### Task 1.4: Fix ? Key 1000ms Blocking

**Problem:** ? hotkey blocked for 1 second after typing ANY character

**Test-First:**

```typescript
test('? works immediately after typing', t => {
    const { type, pressQuestion, toggleHelp } = setupTest();
    type('a');
    pressQuestion();
    t.true(toggleHelp.called); // Should work immediately
});

test('? works when input is empty', t => {
    const { pressQuestion, toggleHelp } = setupTest({ input: '' });
    pressQuestion();
    t.true(toggleHelp.called);
});

test('? does NOT trigger during active typing', t => {
    const { type, pressQuestion, toggleHelp } = setupTest();
    type('hello world');
    pressQuestion();
    t.false(toggleHelp.called); // Should not trigger mid-sentence
});
```

**Implementation:**

```typescript
// OLD (MainLayout.tsx:750-755):
if (input.length > 0) {
    typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
    }, 1000); // ← Too long!
}

// NEW:
if (input.length > 0) {
    typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
    }, 200); // ← Reduced to 200ms
}
```

**Alternative:** Remove timeout entirely and use TextInput focus state.

**Verification:**

```bash
npm test -- question-key.test.ts
npm run build && node dist/cli.js
# Type 'a', immediately press '?' -> help opens
```

**Files:** `INK/floyd-cli/src/ui/layouts/MainLayout.tsx:732-765`, `:927-933`

---

### Task 1.5: Fix Ctrl+M Missing Return

**Problem:** app.tsx Ctrl+M handler doesn't return, causing double-execution

**Test-First:**

```typescript
test('Ctrl+M executes exactly once', t => {
    const { simulateCtrlM, toggleMonitor } = setupTest();
    simulateCtrlM();
    t.is(toggleMonitor.callCount, 1);
});
```

**Implementation:**

```typescript
// app.tsx:444-447 - ADD RETURN
if (inputKey === 'm' && key.ctrl) {
    console.error(`[${frameId}] CTRL+M HANDLER: toggling monitor`);
    setShowMonitor(value => !value);
    return; // ← ADD THIS LINE
}
```

**Verification:**

```bash
npm test -- ctrl-m.test.ts
npm run build && node dist/cli.js
# Press Ctrl+M -> monitor toggles once (verified via logs)
```

**Files:** `INK/floyd-cli/src/app.tsx:444-447`

---

### Task 1.6: Fix Ctrl+T Missing Return

**Problem:** app.tsx Ctrl+T handler doesn't return

**Test-First:**

```typescript
test('Ctrl+T executes exactly once', t => {
    const { simulateCtrlT, toggleAgentViz } = setupTest();
    simulateCtrlT();
    t.is(toggleAgentViz.callCount, 1);
});
```

**Implementation:**

```typescript
// app.tsx:450-453 - ADD RETURN
if (inputKey === 't' && key.ctrl) {
    console.error(`[${frameId}] CTRL+T HANDLER: toggling agent viz`);
    setShowAgentViz(value => !value);
    return; // ← ADD THIS LINE
}
```

**Verification:**

```bash
npm test -- ctrl-t.test.ts
npm run build && node dist/cli.js
# Press Ctrl+T -> agent viz toggles once
```

**Files:** `INK/floyd-cli/src/app.tsx:450-453`

---

### Task 1.7: Consolidate All Hotkey Handlers

**Problem:** 28+ useInput hooks scattered across components

**Test-First:**

```typescript
test('only global useInput hook is registered', t => {
    const hooks = captureUseInputHooks();
    t.is(hooks.length, 1); // Only HotkeyManager
});
```

**Implementation:**

1. Create `useGlobalHotkeys()` hook wrapping HotkeyManager
2. Remove useInput from child components
3. Components register via `useHotkey(key, handler, priority)`

**Verification:**

```bash
npm run build && grep -r "useInput" dist/*.js | grep -v "HotkeyManager" | wc -l
# Expected: 0 (no useInput except in manager)
```

**Files:** Multiple components with useInput

---

## PHASE 2: Critical Height Fixes (3 tasks)

### Task 2.1: Create Layout Constants

**Problem:** Magic numbers scattered for height calculations

**Test-First:**

```typescript
// src/theme/__tests__/layout.test.ts
import test from 'ava';
import { LAYOUT } from '../layout.js';

test('layout constants are defined', t => {
    t.is(LAYOUT.BREAKPOINTS.VERY_NARROW, 80);
    t.is(LAYOUT.BREAKPOINTS.NARROW, 100);
    t.is(LAYOUT.BREAKPOINTS.WIDE, 120);
    t.is(LAYOUT.BREAKPOINTS.ULTRA_WIDE, 160);
});

test('overhead values match actual heights', t => {
    t.is(LAYOUT.OVERHEAD.BANNER, 9);      // 8 + margin(1)
    t.is(LAYOUT.OVERHEAD.STATUSBAR, 3);   // borders + content
    t.is(LAYOUT.OVERHEAD.INPUT, 4);       // borders + content + hint
    t.is(LAYOUT.OVERHEAD.FRAME, 5);       // borders + padding + title
});

test('getTotalOverhead calculates correctly', t => {
    t.is(LAYOUT.getTotalOverhead(true), 21);   // with banner
    t.is(LAYOUT.getTotalOverhead(false), 12);  // no banner
});
```

**Implementation:**

```typescript
// src/theme/layout.ts
export const LAYOUT = {
    BREAKPOINTS: {
        VERY_NARROW: 80,
        NARROW: 100,
        WIDE: 120,
        ULTRA_WIDE: 160,
    },
    OVERHEAD: {
        BANNER: 9,      // 8 ASCII lines + marginBottom(1)
        STATUSBAR: 3,   // top border + content + bottom border
        INPUT: 4,       // top border + content + bottom border + hint
        FRAME: 5,       // top border + padding + title + padding + bottom border
    },
    getTotalOverhead(hasBanner: boolean): number {
        return this.OVERHEAD.STATUSBAR + this.OVERHEAD.INPUT + this.OVERHEAD.FRAME +
               (hasBanner ? this.OVERHEAD.BANNER : 0);
    }
};
```

**Verification:**

```bash
npm test -- layout.test.ts
# Expected: All layout constant tests pass
```

**Files:** New: `INK/floyd-cli/src/theme/layout.ts`

---

### Task 2.2: Fix Height Calculations

**Problem:** Height calculations off by 5-6 lines (Frame overhead not included)

**Test-First:**

```typescript
// src/ui/layouts/__tests__/height-calculation.test.ts
import test from 'ava';
import { calculateAvailableHeight } from '../../utils/layout.js';

test('wide screen: 24 rows -> 3 lines available', t => {
    const height = calculateAvailableHeight(24, true, false);
    t.is(height, 3); // 24 - 21 (banner+status+input+frame)
});

test('narrow screen: 24 rows -> 12 lines available', t => {
    const height = calculateAvailableHeight(24, false, true);
    t.is(height, 12); // 24 - 12 (no banner)
});

test('minimum height is always 1', t => {
    const height = calculateAvailableHeight(10, true, false);
    t.is(height, 1);
});
```

**Implementation:**

```typescript
// src/utils/layout.ts
import { LAYOUT } from '../theme/layout.js';

export function calculateAvailableHeight(
    terminalHeight: number,
    hasBanner: boolean,
    isNarrow: boolean
): number {
    const overhead = isNarrow
        ? LAYOUT.OVERHEAD.STATUSBAR + LAYOUT.OVERHEAD.INPUT + LAYOUT.OVERHEAD.FRAME
        : LAYOUT.getTotalOverhead(true);
    return Math.max(1, terminalHeight - overhead);
}
```

**Update MainLayout.tsx:**

```typescript
// OLD (lines 678-698):
const getOverheadHeight = () => {
    if (isVeryNarrowScreen) return 5;
    if (isNarrowScreen) return 5;
    return 15;
};
const overheadHeight = getOverheadHeight();
const transcriptHeight = Math.max(1, availableHeight - 1);

// NEW:
import { calculateAvailableHeight } from '../../utils/layout.js';
const transcriptHeight = calculateAvailableHeight(
    terminalHeight,
    !isNarrowScreen,
    isNarrowScreen
);
```

**Verification:**

```bash
npm test -- height-calculation.test.ts
npm run build && node dist/cli.js
# On 24-row terminal: count visible transcript lines = expected
```

**Files:** `INK/floyd-cli/src/ui/layouts/MainLayout.tsx:678-700`, New: `INK/floyd-cli/src/utils/layout.ts`

---

### Task 2.3: Add Terminal Size Validation

**Problem:** CLI starts even on too-small terminals

**Test-First:**

```typescript
// src/__tests__/terminal-size.test.ts
import test from 'ava';
import { execSync } from 'child_process';

test('exits with error on small terminal', t => {
    try {
        execSync('stty rows 15 cols 80 && node dist/cli.js', {
            stdio: 'pipe',
            timeout: 1000
        });
    } catch (error) {
        t.regex(error.stderr || error.stdout, /Terminal too small/);
        t.is(error.status, 1);
    }
});

test('starts normally on adequate terminal', t => {
    const result = execSync('node dist/cli.js --help', {
        stdio: 'pipe',
        env: { ...process.env, ROWS: '24', COLUMNS: '80' }
    });
    t.notRegex(result.toString(), /Terminal too small/);
});
```

**Implementation:**

```typescript
// src/cli.tsx - Add near top
const MIN_ROWS = 20;
const MIN_COLS = 80;

const terminalHeight = process.stdout.rows || 24;
const terminalWidth = process.stdout.columns || 80;

if (terminalHeight < MIN_ROWS || terminalWidth < MIN_COLS) {
    console.error(`\n⚠️  Terminal too small: ${terminalWidth}x${terminalHeight}`);
    console.error(`   Minimum required: ${MIN_COLS}x${MIN_ROWS}\n`);
    process.exit(1);
}
```

**Verification:**

```bash
# Small terminal
stty rows 15 cols 80 2>/dev/null; node dist/cli.js
# Expected: Error message + exit

# Normal terminal
node dist/cli.js --help
# Expected: Normal help output
```

**Files:** `INK/floyd-cli/src/cli.tsx`

---

## PHASE 3: Major Fixes (11 tasks)

### Task 3.1: Consolidate Overlay State

**Problem:** showHelp duplicated in app.tsx and MainLayout.tsx

**Test:**

```typescript
test('overlay state is single source of truth', t => {
    const store = useFloydStore.getState();
    store.setOverlay('help', true);
    t.is(store.overlays.help, true);
    // Same state accessible everywhere
});
```

**Implementation:** Add `overlays` object to Zustand store

**Files:** `INK/floyd-cli/src/store/floyd-store.ts`

---

### Task 3.2: Remove DEBUG Statements

**Problem:** console.error in production code

**Test:**

```bash
npm run build 2>&1 | grep -q "DEBUG" && echo "FAIL" || echo "PASS"
```

**Implementation:** Remove lines 664-665 from MainLayout.tsx

**Files:** `INK/floyd-cli/src/ui/layouts/MainLayout.tsx:664-665`

---

### Task 3.3: Add Input Validation

**Problem:** No validation on message submission

**Test:**

```typescript
test('empty message rejected', t => {
    submit('');
    t.false(wasSubmitted);
});

test('message truncated at 10000 chars', t => {
    const long = 'a'.repeat(10001);
    submit(long);
    t.is(lastMessage.length, 10000);
});
```

**Implementation:** Add validation in handleSubmit

**Files:** `INK/floyd-cli/src/ui/layouts/MainLayout.tsx:773`

---

### Task 3.4: Add Rate Limiting

**Problem:** Can spam messages rapidly

**Test:**

```typescript
test('rapid submissions rate limited', t => {
    submit('msg1');
    submit('msg2');
    submit('msg3');
    t.is(submitCount, 1);
});
```

**Implementation:** Add 1 second rate limit

**Files:** `INK/floyd-cli/src/app.tsx:211`

---

### Task 3.5: Handle Terminal Resize

**Problem:** No reactivity to terminal size changes

**Test:**

```typescript
test('layout recalculates on resize', t => {
    const { resize, getHeight } = setupLayout();
    resize({ rows: 40 });
    t.is(getHeight(), calculateAvailableHeight(40, true, false));
});
```

**Implementation:** Add SIGWINCH handler

**Files:** `INK/floyd-cli/src/ui/layouts/MainLayout.tsx`

---

### Tasks 3.6-3.11: Remaining Major Fixes

- Fix Viewport scroll conflicts
- Consolidate safety mode state
- Add Ctrl+N for new task
- Make Shift+Tab global

---

## PHASE 4: Full Smoke Test Suite

### End-to-End Smoke Tests

```typescript
// src/__tests__/smoke/full-workflow.test.ts
import test from 'ava';
import { spawn } from 'child_process';

test('smoke: basic hotkey workflow', async t => {
    const cli = spawn('node', ['dist/cli.js']);

    // Wait for startup
    await delay(1000);

    // Test Ctrl+/ for help
    cli.stdin.write('\x1B/'); // This needs proper encoding

    // Test Esc to exit
    cli.stdin.write('\x1B');

    const code = await cli.exit;
    t.is(code, 0);
});

test('smoke: terminal sizing', async t => {
    // Test various terminal sizes
    const sizes = [
        { rows: 24, cols: 80 },
        { rows: 40, cols: 120 },
        { rows: 50, cols: 160 }
    ];

    for (const size of sizes) {
        const cli = spawn('node', ['dist/cli.js'], {
            env: { ROWS: size.rows, COLUMNS: size.cols }
        });
        // Verify no overflow
        await delay(500);
        cli.kill();
    }
    t.pass();
});
```

**Verification:**

```bash
npm run test:smoke
# Expected: All smoke tests pass
```

---

## Execution Order

| Phase | Tasks        | Prerequisite     |
|-------|--------------|------------------|
| 0     | Fix test config | -              |
| 1.1   | Create HotkeyManager | Phase 0       |
| 1.2-1.7 | Fix hotkey conflicts | Task 1.1    |
| 2.1   | Create layout constants | Phase 0     |
| 2.2   | Fix height calculations | Task 2.1    |
| 2.3   | Terminal size validation | Task 2.1    |
| 3     | Major fixes  | Phase 1 + Phase 2 |
| 4     | Smoke tests  | All fixes        |

---

## Verification Receipts Template

Each task must include:

```bash
# 1. Run tests
npm test -- [test-file].test.ts
# Receipt: [paste test output]

# 2. Build
npm run build
# Receipt: [paste build output]

# 3. Manual smoke test
node dist/cli.js
# [Perform specific actions]
# Receipt: [describe observed behavior]
```

---

## Summary

- **Total Issues:** 25
- **Test Files to Create:** ~30
- **Files to Modify:** ~15
- **Estimated Implementation Time:** Full day with TDD

**Success Criteria:**
- ✅ All 25 issues fixed
- ✅ All tests pass
- ✅ Smoke tests verify functionality
- ✅ No regressions
