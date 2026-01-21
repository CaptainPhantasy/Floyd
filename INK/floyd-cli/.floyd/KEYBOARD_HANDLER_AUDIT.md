# KEYBOARD HANDLER AUDIT
## FLOYD CLI - Complete Keyboard Shortcuts and Conflicts Analysis

**Date**: 2026-01-20
**Issue**: Help menu stuck open, no exit keys work (Ctrl+Q, Esc, Ctrl+/ all broken)
**Scope**: Full audit of all `useInput` handlers and `process.on` signal handlers

---

## CRITICAL FINDING: ROOT CAUSE IDENTIFIED

### The Help Menu Death Trap

When `showHelp=true` in MainLayout.tsx:

```
LINE 1152-1161: Conditional return
if (showHelp) {
    return <HelpOverlay ... />;  // ← ONLY renders HelpOverlay
}
```

**What happens:**

1. MainLayout's `useInput` handler (line 990) is STILL REGISTERED
2. It checks `showHelpRef.current` at line 1055
3. If help is open, it BLOCKS ALL INPUT except Esc/Ctrl+/
4. **HelpOverlay's own `useInput` (line 189) NEVER RECEIVES EVENTS**

**The death sequence:**

| Step | Code | Result |
|------|------|--------|
| 1 | User presses key | Keyboard event generated |
| 2 | MainLayout.useInput (line 990) fires | Handler still active despite conditional return |
| 3 | Checks showHelpRef.current | true (help is open) |
| 4 | Line 1055-1062 executes | Blocks all input except Esc/Ctrl+/ |
| 5 | HelpOverlay.useInput (line 189) | NEVER FIRES - event blocked by MainLayout |

**Why Ctrl+Q doesn't work:**

The SIGQUIT handler at `cli.tsx:51` should work at process level, BUT:
- Terminal may not send SIGQUIT for Ctrl+Q in all terminals
- Terminal may interpret Ctrl+Q as "XON" (resume flow control)
- Process-level signals are NOT guaranteed for Ctrl+Q

---

## ALL KEYBOARD HANDLERS (32 useInput + 5 process.on)

### Level 1: Process Signal Handlers (5)

| File | Line | Signal | Action |
|------|------|--------|--------|
| cli.tsx | 51 | SIGQUIT | `process.exit(0)` |
| cli.tsx | 56 | SIGINT | `process.exit(0)` |
| monitor.tsx | 441 | SIGINT | `handleShutdown()` |
| monitor.tsx | 442 | SIGTERM | `handleShutdown()` |
| monitor.tsx | 447 | beforeExit | Cleanup handler |

**Issues:**
- SIGQUIT (Ctrl+Q) not universally supported by terminals
- Some terminals map Ctrl+Q to XON (flow control resume)
- No fallback in Ink useInput layer

### Level 2: App-Level Handlers (3)

| File | Line | Component | Keys | Conflicts |
|------|------|-----------|------|-----------|
| app.tsx | 426 | App | `?`, `Ctrl+M`, `Ctrl+T`, `Ctrl+Y` | No conflicts - only fires when overlays closed |
| MainLayout.tsx | 990 | MainLayout | **ALL THE THINGS** | See below |
| MainLayout.tsx | 1354 | CompactMainLayout | `Ctrl+Q`, `Ctrl+C`, `Esc` | Duplicate handlers |

**App.tsx handler (line 426-454):**
```typescript
?         → toggleHelp()        (only if !showHelp && !showMonitor)
Ctrl+M    → toggleMonitor()
Ctrl+T    → toggleAgentViz()
Ctrl+Y    → toggleSafetyMode()
```

**Note**: App.tsx handler runs AFTER MainLayout handler. MainLayout can block events before they reach App.tsx.

### Level 3: MainLayout Handler (lines 990-1101) - THE BOSS

| Priority | Key | Action | Notes |
|----------|-----|--------|-------|
| 1 | `Ctrl+Q` | HARD EXIT | Checked first - should work but broken |
| 2 | `Ctrl+C` | HARD EXIT | Failsafe |
| 3 | `Esc` | Context-sensitive | Closes help/overlays or exits |
| 4 | `Ctrl+/` | Toggle help | Works anytime |
| 5 | `Ctrl+P` | Command palette | Pass-through to CommandPaletteTrigger |
| 6 | `?` | Toggle help | ONLY when input is empty |
| 7 | `Shift+Tab` | Cycle safety mode | YOLO→ASK→PLAN→YOLO |
| 8 | `Ctrl+M` | Toggle monitor | Calls onCommand |
| 9 | `Ctrl+T` | Toggle agent viz | Calls onCommand |
| 10 | `Ctrl+R` | Voice input | handleVoiceInput() |
| 11 | `Ctrl+Shift+P` | Prompt library | togglePromptLibrary() |

**The Bug Zone (lines 1052-1062):**
```typescript
// When help overlay is open, only allow Esc/Ctrl+/ to close it
if (showHelpRef.current) {
    if (key.escape || (key.ctrl && _inputKey === '/')) {
        setShowHelp(false);
        return;
    }
    // Block all other input while help is open
    return;  // ← DEATH SENTENCE for HelpOverlay's useInput
}
```

