# FLOYD CLI UI Template Specification

**Purpose**: Detailed specification for generating visual templates of the FLOYD CLI interface.  
**Monitor Setup**: Dual 27" monitors, side-by-side, LEFT is primary  
**Target**: Use this document as an LLM prompt to generate template images for scanning.

---

## MONITOR CONFIGURATION

| Monitor | Role | Application | Terminal Size (Recommended) |
|---------|------|-------------|----------------------------|
| LEFT (Primary) | Interactive CLI | Standard Terminal | 120 cols × 45 rows |
| RIGHT (Secondary) | Monitor Dashboard | TMUX Session | 120 cols × 45 rows |

---

## PAGE INDEX

| Page ID | Page Name | Monitor | Description |
|---------|-----------|---------|-------------|
| `P01` | MainLayout | LEFT | Primary interactive CLI - 3-pane layout |
| `P02` | MonitorLayout | RIGHT | Real-time dashboard - 6-widget grid |
| `P03` | CompactMainLayout | LEFT | Minimal CLI for small terminals |
| `P04` | CompactMonitorLayout | RIGHT | Minimal dashboard for small terminals |
| `O01` | HelpOverlay | LEFT | Keyboard shortcuts modal |
| `O02` | CommandPaletteOverlay | LEFT | Fuzzy command search modal |
| `O03` | PromptLibraryOverlay | LEFT | Obsidian prompt browser modal |
| `O04` | PermissionAskOverlay | LEFT | Tool permission request modal |
| `O05` | DiffPreviewOverlay | LEFT | File diff preview modal |
| `O06` | FilePickerOverlay | LEFT | File/folder selection modal |
| `C01` | ConfigApp | LEFT | Settings configuration page |
| `C02` | AgentManagerConfig | LEFT | Agent/worker configuration page |
| `C03` | PromptLibraryConfig | LEFT | Prompt management page |

---

## COLOR PALETTE (CRUSH Theme)

Use these exact colors in all templates:

### Backgrounds
- `#201F26` - Base background (Pepper)
- `#2d2c35` - Elevated elements (BBQ)
- `#3A3943` - Overlay backgrounds (Charcoal)
- `#4D4C57` - Modal backgrounds (Iron)

### Text
- `#DFDBDD` - Primary text (Ash)
- `#959AA2` - Secondary text (Squid)
- `#BFBCC8` - Tertiary text (Smoke)
- `#706F7B` - Subtle text (Oyster)

### Accents
- `#6B50FF` - Primary accent / Working status (Charple - Purple)
- `#FF60FF` - Secondary accent / Blocked status (Dolly - Pink)
- `#68FFD6` - Tertiary accent / Tool labels (Bok - Teal)
- `#E8FE96` - Highlight / Warning (Zest - Yellow)
- `#00A4FF` - Info accent (Malibu - Blue)

### Status
- `#12C78F` - Ready/Success/Online (Guac - Green)
- `#6B50FF` - Working/Processing (Charple - Purple)
- `#E8FE96` - Warning/Caution (Zest - Yellow)
- `#EB4268` - Error/Critical (Sriracha - Red)
- `#858392` - Offline/Idle (Squid - Gray)

### Border Styles
- Default: `round` corners using `╭╮╰╯` characters
- Focus: Purple `#6B50FF` border
- Error: Red `#EB4268` border
- Success: Green `#12C78F` border

---

## P01: MainLayout (LEFT MONITOR)

**Full-screen 3-pane layout with header and footer**

### Overall Structure
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              [F01] ASCII_BANNER (optional)                                              │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                   [F02] STATUS_BAR                                                      │
├──────────────────────┬───────────────────────────────────────────────────────────────────────────┬─────────────────────┤
│                      │                                                                           │                     │
│  [F03] SESSION_PANEL │                        [F04] TRANSCRIPT_PANEL                             │ [F05] CONTEXT_PANEL │
│                      │                                                                           │                     │
│       (18 cols)      │                           (flex-grow)                                     │      (18 cols)      │
│                      │                                                                           │                     │
├──────────────────────┴───────────────────────────────────────────────────────────────────────────┴─────────────────────┤
│                                                   [F06] INPUT_AREA                                                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Frame Specifications

