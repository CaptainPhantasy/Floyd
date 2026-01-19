# O05: DiffPreviewOverlay - File Diff Viewer Modal

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 120 columns wide × 45 rows tall
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

Shows P01 MainLayout dimmed to ~40% in background, with a large diff viewer modal.

## Modal Specifications
- Width: 108 characters exactly
- Height: 36 rows
- Position: Centered
- Border: Rounded corners (`╭╮╰╯`) in purple `#6B50FF`
- Modal background: `#201F26` (same as main for code readability)

## Modal Layout (108 chars wide)

```
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                            DIFF PREVIEW                                                  │
│ src/components/Button.tsx                                                      +18 -7 lines (3 hunks)   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│ @@ -8,12 +8,18 @@ import React, { useState } from 'react';                                              │
│                                                                                                          │
│    8 │   import React, { useState } from 'react';                                                        │
│    9 │   import { useTheme } from '../hooks/useTheme';                                                   │
│   10 │                                                                                                   │
│   11 │   interface ButtonProps {                                                                         │
│   12 │     children: React.ReactNode;                                                                    │
│   13 │     onClick?: () => void;                                                                         │
│   14 │+    variant?: 'primary' | 'secondary' | 'danger';                                                 │
│   15 │+    size?: 'sm' | 'md' | 'lg';                                                                    │
│   16 │+    disabled?: boolean;                                                                           │
│   17 │   }                                                                                                │
│   18 │                                                                                                   │
│   19 │   export const Button: React.FC<ButtonProps> = ({                                                 │
│   20 │     children,                                                                                     │
│   21 │     onClick,                                                                                      │
│   22 │+    variant = 'primary',                                                                          │
│   23 │+    size = 'md',                                                                                  │
│   24 │+    disabled = false,                                                                             │
│   25 │   }) => {                                                                                         │
│   26 │     const [isHovered, setIsHovered] = useState(false);                                            │
│   27 │-    const theme = useTheme();                                                                     │
│   28 │+    const { colors, spacing } = useTheme();                                                       │
│   29 │                                                                                                   │
│   30 │     return (                                                                                      │
│   31 │-      <button onClick={onClick}>                                                                  │
│   32 │+      <button                                                                                     │
│   33 │+        onClick={onClick}                                                                         │
│   34 │+        disabled={disabled}                                                                       │
│   35 │+      >                                                                                           │
│   36 │         {children}                                                                                │
│   37 │       </button>                                                                                   │
│                                                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [↑↓] Scroll • [←→] Prev/Next Hunk • [A] Apply • [R] Reject • [Esc] Close                    Hunk 1/3   │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

## Color Mapping

**Border:**
- All border characters: Purple `#6B50FF`

**Title Bar:**
- "DIFF PREVIEW": White `#DFDBDD`, bold, centered
- Filename: Pink `#FF60FF`
- `+18`: Green `#12C78F`
- `-7`: Red `#EB4268`
- "lines (3 hunks)": Gray `#706F7B`

**Hunk Header:**
- `@@ -8,12 +8,18 @@`: Purple `#6B50FF`
- Context text after `@@`: Gray `#706F7B`

**Diff Lines:**

Line number column (5 chars + │):
- Context lines: Gray `#706F7B`
- Added lines: Green `#629657`
- Deleted lines: Red `#a45c59`

Diff marker column:
- `+` addition: Green `#629657`
- `-` deletion: Red `#a45c59`
- (space) context: No marker

Code content:
- Context lines: White `#DFDBDD` on `#201F26` background
- Added lines: White on dark green `#323931` background
- Deleted lines: White on dark red `#383030` background

**Syntax Highlighting:**
- Keywords (import, const, return): Blue `#00A4FF`
- Strings: Tan `#BF976F`
- Types (React.FC, ButtonProps): Teal `#68FFD6`
- Functions: Green `#12C78F`
- Operators (=, =>): Orange `#FF6E63`
- Comments: Gray `#706F7B`

**Footer:**
- Navigation hints: Gray `#706F7B`
- "Hunk 1/3": Gray `#706F7B`, right-aligned

## Line Format

```
[line#] │[+/-/ ] [code content padded to fill width]
```

- Line numbers: 5 chars, right-aligned
- Separator: `│` in gray
- Marker: 1 char (`+`, `-`, or space)
- Code: remaining width

## Context

When rendered, this modal appears:
- Centered on 120×45 terminal
- Over P01 MainLayout dimmed to ~40%
- Modal starts at column 6, row 4

## Important Notes
- Render ONLY terminal contents - no window frame
- This is a LARGE modal for code readability
- Added lines have GREEN tinted background
- Deleted lines have RED tinted background
- Syntax highlighting applies within diff content
- Use monospace font
- Border chars: `╭╮╰╯─│├┤`
