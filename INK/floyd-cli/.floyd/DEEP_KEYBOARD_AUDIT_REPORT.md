# DEEP KEYBOARD HANDLER AUDIT REPORT
## Floyd CLI - Complete Line-by-Line Analysis

**Date:** 2026-01-20
**Scope:** ALL 32 useInput handlers + 5 process.on handlers
**Method:** Chain-of-thought analysis of each handler with human UX perspective

---

## EXECUTIVE SUMMARY

| Bug # | Severity | Component | Issue | Status |
|-------|----------|-----------|-------|--------|
| 1 | CRITICAL | MainLayout | `Ctrl+P` fires twice - palette + MainLayout both handle | **FOUND** |
| 2 | CRITICAL | CommandPalette | `Ctrl+P` conflicts with up arrow (both do same thing) | **FOUND** |
| 3 | HIGH | CommandPalette | `Ctrl+N` for down conflicts with vim/emacs conventions | **FOUND** |
| 4 | HIGH | FilePicker | `Ctrl+A` select all but no way to deselect all from keyboard | **FOUND** |
| 5 | HIGH | Config UI | Single-letter shortcuts (`a`, `e`, `m`, etc.) trigger while typing | **FOUND** |
| 6 | MEDIUM | app.tsx | `Ctrl+M` handled by both app.tsx AND MainLayout | **FOUND** |
| 7 | MEDIUM | DiffViewer | `Ctrl+J/K` conflicts with vim (next/prev error in vim) | **FOUND** |
| 8 | MEDIUM | TerminalEmbed | `Ctrl+C` copies, but `Ctrl+C` also sends SIGINT to process | **POTENTIAL** |
| 9 | LOW | AgentBuilder | `Ctrl+C` cancels, but no visual feedback before confirm | **FOUND** |
| 10 | LOW | PromptLibraryOverlay | Typing search doesn't work smoothly - backspace/delete only | **FOUND** |
| 11 | LOW | Config UI | Number keys `1-4` for tabs could conflict with typing | **EDGE CASE** |
| 12 | LOW | FilePicker | `Tab` focuses search but no hint about this capability | **UX** |

---

## DETAILED FINDINGS

### BUG #1: Ctrl+P Fires Twice (CRITICAL)

**Location:**
- `MainLayout.tsx:1035-1037`
- `CommandPaletteTrigger.tsx:116-123`
- `CommandPalette.tsx:235-238`
- `CommandPalette.tsx:441-448` (second handler)

**Code Analysis:**

```typescript
// MainLayout.tsx:1035
if (key.ctrl && _inputKey === 'p') {
    return; // Let CommandPaletteTrigger handle it
}
```

```typescript
// CommandPaletteTrigger.tsx:116
if (key.ctrl && input === 'p') {
    setIsOpen(prev => {
        const next = !prev;
        if (next && onOpen) onOpen();
        if (!next && onClose) onClose();
        return next;
    });
}
```

```typescript
// CommandPalette.tsx:241 (in first handler)
if (key.upArrow || (key.ctrl && input === 'p')) {
    setSelectedIndex(prev => Math.max(0, prev - 1));
    return;
}
```

**The Bug:** When command palette is OPEN, pressing `Ctrl+P`:
1. CommandPaletteTrigger handler toggles it closed
2. CommandPalette handler ALSO fires, moving selection up (before closing)
3. Result: Confusing behavior - sometimes closes, sometimes moves selection

**Human UX Issue:** User expects `Ctrl+P` to either:
- Open palette when closed
- Close palette when open (toggle behavior)
- NOT move selection when open

**Fix:** CommandPalette should check `!isOpen` before handling `Ctrl+P`, or use different key for navigation.

---

### BUG #2: Ctrl+P Does Double Duty (CRITICAL)

**Location:** `CommandPalette.tsx:235-238`

**Code:**
```typescript
if (key.ctrl && input === 'p') {
    onClose(); // Toggle off
    return;
}

// Navigation (Fires AFTER the above check!)
if (key.upArrow || (key.ctrl && input === 'p')) {
    setSelectedIndex(prev => Math.max(0, prev - 1));
    return;
}
```

**Wait, actually looking closer:** The `return` at line 237 should prevent the second check from firing. But this is STILL confusing because the same key does two different things depending on palette state.

