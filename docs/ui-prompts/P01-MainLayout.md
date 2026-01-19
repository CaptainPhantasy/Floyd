# P01: MainLayout - LEFT MONITOR

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

## Complete Layout (120 columns × 45 rows)

Each line below is EXACTLY 120 characters. The three-panel body uses:
- SESSION: 20 chars (│ + 18 content + │)
- TRANSCRIPT: 83 chars (│ + 81 content + │)
- CONTEXT: 17 chars (│ + 15 content + │)
- Junctions share: ╮╭ or ││ or ╯╰ (2 chars)

```
'########:'##::::::::'#######::'##:::'##:'########::::::'######::'##:::::::'####::::::::::::::::::::::::::::::::::::::::
 ##.....:: ##:::::::'##.... ##:. ##:'##:: ##.... ##::::'##... ##: ##:::::::. ##:::::::::::::::::::::::::::::::::::::::::
 ##::::::: ##::::::: ##:::: ##::. ####::: ##:::: ##:::: ##:::..:: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::::
 ######::: ##::::::: ##:::: ##:::. ##:::: ##:::: ##:::: ##::::::: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::::
 ##...:::: ##::::::: ##:::: ##:::: ##:::: ##:::: ##:::: ##::::::: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::::
 ##::::::: ##::::::: ##:::: ##:::: ##:::: ##:::: ##:::: ##::: ##: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::::
 ##::::::: ########:. #######::::: ##:::: ########:::::. ######:: ########:'####::::::::::::::::::::::::::::::::::::::::
..::::::::........:::.......::::::..:::::........:::::::......:::........::....:::::::::::::::::::::::::::::::::::::::::
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ FLOYD CLI  douglas  [Chat]                  .../FLOYD_CLI  ● Online                      ⠋ Pondering the code...     │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭── SESSION ───────╮╭───────────────────────────────────────────────────────────────────────────────────╮╭── CONTEXT ──╮
│ • floyd-cli      ││ > User:                                                             14:32:01     ││ CURRENT PLAN │
│   (TS+Ink+MCP)   ││   Can you help me refactor the Button component?                                 ││ [x] Read cmp │
│                  ││                                                                                  ││ [ ] Find bug │
│ Git: main ●clean ││ < Assistant:                                                        14:32:05     ││ [ ] Refactor │
│                  ││   I'll help you refactor the Button component. Let me first read                 ││ [ ] Test     │
│ Safety:          ││   the current implementation.                                                    ││              │
│ ┌──────────────┐ ││                                                                                  ││ FILES        │
│ │   YOLO OFF   │ ││   ┌─────────────────────────────────────────────────────────────────────────┐    ││ • Button.tsx │
│ └──────────────┘ ││   │ ⚙ read_file                                                ● 124ms      │    ││ • index.ts   │
│                  ││   │   path: src/components/Button.tsx                                       │    ││              │
│ TOOLS            ││   │   ✓ Success                                                             │    ││ DIFFS        │
│ [✓] FS      [ON] ││   └─────────────────────────────────────────────────────────────────────────┘    ││ 2 (45 lines) │
│ [✓] Patch   [ON] ││                                                                                  ││              │
│ [✓] Runner  [ON] ││   I can see the component uses class-based patterns. Here are my                 ││ BROWSER      │
│ [✓] Git     [ON] ││   suggestions for modernizing it:                                                ││ local   [✓]  │
│ [x] Chrome [OFF] ││                                                                                  ││ owned: 1     │
│                  ││   1. Convert to functional component with hooks                                  ││              │
│ WORKERS          ││   2. Extract logic into custom hooks                                             ││ QUICK ACTS   │
│ ● Coder  Working ││   3. Add TypeScript generics for type safety                                     ││ ^P  Palette  │
│ ○ Browser  Idle  ││                                                                                  ││ ^/  Help     │
│                  ││   Let me start with the conversion...▋                                           ││ ^Y  YOLO     │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
│                  ││                                                                                  ││              │
╰──────────────────╯╰──────────────────────────────────────────────────────────────────────────────────╯╰──────────────╯
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ❯ _                                                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Ctrl+P: Commands • Ctrl+/: Help • Esc: Exit                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Color Mapping

Apply these colors to the layout above:

**ASCII Banner (rows 1-8):**
- `#` characters: Pink `#FF60FF`
- `:` characters: Blue `#6060FF`
- `.` characters: Gray `#666666`
- `'` characters: Gray `#888888`

**Status Bar (rows 9-11):**
- "FLOYD" letters: Gradient (F=`#FF60FF`, L=`#6060FF`, O=`#B85CFF`, Y=`#9054FF`, D=`#6B50FF`)
- "CLI": Gray `#959AA2`
- "douglas": Green `#12C78F`
- "[Chat]": Purple background `#6B50FF`, white text
- Path ".../FLOYD_CLI": Gray `#706F7B`
- "● Online": Green `#12C78F`
- "⠋ Pondering the code...": Yellow `#E8FE96`
- Border: Purple `#6B50FF`

**SESSION Panel (left, 20 chars wide):**
- "SESSION" in header: Purple `#6B50FF`
- "• floyd-cli": Purple `#6B50FF`
- "(TS+Ink+MCP)": Gray `#706F7B`
- "Git:" label: White `#DFDBDD`
- "main": Blue `#00A4FF`
- "●clean": Green `#12C78F`
- "YOLO OFF" box border: Green `#12C78F`
- "TOOLS": Pink `#FF60FF`
- "[✓]": Green `#12C78F`
- "[x]": Red `#EB4268`
- "[ON]": Green `#12C78F`
- "[OFF]": Gray `#706F7B`
- "WORKERS": Teal `#68FFD6`
- "● Coder Working": Purple `#6B50FF`
- "○ Browser Idle": Gray `#858392`
- All borders: Purple `#6B50FF`

**TRANSCRIPT Panel (center, 83 chars wide):**
- "> User:": Green `#12C78F`
- "< Assistant:": Blue `#00A4FF`
- Timestamps: Gray `#706F7B`
- Message content: White `#DFDBDD`
- Tool card border: Gray `#3A3943`
- "⚙": Teal `#68FFD6`
- "read_file": White `#DFDBDD`
- "● 124ms": Purple dot `#6B50FF`, gray text
- "✓ Success": Green `#12C78F`
- Cursor "▋": White `#DFDBDD`
- All borders: Purple `#6B50FF`

**CONTEXT Panel (right, 17 chars wide):**
- "CONTEXT" in header: Purple `#6B50FF`
- "CURRENT PLAN": Purple `#6B50FF`
- "[x]": Green `#12C78F` with dimmed text
- "[ ]": Gray brackets, white text
- "FILES": Pink `#FF60FF`
- "DIFFS": Teal `#68FFD6`
- "BROWSER": Blue `#00A4FF`
- "[✓]": Green `#12C78F`
- "QUICK ACTS": Yellow `#E8FE96`
- Shortcuts (^P, ^/, ^Y): Purple `#6B50FF`
- All borders: Purple `#6B50FF`

**Input Area (bottom, full width):**
- "❯" prompt: Green `#12C78F`
- Cursor "_": White `#DFDBDD`
- Hint text: Gray `#706F7B`
- Border: Gray `#3A3943`

## Important Notes
- Render ONLY the terminal text - no window frame
- Each line is exactly 120 characters
- Use monospace font for perfect alignment
- Box-drawing chars: `─│╭╮╰╯┌┐└┘├┤`
