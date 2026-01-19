# P04: CompactMonitorLayout - Minimal Dashboard View

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 80 columns wide × 24 rows tall (SMALLER terminal)
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

This is a minimal/compact version of the monitor dashboard for smaller terminals. Single column layout instead of 2×3 grid. Shows only the most critical information.

## Layout Structure

```
Row 1-2:    COMPACT HEADER (bordered)
Row 3-4:    ALERT SUMMARY (single line or minimal)
Row 5-10:   WORKER STATUS (compact list)
Row 11-16:  SYSTEM METRICS (compact gauges)
Row 17-22:  EVENT STREAM (compact, last few events)
Row 23-24:  FOOTER (connection status)
```

## Color Palette
- Background: `#201F26`
- Primary text: `#DFDBDD`
- Muted text: `#959AA2`
- Purple accent: `#6B50FF`
- Pink accent: `#FF60FF`
- Green success: `#12C78F`
- Yellow warning: `#E8FE96`
- Red error: `#EB4268`

## Section Details

### COMPACT HEADER (Rows 1-2)
Single-line border, pink `#FF60FF`.

```
┌─ FLOYD MONITOR ──────────────────────────────── 2/4 workers • 1 alert ───────┐
└──────────────────────────────────────────────────────────────────────────────┘
```

- "FLOYD MONITOR": Pink `#FF60FF`, bold
- Worker count: Purple `#6B50FF`
- Alert count: Red `#EB4268` if >0, green if 0

### ALERT SUMMARY (Rows 3-4)
No border, inline status.

If alerts exist:
```
⚠ Memory usage high (78%)  •  ✕ Chrome connection failed
```

If no alerts:
```
✓ All systems operational
```

- `⚠`: Yellow `#E8FE96`
- `✕`: Red `#EB4268`
- `✓`: Green `#12C78F`

### WORKER STATUS (Rows 5-10)
Single border box.

```
┌─ Workers ────────────────────────────────────────────────────────────────────┐
│ ◉ Coder       Working   │  ○ FileSystem  Idle     │  … Browser   Waiting    │
│ ○ Git         Idle      │  ○ Shell       Idle     │                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

Compact inline format: `[icon] Name Status`
- `◉` Working: Purple `#6B50FF`
- `○` Idle: Gray `#858392`
- `…` Waiting: Yellow `#E8FE96`
- `⊘` Blocked: Pink `#FF60FF`
- `✕` Error: Red `#EB4268`

### SYSTEM METRICS (Rows 11-16)
Single border box.

```
┌─ System ─────────────────────────────────────────────────────────────────────┐
│ CPU  ████████░░░░░░░░ 52%      MEM  ██████████░░░░░░ 68%                     │
│ Heap ████░░░░░░░░░░░░ 24%      Tkns 12.4K / 100K                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Gauges: 16 chars wide
- Color by fill: Green <50%, Yellow 50-75%, Red >75%
- Bar characters: `█` filled, `░` empty

### EVENT STREAM (Rows 17-22)
Single border box, shows last 4-5 events.

```
┌─ Events ─────────────────────────────────────────────────── ✕ 1 ⚠ 2 ⚙ 15 ──┐
│ 14:32:05  ⚙ read_file                                              (124ms) │
│ 14:32:04  ✓ glob completed                                          (89ms) │
│ 14:32:03  ◉ Agent: Analyzing code...                                        │
│ 14:32:02  ● User: Can you help...                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

Event icons:
- `⚙` Tool: Teal `#68FFD6`
- `✓` Success: Green `#12C78F`
- `✕` Error: Red `#EB4268`
- `◉` Agent: Blue `#00A4FF`
- `●` User: Green `#12C78F`

### FOOTER (Rows 23-24)
Single top border line.

```
──────────────────────────────────────────────────────────────────────────────
● IPC Connected                                    Ctrl+C exit  •  1500ms
```

- `● IPC Connected`: Green if connected, gray "○ Disconnected" if not
- Refresh rate: Gray `#706F7B`

## Full Example

```
┌─ FLOYD MONITOR ──────────────────────────────── 2/4 workers • 1 alert ───────┐
└──────────────────────────────────────────────────────────────────────────────┘
⚠ Memory usage approaching threshold (78%)

┌─ Workers ────────────────────────────────────────────────────────────────────┐
│ ◉ Coder       Working   │  ○ FileSystem  Idle     │  … Browser   Waiting    │
│ ○ Git         Idle      │  ○ Shell       Idle     │                          │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ System ─────────────────────────────────────────────────────────────────────┐
│ CPU  ████████░░░░░░░░ 52%      MEM  ██████████░░░░░░ 68%                     │
│ Heap ████░░░░░░░░░░░░ 24%      Tkns 12.4K / 100K                             │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Events ─────────────────────────────────────────────────── ✕ 0 ⚠ 1 ⚙ 12 ──┐
│ 14:32:05  ⚙ read_file                                              (124ms) │
│ 14:32:04  ✓ glob completed                                          (89ms) │
│ 14:32:03  ◉ Agent: Analyzing code...                                        │
│ 14:32:02  ● User: Can you help...                                           │
└──────────────────────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────────────
● IPC Connected                                    Ctrl+C exit  •  1500ms
```

## Key Differences from Full MonitorLayout
- Single column instead of 2×3 grid
- Smaller terminal (80×24 vs 120×45)
- No Git Activity section
- No Browser State section
- No Tool Timeline (just events)
- Workers shown inline instead of cards
- Simpler metrics display

## Important Notes
- Show ONLY terminal text output
- No window decorations, title bars, or bezels
- No monitor frame or hardware
- No desktop or background outside the terminal
- This is for SMALL terminals - keep it minimal
- Characters should be crisp monospace
- Borders use box-drawing characters: `─│┌┐└┘├┤`