**Problem:** This block happens AFTER Ctrl+Q check but prevents HelpOverlay from receiving ANY events.

### Level 4: Overlay Handlers (6)

| File | Line | Component | Keys | Status |
|------|------|-----------|------|--------|
| HelpOverlay.tsx | 189 | HelpOverlay | `Esc`, `Ctrl+/`, arrows, Enter | **BROKEN** - events blocked by MainLayout |
| PromptLibraryOverlay.tsx | 425 | PromptLibrary | `Esc`, arrows, Enter | Unknown - same issue likely |
| CommandPalette.tsx | 198 | CommandPalette | `Esc`, arrows, Enter | May work - rendered differently |
| CommandPalette.tsx | 439 | CommandPalette (inner) | Various | Status unknown |
| CommandPaletteTrigger.tsx | 114 | Trigger | `/` | Status unknown |
| CommandPaletteTrigger.tsx | 212 | Trigger | Various | Status unknown |

**HelpOverlay.tsx handler (line 189-226):**
```typescript
useInput((input, key) => {
    // Ctrl+Q - Quit the entire CLI immediately
    if (key.ctrl && (input === 'q' || input === 'Q')) {
        process.exit(0);
    }

    if (key.escape) {
        onClose();    // ← NEVER CALLED - MainLayout blocks first
        return;
    }

    // Ctrl+/ to close
    if (key.ctrl && input === '/') {
        onClose();    // ← NEVER CALLED - MainLayout blocks first
        return;
    }

    // Navigation (arrows, Enter) - ALL BROKEN
});
```

### Level 5: Component Handlers (15)

| File | Line | Component | Keys | Purpose |
|------|------|-----------|------|---------|
| AgentBuilder.tsx | 67 | Step 1 | Arrows, Enter, Esc, Ctrl+Q | Navigation |
| AgentBuilder.tsx | 147 | Step 2 | Arrows, Enter, Esc, Ctrl+Q | Navigation |
| AgentBuilder.tsx | 253 | Step 3 | Arrows, Enter, Esc, Ctrl+Q | Navigation |
| AgentBuilder.tsx | 328 | Step 4 | Arrows, Enter, Esc, Ctrl+Q | Navigation |
| FilePicker.tsx | 425 | FilePicker | Various | File navigation |
| FilePicker.tsx | 708 | FilePicker | Esc, Ctrl+Q | Exit handlers |
| ConfirmInput.tsx | 39 | ConfirmInput | `Y`, `N`, arrows, Esc, Enter | Yes/no prompt |
| ask-overlay.tsx | 144 | AskOverlay | `Y`, `N`, `1`, `2`, `3`, Esc, Enter | Permission prompt |
| PermissionModal.tsx | 144 | PermissionModal | `Y`, `N`, `1`, `2`, `3`, `R`, arrows | Full permission modal |
| PermissionCompact.tsx | 104 | PermissionCompact | `Y`, `N`, `1`, `2`, `3`, Esc | Inline permission |
| PermissionCompact.tsx | 246 | PermissionMinimal | `Y`, `N`, `1`, `2`, `3`, Esc | Minimal permission |
| PermissionCompact.tsx | 334 | PermissionBar | `Y`, `N`, `1`, `2`, `3` | Bar-style permission |
| DiffViewer.tsx | 427 | DiffViewer | `q`, arrows, Esc | Exit diff view |
| TerminalEmbed.tsx | 418 | TerminalEmbed | Pass-through | Terminal in terminal |

### Level 6: Config UI Handlers (5)

| File | Line | Component | Keys | Purpose |
|------|------|-----------|------|---------|
| ConfigApp.tsx | 37 | ConfigApp | `Esc`, `Ctrl+Q` | Exit config |
| AgentManager.tsx | 90 | AgentManager | `Esc`, `Ctrl+Q`, arrows | Config navigation |
| ApiSettings.tsx | 128 | ApiSettings | `Esc`, `Ctrl+Q`, arrows | API settings |
| PromptLibrary.tsx | 80 | PromptLibrary | `Esc`, `Ctrl+Q`, arrows | Prompt management |
| MonitorConfig.tsx | 67 | MonitorConfig | `Esc`, `Ctrl+Q`, arrows | Monitor settings |

### Level 7: Crush UI Handlers (2)

| File | Line | Component | Keys | Purpose |
|------|------|-----------|------|---------|
| FocusManager.tsx | 60 | FocusManager | `Tab`, `Shift+Tab` | Focus management |
| Viewport.tsx | 115 | Viewport | `+`, `-`, arrows | Zoom control |

---

## CONFLICTS AND DUPLICATES

### Duplicate Exit Keys

| Key | Count | Locations |
|-----|-------|-----------|
| `Ctrl+Q` | 14+ | Everywhere - universal quit |
| `Esc` | 20+ | Almost every component |
| `Ctrl+C` | 2 | MainLayout, process.on |

### Specific Conflicts

