# Floyd CLI FLOYD CURSE'M IDE Color Theme
# CRUSH Theme - Exact color match for INK/floyd-cli implementation

**Company:** Legacy AI
**Developer:** Douglas Talley

## Theme Name
**Floyd CRUSH** - Dark theme with vibrant purple-pink accents for FLOYD CURSE'M IDE

## Color Palette

### Background Colors
```json
{
  "base": "#201F26",      // Main background - Pepper
  "elevated": "#2d2c35", // Elevated elements - BBQ
  "overlay": "#3A3943",   // Overlay backgrounds - Charcoal
  "modal": "#4D4C57"      // Modal/Dialog backgrounds - Iron
}
```

### Text Colors
```json
{
  "primary": "#DFDBDD",    // Primary text - Ash
  "secondary": "#959AA2",  // Secondary text - Squid
  "tertiary": "#BFBCC8",   // Tertiary text - Smoke
  "subtle": "#706F7B",     // Subtle text - Oyster
  "selected": "#F1EFEF",   // Selected text - Salt
  "inverse": "#FFFAF1"     // Inverse text - Butter
}
```

### Primary Accent Colors
```json
{
  "primary": "#6B50FF",     // Primary accent - Charple (purple)
  "secondary": "#FF60FF",   // Secondary accent - Dolly (pink)
  "tertiary": "#68FFD6",    // Tertiary accent - Bok (teal)
  "highlight": "#E8FE96",   // Highlight accent - Zest (yellow)
  "info": "#00A4FF"         // Info accent - Malibu (blue)
}
```

### Status Colors
```json
{
  "ready": "#12C78F",       // Ready/Success - Guac (green)
  "working": "#6B50FF",     // Working/Processing - Charple (purple)
  "warning": "#E8FE96",     // Warning/Caution - Zest (yellow)
  "error": "#EB4268",       // Error/Critical - Sriracha (red)
  "blocked": "#FF60FF",      // Blocked/Waiting - Dolly (pink)
  "online": "#12C78F",       // Online/Connected - Guac (green)
  "offline": "#858392",      // Offline/Disconnected - Squid (gray)
  "busy": "#E8FF27"          // Busy/Processing - Citron (yellow-green)
}
```

## FLOYD CURSE'M IDE Theme Configuration