#### F01: ASCII_BANNER
- **Position**: Top, full width
- **Height**: 8 rows (fixed)
- **Width**: 100%
- **Content**: FLOYD ASCII art logo
- **Colors**: Gradient pink `#FF60FF` to purple `#6B50FF` to blue `#6060FF`
- **Visibility**: Hidden in compact mode
- **Border**: None

#### F02: STATUS_BAR
- **Position**: Below banner, full width
- **Height**: 3 rows (1 content + border)
- **Width**: 100%
- **Border**: Round style, color `#6B50FF` (focus purple)
- **Layout**: 3 sections (left | center | right)

| Section | Width | Content |
|---------|-------|---------|
| Left | 33% | "FLOYD CLI" branding (gradient letters), username, mode badge |
| Center | 33% | CWD path (truncated), connection status indicator |
| Right | 33% | Agent status with spinner/icon, whimsical phrase when thinking |

**Status Indicators**:
- Connected: `●` green `#12C78F`
- Connecting: spinner dots, yellow `#E8FE96`
- Disconnected: `○` gray `#858392`
- Thinking: spinner + yellow text

#### F03: SESSION_PANEL
- **Position**: Left column
- **Width**: 18 characters (fixed)
- **Height**: Flex (fills available space)
- **Border**: Round style with title " SESSION "
- **Border Color**: `#6B50FF` (focus purple)
- **Padding**: 1 character internal

**Internal Sections** (vertical stack):

| Section ID | Name | Height | Content |
|------------|------|--------|---------|
| F03.1 | REPO_INFO | 3 rows | `• repo-name` (purple), `(tech stack)` (gray) |
| F03.2 | GIT_STATUS | 2 rows | `Git: branch name` (blue), status dot + `clean/dirty` |
| F03.3 | SAFETY_MODE | 2 rows | `Safety:` label, boxed `YOLO ON/OFF` badge |
| F03.4 | TOOLS_LIST | 5+ rows | Header "TOOLS" (pink), list: `[✓/x] ToolName [ON/OFF]` |
| F03.5 | WORKERS_LIST | 5+ rows | Header "WORKERS" (teal), list: `○/●/…/⛔ WorkerName [Status]` |
| F03.6 | QUICK_ACTIONS | 3+ rows | Header "QUICK ACTS" (blue), shortcut hints |

**Worker Status Icons**:
- Idle: `○` gray
- Working: `●` purple (with optional spinner)
- Waiting: `…` yellow
- Blocked: `⛔` pink

#### F04: TRANSCRIPT_PANEL
- **Position**: Center column
- **Width**: Flex (takes remaining space after SESSION and CONTEXT)
- **Height**: Flex (fills available space)
- **Border**: Round style with title " TRANSCRIPT "
- **Border Color**: `#6B50FF` (focus purple)
- **Padding**: 1 character internal
- **Scrollable**: Yes, with scroll indicator

**Internal Content** (vertical stack, scrollable):

| Element Type | Format |
|--------------|--------|
| User Message | `> User: HH:MM:SS` (green label), content below indented |
| Assistant Message | `< Assistant: HH:MM:SS` (blue label), content below indented |
| System Message | `System: HH:MM:SS` (yellow label), content below indented |
| Tool Call | Inline card: `[worker.requested] ToolName ● Running` or `✓ Success` |
| Streaming Content | Assistant message with cursor `▋` and optional spinner |

**Tool Card Format**:
```
┌─────────────────────────────────────────┐
│ ⚙ tool_name                    ● 245ms │
│   param1: value                         │
│   param2: value                         │
│   ✓ Success / ✕ Error message          │
└─────────────────────────────────────────┘
```