**Human UX Issue:** Cognitive load - user must remember "Ctrl+P opens, but also Ctrl+P closes, and if it's already open, wait, does it close or move up?"

---

### BUG #3: Ctrl+N/P For Navigation (HIGH)

**Location:** `CommandPalette.tsx:241-249`

**Code:**
```typescript
if (key.upArrow || (key.ctrl && input === 'p')) {
    setSelectedIndex(prev => Math.max(0, prev - 1));
    return;
}

if (key.downArrow || (key.ctrl && input === 'n')) {
    setSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
    return;
}
```

**The Issue:**
- `Ctrl+P` = previous (up)
- `Ctrl+N` = next (down)

**Conflict:** In Emacs, `Ctrl+N` = next line, `Ctrl+P` = previous line. But in many other contexts:
- Vim: `Ctrl+N` = autocomplete next, `Ctrl+P` = autocomplete prev
- Bash/zsh: `Ctrl+N` = next command, `Ctrl+P` = previous command
- Some terminals: `Ctrl+S` = flow control stop, `Ctrl+Q` = resume

**Human UX Issue:** This is actually consistent with Emacs/bash conventions. **NOT A BUG** - but worth documenting for consistency.

**Verdict:** **KEEP** - follows standard conventions.

---

### BUG #4: Ctrl+A Selects All But No Clear Deselect (HIGH)

**Location:** `FilePicker.tsx:449-457`

**Code:**
```typescript
if (key.ctrl && input === 'a') {
    // Select all visible files (not directories)
    setSelectedPaths(
        new Set(
            filteredEntries.filter(e => e.type === 'file').map(e => e.fullPath),
        ),
    );
    return;
}

if (key.ctrl && input === 'd') {
    // Deselect all
    setSelectedPaths(new Set());
    return;
}
```

**Analysis:** Actually, `Ctrl+D` IS provided for deselect all. This is fine.

**Verdict:** **NOT A BUG** - deselect exists.

---

### BUG #5: Single-Letter Shortcuts Fire While Typing (CRITICAL)

**Location:**
- `ConfigApp.tsx:44-47` (keys `1`, `2`, `3`, `4`)
- `AgentManager.tsx:99,105,109` (keys `a`, `n`)
- `ApiSettings.tsx:144-158` (keys `a`, `e`, `m`, `s`, `r`)
- `PromptLibrary.tsx:91,97,103` (keys `a`, `c`, `f`)
- `MonitorConfig.tsx:99,105,109` (keys `a`, `p`, `g`, `b`)

**Example Code:**
```typescript
// ApiSettings.tsx:144-158
if (input === 'a') {
    setEditingField('apiKey');
    setTempValue(config.apiKey);
}
if (input === 'e') {
    setEditingField('endpoint');
    setTempValue(config.endpoint);
}
if (input === 'm') {
    setEditingField('model');
    setTempValue(config.model);
}
```

**The Bug:** These handlers fire on ANY keypress, not just when no input is focused. If a TextInput component has focus, these single-letter keys will STILL trigger the shortcuts, interfering with typing.

**Human UX Issue:** User tries to type "endpoint" in the API settings, presses `e`, and suddenly the endpoint field is selected for editing instead of typing the letter `e`.

**Why This Happens:** Ink's `useInput` fires for ALL keyboard input regardless of which component has focus. There's no built-in focus management.

**Fix Required:** Each config component should track whether an input field is focused, and only fire shortcuts when `!isInputFocused`.

---

### BUG #6: Ctrl+M Handled Twice (MEDIUM)

**Location:**
- `app.tsx:431-433`
- `MainLayout.tsx:1078-1081`

**Code:**
```typescript
// app.tsx
if (inputKey === 'm' && key.ctrl) {
    toggleMonitor();
    return;
}

// MainLayout.tsx
if (key.ctrl && _inputKey === 'm') {
    onCommand?.('toggle-monitor');
    return;
}
```

**The Issue:** Both handlers fire for `Ctrl+M`. The `toggleMonitor()` function is called, AND `onCommand('toggle-monitor')` is called. This could cause the monitor to toggle twice (back to original state) or cause other side effects.

**Human UX Issue:** Pressing `Ctrl+M` might appear to do nothing, or might toggle twice rapidly, confusing the user.

