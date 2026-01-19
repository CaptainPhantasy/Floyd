# O02: CommandPaletteOverlay - Fuzzy Command Search Modal

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 120 columns wide × 45 rows tall
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

Shows P01 MainLayout dimmed to ~40% in background, with a command palette modal in the upper-center area.

## Modal Specifications
- Width: 60 characters exactly
- Height: 16 rows
- Position: Upper-center (not dead center - shifted up)
- Border: Rounded corners (`╭╮╰╯`) in purple `#6B50FF`
- Modal background: `#3A3943`

## Modal Layout (60 chars wide)

Each line of the modal is exactly 60 characters:

```
╭──────────────────────────────────────────────────────────╮
│ > ref_                                                   │
├──────────────────────────────────────────────────────────┤
│ ▶ 📝 New Task                                       ^N  │
│   📄 Open File                                      ^O  │
│   🔍 Search Files                                   ^F  │
│   ⚡ Run Command                                    ^R  │
│   📜 View History                                       │
│   ⚙️  Settings                                      ^,  │
│   ❓ Help                                           F1  │
│   👋 Exit                                           ^Q  │
├──────────────────────────────────────────────────────────┤
│ Create a new task/conversation                           │
├──────────────────────────────────────────────────────────┤
│ ↑↓ Nav • Enter Select • Esc Close                  1/8  │
╰──────────────────────────────────────────────────────────╯
```

## Color Mapping

**Border:**
- All border characters: Purple `#6B50FF`

**Search Input Row:**
- Prompt `>`: Pink `#FF60FF`
- Input text "ref_": White `#DFDBDD`
- Cursor after text: Blinking block or underscore
- When empty, placeholder: "Type a command..." in gray `#706F7B`

**Command List:**
- Selection indicator `▶`: Pink `#FF60FF`
- Selected row background: Slightly lighter `#4D4C57`
- Icons: Render as emoji or Unicode
- Labels:
  - Selected: White `#DFDBDD`, bold
  - Unselected: Gray `#959AA2`
- Matched search chars: Pink `#FF60FF` (e.g., "R", "e", "f" highlighted)
- Shortcuts (^N, ^O, etc.): Gray `#706F7B`, right-aligned

**Description Area:**
- Shows description for selected command
- Text: Gray `#959AA2`

**Footer:**
- Navigation hints: Gray `#706F7B`
- Counter "1/8": Gray `#706F7B`, right-aligned

## Column Layout Within Modal

Inside the 58-char content area:
- Selection indicator: 2 chars
- Icon: 3 chars (emoji + space)
- Label: 45 chars (flex)
- Shortcut: 4 chars, right-aligned
- Gap: 4 chars

## Search Highlight Example

When user types "ref", letters matching in "Refactor" would show:
- "R" in pink, "e" in pink, "factor" in normal color

## Context

When rendered, this modal appears:
- Centered horizontally on 120-col terminal
- Positioned in upper third (not vertically centered)
- Over P01 MainLayout dimmed to ~40%
- Modal starts at column 30, row 8

## Important Notes
- Render ONLY terminal contents - no window frame
- Background should be dimmed P01 layout
- Modal positioned upper-center, not dead-center
- Use monospace font
- Border chars: `╭╮╰╯─│├┤`
