# FLOYD CLI UI Prompts

Individual prompts for generating terminal UI template images.

## Purpose

These prompts are designed for image-generating LLMs. Each file describes ONE terminal screen in detail, specifying exact ASCII layouts, colors, and content. The generated images will be processed by a template-building system.

## Key Instructions (Included in Each Prompt)

1. **Terminal contents ONLY** - No window chrome, title bars, bezels, hardware, or desktop background
2. **Exact dimensions** - Each prompt specifies precise character widths and row counts
3. **Monospace font** - All characters must align in a grid
4. **Hex color codes** - Exact colors from the CRUSH theme

## File Index

### Main Layouts (Full-size: 120×45)

| File | Description | Monitor |
|------|-------------|---------|
| `P01-MainLayout.md` | Interactive CLI with 3-panel layout | LEFT |
| `P02-MonitorLayout.md` | Dashboard with 2×3 widget grid | RIGHT |

### Compact Layouts (Small: 80×24)

| File | Description | Monitor |
|------|-------------|---------|
| `P03-CompactMainLayout.md` | Minimal CLI, no sidebars | LEFT |
| `P04-CompactMonitorLayout.md` | Minimal dashboard, single column | RIGHT |

### Overlays (Modals over P01)

| File | Description | Dimensions |
|------|-------------|------------|
| `O01-HelpOverlay.md` | Keyboard shortcuts modal | 70×22 |
| `O02-CommandPaletteOverlay.md` | Fuzzy command search | 60×16 |
| `O03-PromptLibraryOverlay.md` | Obsidian prompt browser (2-pane) | 100×32 |
| `O04-PermissionAskOverlay.md` | Tool permission request | 80×22 |
| `O05-DiffPreviewOverlay.md` | Code diff viewer | 108×36 |
| `O06-FilePickerOverlay.md` | File/folder selection | 70×26 |

## Monitor Assignment

```
┌─────────────────────┐  ┌─────────────────────┐
│    LEFT MONITOR     │  │   RIGHT MONITOR     │
│     (Primary)       │  │   (Secondary)       │
├─────────────────────┤  ├─────────────────────┤
│ P01: MainLayout     │  │ P02: MonitorLayout  │
│  └─ O01-O06        │  │                     │
│     overlays       │  │                     │
├─────────────────────┤  ├─────────────────────┤
│ P03: CompactMain   │  │ P04: CompactMonitor │
│ (fallback/small)   │  │ (fallback/small)    │
└─────────────────────┘  └─────────────────────┘
```

## Layout Dimensions Summary

| Layout | Columns | Rows | Notes |
|--------|---------|------|-------|
| P01/P02 | 120 | 45 | Full 27" monitor |
| P03/P04 | 80 | 24 | Standard terminal |
| O01 | 70 | 22 | Centered modal |
| O02 | 60 | 16 | Upper-center modal |
| O03 | 100 | 32 | Large 2-pane modal |
| O04 | 80 | 22 | Centered modal |
| O05 | 108 | 36 | Large code viewer |
| O06 | 70 | 26 | Centered modal |

## P01 Three-Panel Structure

The MainLayout uses a 3-column structure within 120 chars:

```
│← 20 →│← ────────────── 83 ─────────────── →│← 17 →│
╭──────╮╭────────────────────────────────────╮╭──────╮
│SESSION││         TRANSCRIPT                ││CONTXT│
╰──────╯╰────────────────────────────────────╯╰──────╯
```

- SESSION: 20 chars (1 + 18 content + 1)
- TRANSCRIPT: 83 chars (1 + 81 content + 1)
- CONTEXT: 17 chars (1 + 15 content + 1)
- Shared borders (╮╭ or ││ or ╯╰): 2 chars at each junction

## P02 Two-Column Grid

The MonitorLayout uses side-by-side widgets:

```
│←──── 59 ────→│  │←──── 59 ────→│
┌──────────────┐  ┌──────────────┐
│  LEFT WIDGET │  │ RIGHT WIDGET │
└──────────────┘  └──────────────┘
     (2-char gap between columns)
```

- Each widget: 59 chars wide
- Gap: 2 chars
- Total: 59 + 2 + 59 = 120 chars

## CRUSH Theme Colors

```
Background:     #201F26 (dark charcoal)
Primary text:   #DFDBDD (white)
Muted text:     #959AA2 (gray)
Subtle text:    #706F7B (dim gray)

Purple accent:  #6B50FF
Pink accent:    #FF60FF
Teal accent:    #68FFD6
Yellow:         #E8FE96
Blue info:      #00A4FF
Green success:  #12C78F
Red error:      #EB4268
Border:         #3A3943
```

## Box-Drawing Characters Reference

```
Rounded corners:  ╭ ╮ ╰ ╯
Square corners:   ┌ ┐ └ ┘
Horizontal line:  ─
Vertical line:    │
T-junctions:      ├ ┤ ┬ ┴
Cross:            ┼

Double-line:      ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬

Gauges:           ████████░░░░ (filled █, empty ░)
Sparklines:       ▁▂▃▄▅▆▇█

Icons:
  Tools:    ⚙
  Success:  ✓
  Error:    ✕
  Warning:  ⚠
  User:     ●
  Agent:    ◉
  System:   ◆
  Spinner:  ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏
```

## Usage

1. Open one prompt file (e.g., `P01-MainLayout.md`)
2. Copy the entire content
3. Paste into image-generating LLM
4. Request terminal screenshot generation
5. Repeat for each screen needed

## Alignment Notes

Each ASCII layout in these files is designed with:
- Consistent line lengths within each block
- Proper border character alignment
- Content padded to fill frames evenly
- Shared borders between adjacent panels

For best results, the image-generating LLM should render text character-by-character in a monospace grid.