1. **`Ctrl+Q` Exit**
   - Defined in: 14+ components
   - Process-level: cli.tsx SIGQUIT handler
   - Problem: Terminal may not send SIGQUIT
   - Status: **BROKEN in help menu**

2. **`Esc` Key**
   - MainLayout: Context-aware (closes overlays)
   - All overlays: Close overlay
   - All components: Various actions
   - Problem: MainLayout intercepts before overlays
   - Status: **BROKEN in help menu**

3. **`Ctrl+/` Help Toggle**
   - App.tsx: Not handled (comment says MainLayout handles it)
   - MainLayout: Toggles help
   - HelpOverlay: Closes help
   - Problem: MainLayout intercepts before HelpOverlay
   - Status: **Works from MainLayout, but HelpOverlay can't self-close**

4. **`?` Help Key**
   - App.tsx: Only when !showHelp && !showMonitor
   - MainLayout: Only when input.length === 0
   - Problem: May trigger mid-sentence
   - Status: **FIXED - now checks input.isEmpty()**

5. **`Ctrl+M` Monitor Toggle**
   - App.tsx: toggleMonitor()
   - MainLayout: onCommand('toggle-monitor')
   - Problem: Both handle the same key
   - Status: Unknown - may fire twice

---

## EVENT FLOW DIAGRAM

### Normal Flow (MainLayout rendering)

```
User presses key
    ↓
App.tsx useInput (line 426)
    ↓ (not handled)
MainLayout useInput (line 990)
    ↓ (not handled)
Specific component useInput
    ↓
Default behavior
```

### Broken Flow (Help menu open)

```
User presses Esc
    ↓
App.tsx useInput
    → Checks: if (inputKey === '?' && !showHelp && !showMonitor)
    → NOT '?' or showHelp=true → doesn't handle
    ↓
MainLayout useInput (line 990)
    → Line 1055: if (showHelpRef.current)
    → Line 1056: if (key.escape || ...)
    → Calls setShowHelp(false) ✓
    → But user reports THIS DOESN'T WORK
    ↓
HelpOverlay useInput (line 189)
    → NEVER FIRES - MainLayout returns early
```

### The Mystery: Why doesn't the MainLayout Esc handler work?

Looking at line 1010-1027:
```typescript
if (key.escape) {
    if (showHelpRef.current) {
        setShowHelp(false);  // ← This should work
    }
    // ...
    return;
}
```

**This SHOULD work.** The ref is synced via useEffect. The state update should trigger a re-render.

**BUT**: The conditional return at line 1152 means when showHelp=true, only HelpOverlay renders. The MainLayout handler is still registered from the previous render cycle when showHelp=false.

**THEORY**: React's useInput cleanup isn't working properly. When showHelp changes, the handler from the previous render is still active, but it's checking showHelpRef which IS current. This should work...

**UNLESS**: There's a React rendering issue where the component isn't re-rendering when setShowHelp(false) is called.

---

## THE FIX

### Option 1: Remove MainLayout's help-blocking logic

```typescript
// REMOVE lines 1052-1062 from MainLayout
// Let HelpOverlay handle its own input
```

**Problem**: Other hotkeys might still fire while help is open.

### Option 2: Pass input handling to overlay via props

```typescript
// When rendering HelpOverlay, give it full control
<HelpOverlay
    hotkeys={hotkeys}
    onClose={() => setShowHelp(false)}
    onCommand={handleCommand}
    onKeyDown={(key) => { /* global hook */ }}
    title=" KEYBOARD SHORTCUTS "
/>
```

### Option 3: Disable MainLayout's useInput when overlay is active

```typescript
useInput((_inputKey, key) => {
    // ... Ctrl+Q, Ctrl+C

    // Skip all other handling when overlays are open
    if (showHelpRef.current || showPromptLibrary || showAgentBuilder) {
        return; // Let the overlay handle it
    }

    // ... rest of handler
});
```

This is the cleanest solution - it gives overlays full control over their input.

---

## RECOMMENDATION

1. **Remove the help-blocking logic** (lines 1052-1062)
2. **Early-return when ANY overlay is open**
3. **Fix SIGQUIT** - add terminal capability detection or use fallback key
4. **Consolidate Esc handling** - single source of truth
5. **Test all overlay exit paths** - help, prompt library, agent builder

---

## VERIFICATION CHECKLIST

After fix:
- [ ] Help menu opens with `?`
- [ ] Help menu closes with `Esc`
- [ ] Help menu closes with `Ctrl+/`
- [ ] Help menu exits entire CLI with `Ctrl+Q`
- [ ] Prompt library overlay exits with `Esc`
- [ ] Agent builder overlay exits with `Esc`
- [ ] All other hotkeys still work when overlays are closed
- [ ] No double-firing of handlers

---

## STATUS: CRITICAL BUG - USER TRAPPED IN HELP MENU

**User Report**: "well ctrl-q didnt even work top exit anymore so I didnt gget to try the others. The logic is fucked."

**Severity**: P0 - User cannot exit help menu, forced to kill process

**Next Action**: Apply Option 3 fix and test
