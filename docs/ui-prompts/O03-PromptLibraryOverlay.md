# O03: PromptLibraryOverlay - Obsidian Prompt Browser Modal

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 120 columns wide × 45 rows tall
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

Shows P01 MainLayout dimmed to ~40% in background, with a large 2-pane prompt browser modal.

## Modal Specifications
- Width: 100 characters exactly
- Height: 32 rows
- Position: Centered
- Border: Rounded corners (`╭╮╰╯`) in purple `#6B50FF`
- Modal background: `#3A3943`

## Modal Layout (100 chars wide)

Two-pane layout: Left (40%) for list, Right (60%) for preview.

```
╭──────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                       PROMPT LIBRARY                                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Search: system design_                                                          ✓ Copied!       │
├────────────────────────────────────────┬─────────────────────────────────────────────────────────┤
│ Prompts (42)                           │ System Design Template                                  │
│                                        │ prompts/templates/system-design.md                     │
│ ╭────────────────────────────────────╮ ├─────────────────────────────────────────────────────────┤
│ │ System Design Template             │ │ ## Overview                                             │
│ │ #template #architecture            │ │                                                         │
│ ╰────────────────────────────────────╯ │ This template provides a structured approach for        │
│                                        │ designing complex distributed systems. Use it when      │
│   API Integration Guide                │ planning new features or services.                      │
│   #api #integration                    │                                                         │
│                                        │ ## Sections                                             │
│   Code Review Checklist                │                                                         │
│   #review #quality                     │ ### 1. Requirements Analysis                            │
│                                        │ - Functional requirements                               │
│   Debugging Workflow                   │ - Non-functional requirements                           │
│   #debug #troubleshoot                 │ - Constraints and assumptions                           │
│                                        │                                                         │
│   Performance Optimization             │ ### 2. High-Level Design                                │
│   #performance #speed                  │ - System components                                     │
│                                        │ - Data flow diagram                                     │
│   Security Audit Template              │ - API contracts                                         │
│   #security #audit                     │                                                         │
│                                        │ ### 3. Detailed Design                                  │
│   Testing Strategy                     │ - Database schema                                       │
│   #testing #qa                         │ - Service interfaces                                    │
│                                        │ - Error handling                                        │
├────────────────────────────────────────┴─────────────────────────────────────────────────────────┤
│ [↑↓] Navigate • [Enter] Copy • [Esc] Close                                       2,847 chars    │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
```

## Color Mapping

**Border:**
- All border characters: Purple `#6B50FF`

**Title:**
- "PROMPT LIBRARY": White `#DFDBDD`, bold, centered

**Search Bar:**
- "Search:": Gray `#959AA2`
- Input text: White `#DFDBDD`
- "✓ Copied!": Green `#12C78F` (appears after copying)

**Left Pane - Prompt List:**
- "Prompts (42)": Purple `#6B50FF`, bold
- Selected item box border: Purple `#6B50FF` with `╭╮╰╯`
- Selected title: White `#DFDBDD`, bold
- Selected tags: Gray `#706F7B`
- Unselected titles: Gray `#959AA2`
- Unselected tags: Gray `#706F7B`, dimmer
- Tags have `#` prefix

**Right Pane - Preview:**
- Filename: Pink `#FF60FF`, bold
- Path: Gray `#706F7B`
- `##` headers: Blue `#00A4FF`, bold
- `###` subheaders: Teal `#68FFD6`
- `-` bullets: Gray `#706F7B`
- Body text: White `#DFDBDD`

**Divider:**
- Vertical line `│`: Gray `#3A3943`

**Footer:**
- Navigation hints: Gray `#706F7B`
- Character count: Gray `#706F7B`, right-aligned

## Pane Widths

Total content width: 98 chars (100 - 2 for outer borders)
- Left pane: 39 chars
- Divider: 1 char
- Right pane: 58 chars

## Context

When rendered, this modal appears:
- Centered on 120×45 terminal
- Over P01 MainLayout dimmed to ~40%
- Modal starts at column 10, row 6

## Important Notes
- Render ONLY terminal contents - no window frame
- This is a LARGE modal taking most of the screen
- Left/right panes divided by vertical line
- Selected prompt has rounded box highlight
- Preview shows markdown with syntax coloring
- Use monospace font
- Border chars: `╭╮╰╯─│├┤┬┴`