#### F05: CONTEXT_PANEL
- **Position**: Right column
- **Width**: 18 characters (fixed)
- **Height**: Flex (fills available space)
- **Border**: Round style with title " CONTEXT "
- **Border Color**: `#6B50FF` (focus purple)
- **Padding**: 1 character internal

**Internal Sections** (vertical stack):

| Section ID | Name | Height | Content |
|------------|------|--------|---------|
| F05.1 | CURRENT_PLAN | 4+ rows | Header "CURRENT PLAN" (purple), checklist `[x]/[ ] task` |
| F05.2 | FILES_TOUCHED | 4+ rows | Header "FILES TOUCHED" (pink), bullet list `• filename` |
| F05.3 | OPEN_DIFFS | 2 rows | Header "OPEN DIFFS" (teal), `N diffs (M lines / K files)` |
| F05.4 | BROWSER_STATE | 3 rows | Header "BROWSER" (blue), domain + `[✓/x]` allowed badge |
| F05.5 | QUICK_ACTIONS | 3+ rows | Header "QUICK ACTS" (highlight), `shortcut label` pairs |

#### F06: INPUT_AREA
- **Position**: Bottom, full width
- **Height**: 4 rows (2 content + border + hint)
- **Width**: 100%
- **Border**: Single style, color `#3A3943`
- **Padding**: 1 character internal

**Internal Layout**:
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ❯ [text input field with cursor]                                                          [spinner if thinking]       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Ctrl+P: Commands • Ctrl+/: Help • Esc: Exit                                               Generating response...      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Prompt character: `❯` in green `#12C78F`
- Placeholder text: "Type a message..." in gray
- Hint text: Gray `#706F7B`, dimmed

---

## P02: MonitorLayout (RIGHT MONITOR)

**Dashboard grid layout with header, alert ticker, and 6-widget grid**

### Overall Structure
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                   [F10] MONITOR_HEADER                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                   [F11] ALERT_TICKER                                                    │
├───────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────┤
│                                                                   │                                                    │
│                      [F12] EVENT_STREAM                           │              [F13] WORKER_STATE_BOARD              │
│                                                                   │                                                    │
│                         (50% width)                               │                    (50% width)                     │
│                         (tall)                                    │                    (tall)                          │
│                                                                   │                                                    │
├───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│                                                                   │                                                    │
│                      [F14] TOOL_TIMELINE                          │              [F15] SYSTEM_METRICS                  │
│                                                                   │                                                    │
│                         (50% width)                               │                    (50% width)                     │
│                                                                   │                                                    │
├───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│                                                                   │                                                    │
│                      [F16] GIT_ACTIVITY                           │              [F17] BROWSER_STATE                   │
│                                                                   │                                                    │
│                         (50% width)                               │                    (50% width)                     │
│                                                                   │                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                   [F18] MONITOR_FOOTER                                                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Frame Specifications

#### F10: MONITOR_HEADER
- **Position**: Top, full width
- **Height**: 3 rows
- **Width**: 100%
- **Border**: Double style `║`, color `#FF60FF` (pink)
- **Padding**: 1 character internal

**Layout**:
| Section | Content |
|---------|---------|
| Left | "FLOYD MONITOR" (bold pink), "Right Screen (27\")" (gray) |
| Right | `N/M workers` (purple), `X alerts` (red if >0, green if 0), `XXXXms` refresh |

#### F11: ALERT_TICKER
- **Position**: Below header, full width
- **Height**: 2-4 rows (expandable)
- **Width**: 100%
- **Border**: Single style, color `#3A3943`
- **Content**: Scrolling alert messages with severity icons

**Alert Format**:
```
HH:MM:SS  ⓘ/⚠/✕/⚡/✓  Alert message text here                [Action]
```

