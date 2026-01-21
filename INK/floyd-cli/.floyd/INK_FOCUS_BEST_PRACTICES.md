# INK FOCUS MANAGEMENT BEST PRACTICES
## Solutions for Keyboard Shortcut Conflicts with TextInput

**Date:** 2026-01-21
**Purpose:** Fix P0 bugs where single-letter shortcuts fire while typing in input fields

---

## THE PROBLEM

Ink's `useInput` hook fires for ALL keyboard events regardless of which component has focus. This causes shortcuts like `a`, `e`, `m`, `s` to fire even when typing in TextInput fields.

**Example buggy code:**
```typescript
// ApiSettings.tsx - BUGGY
useInput((input, key) => {
    if (input === 'a') {  // Fires when typing ANY word with 'a'!
        setEditingField('apiKey');
    }
    // No check for whether TextInput has focus!
});
```

---

## SOLUTION 1: useFocus Hook (INK BUILT-IN)

Ink provides a `useFocus` hook that returns an `isFocused` boolean. This is the cleanest solution.

### Pattern

```typescript
import { useFocus, useInput } from 'ink';

function MyConfigComponent() {
    const { isFocused } = useFocus();

    useInput((input, key) => {
        // Only fire shortcuts when this component is NOT focused
        if (isFocused) return;  // Let TextInput handle input

        // Now safe to use single-letter shortcuts
        if (input === 'a') {
            setEditingField('apiKey');
        }
        if (input === 'e') {
            setEditingField('endpoint');
        }
    });

    return (
        <Box>
            <TextInput value={value} onChange={setValue} />
        </Box>
    );
}
```

### How It Works

1. `useFocus()` returns `{ isFocused: boolean }`
2. Components using `useFocus` participate in Ink's focus system
3. Tab/Shift+Tab automatically cycles through focusable components
4. Check `isFocused` before firing shortcuts

---

## SOLUTION 2: focus Prop on TextInput

`ink-text-input` has a `focus` prop that controls whether it receives keyboard input.

### API Reference

```typescript
TextInput Props:
  focus: boolean
    Default: true
    Description: Listen to user's input. Useful in case there are multiple
                 input components at the same time and input must be
                 "routed" to a specific component.
```

### Pattern

```typescript
import { useState } from 'react';
import TextInput from 'ink-text-input';

function MultiInputForm() {
    const [focusedInput, setFocusedInput] = useState('field1');
    const [field1, setField1] = useState('');
    const [field2, setField2] = useState('');

    useInput((input, key) => {
        // Only fire shortcuts when no input is focused
        if (focusedInput !== null) return;

        // Single-letter shortcuts are now safe
        if (input === 's') {
            save();
        }
    });

    return (
        <Box flexDirection="column">
            <TextInput
                value={field1}
                onChange={setField1}
                focus={focusedInput === 'field1'}
                onSubmit={() => setFocusedInput('field2')}
                placeholder="Field 1 (Tab to next)"
            />
            <TextInput
                value={field2}
                onChange={setField2}
                focus={focusedInput === 'field2'}
                onSubmit={() => setFocusedInput(null)}
                placeholder="Field 2 (Enter to finish)"
            />
        </Box>
    );
}
```

---

## SOLUTION 3: useFocusManager for Programmatic Control

For complex navigation, use `useFocusManager` to programmatically control focus.

### API Reference

```typescript
useFocusManager return value:
  focusNext()       - Focus next component in render order
  focusPrevious()   - Focus previous component
  focus(id)         - Focus specific component by ID
  enableFocus()     - Enable focus system
  disableFocus()    - Disable all focus management
```

### Pattern

```typescript
import { useFocus, useFocusManager, useInput } from 'ink';

function MenuItem({ id, label, onSelect }) {
    const { isFocused } = useFocus({ id });

    return (
        <Text color={isFocused ? 'green' : 'white'}>
            {isFocused ? '→ ' : '  '}{label}
        </Text>
    );
}

function Menu() {
    const { focusNext, focusPrevious, focus } = useFocusManager();

    useInput((input, key) => {
        if (key.upArrow) focusPrevious();
        if (key.downArrow) focusNext();
        if (input === '1') focus('home');
        if (input === '2') focus('settings');
    });

    return (
        <Box flexDirection="column">
            <MenuItem id="home" label="Home" />
            <MenuItem id="settings" label="Settings" />
        </Box>
    );
}
```

---

## RECOMMENDED FIX FOR OUR CODEBASE

### Pattern to Apply to All Config UI Components

```typescript
// BEFORE (BUGGY)
// src/config/ApiSettings.tsx
useInput((input, key) => {
    if (input === 'a') {
        setEditingField('apiKey');
        setTempValue(config.apiKey);
    }
    if (input === 'e') {
        setEditingField('endpoint');
        setTempValue(config.endpoint);
    }
    // ... more single-letter shortcuts
});

// AFTER (FIXED)
import { useFocus } from 'ink';

function ApiSettings() {
    const { isFocused } = useFocus();

    useInput((input, key) => {
        // CRITICAL: Don't fire shortcuts when component is focused
        if (isFocused) return;

        // Now single-letter shortcuts only fire when not typing
        if (input === 'a') {
            setEditingField('apiKey');
            setTempValue(config.apiKey);
        }
        if (input === 'e') {
            setEditingField('endpoint');
            setTempValue(config.endpoint);
        }
        // ... rest of shortcuts
    });

    // Component render...
}
```

---

## COMPLETE FIX LIST

### Files Requiring focus tracking:

| File | Shortcuts | Fix |
|------|-----------|-----|
| `ConfigApp.tsx` | `1`, `2`, `3`, `4` | Add `useFocus`, check `isFocused` |
| `AgentManager.tsx` | `a`, `n` | Add `useFocus`, check `isFocused` |
| `ApiSettings.tsx` | `a`, `e`, `m`, `s`, `r` | Add `useFocus`, check `isFocused` |
| `PromptLibrary.tsx` | `a`, `c`, `f` | Add `useFocus`, check `isFocused` |
| `MonitorConfig.tsx` | `a`, `p`, `g`, `b` | Add `useFocus`, check `isFocused` |

### Additional Fixes:

| Bug # | File | Issue | Fix |
|-------|------|-------|-----|
| 6 | `app.tsx` | `Ctrl+M` double-fire | Remove handler (MainLayout handles it) |
| 1-2 | `CommandPalette.tsx` | `Ctrl+P` confusion | Use different key for nav up |
| 10 | `PromptLibraryOverlay.tsx` | Janky typing | Replace with `TextInput` |

---

## TESTING CHECKLIST

After fixes:
- [ ] Type "endpoint" in API settings - `e` should NOT switch to endpoint edit
- [ ] Type "agent" in Agent Manager - `a` should NOT trigger "add new"
- [ ] Type numbers in forms - `1-4` should NOT switch tabs
- [ ] Tab through fields - focus should cycle correctly
- [ ] Single-letter shortcuts should work when NO input is focused

---

## REFERENCES

- **Ink Documentation**: https://github.com/vadimdemedes/ink
- **ink-text-input**: https://github.com/vadimdemedes/ink-text-input
- **useFocus Hook**: Built into Ink 3+
- **useFocusManager Hook**: Built into Ink 3+

---

## STATUS

**Research Complete**: ✅ Ink has built-in focus management
**Next Step**: Apply fixes to all 5 Config UI components