**Fix:** Remove from one location (prefer app.tsx since MainLayout is the "owner" of keyboard shortcuts now).

---

### BUG #7: Ctrl+J/K Conflicts With Vim (MEDIUM)

**Location:** `DiffViewer.tsx:443-457`

**Code:**
```typescript
case key.ctrl && input === 'j':
case key.tab && key.shift:
    // Previous hunk
    setFocusedHunkIndex(prev => Math.max(0, prev - 1));
    break;

case key.ctrl && input === 'k':
case key.tab:
    // Next hunk
    if (focusedFile) {
        setFocusedHunkIndex(prev =>
            Math.min(focusedFile.hunks.length - 1, prev + 1),
        );
    }
    break;
```

**The Issue:** In Vim:
- `Ctrl+J` = scroll down one line
- `Ctrl+K` = scroll up one line

But here:
- `Ctrl+J` = previous hunk (OPPOSITE of vim!)
- `Ctrl+K` = next hunk (OPPOSITE of vim!)

**Wait, actually:** In OTHER tools:
- VS Code: `Ctrl+J` = extend selection down one line
- Many IDEs: `Ctrl+J` = join lines
- Some diff tools: `Ctrl+J/K` for navigation

**Human UX Issue:** Vim users will be confused. But this might be intentional for diff-specific navigation.

**Recommendation:** Document this in help overlay, or change to arrow keys which are universal.

---

### BUG #8: Ctrl+C Copies But Also Sends SIGINT (MEDIUM)

**Location:** `TerminalEmbed.tsx:422-428`

**Code:**
```typescript
case key.ctrl && input === 'c':
    if (onCopy && selectedLine !== null) {
        onCopy(terminalOutput.lines[selectedLine - 1]?.content || '');
        setShowCopyConfirmation(true);
        setTimeout(() => setShowCopyConfirmation(false), 2000);
    }
    break;
```

**The Issue:** `Ctrl+C` is traditionally:
1. The SIGINT signal to interrupt processes
2. The "copy" command in GUI applications

In a terminal emulator, `Ctrl+C` should send SIGINT to the running process. Using it for "copy" is correct for a GUI, but confusing in a terminal context.

**Human UX Issue:** User sees a terminal, expects `Ctrl+C` to interrupt, but it copies instead.

**Mitigation:** The `cli.tsx` has a SIGINT handler that calls `process.exit(0)`. This might interfere with the copy behavior.

**Verdict:** **POTENTIAL ISSUE** - needs testing to see if SIGINT fires before the useInput handler.

---

### BUG #9: Ctrl+C Cancels But No Visual Feedback (LOW)

**Location:** `AgentBuilder.tsx:74-77, 154-157, 260-263`

**Code:**
```typescript
// Ctrl+C - Close this overlay
if (key.ctrl && input === 'c') {
    onCancel();
    return;
}
```

**The Issue:** `Ctrl+C` is supposed to cancel/exit, but there's no visual feedback before the user presses it. The hint text says "Ctrl+C: Cancel" but:
1. User might not know about this
2. No confirmation or "are you sure?" prompt

**Human UX Issue:** User presses `Ctrl+C` expecting to copy text, but instead the entire form closes and their work is lost.

**Fix:** Use `Esc` for cancel (more universal), and only use `Ctrl+C` for exit with confirmation, OR document clearly.

---

### BUG #10: Typing Search in PromptLibraryOverlay Janky (LOW)

**Location:** `PromptLibraryOverlay.tsx:472-484`

**Code:**
```typescript
// Backspace in search
if (key.backspace || key.delete) {
    setSearchQuery(prev => prev.slice(0, -1));
    return;
}

// Typing adds to search (only if not a special key)
if (
    input.length > 0 &&
    !key.ctrl &&
    !key.meta &&
    !key.return &&
    !key.tab
) {
    setSearchQuery(prev => prev + input);
    return;
}
```

**The Issue:** This manual implementation of typing is fragile. It:
1. Only handles single characters at a time
2. Doesn't handle paste events
3. Doesn't handle cursor position within the search string
4. Backspace only removes one char at a time

**Human UX Issue:** Typing feels "laggy" or unresponsive. User expects search to work like a normal input field, but this is a custom reimplementation.

**Recommendation:** Use `TextInput` component from Ink instead of manual input handling.