**Severity Icons**:
- Info: `ⓘ` blue `#00A4FF`
- Warning: `⚠` yellow `#E8FE96`
- Error: `✕` red `#EB4268`
- Critical: `⚡` bright red
- Success: `✓` green `#12C78F`

#### F12: EVENT_STREAM
- **Position**: Left column, row 1
- **Width**: 50%
- **Height**: ~33% of grid area (approximately 12 rows)
- **Border**: Single style with header "Event Stream"
- **Scrollable**: Yes, auto-scroll to bottom

**Content**: Live event waterfall

| Column | Width | Content |
|--------|-------|---------|
| Timestamp | 12 chars | `HH:MM:SS.mmm` gray |
| Icon | 2 chars | Event type icon (colored) |
| Message | flex | Event description |
| Duration | 8 chars | `(XXXms)` colored by speed |

**Event Type Icons**:
- Tool Call: `⚙` teal
- Tool Response: `✓` or `✕` 
- Agent Message: `◉` blue
- User Message: `●` green
- System: `◆` yellow
- Thinking: `⟳` yellow

#### F13: WORKER_STATE_BOARD
- **Position**: Right column, row 1
- **Width**: 50%
- **Height**: ~33% of grid area
- **Border**: Single style with header "Worker Status"

**Layout**: Grid of worker cards (2 columns)

**Worker Card Format**:
```
┌─────────────────────────┐
│ ◈ WorkerName    ● 5s ago│
│ Task: Current task...   │
│ ████████░░ 80%          │
│ ✓ 42  ✕ 2  Q: 5        │
└─────────────────────────┘
```

**Worker Type Icons**:
- Agent: `◈` pink
- Tool: `⚙` teal
- System: `◆` blue

**Worker Status Colors**:
- Idle: `○` gray
- Working: `◉` purple (with spinner)
- Waiting: `…` yellow
- Blocked: `⊘` pink
- Error: `✕` red
- Offline: `⊗` dark gray

#### F14: TOOL_TIMELINE
- **Position**: Left column, row 2
- **Width**: 50%
- **Height**: ~33% of grid area
- **Border**: Single style with header "Tool Timeline"

**Content**: Horizontal timeline of tool executions

```
Time ──────────────────────────────────────────────────────────────▶
     │ read_file ████ 120ms │ write_file ██████████ 450ms │
     │ grep ██ 45ms         │ shell ████████████████ 2.1s │
```

**Duration Colors**:
- Fast (<100ms): Green `#12C78F`
- Normal (100-500ms): Teal `#68FFD6`
- Slow (500-2000ms): Yellow `#E8FE96`
- Very Slow (>2000ms): Red `#EB4268`

#### F15: SYSTEM_METRICS
- **Position**: Right column, row 2
- **Width**: 50%
- **Height**: ~33% of grid area
- **Border**: Single style with header "System Metrics"

**Content**: Resource usage with sparklines

```
CPU:  ████████░░░░░░░░ 52%  ▁▂▃▄▅▆▇▆▅▄▃▂▁▂▃
MEM:  ██████████░░░░░░ 68%  ▃▃▃▄▄▅▅▆▆▇▇▇▇▇▇
Heap: ████░░░░░░░░░░░░ 24%  ▁▁▂▂▃▃▂▂▁▁▂▂▃▃▂
Tkns: 12.4K / 100K           ▂▃▄▅▆▅▄▃▂▃▄▅▆▇█
```

#### F16: GIT_ACTIVITY
- **Position**: Left column, row 3
- **Width**: 50%
- **Height**: ~33% of grid area
- **Border**: Single style with header "Git Activity"

**Content**:
```
Branch: feature/xyz        ● dirty (5 files)

Recent:
  M src/app.tsx
  A src/new-file.ts
  D src/old-file.ts
  
Commits:
  abc1234 Fix bug in... (2m ago)
  def5678 Add feature... (15m ago)
```

