# O06: FilePickerOverlay - File/Folder Selection Modal

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 120 columns wide × 45 rows tall
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

Shows P01 MainLayout dimmed to ~40% in background, with a file picker modal.

## Modal Specifications
- Width: 70 characters exactly
- Height: 26 rows
- Position: Centered
- Border: Rounded corners (`╭╮╰╯`) in purple `#6B50FF`
- Modal background: `#3A3943`

## Modal Layout (70 chars wide)

```
╭────────────────────────────────────────────────────────────────────╮
│                           FILE PICKER                              │
├────────────────────────────────────────────────────────────────────┤
│ Path: ~/project/src/components/                           [↑ Up]  │
├────────────────────────────────────────────────────────────────────┤
│ Filter: button_                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   📁 __tests__/                                                    │
│   📁 hooks/                                                        │
│   📁 utils/                                                        │
│ ▶ 📄 Button.tsx                                            2.4 KB │
│   📄 Button.test.tsx                                       1.8 KB │
│   📄 Card.tsx                                              1.2 KB │
│   📄 Dialog.tsx                                            3.1 KB │
│   📄 index.ts                                              0.5 KB │
│   📄 Input.tsx                                             2.0 KB │
│   📄 Modal.tsx                                             2.8 KB │
│   📄 Select.tsx                                            3.4 KB │
│   📄 Table.tsx                                             4.2 KB │
│   📄 Tooltip.tsx                                           1.1 KB │
│                                                                    │
│                                                       14 items    │
├────────────────────────────────────────────────────────────────────┤
│ [↑↓] Navigate • [Enter] Select • [Tab] Open Dir • [Esc] Cancel    │
╰────────────────────────────────────────────────────────────────────╯
```

## Color Mapping

**Border:**
- All border characters: Purple `#6B50FF`

**Title:**
- "FILE PICKER": White `#DFDBDD`, bold, centered

**Path Bar:**
- "Path:": Gray `#959AA2`
- Path text: White `#DFDBDD`
- "[↑ Up]": Teal `#68FFD6`

**Filter Bar:**
- "Filter:": Gray `#959AA2`
- Input text: White `#DFDBDD`
- Cursor after text

**File List:**

Folders:
- Icon `📁`: Yellow `#E8FE96` (or use [D])
- Name: Blue `#00A4FF`
- Trailing `/`

Files:
- Icon `📄`: White `#DFDBDD` (or use [F])
- Name: White `#DFDBDD`
- Size: Gray `#706F7B`, right-aligned

Selected row:
- Indicator `▶`: Pink `#FF60FF`
- Background: Slightly highlighted `#4D4C57`
- Text: Bold

**File Extensions - Color by Type:**
- `.tsx`, `.ts`, `.js`: Blue `#00A4FF`
- `.json`, `.yaml`: Yellow `#E8FE96`
- `.md`, `.txt`: White `#DFDBDD`
- `.css`, `.scss`: Pink `#FF60FF`
- `.test.tsx`: Teal `#68FFD6`

**Item Count:**
- "14 items": Gray `#706F7B`, right-aligned

**Footer:**
- Navigation hints: Gray `#706F7B`

## Row Format

```
[▶/ ] [icon] [filename padded]                          [size]
```

- Selection: 2 chars (`▶ ` or `  `)
- Icon: 2 chars (emoji + space)
- Filename: flexible width
- Size: 8 chars, right-aligned

## Alternative ASCII Icons

If emoji uncertain, use ASCII:
- Folders: `[D]` in yellow
- Files: `[F]` in white

## Context

When rendered, this modal appears:
- Centered on 120×45 terminal
- Over P01 MainLayout dimmed to ~40%
- Modal starts at column 25, row 9

## Important Notes
- Render ONLY terminal contents - no window frame
- Folders appear before files (sorted)
- Folders have trailing `/`
- Selected item has `▶` indicator
- File sizes right-aligned
- Use monospace font
- Border chars: `╭╮╰╯─│├┤`
