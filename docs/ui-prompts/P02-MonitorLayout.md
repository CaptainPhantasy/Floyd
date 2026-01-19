# P02: MonitorLayout - RIGHT MONITOR

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 120 columns wide × 45 rows tall
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Color Palette
- Background: `#201F26`
- Primary text: `#DFDBDD`
- Muted text: `#959AA2`
- Subtle text: `#706F7B`
- Purple accent: `#6B50FF`
- Pink accent: `#FF60FF`
- Teal accent: `#68FFD6`
- Yellow highlight: `#E8FE96`
- Blue info: `#00A4FF`
- Green success: `#12C78F`
- Red error: `#EB4268`
- Border color: `#3A3943`

## Layout Structure

The monitor dashboard uses:
- Full-width header (120 chars)
- Full-width alert ticker (120 chars)
- 2-column grid: LEFT (59 chars) + 2 gap + RIGHT (59 chars) = 120 chars
- Full-width footer

## Complete Layout (120 columns × 45 rows)

Each line is EXACTLY 120 characters.

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ FLOYD MONITOR                       Right Screen (27")                      2/4 workers   0 alerts   1500ms refresh  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
┌─ Alert Ticker ─────────────────────────────────────────────────────────────────────────────── 1 alert ─── ⚠ 1 ── ✕ 0 ┐
│ 14:32:05  ⚠  Memory usage approaching threshold (78%)                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌─ Event Stream ─────────────────────────── 42/50 ── ▶ Live ─┐  ┌─ Worker Status ─────────────────── 4 workers ────────┐
│ 14:32:05  ⚙  read_file                      (124ms) │  │ ┌───────────────────────────┐ ┌───────────────────────────┐ │
│ 14:32:04  ✓  read_file completed            (124ms) │  │ │ ◈ Coder         ◉ 5s ago │ │ ⚙ FS             ○ 12s ago │ │
│ 14:32:03  ◉  Agent: Analyzing...                    │  │ │ Task: Refactoring Button │ │ Task: -                    │ │
│ 14:32:02  ⚙  glob                            (89ms) │  │ │ ████████░░ 80%           │ │                            │ │
│ 14:32:01  ●  User: Can you help...                  │  │ │ ✓ 12  ✕ 0  Q: 2         │ │ ✓ 45  ✕ 1  Q: 0             │ │
│ 14:32:00  ◆  Session started                        │  │ └───────────────────────────┘ └───────────────────────────┘ │
│                                                     │  │ ┌───────────────────────────┐ ┌───────────────────────────┐ │
│                                                     │  │ │ ◈ Browser       … 30s ago│ │ ⚙ Git            ○ 8s ago  │ │
│                                                     │  │ │ Task: Waiting for tab... │ │ Task: -                    │ │
│                                                     │  │ │                           │ │                           │ │
│                                                     │  │ │ ✓ 3   ✕ 0  Q: 1         │ │ ✓ 22  ✕ 0  Q: 0             │ │
│                                                     │  │ └───────────────────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────┘  └─────────────────────────────────────────────────────────────┘
┌─ Tool Timeline ────────────────────── 60s window ───┐  ┌─ System Metrics ────────────────────────────────────────────┐
│ Time ───────────────────────────────────────────▶Now│  │                                                             │
│                                                     │  │ CPU:  ████████░░░░░░░░ 52%      ▁▂▃▄▅▆▇▆▅▄▃▂▁▂▃             │
│ read_file   ████ 124ms                              │  │ MEM:  ██████████░░░░░░ 68%      ▃▃▃▄▄▅▅▆▆▇▇▇▇▇▇             │
│ glob        ██ 89ms                                 │  │ Heap: ████░░░░░░░░░░░░ 24%      ▁▁▂▂▃▃▂▂▁▁▂▂▃▃▂             │
│ write_file                    ████████ 450ms        │  │                                                             │
│ shell                                    ██████ 2.1s│  │ Tokens: 12.4K / 100K           ▂▃▄▅▆▅▄▃▂▃▄▅▆▇█              │
│                                                     │  │ Cost:   $0.42 this session                                  │
│ ─────────────────────────────────────────────────── │  │                                                             │
│ Legend: ████ <100ms  ████ 100-500ms  ████ >500ms   │  │                                                              │
└─────────────────────────────────────────────────────┘  └─────────────────────────────────────────────────────────────┘
┌─ Git Activity ──────────────────────────────────────┐  ┌─ Browser State ─────────────────────────────────────────────┐
│ Branch: feature/refactor-button         ● dirty (3) │  │ Connection: ● Connected to Chrome Extension                 │
│                                                     │  │                                                             │
│ Changes:                                            │  │ Allowed Domains:                                            │
│   M src/components/Button.tsx                       │  │   [✓] localhost                                             │
│   M src/components/index.ts                         │  │   [✓] github.com                                            │
│   A src/components/Button.test.tsx                  │  │   [x] twitter.com (blocked)                                 │
│                                                     │  │                                                             │
│ Recent Commits:                                     │  │ Owned Tabs: 2                                               │
│   abc1234 Add button hover state (2m ago)           │  │ Active Tab: GitHub - Pull Request #142                      │
└─────────────────────────────────────────────────────┘  └─────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Monitor Layout    ● IPC Connected                                                   Press Ctrl+C to exit    1500ms     
```

## Color Mapping

**Header (rows 1-3):**
- Double border: Pink `#FF60FF`
- "FLOYD MONITOR": Bold pink `#FF60FF`
- "Right Screen (27")": Gray `#959AA2`
- "2/4 workers": Purple `#6B50FF`
- "0 alerts": Green `#12C78F` (red if >0)
- "1500ms refresh": Gray `#706F7B`