#### F17: BROWSER_STATE
- **Position**: Right column, row 3
- **Width**: 50%
- **Height**: ~33% of grid area
- **Border**: Single style with header "Browser State"

**Content**:
```
Connection: ● Connected to Chrome Extension

Allowed Domains:
  [✓] localhost
  [✓] github.com
  [x] example.com (blocked)

Owned Tabs: 3
Active Tab: GitHub - Pull Request #42
```

#### F18: MONITOR_FOOTER
- **Position**: Bottom, full width
- **Height**: 2 rows
- **Width**: 100%
- **Border**: Single style top only
- **Content**: `Monitor Layout` | `● IPC Connected` | `Press Ctrl+C to exit` | `1500ms refresh`

---

## O01: HelpOverlay (LEFT MONITOR - Modal)

**Centered modal overlay for keyboard shortcuts**

### Dimensions
- **Width**: 70 characters (fixed)
- **Height**: Auto (based on content, typically 20-25 rows)
- **Position**: Centered horizontally and vertically
- **Border**: Round style, color `#6B50FF` (focus purple)
- **Background**: `#3A3943` (overlay) with dimmed background

### Structure
```
╭──────────────────────────────────────────────────────────────────────╮
│                        KEYBOARD SHORTCUTS                             │
├──────────────────────────────────────────────────────────────────────┤
│ Use ↑↓ to navigate, Enter to execute, Esc or Ctrl+/ to close        │
├──────────────────────────────────────────────────────────────────────┤
│ Navigation                                                            │
│   ▶ Ctrl+/              Show/hide keyboard shortcuts                 │
│     Ctrl+P              Open command palette                          │
│     Ctrl+M              Toggle monitor dashboard                      │
│     Esc                 Close overlay / Exit                          │
├──────────────────────────────────────────────────────────────────────┤
│ Input                                                                 │
│     Enter               Send message                                  │
├──────────────────────────────────────────────────────────────────────┤
│ System                                                                │
│     Ctrl+C              Exit application                              │
│     Ctrl+Y              Toggle YOLO mode                              │
├──────────────────────────────────────────────────────────────────────┤
│ Press Esc or Ctrl+/ to close this overlay                            │
╰──────────────────────────────────────────────────────────────────────╯
```

### Elements
- Title: "KEYBOARD SHORTCUTS" centered, bold
- Instruction text: Gray, dimmed
- Category headers: Purple `#6B50FF`, bold
- Selection indicator: `▶` purple for selected row
- Key column: 20 chars wide, white/bold when selected
- Description column: Flex width, gray when not selected
- Footer: Gray, dimmed

---

## O02: CommandPaletteOverlay (LEFT MONITOR - Modal)

**Centered modal for fuzzy command search**

### Dimensions
- **Width**: 60 characters (fixed)
- **Height**: Auto (8 visible items + header/footer, ~15 rows)
- **Position**: Centered horizontally, upper third vertically
- **Border**: Round style, color `#6B50FF` (focus purple)
- **Background**: `#3A3943` with dimmed background

### Structure
```
╭──────────────────────────────────────────────────────────────────╮
│ > [search input with cursor]                                     │
├──────────────────────────────────────────────────────────────────┤
│ ▶ 📝 New Task                                            ^N     │
│   📄 Open File                                           ^O     │
│   🔍 Search Files                                        ^F     │
│   ⚡ Run Command                                         ^R     │
│   📜 View History                                               │
│   ⚙️ Settings                                            ^,     │
│   ❓ Help                                                F1     │
│   👋 Exit                                                ^Q     │
├──────────────────────────────────────────────────────────────────┤
│ Selected command description appears here                        │
├──────────────────────────────────────────────────────────────────┤
│ ↑↓ Nav • Enter Select • Esc Close                    1/8        │
╰──────────────────────────────────────────────────────────────────╯
```