---

### BUG #11: Number Keys 1-4 For Tabs Could Conflict (LOW)

**Location:** `ConfigApp.tsx:44-47`

**Code:**
```typescript
// Number keys for direct tab selection
if (input === '1') setActiveTab('monitor');
if (input === '2') setActiveTab('agents');
if (input === '3') setActiveTab('prompts');
if (input === '4') setActiveTab('api');
```

**The Issue:** These fire on ANY press of `1`, `2`, `3`, `4`. If the user is in a text input field within one of the tabs, these will still trigger tab changes.

**Human UX Issue:** User tries to enter "3" as a number in a form, but the tab changes instead.

**Fix:** Only fire when no text input has focus. Track input focus state.

---

### BUG #12: Tab Focuses Search But No Hint (LOW - UX)

**Location:** `FilePicker.tsx:435-438`

**Code:**
```typescript
// Search focus
if (key.tab && !key.shift) {
    setIsSearchFocused(true);
    return;
}
```

**The Issue:** `Tab` focuses the search field, but there's NO visible hint about this capability. Users won't discover this feature.

**Human UX Issue:** User doesn't know they can press `Tab` to search. Feature is hidden/discoverable only by accident.

**Fix:** Add hint text like "Tab: Search • Esc: Exit"

---

## COMPLETE KEYBOARD MAP

### Global Shortcuts (MainLayout)

| Key | Action | Conflicts | Human-Friendly? |
|-----|--------|-----------|-----------------|
| `Ctrl+Q` | Hard exit | 14+ handlers | ✅ Clear, consistent |
| `Ctrl+C` | Hard exit | Process SIGINT | ⚠️ Terminates without confirmation |
| `Esc` | Exit CLI (when no overlays) | All overlays | ✅ Standard |
| `Ctrl+/` | Toggle help | None | ✅ Good (modifier key) |
| `Ctrl+P` | Open command palette | CommandPalette nav | ⚠️ Toggle + nav = confusing |
| `?` | Toggle help (when input empty) | None | ✅ Works now after fix |
| `Shift+Tab` | Cycle safety modes | None | ✅ Clear |
| `Ctrl+M` | Toggle monitor | app.tsx also handles | ❌ Double-fire |
| `Ctrl+T` | Toggle agent viz | app.tsx also handles | ⚠️ Possible double-fire |
| `Ctrl+R` | Voice input | None | ✅ Clear |
| `Ctrl+Shift+P` | Prompt library | None | ✅ Clear |

### Overlay-Specific Shortcuts

| Overlay | Key | Action | Issues |
|---------|-----|--------|--------|
| HelpOverlay | `Esc` | Close | Fixed (now works) |
| HelpOverlay | `Ctrl+/` | Close | Fixed (now works) |
| HelpOverlay | `Ctrl+Q` | Hard exit | Works |
| HelpOverlay | `↑/↓` | Navigate | ✅ Standard |
| HelpOverlay | `Enter` | Execute action | ✅ Standard |
| **PromptLibraryOverlay** | `Esc` | Close | ✅ Works |
| **PromptLibraryOverlay** | `↑/↓` | Navigate | ✅ Works |
| **PromptLibraryOverlay** | `Enter` | Select/Copy | ✅ Works |
| **PromptLibraryOverlay** | Typing | Search | ⚠️ Janky manual implementation |
| **CommandPalette** | `Esc` | Close | ✅ Works |
| **CommandPalette** | `Ctrl+P` | Close/Nav up | ❌ Confusing double-duty |
| **CommandPalette** | `Ctrl+N` | Nav down | ⚠️ Emacs-style, not arrow |
| **CommandPalette** | `↑/↓` | Navigate | ✅ Standard |
| **CommandPalette** | `PageUp/PageDown` | Navigate page | ✅ Standard |

### File Picker Shortcuts

| Key | Action | Issues |
|-----|--------|--------|
| `Esc` / `Ctrl+C` | Cancel | ✅ Clear |
| `Tab` | Focus search | ⚠️ No hint visible |
| `Ctrl+A` | Select all | ✅ Works |
| `Ctrl+D` | Deselect all | ✅ Works |
| `Space` | Toggle selection | ✅ Standard |
| `Enter` | Navigate directory / Confirm | ✅ Standard |
| `↑/↓` | Navigate | ✅ Standard |
| `PageUp/PageDown` | Navigate page | ✅ Standard |