**Alert Ticker (rows 4-6):**
- Border: Gray `#3A3943`
- "Alert Ticker": Pink `#FF60FF`
- "⚠": Yellow `#E8FE96`
- "✕": Red `#EB4268`
- Message text: White `#DFDBDD`

**Event Stream (left, rows 7-20):**
- Border: Gray `#3A3943`
- "Event Stream": Pink `#FF60FF`
- "▶ Live": Green `#12C78F`
- Timestamps: Gray `#706F7B`
- `⚙` tool: Teal `#68FFD6`
- `✓` success: Green `#12C78F`
- `◉` agent: Blue `#00A4FF`
- `●` user: Green `#12C78F`
- `◆` system: Yellow `#E8FE96`
- Durations: Color by speed (<100ms green, 100-500ms teal, >500ms yellow, >2s red)

**Worker Status (right, rows 7-20):**
- Border: Gray `#3A3943`
- "Worker Status": Pink `#FF60FF`
- Worker cards: Gray `#3A3943` borders
- `◈` agent: Pink `#FF60FF`
- `⚙` tool: Teal `#68FFD6`
- `◉` working: Purple `#6B50FF`
- `○` idle: Gray `#858392`
- `…` waiting: Yellow `#E8FE96`
- Progress bars: Purple fill `#6B50FF`, gray empty `#3A3943`
- Stats: `✓` green, `✕` red, Q: blue

**Tool Timeline (left, rows 21-31):**
- Border: Gray `#3A3943`
- "Tool Timeline": Pink `#FF60FF`
- Tool names: White `#DFDBDD`
- Bars: Green (<100ms), Teal (100-500ms), Yellow (>500ms), Red (>2s)

**System Metrics (right, rows 21-31):**
- Border: Gray `#3A3943`
- "System Metrics": Pink `#FF60FF`
- Labels: White `#DFDBDD`
- Gauges: Green (0-50%), Yellow (50-75%), Red (>75%)
- Sparklines: Teal `#68FFD6`
- Cost: Green `#12C78F`

**Git Activity (left, rows 32-41):**
- Border: Gray `#3A3943`
- "Git Activity": Pink `#FF60FF`
- Branch name: Blue `#00A4FF`
- "● dirty": Red `#EB4268`
- `M`: Yellow `#E8FE96`
- `A`: Green `#12C78F`
- Commit hashes: Purple `#6B50FF`

**Browser State (right, rows 32-41):**
- Border: Gray `#3A3943`
- "Browser State": Pink `#FF60FF`
- "● Connected": Green `#12C78F`
- `[✓]`: Green `#12C78F`
- `[x]`: Red `#EB4268`

**Footer (rows 42-43):**
- Horizontal line: Gray `#3A3943`
- "● IPC Connected": Green `#12C78F`
- Hint text: Gray `#706F7B`

## Important Notes
- Render ONLY terminal contents - no window frame
- Each line is exactly 120 characters
- Left and right columns are 59 chars each with 2-char gap
- Use monospace font for alignment
- Box-drawing chars: `─│┌┐└┘├┤═║╔╗╚╝`