### Elements
- Prompt: `>` pink `#FF60FF`
- Search input: Full width, placeholder "Type a command or search..."
- Selected row: `▶` indicator, bold text, pink highlight on matched chars
- Icon column: 3 chars (emoji)
- Label column: Flex width
- Shortcut column: 6 chars, gray, right-aligned
- Description: Gray, shown for selected item only
- Counter: `X/Y` showing position

---

## O03: PromptLibraryOverlay (LEFT MONITOR - Modal)

**Large modal for browsing Obsidian prompts**

### Dimensions
- **Width**: 80-100 characters (or terminal width - 4)
- **Height**: Terminal height - 10 rows
- **Position**: Centered
- **Border**: Round style, color `#6B50FF`
- **Background**: `#3A3943`

### Structure
```
╭────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                        PROMPT LIBRARY                                           │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Search: [search input]                                                          ✓ Copied!      │
├────────────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Prompts (42)                           │ System Design Template                                │
│ ┌────────────────────────────────────┐ │ prompts/templates/system-design.md                    │
│ │ System Design Template             │ │                                                       │
│ │ #template #architecture            │ │ ## Overview                                           │
│ └────────────────────────────────────┘ │ This template provides a structured approach          │
│   API Integration Guide                │ for designing complex systems...                      │
│   #api #integration                    │                                                       │
│   Code Review Checklist                │ ## Sections                                           │
│   #review #quality                     │ 1. Requirements Analysis                              │
│   Debugging Workflow                   │ 2. Architecture Design                                │
│   #debug #troubleshoot                 │ 3. Implementation Plan                                │
│                                        │ ...                                                   │
├────────────────────────────────────────┴───────────────────────────────────────────────────────┤
│ [↑↓] Navigate • [Enter] Copy • [Esc] Close                                      1234 chars     │
╰────────────────────────────────────────────────────────────────────────────────────────────────╯
```

### Layout
- **Left pane**: 40% width - Prompt list with selection
- **Right pane**: 60% width - Markdown preview
- **Divider**: Single vertical line

### Elements
- Search bar: Full width at top
- "Copied!" indicator: Green, appears after copy
- List items: Title (bold when selected), tags below (gray)
- Selected item: Bordered box
- Preview: Markdown rendered with syntax highlighting
- Footer: Navigation hints + character count

---

## O04: PermissionAskOverlay (LEFT MONITOR - Modal)

**Risk-aware permission request modal**

### Dimensions
- **Width**: 80 characters (fixed)
- **Height**: Auto (typically 18-25 rows)
- **Position**: Centered
- **Border**: Double style `║`, color based on risk level
- **Background**: `#3A3943`

### Risk Level Styling
| Level | Border Color | Label | Symbol |
|-------|--------------|-------|--------|
| LOW | Green `#12C78F` | "LOW RISK" | `[SAFE]` |
| MEDIUM | Yellow `#E8FE96` | "MEDIUM RISK" | `[CAUT]` |
| HIGH | Red `#EB4268` | "HIGH RISK" | `[DANG]` |

### Structure
```
╔══════════════════════════════════════════════════════════════════════════════════╗
║ [CAUT] MEDIUM RISK                                                    14:32:05   ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ Tool Request: write_file                                                         ║
║                                                                                   ║
║ This action requires your approval before proceeding.                            ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ Arguments:                                                                       ║
║ ┌──────────────────────────────────────────────────────────────────────────────┐ ║
║ │   path: /src/components/Button.tsx                                           │ ║
║ │   content: import React from 'react'...                                      │ ║
║ └──────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                   ║
║ Why this risk level?                                                             ║
║   • Writing to source code directory                                             ║
║   • File modification requires approval                                          ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ Remember this choice:                                                            ║
║   [X] Once (1)     [ ] Session (2)     [ ] Always (3)                           ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ ╔═══════════════════╗                              ╔═══════════════════╗         ║
║ ║ [X] Approve (Once)║       Y/N | 1-3 | Enter     ║ [ ] Deny          ║         ║
║ ╚═══════════════════╝                              ╚═══════════════════╝         ║
║                                                                                   ║
║       Arrows: Select • Y: Approve • N: Deny • 1-3: Scope • Enter: Confirm       ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

### Elements
- Risk badge: Top-left, colored by risk level
- Timestamp: Top-right, gray
- Tool name: Pink `#FF60FF`, bold
- Arguments box: Bordered, gray background
- Risk reasons: Blue info text
- Scope radio buttons: `[X]` selected, `[ ]` unselected
- Action buttons: Double-bordered when focused, colored by action
  - Approve: Green border when focused
  - Deny: Red border when focused
