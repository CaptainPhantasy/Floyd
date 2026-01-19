# O04: PermissionAskOverlay - Tool Permission Request Modal

Generate a single image of terminal text output. Show ONLY the terminal contents - no window chrome, no title bar, no monitor bezel, no hardware, no desktop background. Pure terminal output as if screenshotted and cropped to just the text area.

## Terminal Dimensions
- 120 columns wide × 45 rows tall
- Monospace font (standard terminal font)
- Background color: `#201F26` (dark charcoal)

## Layout Description

This shows the MainLayout (P01) in the background, DIMMED/DARKENED to ~40% opacity, with a centered modal overlay on top.

## Modal Specifications
- Width: 80 characters exactly
- Height: 22 rows
- Position: Centered (20 chars from left edge, ~12 rows from top)
- Border: Double line (`═║╔╗╚╝╠╣`) in YELLOW `#E8FE96` (for MEDIUM RISK)
- Modal background: `#3A3943`

## Complete Terminal Output (120 × 45)

The dimmed P01 shows through around the modal. Modal is 80 chars wide, starting at column 20.

```
'########:'##::::::::'#######::'##:::'##:'########::::::'######::'##:::::::'####::::::::::::::::::::::::::::::::::::::
 ##.....:: ##:::::::'##.... ##:. ##:'##:: ##.... ##::::'##... ##: ##:::::::. ##:::::::::::::::::::::::::::::::::::::::
 ##::::::: ##::::::: ##:::: ##::. ####::: ##:::: ##:::: ##:::..:: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::
 ######::: ##::::::: ##:::: ##:::. ##:::: ##:::: ##:::: ##::::::: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::
 ##...:::: ##::::::: ##:::: ##:::: ##:::: ##:::: ##:::: ##::::::: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::
 ##::::::: ##::::::: ##:::: ##:::: ##:::: ##:::: ##:::: ##::: ##: ##:::::::: ##:::::::::::::::::::::::::::::::::::::::
 ##::::::: ########:. #######::::: ##:::: ########:::::. ######:: ########:'####::::::::::::::::::::::::::::::::::::::
..::::::::........:::.......::::::..:::::........:::::::......:::........::....:::::::::::::::::::::::::::::::::::::::
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ FLOYD CLI  douglas  [Chat]                .../FLOYD_CLI  ● Online                       ⠋ Pondering the code...      │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭── SESSION ───────╮╭───────────────────────────────────────────────────────────────────────────────────╮╭─── CONTEXT ──╮
│                  ││   ╔════════════════════════════════════════════════════════════════════════════╗  ││              │
│                  ││   ║ [CAUT] MEDIUM RISK                                             14:32:05    ║  ││              │
│                  ││   ╠════════════════════════════════════════════════════════════════════════════╣  ││              │
│                  ││   ║                                                                            ║  ││              │
│                  ││   ║ Tool Request: write_file                                                   ║  ││              │
│                  ││   ║                                                                            ║  ││              │
│                  ││   ║ This action requires your approval before proceeding.                      ║  ││              │
│                  ││   ║                                                                            ║  ││              │
│                  ││   ╠════════════════════════════════════════════════════════════════════════════╣  ││              │
│                  ││   ║ Arguments:                                                                 ║  ││              │
│                  ││   ║ ┌────────────────────────────────────────────────────────────────────────┐ ║  ││              │
│                  ││   ║ │   path: /src/components/Button.tsx                                     │ ║  ││              │
│                  ││   ║ │   content: import React from 'react';                                  │ ║  ││              │
│                  ││   ║ └────────────────────────────────────────────────────────────────────────┘ ║  ││              │
│                  ││   ║                                                                            ║  ││              │
│                  ││   ║ Why this risk level?                                                       ║  ││              │
│                  ││   ║   • Writing to source code directory                                       ║  ││              │
│                  ││   ║   • File modification operation                                            ║  ││              │
│                  ││   ║                                                                            ║  ││              │
│                  ││   ╠════════════════════════════════════════════════════════════════════════════╣  ││              │
│                  ││   ║ Remember this choice:                                                      ║  ││              │
│                  ││   ║   [X] Once (1)       [ ] Session (2)       [ ] Always (3)                  ║  ││              │
│                  ││   ╠════════════════════════════════════════════════════════════════════════════╣  ││              │
│                  ││   ║  ╔═════════════════════╗              ╔═════════════════════╗              ║  ││              │
│                  ││   ║  ║  [X] Approve (Once) ║              ║      [ ] Deny       ║              ║  ││              │
│                  ││   ║  ╚═════════════════════╝              ╚═════════════════════╝              ║  ││              │
│                  ││   ║                                                                            ║  ││              │
│                  ││   ║          Y/N • 1-3 Scope • Enter Confirm • Esc Deny                        ║  ││              │
│                  ││   ╚════════════════════════════════════════════════════════════════════════════╝  ││              │
│                  ││                                                                                   ││              │
╰──────────────────╯╰───────────────────────────────────────────────────────────────────────────────────╯╰──────────────╯
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ❯ _                                                                                                                   │
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Ctrl+P: Commands • Ctrl+/: Help • Esc: Exit                                                                           │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Color Mapping

**Background (P01 - Dimmed to ~40%):**
- All colors from P01 but darkened/faded

**Modal Border (Double Line):**
- MEDIUM RISK: Yellow `#E8FE96`
- LOW RISK: Green `#12C78F`  
- HIGH RISK: Red `#EB4268`

**Modal Header:**
- "[CAUT]": Yellow `#E8FE96`
- "MEDIUM RISK": Yellow `#E8FE96`, bold
- Timestamp: Gray `#706F7B`

**Tool Request:**
- "Tool Request:": Gray `#959AA2`
- "write_file": Pink `#FF60FF`, bold

**Description:**
- Text: Gray `#959AA2`

**Arguments Box:**
- Border `┌┐└┘`: Gray `#3A3943`
- "path:", "content:": Teal `#68FFD6`
- Values: White `#DFDBDD`

**Risk Reasons:**
- "Why this risk level?": Blue `#00A4FF`
- Bullet `•`: Gray `#706F7B`
- Reasons: Gray `#959AA2`

**Scope Selection:**
- "Remember this choice:": White `#DFDBDD`, bold
- `[X]` selected: Purple `#6B50FF`
- `[ ]` unselected: Gray `#706F7B`
- Labels: White `#DFDBDD`

**Action Buttons:**
- Approve button border (focused): Green `#12C78F`
- Approve text: Green `#12C78F`
- Deny button border (unfocused): Gray `#3A3943`
- Deny text: Gray `#706F7B`

**Keyboard Hints:**
- Text: Gray `#706F7B`
- Bullet separators `•`: Gray `#3A3943`

## Risk Level Variations

For **LOW RISK** (read operations):
- Border: Green `#12C78F`
- Badge: "[SAFE] LOW RISK"

For **HIGH RISK** (destructive operations):
- Border: Red `#EB4268`
- Badge: "[DANG] HIGH RISK"

## Important Notes
- Render ONLY terminal contents - no window frame
- Background P01 must be visibly dimmed
- Modal uses DOUBLE-LINE borders `═║╔╗╚╝╠╣`
- Modal border color matches risk level
- Button boxes use double borders too
- All 120-char lines, modal is 80 chars centered
- Use monospace font
