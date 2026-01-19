# O01: HelpOverlay - Keyboard Shortcuts Modal

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 120 columns wide × 45 rows tall
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

Shows P01 MainLayout dimmed to ~40% in background, with a centered 70-char wide help modal on top.

## Modal Specifications
- Width: 70 characters exactly
- Height: 22 rows
- Border: Rounded corners (`╭╮╰╯`) in purple `#6B50FF`
- Modal background: `#3A3943`

## Modal Layout (70 chars wide)

Each line of the modal is exactly 70 characters:

```
╭────────────────────────────────────────────────────────────────────╮
│                       KEYBOARD SHORTCUTS                           │
├────────────────────────────────────────────────────────────────────┤
│ Use ↑↓ to navigate, Enter to execute, Esc to close                 │
├────────────────────────────────────────────────────────────────────┤
│ Navigation                                                         │
│   ▶ Ctrl+/            Show/hide this help                          │
│     Ctrl+P            Open command palette                         │
│     Ctrl+M            Toggle monitor dashboard                     │
│     Ctrl+T            Toggle agent visualization                   │
│     Esc               Close overlay / Exit                         │
│                                                                    │
│ Input                                                              │
│     Enter             Send message                                 │
│     ?                 Show help (when input empty)                 │
│                                                                    │
│ System                                                             │
│     Ctrl+C            Exit application                             │
│     Ctrl+Y            Toggle YOLO mode                             │
│     Ctrl+Shift+P      Open prompt library                          │
├────────────────────────────────────────────────────────────────────┤
│ Press Esc or Ctrl+/ to close                                       │
╰────────────────────────────────────────────────────────────────────╯
```

## Color Mapping

**Border:**
- All border characters (`╭╮╰╯─│├┤`): Purple `#6B50FF`

**Title:**
- "KEYBOARD SHORTCUTS": White `#DFDBDD`, bold, centered

**Instruction Text:**
- "Use ↑↓ to navigate...": Gray `#706F7B`

**Category Headers:**
- "Navigation", "Input", "System": Purple `#6B50FF`, bold

**Shortcut Rows:**
- Selection indicator `▶`: Purple `#6B50FF` (current selection)
- Unselected rows have 2 spaces instead of `▶ `
- Key names (Ctrl+/, etc):
  - Selected: White `#DFDBDD`, bold
  - Unselected: Gray `#959AA2`
- Descriptions:
  - Selected: White `#DFDBDD`
  - Unselected: Gray `#706F7B`

**Footer:**
- "Press Esc or Ctrl+/ to close": Gray `#706F7B`

## Column Layout Within Modal

Inside the 68-char content area (70 - 2 for borders):
- 2 spaces indent
- Selection indicator: 2 chars (`▶ ` or `  `)
- Key column: 16 chars, left-aligned
- Description column: 48 chars, left-aligned

## Context

When rendered, this modal appears:
- Centered on 120×45 terminal
- Over P01 MainLayout dimmed to ~40%
- Modal starts at column 25, row 12

## Important Notes
- Render ONLY terminal contents - no window frame
- Background should be dimmed P01 layout showing through
- Modal uses rounded border style
- Currently selected row has `▶` indicator
- Use monospace font for alignment
- Border chars: `╭╮╰╯─│├┤`