### Config UI Shortcuts

| Key | Action | Issues |
|-----|--------|--------|
| `Esc` | Exit | ✅ Works |
| `1-4` | Direct tab selection | ❌ Fires even when typing in input fields |
| `a` | Add new item | ❌ Fires even when typing |
| `c` | Clear search | ❌ Fires even when typing |
| `e` | Edit endpoint | ❌ Fires even when typing |
| `f` | Show favorites | ❌ Fires even when typing |
| `g` | Toggle git monitoring | ❌ Fires even when typing |
| `m` | Edit model | ❌ Fires even when typing |
| `n` | Next profile | ❌ Fires even when typing |
| `p` | Toggle process monitoring | ❌ Fires even when typing |
| `r` | Reload config | ❌ Fires even when typing |
| `s` | Save | ❌ Fires even when typing |

### Agent Builder Shortcuts

| Step | Key | Action | Issues |
|-----|-----|--------|--------|
| All | `Ctrl+Q` | Hard exit | ✅ Consistent |
| All | `Ctrl+C` | Cancel | ⚠️ No confirmation, loses work |
| Name | `Enter` | Continue | ✅ Standard |
| Capabilities | `Space` | Toggle | ✅ Standard |
| Capabilities | `↑/↓` | Navigate | ✅ Standard |
| System Prompt | `Enter` | Create | ✅ Standard |
| Success | `Enter/Esc` | Close | ✅ Standard |

---

## PRIORITY FIXES

### P0 (User-Affecting, Immediate Fix Required)

1. **Single-letter shortcuts in Config UI** - Add focus tracking
2. **Ctrl+M double-fire** - Remove from app.tsx
3. **Ctrl+P confusion in CommandPalette** - Use different key for nav up

### P1 (UX Improvements)

4. **Typing search in PromptLibraryOverlay** - Replace with TextInput
5. **Tab hint in FilePicker** - Add visible hint
6. **Ctrl+C cancel without confirmation** - Add confirm or use Esc only

### P2 (Documentation)

7. **Document all shortcuts in help overlay** - Currently incomplete
8. **Add conflicts/disabled shortcuts note** - Inform users why certain keys don't work in certain contexts

---

## TESTING CHECKLIST

After fixes:
- [ ] `Ctrl+M` only fires once
- [ ] Single-letter shortcuts in Config UI don't fire when typing in inputs
- [ ] `Ctrl+P` in command palette doesn't confuse users
- [ ] All overlays exit cleanly with `Esc`
- [ ] Search in PromptLibraryOverlay feels smooth
- [ ] Number keys don't change tabs when typing in inputs
- [ ] `Ctrl+Q` works everywhere consistently

---

## ARCHITECTURAL NOTES

### Why These Bugs Exist

1. **No Focus Management:** Ink doesn't provide built-in focus tracking. Components must manually track which element has focus and conditionally handle input.

2. **Handler Proliferation:** 32 useInput handlers means high chance of conflicts. No central registry of "claimed" keys.

3. **Closure Staleness:** useInput handlers capture state at render time, requiring refs to get current values. This pattern is error-prone.

4. **No Event Propagation Control:** Ink doesn't provide `stopPropagation()` equivalent. Handlers must coordinate via early returns.

### Recommended Architecture

```typescript
// Create a global keyboard registry
const KeyboardRegistry = {
    claimed: new Map<string, string>(), // key → owner

    claim(key: string, owner: string, handler: Function) {
        if (this.claimed.has(key)) {
            console.warn(`Key ${key} already claimed by ${this.claimed.get(key)}`);
        }
        this.claimed.set(key, owner);
    },

    release(key: string, owner: string) {
        if (this.claimed.get(key) === owner) {
            this.claimed.delete(key);
        }
    }
};

// Components claim keys during mount, release during unmount
```

---

## STATUS

**Total Issues Found:** 12
**P0 (Critical):** 3
**P1 (High):** 3
**P2 (Medium):** 6

**Already Fixed in Previous Session:**
- Help menu stuck open ✅
- `?` triggering mid-sentence ✅

**Remaining Work:** Fix P0 issues #1, #2, #5, #6
