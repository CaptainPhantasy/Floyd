```
CRUSH CLI - Complete Visual Design Specification

       Executive Summary

       CRUSH (by Charmbracelet) is "The glamourous AI coding agent for all" - a terminal-based AI coding assistant with a highly polished, distinctive visual design built on the Charm ecosystem (Bubble Tea, Lip Gloss, Glamour). The design features a
       sophisticated dark theme with the proprietary CharmTone color palette.

       Repository: https://github.com/charmbracelet/crush
       Color System: https://github.com/charmbracelet/x/blob/main/exp/charmtone/charmtone.go

       ---
       1. Complete Color Palette (CharmTone)

       1.1 Primary Theme Colors (Default Theme: "charmtone")
       ┌───────────┬────────────┬──────────┬───────────────────────────────────────┐
       │   Role    │ Color Name │ Hex Code │                 Usage                 │
       ├───────────┼────────────┼──────────┼───────────────────────────────────────┤
       │ Primary   │ Charple    │ #6B50FF  │ Primary accents, gradients, selection │
       ├───────────┼────────────┼──────────┼───────────────────────────────────────┤
       │ Secondary │ Dolly      │ #FF60FF  │ Secondary accents, "Charm" text       │
       ├───────────┼────────────┼──────────┼───────────────────────────────────────┤
       │ Tertiary  │ Bok        │ #68FFD6  │ Tertiary accents, prompts             │
       ├───────────┼────────────┼──────────┼───────────────────────────────────────┤
       │ Accent    │ Zest       │ #E8FE96  │ Highlights, emphasis                  │
       └───────────┴────────────┴──────────┴───────────────────────────────────────┘
       1.2 Background Colors
       ┌───────────────┬────────────┬──────────┬─────────────────────────────────┐
       │     Role      │ Color Name │ Hex Code │              Usage              │
       ├───────────────┼────────────┼──────────┼─────────────────────────────────┤
       │ BgBase        │ Pepper     │ #201F26  │ Main background                 │
       ├───────────────┼────────────┼──────────┼─────────────────────────────────┤
       │ BgBaseLighter │ BBQ        │ #2d2c35  │ Lighter background (diff lines) │
       ├───────────────┼────────────┼──────────┼─────────────────────────────────┤
       │ BgSubtle      │ Charcoal   │ #3A3943  │ Subtle backgrounds              │
       ├───────────────┼────────────┼──────────┼─────────────────────────────────┤
       │ BgOverlay     │ Iron       │ #4D4C57  │ Overlay backgrounds             │
       └───────────────┴────────────┴──────────┴─────────────────────────────────┘
       1.3 Foreground Colors
       ┌─────────────┬────────────┬──────────┬────────────────────────────┐
       │    Role     │ Color Name │ Hex Code │           Usage            │
       ├─────────────┼────────────┼──────────┼────────────────────────────┤
       │ FgBase      │ Ash        │ #DFDBDD  │ Primary text               │
       ├─────────────┼────────────┼──────────┼────────────────────────────┤
       │ FgMuted     │ Squid      │ #858392  │ Muted text (unfocused)     │
       ├─────────────┼────────────┼──────────┼────────────────────────────┤
       │ FgHalfMuted │ Smoke      │ #BFBCC8  │ Half-muted text            │
       ├─────────────┼────────────┼──────────┼────────────────────────────┤
       │ FgSubtle    │ Oyster     │ #605F6B  │ Subtle text (placeholders) │
       ├─────────────┼────────────┼──────────┼────────────────────────────┤
       │ FgSelected  │ Salt       │ #F1EFEF  │ Selected text              │
       └─────────────┴────────────┴──────────┴────────────────────────────┘
       1.4 Border Colors
       ┌─────────────┬────────────┬──────────┬─────────────────┐
       │    Role     │ Color Name │ Hex Code │      Usage      │
       ├─────────────┼────────────┼──────────┼─────────────────┤
       │ Border      │ Charcoal   │ #3A3943  │ Default borders │
       ├─────────────┼────────────┼──────────┼─────────────────┤
       │ BorderFocus │ Charple    │ #6B50FF  │ Focused borders │
       └─────────────┴────────────┴──────────┴─────────────────┘
       1.5 Status Colors
       ┌─────────┬────────────┬──────────┬───────────────────────────────────┐
       │  Role   │ Color Name │ Hex Code │               Usage               │
       ├─────────┼────────────┼──────────┼───────────────────────────────────┤
       │ Success │ Guac       │ #12C78F  │ Success states, online indicators │
       ├─────────┼────────────┼──────────┼───────────────────────────────────┤
       │ Error   │ Sriracha   │ #EB4268  │ Errors, offline/error indicators  │
       ├─────────┼────────────┼──────────┼───────────────────────────────────┤
       │ Warning │ Zest       │ #E8FE96  │ Warnings                          │
       ├─────────┼────────────┼──────────┼───────────────────────────────────┤
       │ Info    │ Malibu     │ #00A4FF  │ Info messages                     │
       └─────────┴────────────┴──────────┴───────────────────────────────────┘
       1.6 Complete CharmTone Color Reference

       REDS/PINKS:
       Coral      #FF577D    Salmon    #FF7F90    Cherry    #FF3888B
       Sriracha   #EB4268    Chili     #E23080    Bengal    #FF6E63

       PURPLES:
       Charple    #6B50FF    Dolly     #FF60FF    Blush     #FF84FF
       Violet     #C259FF    Mauve     #D46EFF    Grape     ##7134DD
       Plum       #9953FF    Orchid    #AD6EFF    Jelly     #4A30D9
       Hazy       #8B75FF    Prince    #9C35E1    Urchin    #C337E0

       BLUES:
       Malibu     #00A4FF    Sardine   #4FBEFE    Damson    #007AB8
       Thunder    #4776FF    Anchovy   #719AFC    Sapphire  #4949FF
       Guppy      #7272FF    Oceania   #2B55B3    Ox        #3331B2

       GREENS:
       Guac       #12C78F    Julep     #00FFB2    Bok       #68FFD6
       Pickle     #00A475    Gator     #18463D    Spinach   #1C3634

       YELLOWS:
       Zest       #E8FE96    Citron    #E8FF27    Mustard   ##F5EF34

       ORANGES/TANS:
       Cumin      #BF976F    Tang      #FF985A    Yam       #FFB587
       Paprika    #D36C64    Uni       #FF937D

       GRAYS:
       Pepper     #201F26    BBQ       ##2d2c35   Charcoal  ##3A3943
       Iron       ##4D4C57   Oyster    #605F6B    Squid     #858392
       Smoke      #BFBCC8    Ash       #DFDBDD    Salt      #F1EFEF
       Butter     ##FFFAF1

       CYANS/TEALS:
       Zinc       #10B1AE    Turtle    #0ADCD9    Lichen    #5CDFEA

       ---
       2. Typography Specifications

       2.1 Text Styles
       ┌──────────────┬──────────────────────────────────────────────┬───────────────────────────────┐
       │   Element    │               Font Properties                │            Example            │
       ├──────────────┼──────────────────────────────────────────────┼───────────────────────────────┤
       │ Title        │ Foreground(Accent) + Bold(true)              │ Bright green/yellow, bold     │
       ├──────────────┼──────────────────────────────────────────────┼───────────────────────────────┤
       │ Subtitle     │ Foreground(Secondary) + Bold(true)           │ Pink/purple, bold             │
       ├──────────────┼──────────────────────────────────────────────┼───────────────────────────────┤
       │ Text         │ Foreground(FgBase)                           │ Off-white default             │
       ├──────────────┼──────────────────────────────────────────────┼───────────────────────────────┤
       │ TextSelected │ Background(Primary) + Foreground(FgSelected) │ Purple background, white text │
       ├──────────────┼──────────────────────────────────────────────┼───────────────────────────────┤
       │ Muted        │ Foreground(FgMuted)                          │ Gray text                     │
       ├──────────────┼──────────────────────────────────────────────┼───────────────────────────────┤
       │ Subtle       │ Foreground(FgSubtle)                         │ Darker gray                   │
       └──────────────┴──────────────────────────────────────────────┴───────────────────────────────┘
       2.2 Markdown/Syntax Highlighting

       // Code block background (from theme.go)
       CodeBlock: {
           BackgroundColor: "#3A3943"  // Charcoal
           Color: "#3A3943"
       }

       // Syntax colors:
       Keywords:     "#00A4FF"  // Malibu (blue)
       Functions:    "#12C78F"  // Guac (green)
       Strings:      "#BF976F"  // Cumin (tan)
       Numbers:      "#00FFB2"  // Julep (bright green)
       Comments:     "#605F6B"  // Oyster (gray)
       Classes:      "#F1EFEF"  // Salt (white) + underline + bold
       Operators:    "#FF6E63"  // Bengal (orange)
       Punctuation:  "#E8FE96"  // Zest (yellow)

       ---
       3. Layout Structure

       3.1 Main Layout Components

       ┌─────────────────────────────────────────────────────────────┐
       │  HEADER: Charm™ CRUSH ╱╱╱╱╱╱ ╱ path • model% ctrl+d close    │
       ├──────────────┬──────────────────────────────────────────────┤
       │              │                                              │
       │   SIDEBAR    │           CHAT AREA                          │
       │              │                                              │
       │  ┌───────┐  │  ┌─────────────────────────────────────┐    │
       │  │ Logo  │  │  │ User Message                        │    │
       │  │ CRUSH │  │  └─────────────────────────────────────┘    │
       │  └───────┘  │                                              │
       │              │  ┌─────────────────────────────────────┐    │
       │  Session     │  │ Assistant Response                   │    │
       │  Title       │  │ (streaming markdown)                 │    │
       │              │  └─────────────────────────────────────┘    │
       │  ~/path      │                                              │
       │              │  ┌─────────────────────────────────────┐    │
       │  ◇ Model    │  │ Tool Call                           │    │
       │  Thinking on │  │ ● tool_name                         │    │
       │              │  └─────────────────────────────────────┘    │
       │  Files:      │                                              │
       │  - file.go   │  ════════════════════════════════════════   │
       │  - file.rs   │                                              │
       │              │  ◇ ModelName 5s                            │
       │  LSPs:       │                                              │
       │  ● gopls    │                                              │
       │  ● nil      │                                              │
       │              │                                              │
       │  MCPs:       │  ┌─────────────────────────────────────────┐│
       │  ● fs       │  │ > Ready!                                ││
       │              │  │ [multiline input area]                  ││
       │              │  └─────────────────────────────────────────┘│
       └──────────────┴──────────────────────────────────────────────┘

       3.2 Dimensions and Spacing
       ┌──────────────┬─────────────────────────┬─────────────────────────────┐
       │   Element    │      Width/Height       │       Padding/Spacing       │
       ├──────────────┼─────────────────────────┼─────────────────────────────┤
       │ Header       │ Full width              │ Padding(0, right, 0, left)  │
       ├──────────────┼─────────────────────────┼─────────────────────────────┤
       │ Sidebar      │ ~58 chars max (dynamic) │ Padding(1)                  │
       ├──────────────┼─────────────────────────┼─────────────────────────────┤
       │ Chat Area    │ Remaining width         │ Padding(1, 1, 0, 1)         │
       ├──────────────┼─────────────────────────┼─────────────────────────────┤
       │ Editor/Input │ Full width              │ Padding(1)                  │
       ├──────────────┼─────────────────────────┼─────────────────────────────┤
       │ Message Gap  │ -                       │ Gap(1) between messages     │
       ├──────────────┼─────────────────────────┼─────────────────────────────┤
       │ Logo Gap     │ -                       │ Gap(6) after logo on splash │
       └──────────────┴─────────────────────────┴─────────────────────────────┘
       ---
       4. Component Styles

       4.1 Header

       // Header styling (from header.go)
       "Charm™" → Foreground(Dolly)        // #FF60FF pink
       "CRUSH" → Gradient(Dolly → Charple) // Pink to purple
       "╱╱╱" → Foreground(Primary)        // #6B50FF purple

       Status icons:
       • Error count → Foreground(Sriracha)  // #EB4268 red
       • Token usage → Foreground(FgMuted)    // #858392 gray

       4.2 Messages

       User Message:
       PaddingLeft(1)
       BorderLeft(true)
       BorderStyle(focusedMessageBorder) // "▌" or normal
       BorderForeground(Primary)  // #6B50FF purple

       Assistant Message (unfocused):
       PaddingLeft(2)  // No border, just indent

       Assistant Message (focused):
       PaddingLeft(1)
       BorderLeft(true)
       BorderStyle(focusedMessageBorder)
       BorderForeground(GreenDark)  // #12C78F green

       4.3 Tool Calls

       // Status icons from icons.go
       ToolPending: "●"  // Solid circle
       ToolSuccess: "✓"  // Checkmark
       ToolError:   "×"  // X mark

       // Status colors
       ItemOfflineIcon: Foreground(Squid)   // #858392 gray
       ItemBusyIcon:    Foreground(Citron)  // #E8FF27 yellow
       ItemErrorIcon:   Foreground(Coral)   // #FF577D pink
       ItemOnlineIcon:  Foreground(Guac)    // #12C78F green

       4.4 Input/Editor

       Normal Mode Prompt:
       Focused:  "  > "  (first line)
       Focused:  "::: "  (subsequent lines, in Guac #12C78F)
       Blurred:  "::: "  (in Squid #858392)

       YOLO Mode Prompt:
       YoloIconFocused:  " ! "  Background(Citron) Foreground(Pepper)
       YoloIconBlurred:  " ! "  Background(Squid) Foreground(Pepper)
       YoloDotsFocused:  ":::"  Foreground(Zest)
       YoloDotsBlurred:  ":::"  Foreground(Squid)

       Placeholders:
       "Ready!", "Ready...", "Ready?", "Ready for instructions"
       "Working!", "Working...", "Brrrrr...", "Prrrrrrrr..."
       "Yolo mode!" (when permissions skipped)

       4.5 File Attachments

       // Attachment badge
       Background(FgMuted)  // #858392
       Foreground(FgBase)   // #DFDBDD
       Padding(0, 1)

       // Icon badge
       Background(Green)    // #12C78F
       Foreground(BgSubtle) // #3A3943
       Bold(true)

       // Icons
       TextIcon:  "☰"  (text files)
       ImageIcon: "■"  (images)

       // Delete mode
       Remove badge: Background(Red) #EB4268

       ---
       5. Animations and Transitions

       5.1 Loading/Thinking Animation

       // From anim.go
       Size: 15 frames
       GradColorA: Primary   // #6B50FF
       GradColorB: Secondary // #FF60FF
       CycleColors: true

       Labels: "Thinking", "Summarizing", "Working", etc.

       The animation creates a cycling gradient between purple (Charple) and pink (Dolly) for a "breathing" effect.

       5.2 Splash Screen Logo

       Logo Rendering:
       FieldColor:   Primary   // #6B50FF (diagonal lines)
       TitleColorA:  Secondary // #FF60FF (left gradient)
       TitleColorB:  Primary   // #6B50FF (right gradient)
       CharmColor:   Secondary // #FF60FF
       VersionColor: Primary   // #6B50FF

       The logo features:
       - Large stylized "CRUSH" text with horizontal gradient
       - Diagonal lines (╱) creating a dynamic field effect
       - One letter randomly "stretches" on each render
       - "Charm™" branding

       5.3 Gradient Text Function

       ApplyBoldForegroundGrad(text, color1, color2)
       // Creates horizontal gradient for text like "CRUSH"
       // Blends using HCL color space for smooth transitions

       ---
       6. Borders and Frames

       6.1 Border Characters

       // From icons.go
       BorderThin:  "│"  // Standard vertical border
       BorderThick: "▌"  // Half-block focused border

       // Focused message border
       focusedMessageBorder: lipgloss.Border{Left: "▌"}

       6.2 Diff View Colors

       // Insertions (green theme)
       LineNumber: "#629657" on "#2b322a"
       Symbol:     "#629657" on "#323931"
       Code:       Background("#323931")

       // Deletions (red theme)
       LineNumber: "#a45c59" on "#312929"
       Symbol:     "#a45c59" on "#383030"
       Code:       Background("#383030")

       ---
       7. Icons and Symbols

       7.1 Status Icons

       CheckIcon:    "✓"
       ErrorIcon:    "×"
       WarningIcon:  "⚠"
       InfoIcon:     "ⓘ"
       HintIcon:     "∵"
       SpinnerIcon:  "..."
       LoadingIcon:  "⟳"
       ImageIcon:    "■"
       TextIcon:     "☰"
       ModelIcon:    "◇"

       7.2 Section Dividers

       HorizontalRule: "\n--------\n"  // In Charcoal color
       Diagonal:        "╱" repeated   // Creates animated field effect

       ---
       8. Special Visual Features

       8.1 Gradient Branding

       The "CRUSH" title uses a horizontal gradient from Dolly (#FF60FF) to Charple (#6B50FF), applied character-by-character using HCL blending for smooth transitions.

       8.2 Adaptive Width Handling

       The logo and components automatically truncate with ansi.Truncate() and … ellipsis when space is limited.

       8.3 Compact Mode

       When height < 30 or width constrained:
       - Logo simplifies to single-line logo.SmallRender()
       - Sidebar sections render horizontally when width > height
       - Sections collapse to minimum 2 items each

       8.4 Dark-Only Theme

       The default theme is dark-only (IsDark: true). The design uses ANSI16 terminal color compatibility for better terminal support.

       ---
       9. Color Theme Implementation (Go Code Reference)

       // from internal/tui/styles/charmtone.go
       func NewCharmtoneTheme() *Theme {
           return &Theme{
               Name:   "charmtone",
               IsDark: true,

               Primary:   charmtone.Charple,  // #6B50FF
               Secondary: charmtone.Dolly,    // #FF60FF
               Tertiary:  charmtone.Bok,      // #68FFD6
               Accent:    charmtone.Zest,     // #E8FE96

               BgBase:        charmtone.Pepper,    // #201F26
               BgBaseLighter: charmtone.BBQ,       // #2d2c35
               BgSubtle:      charmtone.Charcoal,  // #3A3943
               BgOverlay:     charmtone.Iron,      // #4D4C57

               FgBase:      charmtone.Ash,    // #DFDBDD
               FgMuted:     charmtone.Squid,  // #858392
               FgHalfMuted: charmtone.Smoke,  // #BFBCC8
               FgSubtle:    charmtone.Oyster, // #605F6B
               FgSelected:  charmtone.Salt,   // #F1EFEF

               Border:      charmtone.Charcoal, // #3A3943
               BorderFocus: charmtone.Charple,  // #6B50FF

               Success: charmtone.Guac,      // #12C78F
               Error:   charmtone.Sriracha,  // #EB4268
               Warning: charmtone.Zest,      // #E8FE96
               Info:    charmtone.Malibu,    // #00A4FF
           }
       }

       ---
       10. Recreating the Style

       Key Design Principles

       1. Purple-Pink-Teal Triad: The signature look combines Charple (purple), Dolly (pink), and Guac/Julep (teal) accents
       2. Dark Background: Always use Pepper (#201F26) or BBQ (#2d2c35) for backgrounds
       3. Subtle Borders: Use Charcoal (#3A3943) for default borders, purple when focused
       4. Gradient Text: Apply horizontal gradients to titles for depth
       5. Status Indicators: Use colored circles ● for states (gray=offline, yellow=busy, green=online, red=error)
       6. Soft Muted Text: Squid (#858392) for unfocused/secondary information
       7. Bright Accents Only: Use bright colors (Zest, Julep, Bok) sparingly for emphasis

       Minimal Implementation Palette

       If you only need the essential colors:

       --bg-base:       #201F26;  /* Pepper */
       --bg-subtle:     #3A3943;  /* Charcoal */
       --fg-base:       #DFDBDD;  /* Ash */
       --fg-muted:      #858392;  /* Squid */
       --primary:       #6B50FF;  /* Charple - purple */
       --secondary:     #FF60FF;  /* Dolly - pink */
       --tertiary:      #68FFD6;  /* Bok - teal */
       --accent:        #E8FE96;  /* Zest - yellow */
       --success:       #12C78F;  /* Guac - green */
       --error:         #EB4268;  /* Sriracha - red */

       ---
       Sources

       - https://github.com/charmbracelet/crush
       - https://github.com/charmbracelet/x/blob/main/exp/charmtone/charmtone.go
       - https://charm.land/blog/crush-comes-home/
       - https://thenewstack.io/terminal-user-interfaces-review-of-crush-ex-opencode-al/
       - https://www.youtube.com/watch?v=kCcCxzCSf_w
       - https://github.com/charmbracelet/lipgloss
       - https://github.com/charmbracelet/bubbletea
  ⎿  Done (25 tool uses · 98.1k tokens · 7m 55s)
```
