# P03: CompactMainLayout - Minimal CLI View

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 80 columns wide × 24 rows tall (SMALLER terminal)
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

This is a minimal/compact version of the main CLI for smaller terminals or resource-constrained environments. NO side panels, NO ASCII banner - just a simple header, message area, and input.

## Layout Structure

```
Row 1-2:    COMPACT STATUS BAR (single bordered row)
Row 3-21:   MESSAGE AREA (scrollable, no border)
Row 22-24:  INPUT AREA (bordered box)
```

## Color Palette
- Background: `#201F26`
- Primary text: `#DFDBDD`
- Muted text: `#959AA2`
- Purple accent: `#6B50FF`
- Pink accent: `#FF60FF`
- Green success: `#12C78F`
- Yellow highlight: `#E8FE96`

## Section Details

### COMPACT STATUS BAR (Rows 1-2)
Rounded border, purple `#6B50FF`.
Single row of content inside.

```
╭──────────────────────────────────────────────────────────────────────────────╮
│ FLOYD CLI                                              Online    ● Thinking  │
╰──────────────────────────────────────────────────────────────────────────────╯
```

- "FLOYD" with gradient letters (F=pink, L=blue, O=lavender, Y=indigo, D=violet)
- "CLI": Gray `#959AA2`
- "Online": Green `#12C78F`
- Thinking indicator: `●` yellow + "Thinking" in yellow (or "Ready" in green when idle)

### MESSAGE AREA (Rows 3-21)
No border, just plain content area.
Shows last 5-8 messages, scrollable.

```
You:
  Can you help me fix this bug?

Floyd:
  I'll take a look at the code. Let me read the file first.
  
  [read_file ✓]
  
  I see the issue. The problem is on line 42 where...▋

```

Message format:
- "You:": Green `#12C78F`, bold
- "Floyd:": Blue `#00A4FF`, bold  
- User content: White `#DFDBDD`, indented 2 spaces
- Assistant content: White `#DFDBDD`, indented 2 spaces
- Tool results: `[tool_name ✓]` or `[tool_name ✕]` inline, teal/green or red
- Streaming cursor: `▋` block cursor

### INPUT AREA (Rows 22-24)
Single-line border, gray `#3A3943`.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ❯ _                                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Prompt `❯`: Green `#12C78F`
- Cursor: White block or underscore
- No hint text in compact mode to save space

## Full Example

```
╭──────────────────────────────────────────────────────────────────────────────╮
│ FLOYD CLI                                              Online    ⠋ Thinking  │
╰──────────────────────────────────────────────────────────────────────────────╯

You:
  Can you help me refactor the Button component to add a loading state?

Floyd:
  I'll help you add a loading state to the Button component. Let me first
  read the current implementation.
  
  [read_file ✓ 124ms]
  
  I can see the component. I'll add a loading prop and show a spinner
  when it's active. Here's my plan:
  
  1. Add `loading` prop to ButtonProps
  2. Add spinner component
  3. Disable button when loading
  
  Let me make these changes...▋

┌──────────────────────────────────────────────────────────────────────────────┐
│ ❯ _                                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key Differences from Full MainLayout
- NO ASCII banner
- NO SESSION panel (left sidebar)
- NO CONTEXT panel (right sidebar)
- NO keyboard hints in footer
- Simpler status bar (one line)
- Smaller terminal size (80×24 vs 120×45)
- Messages are more compact

## Important Notes
- Show ONLY terminal text output
- No window decorations, title bars, or bezels
- No monitor frame or hardware
- No desktop or background outside the terminal
- This is for SMALL terminals - keep it minimal
- Characters should be crisp monospace
- Borders use box-drawing characters: `─│╭╮╰╯┌┐└┘`