- Keyboard hints: Gray, centered at bottom

---

## O05: DiffPreviewOverlay (LEFT MONITOR - Modal)

**File diff viewer modal**

### Dimensions
- **Width**: 90% of terminal width
- **Height**: 80% of terminal height
- **Position**: Centered
- **Border**: Round style, color `#6B50FF`

### Structure
```
╭───────────────────────────────────────────────────────────────────────────────────────────────╮
│                                         DIFF PREVIEW                                           │
│ src/components/Button.tsx                                              +15 -8 (3 hunks)       │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ @@ -10,6 +10,8 @@ import React from 'react';                                                    │
│                                                                                                │
│  10 │   const Button = ({ children, onClick }) => {                                           │
│  11 │     const [isHovered, setIsHovered] = useState(false);                                  │
│  12 │+    const [isPressed, setIsPressed] = useState(false);                                  │
│  13 │+    const theme = useTheme();                                                           │
│  14 │                                                                                         │
│  15 │     return (                                                                            │
│  16 │-      <button onClick={onClick}>                                                        │
│  17 │+      <button                                                                           │
│  18 │+        onClick={onClick}                                                               │
│  19 │+        onMouseDown={() => setIsPressed(true)}                                          │
│  20 │+        style={{ background: theme.primary }}                                           │
│  21 │+      >                                                                                 │
│  22 │         {children}                                                                      │
│                                                                                                │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [↑↓] Scroll • [←→] Prev/Next Hunk • [A] Apply • [R] Reject • [Esc] Close                     │
╰───────────────────────────────────────────────────────────────────────────────────────────────╯
```

### Diff Coloring
- Addition line number: Green `#629657`
- Addition symbol `+`: Green `#629657`
- Addition background: Dark green `#323931`
- Deletion line number: Red `#a45c59`
- Deletion symbol `-`: Red `#a45c59`
- Deletion background: Dark red `#383030`
- Context lines: Gray text, no background
- Hunk header `@@`: Purple `#6B50FF`

---

## O06: FilePickerOverlay (LEFT MONITOR - Modal)

**File/folder selection modal with tree view**

### Dimensions
- **Width**: 70 characters (fixed)
- **Height**: 60% of terminal height
- **Position**: Centered
- **Border**: Round style, color `#6B50FF`

### Structure
```
╭────────────────────────────────────────────────────────────────────────╮
│                              FILE PICKER                                │
├────────────────────────────────────────────────────────────────────────┤
│ Path: /Users/user/project/src/                              [Go Up ↑]  │
├────────────────────────────────────────────────────────────────────────┤
│ Filter: [search input]                                                  │
├────────────────────────────────────────────────────────────────────────┤
│   📁 components/                                                        │
│   📁 utils/                                                             │
│ ▶ 📄 app.tsx                                              2.4 KB       │
│   📄 index.ts                                             0.5 KB       │
│   📄 styles.css                                           1.2 KB       │
│   📄 types.ts                                             0.8 KB       │
│                                                                         │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│ [↑↓] Navigate • [Enter] Select • [Tab] Toggle Dir • [Esc] Cancel       │
╰────────────────────────────────────────────────────────────────────────╯
```