### Basic Color Mapping
```json
{
  "name": "Floyd CRUSH for FLOYD CURSE'M IDE",
  "type": "dark",
  "semanticTokenColors": {
    // Text
    "": "#DFDBDD",                          // Default - primary text

    // Keywords
    "keyword": "#FF60FF",                     // Secondary - Dolly pink
    "keyword.control": "#6B50FF",            // Primary - Charple purple
    "keyword.operator": "#FF60FF",           // Secondary - Dolly pink

    // Functions
    "entity.name.function": "#00A4FF",       // Info - Malibu blue
    "support.function": "#00A4FF",

    // Variables
    "variable": "#959AA2",                   // Secondary - Squid
    "variable.parameter": "#DFDBDD",

    // Types/Classes
    "type": "#68FFD6",                       // Tertiary - Bok teal
    "class": "#68FFD6",
    "interface": "#68FFD6",
    "enum": "#68FFD6",

    // Strings
    "string": "#12C78F",                     // Ready - Guac green
    "constant.other.string": "#12C78F",

    // Numbers
    "number": "#E8FE96",                     // Highlight - Zest yellow
    "constant.numeric": "#E8FE96",

    // Comments
    "comment": "#706F7B",                    // Subtle - Oyster gray

    // Decorators
    "decorator": "#C259FF",                  // Violet

    // Error highlighting
    "invalid": "#EB4268",                    // Error - Sriracha red
    "error": "#EB4268",

    // Warnings
    "keyword.warning": "#E8FE96",            // Warning - Zest yellow

    // Meta
    "meta": "#BFBCC8",                        // Tertiary - Smoke
    "tag": "#C259FF"                          // Violet
  },
  "colors": {
    "editor.background": "#201F26",
    "editor.foreground": "#DFDBDD",
    "editorLineNumber.foreground": "#706F7B",
    "editorLineNumber.activeForeground": "#959AA2",
    "editorCursor.foreground": "#6B50FF",
    "editor.selectionBackground": "#6B50FF40",
    "editor.inactiveSelectionBackground": "#6B50FF20",
    "editor.findMatchHighlightBackground": "#E8FE96",
    "editor.findMatchHighlightBorder": "#68FFD6",

    // Sidebar
    "sideBar.background": "#2d2c35",
    "sideBar.foreground": "#DFDBDD",
    "sideBarSectionHeader.background": "#3A3943",
    "sideBarSectionHeader.foreground": "#959AA2",

    // Activity Bar
    "activityBar.background": "#201F26",
    "activityBar.foreground": "#959AA2",
    "activityBar.inactiveForeground": "#706F7B",
    "activityBarBadge.background": "#6B50FF",
    "activityBarBadge.foreground": "#FFFFFF",

    // Panel
    "panel.background": "#201F26",
    "panel.border": "#3A3943",
    "panelTitle.activeForeground": "#FF60FF",
    "panelTitle.inactiveForeground": "#706F7B",

    // Tabs
    "tab.activeBackground": "#3A3943",
    "tab.activeForeground": "#FF60FF",
    "tab.inactiveBackground": "#201F26",
    "tab.inactiveForeground": "#706F7B",
    "tab.modifiedForeground": "#E8FE96",
    "tab.unfocusedActiveModifiedForeground": "#E8FE96",
    "tab.border": "#3A3943",

    // Status Bar
    "statusBar.background": "#2d2c35",
    "statusBar.foreground": "#959AA2",
    "statusBar.noFolderBackground": "#2d2c35",
    "statusBar.noFolderForeground": "#706F7B",

    // Buttons
    "button.background": "#6B50FF",
    "button.foreground": "#FFFFFF",
    "button.hoverBackground": "#FF60FF",
    "button.secondaryBackground": "#3A3943",
    "button.secondaryForeground": "#DFDBDD",
    "button.secondaryHoverBackground": "#4D4C57",

    // Input
    "input.background": "#2d2c35",
    "input.foreground": "#DFDBDD",
    "input.placeholderForeground": "#706F7B",
    "input.border": "#3A3943",
    "inputOption.activeBorder": "#6B50FF",
    "inputValidation.errorBorder": "#EB4268",

    // Lists
    "list.focusBackground": "#2d2c35",
    "list.focusForeground": "#DFDBDD",

    // Notifications
    "notificationsInfoIcon.foreground": "#12C78F",     // Success green
    "notificationsWarningIcon.foreground": "#E8FE96", // Warning yellow
    "notificationsErrorIcon.foreground": "#EB4268",    // Error red

    // Git
    "gitDecoration.addedForeground": "#12C78F",      // Success green
    "gitDecoration.modifiedForeground": "#E8FE96",   // Warning yellow
    "gitDecoration.deletedForeground": "#EB4268",     // Error red
    "gitDecoration.untrackedForeground": "#706F7B", // Subtle gray
    "gitDecoration.conflictingForeground": "#FF60FF", // Dolly pink

    // Diff
    "diffEditor.insertedTextBackground": "#323931",
    "diffEditor.insertedTextBorder": "#12C78F40",
    "diffEditor.removedTextBackground": "#383030",
    "diffEditor.removedTextBorder": "#EB426840",
    "diffEditor.insertedLineBackground": "#323931",
    "diffEditor.removedLineBackground": "#383030",

    // Minimap
    "minimap.background": "#2d2c35",
    "minimap.findMatchHighlightBackground": "#E8FE96",
    "minimap.selectionHighlightBackground": "#6B50FF40",
    "minimap.errorHighlightBackground": "#EB4268",
    "minimap.warningHighlightBackground": "#E8FE96",
    "minimapInfo.foreground": "#12C78F",

    // Scrollbar
    "scrollbarSlider.background": "#3A3943",
    "scrollbarSlider.hoverBackground": "#4D4C57",
    "scrollbarSlider.activeBackground": "#6B50FF",

    // Progress Bar
    "progressBar.background": "#3A3943",
    "progressBar.foreground": "#6B50FF"
  }
}
```

## Floyd CLI Specific UI Elements

| UI Element | Color | Hex Code | Usage |
|------------|-------|----------|-------|
| **Window Border** | Primary Accent | `#371DF4` | Outer border, panel borders |
| **Button Background** | Primary Accent | `#371DF4` | Interactive buttons (Chat, Tools, etc.) |
| **Button Text** | White | `#FFFFFF` | Text on purple buttons |
| **Sidebar Background** | Dark Purple | `#1C165E` | Left panel background |
| **Sidebar Text** | Light Purple | `#231991` | Labels (Chat, Tools, Workers) |
| **Main Background** | Dark Navy | `#0E111A` | Application background |
| **Primary Text** | Gray | `#5C5B62` | AI greeting, body text |
| **Success/Online** | Green | `#00FF00` | "Online" status, checkmarks |
| **Status Header** | Gradient | `#FF006E → #8338EC` | "FLOYD CLI" title gradient |

## Theme Philosophy

The Floyd CRUSH theme follows the **CRUSH principles**:
- **CharmUI**: High-contrast neon/pink aesthetics with personality
- **Rustic**: Dark backgrounds (`#0E111A`) for reduced eye strain
- **User-focused**: Clear visual hierarchy with purposeful color usage
- **Speedy**: Fast visual feedback with status colors (success=green, working=purple, error=red)
- **Hybrid**: Works across different terminal capabilities

## Implementation Notes

- Theme based on CharmTone color system from Charmbracelet
- Source: https://github.com/charmbracelet/x
- Extended palette includes 50+ semantic colors
- All colors have 10% increased contrast for accessibility
- Supports both dark mode (default) and role-based semantic coloring