### Elements
- Current path: Breadcrumb style, truncated from left
- "Go Up" button: Right-aligned in path bar
- Filter input: For searching files
- Folder icon: `📁` yellow
- File icon: `📄` blue
- Selected row: `▶` indicator, bold text, highlighted background
- File size: Right-aligned, gray

---

## PARITY LABELS

When elements appear on BOTH monitors (e.g., status indicators, worker lists), use these parity labels:

| Element | LEFT Label | RIGHT Label | Sync Behavior |
|---------|------------|-------------|---------------|
| Worker Status | F03.5 WORKERS_LIST | F13 WORKER_STATE_BOARD | Real-time sync via IPC |
| Tool Activity | F04 (inline cards) | F14 TOOL_TIMELINE | Same data, different view |
| Connection Status | F02 STATUS_BAR | F10 MONITOR_HEADER | Identical state |
| Git Status | F03.2 GIT_STATUS | F16 GIT_ACTIVITY | Same repo, RIGHT has more detail |
| Browser State | F05.4 BROWSER_STATE | F17 BROWSER_STATE | Identical state |

---

## RESPONSIVE BEHAVIOR

### Compact Mode Triggers
- Terminal width < 80 columns
- Terminal height < 30 rows

### Compact Mode Changes
| Frame | Normal | Compact |
|-------|--------|---------|
| F01 ASCII_BANNER | Visible | Hidden |
| F03 SESSION_PANEL | 18 cols | Hidden |
| F05 CONTEXT_PANEL | 18 cols | Hidden |
| F02 STATUS_BAR | Full | Single line with gradient "FLOYD" |
| F12-F17 (Monitor) | 6-widget grid | Vertical stack, single column |

---

## FRAME HIERARCHY SUMMARY

```
LEFT MONITOR (P01 MainLayout)
├── F01 ASCII_BANNER (optional)
├── F02 STATUS_BAR
│   ├── Left section (branding, user, mode)
│   ├── Center section (cwd, connection)
│   └── Right section (agent status)
├── Content Area (3-pane)
│   ├── F03 SESSION_PANEL
│   │   ├── F03.1 REPO_INFO
│   │   ├── F03.2 GIT_STATUS
│   │   ├── F03.3 SAFETY_MODE
│   │   ├── F03.4 TOOLS_LIST
│   │   ├── F03.5 WORKERS_LIST
│   │   └── F03.6 QUICK_ACTIONS
│   ├── F04 TRANSCRIPT_PANEL (scrollable)
│   └── F05 CONTEXT_PANEL
│       ├── F05.1 CURRENT_PLAN
│       ├── F05.2 FILES_TOUCHED
│       ├── F05.3 OPEN_DIFFS
│       ├── F05.4 BROWSER_STATE
│       └── F05.5 QUICK_ACTIONS
└── F06 INPUT_AREA

RIGHT MONITOR (P02 MonitorLayout)
├── F10 MONITOR_HEADER
├── F11 ALERT_TICKER
├── Content Grid (2x3)
│   ├── F12 EVENT_STREAM (left, row 1)
│   ├── F13 WORKER_STATE_BOARD (right, row 1)
│   ├── F14 TOOL_TIMELINE (left, row 2)
│   ├── F15 SYSTEM_METRICS (right, row 2)
│   ├── F16 GIT_ACTIVITY (left, row 3)
│   └── F17 BROWSER_STATE (right, row 3)
└── F18 MONITOR_FOOTER

OVERLAYS (appear on LEFT, centered)
├── O01 HelpOverlay
├── O02 CommandPaletteOverlay
├── O03 PromptLibraryOverlay
├── O04 PermissionAskOverlay
├── O05 DiffPreviewOverlay
└── O06 FilePickerOverlay
```

---

## END OF SPECIFICATION

Use this document to generate visual templates. Each frame ID (F01, F02, etc.) and overlay ID (O01, O02, etc.) should be represented as a distinct visual region in the generated images for template scanning.
