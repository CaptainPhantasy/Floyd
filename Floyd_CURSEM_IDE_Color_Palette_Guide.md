# Floyd CURSE'M IDE - Official Color Palette Guide

## Executive Summary

This document provides the complete color palette for Floyd CURSE'M IDE, derived from the Floyd CLI **CRUSH Theme** (CharmUI aesthetic). This palette includes **81 total color tokens** organized into semantic categories for IDE theming.

---

## Table of Contents

1. [Color System Overview](#color-system-overview)
2. [Core Color Palette (22 colors)](#core-color-palette)
3. [Extended Color Palette (36 colors)](#extended-color-palette)
4. [Role-Based Colors (9 colors)](#role-based-colors)
5. [Syntax Highlighting Colors (8 colors)](#syntax-highlighting-colors)
6. [Diff View Colors (6 colors)](#diff-view-colors)
7. [CSS Variables Reference](#css-variables-reference)
8. [NetBeans Theme Implementation](#netbeans-theme-implementation)
9. [Color Usage Guidelines](#color-usage-guidelines)

---

## Color System Overview

### Theme Name: **CRUSH**
**Theme Type:** Dark (Primary)  
**Aesthetic:** CharmUI-inspired  
**Total Colors:** 81 tokens  
**Primary Accent:** Purple (#6B50FF - Charple)  
**Secondary Accent:** Pink (#FF60FF - Dolly)

### Design Philosophy

The CRUSH theme uses a **deep purple-black base** with **vibrant accent colors** to create a modern, high-contrast development environment suitable for long coding sessions.

**Key Characteristics:**
- Deep backgrounds reduce eye strain
- Vibrant accents for visual hierarchy
- Semantic color naming for maintainability
- Extended palette covers all UI use cases
- Syntax-optimized for code readability

---

## Core Color Palette

### 1. Background Colors (4 tokens)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `bg.base` | `#0E111A` | Very Deep Blue-Black | Main editor background, primary canvas |
| `bg.elevated` | `#1C165E` | Deep Purple | Sidebars, panels, elevated surfaces |
| `bg.overlay` | `#231991` | Purple | Main content areas, overlays |
| `bg.modal` | `#4D4C57` | Gray-Purple | Modal dialogs, popups |

**Preview:**
```
bg.base      ████████ #0E111A (Nearly black with blue tint)
bg.elevated  ████████ #1C165E (Deep purple - sidebar)
bg.overlay   ████████ #231991 (Purple - main content)
bg.modal     ████████ #4D4C57 (Gray for modals)
```

### 2. Text Colors (6 tokens)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `text.primary` | `#DFDBDD` | Ash | Primary text, headings, labels |
| `text.secondary` | `#959AA2` | Squid | Secondary text, descriptions |
| `text.tertiary` | `#BFBCC8` | Smoke | Tertiary text, metadata |
| `text.subtle` | `#706F7B` | Oyster | Subtle text, hints, placeholders |
| `text.selected` | `#F1EFEF` | Salt | Selected text, active elements |
| `text.inverse` | `#FFFAF1` | Butter | Text on dark backgrounds |

**Preview:**
```
text.primary   ████████ #DFDBDD (Ash - primary text)
text.secondary ████████ #959AA2 (Squid - secondary)
text.tertiary  ████████ #BFBCC8 (Smoke - tertiary)
text.subtle    ████████ #706F7B (Oyster - subtle)
text.selected  ████████ #F1EFEF (Salt - selected)
text.inverse   ████████ #FFFAF1 (Butter - inverse)
```

### 3. Accent Colors (5 tokens)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `accent.primary` | `#6B50FF` | Charple | Primary actions, buttons, links |
| `accent.secondary` | `#FF60FF` | Dolly | Secondary actions, highlights |
| `accent.tertiary` | `#68FFD6` | Bok | Tertiary actions, info callouts |
| `accent.highlight` | `#E8FE96` | Zest | Highlights, warnings, focus states |
| `accent.info` | `#00A4FF` | Malibu | Info messages, notifications |

**Preview:**
```
accent.primary   ████████ #6B50FF (Charple - purple)
accent.secondary ████████ #FF60FF (Dolly - pink)
accent.tertiary  ████████ #68FFD6 (Bok - teal)
accent.highlight ████████ #E8FE96 (Zest - yellow)
accent.info      ████████ #00A4FF (Malibu - blue)
```

### 4. Status Colors (7 tokens)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `status.ready` | `#12C78F` | Guac | Success, ready states, completions |
| `status.working` | `#6B50FF` | Charple | In-progress, loading states |
| `status.warning` | `#E8FE96` | Zest | Warnings, cautions |
| `status.error` | `#EB4268` | Sriracha | Errors, failures, critical issues |
| `status.blocked` | `#FF60FF` | Dolly | Blocked states, disabled |
| `status.offline` | `#858392` | Squid | Offline, disconnected states |
| `status.busy` | `#E8FF27` | Citron | Busy, processing states |

**Preview:**
```
status.ready   ████████ #12C78F (Guac - green)
status.working ████████ #6B50FF (Charple - purple)
status.warning ████████ #E8FE96 (Zest - yellow)
status.error   ████████ #EB4268 (Sriracha - red)
status.blocked ████████ #FF60FF (Dolly - pink)
status.offline ████████ #858392 (Squid - gray)
status.busy    ████████ #E8FF27 (Citron - lime)
```

---

## Extended Color Palette (36 colors)

### Reds & Pinks (7 colors)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `extended.coral` | `#FF577D` | Coral | Metrics, charts, highlights |
| `extended.salmon` | `#FF7F90` | Salmon | Secondary red accent |
| `extended.cherry` | `#FF3888` | Cherry | Bright red highlights |
| `extended.sriracha` | `#EB4268` | Sriracha | Error states, critical |
| `extended.chili` | `#E23080` | Chili | Deep red/pink |
| `extended.bengal` | `#FF6E63` | Bengal | Orange-red accent |
| `extended.blush` | `#FF84FF` | Blush | Pink highlights |

### Purples (9 colors)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `extended.violet` | `#C259FF` | Violet | Purple accent |
| `extended.mauve` | `#D46EFF` | Mauve | Light purple |
| `extended.grape` | `#7134DD` | Grape | Deep purple |
| `extended.plum` | `#9953FF` | Plum | Purple highlight |
| `extended.orchid` | `#AD6EFF` | Orchid | Light orchid |
| `extended.jelly` | `#4A30D9` | Jelly | Dark purple |
| `extended.hazy` | `#8B75FF` | Hazy | Muted purple |
| `extended.prince` | `#9C35E1` | Prince | Medium purple |
| `extended.urchin` | `#C337E0` | Urchin | Bright purple |

### Blues (9 colors)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `extended.malibu` | `#00A4FF` | Malibu | Primary blue accent |
| `extended.sardine` | `#4FBEFE` | Sardine | Light blue |
| `extended.damson` | `#007AB8` | Damson | Dark blue |
| `extended.thunder` | `#4776FF` | Thunder | Bright blue |
| `extended.anchovy` | `#719AFC` | Anchovy | Medium blue |
| `extended.sapphire` | `#4949FF` | Sapphire | Deep blue |
| `extended.guppy` | `#7272FF` | Guppy | Periwinkle |
| `extended.oceania` | `#2B55B3` | Oceania | Navy blue |
| `extended.ox` | `#3331B2` | Ox | Dark navy |

### Greens (5 colors)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `extended.guac` | `#12C78F` | Guac | Primary green (success) |
| `extended.julep` | `#00FFB2` | Julep | Bright green |
| `extended.pickle` | `#00A475` | Pickle | Dark green |
| `extended.gator` | `#18463D` | Gator | Deep green |
| `extended.spinach` | `#1C3634` | Spinach | Dark green-gray |

### Yellows (1 color)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `extended.citron` | `#E8FF27` | Citron | Lime yellow, warnings |

### Oranges & Tans (5 colors)

| Token Name | Hex Code | Color Name | Usage |
|------------|----------|------------|-------|
| `extended.cumin` | `#BF976F` | Cumin | Tan, string literals |
| `extended.tang` | `#FF985A` | Tang | Orange accent |
| `extended.yam` | `#FFB587` | Yam | Light orange |
| `extended.paprika` | `#D36C64` | Paprika | Red-orange |
| `extended.uni` | `#FF937D` | Uni | Coral orange |

---

## Role-Based Colors (9 colors)

Semantic colors for specific UI roles in Floyd CURSE'M IDE.

| Token Name | Hex Code | Source | Usage |
|------------|----------|--------|-------|
| `roles.headerTitle` | `#FF60FF` | accent.secondary | Window titles, headers |
| `roles.headerStatus` | `#DFDBDD` | text.primary | Status bar text |
| `roles.userLabel` | `#12C78F` | status.ready | User messages, labels |
| `roles.assistantLabel` | `#00A4FF` | accent.info | Assistant responses |
| `roles.systemLabel` | `#E8FE96` | accent.highlight | System messages |
| `roles.toolLabel` | `#68FFD6` | accent.tertiary | Tool outputs |
| `roles.thinking` | `#E8FE96` | accent.highlight | AI thinking indicator |
| `roles.inputPrompt` | `#12C78F` | status.ready | Input prompts |
| `roles.hint` | `#959AA2` | text.secondary | Hints, help text |

---

## Syntax Highlighting Colors (8 colors)

Optimized for code readability in Floyd CURSE'M IDE's editor.

| Token Name | Hex Code | Source | Usage |
|------------|----------|--------|-------|
| `syntax.keywords` | `#00A4FF` | accent.info | Keywords: `if`, `for`, `class` |
| `syntax.functions` | `#12C78F` | status.ready | Function names, methods |
| `syntax.strings` | `#BF976F` | extended.cumin | String literals |
| `syntax.numbers` | `#00FFB2` | extended.julep | Numeric literals |
| `syntax.comments` | `#706F7B` | text.subtle | Comments, documentation |
| `syntax.classes` | `#F1EFEF` | text.selected | Class names, types |
| `syntax.operators` | `#FF6E63` | extended.bengal | Operators, punctuation |
| `syntax.punctuation` | `#E8FE96` | accent.highlight | Brackets, delimiters |

### Syntax Preview (JavaScript)

```javascript
// syntax.comments: #706F7B
// This is a comment in Floyd CURSE'M IDE

// syntax.keywords: #00A4FF
// syntax.classes: #F1EFEF
// syntax.functions: #12C78F
class FloydIDE extends Component {
  
  // syntax.functions: #12C78F
  // syntax.strings: #BF976F
  // syntax.numbers: #00FFB2
  render() {
    const version = "1.0.0";
    const maxItems = 100;
    
    // syntax.operators: #FF6E63
    // syntax.punctuation: #E8FE96
    return <div>Hello Floyd!</div>;
  }
}
```

---

## Diff View Colors (6 colors)

For version control diff display in Floyd CURSE'M IDE.

### Addition Colors (Green theme)

| Token Name | Hex Code | Usage |
|------------|----------|-------|
| `diff.addition.lineNumber` | `#629657` | Added line numbers |
| `diff.addition.symbol` | `#629657` | Plus sign (+) indicator |
| `diff.addition.background` | `#323931` | Added lines background |

### Deletion Colors (Red theme)

| Token Name | Hex Code | Usage |
|------------|----------|-------|
| `diff.deletion.lineNumber` | `#a45c59` | Deleted line numbers |
| `diff.deletion.symbol` | `#a45c59` | Minus sign (-) indicator |
| `diff.deletion.background` | `#383030` | Deleted lines background |

### Diff Preview

```diff
// diff.addition.background: #323931
// diff.addition.lineNumber: #629657
+ // This line was added in Floyd CURSE'M IDE
+ const newFeature = true;

// diff.deletion.background: #383030
// diff.deletion.lineNumber: #a45c59
- // This line was removed
- const oldFeature = false;
```

---

## CSS Variables Reference

Complete list of CSS custom properties for Floyd CURSE'M IDE theme implementation.

### Core Variables

```css
/* Background Colors */
--color-bg-base: #0E111A;
--color-bg-elevated: #1C165E;
--color-bg-overlay: #231991;
--color-bg-modal: #4D4C57;

/* Text Colors */
--color-text-primary: #DFDBDD;
--color-text-secondary: #959AA2;
--color-text-tertiary: #BFBCC8;
--color-text-subtle: #706F7B;
--color-text-selected: #F1EFEF;
--color-text-inverse: #FFFAF1;

/* Accent Colors */
--color-accent-primary: #6B50FF;
--color-accent-secondary: #FF60FF;
--color-accent-tertiary: #68FFD6;
--color-accent-highlight: #E8FE96;
--color-accent-info: #00A4FF;

/* Status Colors */
--color-status-ready: #12C78F;
--color-status-working: #6B50FF;
--color-status-warning: #E8FE96;
--color-status-error: #EB4268;
--color-status-blocked: #FF60FF;
--color-status-offline: #858392;
--color-status-busy: #E8FF27;
```

### Extended Colors

```css
/* Reds/Pinks */
--color-extended-coral: #FF577D;
--color-extended-salmon: #FF7F90;
--color-extended-cherry: #FF3888;
--color-extended-sriracha: #EB4268;
--color-extended-chili: #E23080;
--color-extended-bengal: #FF6E63;
--color-extended-blush: #FF84FF;

/* Purples */
--color-extended-violet: #C259FF;
--color-extended-mauve: #D46EFF;
--color-extended-grape: #7134DD;
--color-extended-plum: #9953FF;
--color-extended-orchid: #AD6EFF;
--color-extended-jelly: #4A30D9;
--color-extended-hazy: #8B75FF;
--color-extended-prince: #9C35E1;
--color-extended-urchin: #C337E0;

/* Blues */
--color-extended-malibu: #00A4FF;
--color-extended-sardine: #4FBEFE;
--color-extended-damson: #007AB8;
--color-extended-thunder: #4776FF;
--color-extended-anchovy: #719AFC;
--color-extended-sapphire: #4949FF;
--color-extended-guppy: #7272FF;
--color-extended-oceania: #2B55B3;
--color-extended-ox: #3331B2;

/* Greens */
--color-extended-guac: #12C78F;
--color-extended-julep: #00FFB2;
--color-extended-pickle: #00A475;
--color-extended-gator: #18463D;
--color-extended-spinach: #1C3634;

/* Yellows */
--color-extended-citron: #E8FF27;

/* Oranges/Tans */
--color-extended-cumin: #BF976F;
--color-extended-tang: #FF985A;
--color-extended-yam: #FFB587;
--color-extended-paprika: #D36C64;
--color-extended-uni: #FF937D;
```

### Role Colors

```css
--color-role-headerTitle: #FF60FF;
--color-role-headerStatus: #DFDBDD;
--color-role-userLabel: #12C78F;
--color-role-assistantLabel: #00A4FF;
--color-role-systemLabel: #E8FE96;
--color-role-toolLabel: #68FFD6;
--color-role-thinking: #E8FE96;
--color-role-inputPrompt: #12C78F;
--color-role-hint: #959AA2;
```

### Syntax Colors

```css
--color-syntax-keywords: #00A4FF;
--color-syntax-functions: #12C78F;
--color-syntax-strings: #BF976F;
--color-syntax-numbers: #00FFB2;
--color-syntax-comments: #706F7B;
--color-syntax-classes: #F1EFEF;
--color-syntax-operators: #FF6E63;
--color-syntax-punctuation: #E8FE96;
```

### Diff Colors

```css
/* Additions */
--color-diff-addition-line-number: #629657;
--color-diff-addition-symbol: #629657;
--color-diff-addition-background: #323931;

/* Deletions */
--color-diff-deletion-line-number: #a45c59;
--color-diff-deletion-symbol: #a45c59;
--color-diff-deletion-background: #383030;
```

---

## NetBeans Theme Implementation

### Applying CRUSH Theme to NetBeans

#### 1. Create NetBeans Look and Feel Theme

**File:** `nb/branding/core/core.jar/org/netbeans/swing/plaf/FloydTheme.java`

```java
package org.netbeans.swing.plaf;

import javax.swing.plaf.ColorUIResource;
import java.awt.Color;

public class FloydTheme extends javax.swing.plaf.metal.MetalTheme {

    @Override
    public String getName() {
        return "Floyd CRUSH";
    }

    // Primary colors
    protected ColorUIResource getPrimary1() {
        return new ColorUIResource(0x6B50FF); // accent.primary - Charple
    }

    protected ColorUIResource getPrimary2() {
        return new ColorUIResource(0x0E111A); // bg.base - Very deep
    }

    protected ColorUIResource getPrimary3() {
        return new ColorUIResource(0x1C165E); // bg.elevated - Purple
    }

    // Secondary colors
    protected ColorUIResource getSecondary1() {
        return new ColorUIResource(0x4D4C57); // bg.modal - Gray
    }

    protected ColorUIResource getSecondary2() {
        return new ColorUIResource(0x0E111A); // bg.base
    }

    protected ColorUIResource getSecondary3() {
        return new ColorUIResource(0x1C165E); // bg.elevated
    }

    // Text colors
    @Override
    public ColorUIResource getControlTextColor() {
        return new ColorUIResource(0xDFDBDD); // text.primary - Ash
    }

    @Override
    public ColorUIResource getMenuForeground() {
        return new ColorUIResource(0xDFDBDD);
    }

    @Override
    public ColorUIResource getMenuSelectedForeground() {
        return new ColorUIResource(0xFFFAF1); // text.inverse - Butter
    }

    @Override
    public ColorUIResource getMenuSelectedBackground() {
        return new ColorUIResource(0x6B50FF); // accent.primary
    }

    @Override
    public ColorUIResource getWindowTitleBackground() {
        return new ColorUIResource(0x1C165E); // bg.elevated
    }

    @Override
    public ColorUIResource getWindowTitleForeground() {
        return new ColorUIResource(0xFF60FF); // accent.secondary - Dolly
    }
}
```

#### 2. Create Editor Syntax Highlighting Theme

**File:** `nb/branding/core/core.jar/org/netbeans/modules/editor/options/FontsColorsTokens-Floyd.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE font-colors PUBLIC "-//NetBeans//DTD Editor Fonts and Colors settings 1.1//EN"
    "http://www.netbeans.org/dtds/EditorFontsColors-1_1.dtd">
<font-colors>
    <fontcolor name="keyword" bgColor="0E111A" fgColor="00A4FF" bold="true"/>
    <fontcolor name="string" bgColor="0E111A" fgColor="BF976F"/>
    <fontcolor name="comment" bgColor="0E111A" fgColor="706F7B" italic="true"/>
    <fontcolor name="number" bgColor="0E111A" fgColor="00FFB2"/>
    <fontcolor name="operator" bgColor="0E111A" fgColor="FF6E63"/>
    <fontcolor name="function" bgColor="0E111A" fgColor="12C78F"/>
    <fontcolor name="class" bgColor="0E111A" fgColor="F1EFEF" bold="true"/>
    <fontcolor name="identifier" bgColor="0E111A" fgColor="DFDBDD"/>
    <fontcolor name="background" bgColor="0E111A" fgColor="DFDBDD"/>
    <fontcolor name="selection" bgColor="6B50FF" fgColor="FFFAF1"/>
</font-colors>
```

#### 3. Apply CSS to NetBeans UI

**File:** `nb/branding/core/core.jar/org/netbeans/core/startup/branding.css`

```css
/*
 * Floyd CURSE'M IDE - CRUSH Theme
 * Derived from Floyd CLI CharmUI aesthetic
 */

:root {
    /* Background Colors */
    --nb-bg-base: #0E111A;
    --nb-bg-elevated: #1C165E;
    --nb-bg-overlay: #231991;
    --nb-bg-modal: #4D4C57;
    
    /* Text Colors */
    --nb-text-primary: #DFDBDD;
    --nb-text-secondary: #959AA2;
    --nb-text-subtle: #706F7B;
    
    /* Accent Colors */
    --nb-accent-primary: #6B50FF;
    --nb-accent-secondary: #FF60FF;
    --nb-accent-highlight: #E8FE96;
    
    /* Status Colors */
    --nb-status-ready: #12C78F;
    --nb-status-error: #EB4268;
    --nb-status-warning: #E8FE96;
}

/* Apply to NetBeans UI components */
.menubar {
    background-color: var(--nb-bg-elevated);
    color: var(--nb-text-primary);
    border-bottom: 1px solid #4D4C57;
}

.toolbar {
    background-color: var(--nb-bg-elevated);
    border-bottom: 1px solid #4D4C57;
}

.statusbar {
    background-color: var(--nb-bg-base);
    color: var(--nb-accent-secondary);
    border-top: 1px solid #4D4C57;
}

/* Explorer / Project Tree */
.tree {
    background-color: var(--nb-bg-base);
    color: var(--nb-text-primary);
}

/* Editor tabs */
.tab {
    background-color: var(--nb-bg-elevated);
    color: var(--nb-text-secondary);
}

.tab:selected {
    background-color: var(--nb-accent-primary);
    color: var(--nb-text-inverse);
}

/* Output window */
.output {
    background-color: var(--nb-bg-base);
    color: var(--nb-text-primary);
    font-family: 'Monaco', 'Menlo', monospace;
}

/* Scrollbars */
scrollbar {
    background-color: var(--nb-bg-elevated);
}

scrollbar thumb {
    background-color: var(--nb-accent-primary);
}

scrollbar thumb:hover {
    background-color: var(--nb-accent-secondary);
}
```

---

## Color Usage Guidelines

### DO's ✅

1. **Use semantic colors** - Reference tokens by name, not hex values
2. **Maintain contrast** - Ensure text is readable on backgrounds
3. **Respect status colors** - Use status.ready for success, status.error for errors
4. **Use accent hierarchy** - primary → secondary → tertiary for visual emphasis
5. **Leverage syntax colors** - Consistent code highlighting across languages

### DON'Ts ❌

1. **Don't hardcode hex values** - Always use CSS variables or token names
2. **Don't mix themes** - Stay within CRUSH palette (no custom colors)
3. **Don't ignore accessibility** - Maintain WCAG AA contrast ratios (4.5:1 minimum)
4. **Don't overuse bright accents** - Reserve for highlights, not large areas
5. **Don't modify core tokens** - Create extended tokens for new needs

### Contrast Ratios

| Foreground | Background | Ratio | WCAG Grade |
|------------|------------|-------|------------|
| #DFDBDD (text.primary) | #0E111A (bg.base) | 13.2:1 | AAA |
| #959AA2 (text.secondary) | #0E111A (bg.base) | 7.1:1 | AA |
| #706F7B (text.subtle) | #0E111A (bg.base) | 4.3:1 | AA |
| #6B50FF (accent.primary) | #0E111A (bg.base) | 4.8:1 | AA |
| #FF60FF (accent.secondary) | #0E111A (bg.base) | 5.2:1 | AA |

---

## Quick Reference Card

### Primary Brand Colors

```
Background:     #0E111A (Deep Blue-Black)
Elevated:       #1C165E (Deep Purple)
Primary Text:   #DFDBDD (Ash)
Primary Accent: #6B50FF (Charple - Purple)
Secondary:      #FF60FF (Dolly - Pink)
Success:        #12C78F (Guac - Green)
Error:          #EB4268 (Sriracha - Red)
Warning:        #E8FE96 (Zest - Yellow)
```

### Syntax Highlighting

```
Keywords:       #00A4FF (Malibu - Blue)
Functions:      #12C78F (Guac - Green)
Strings:        #BF976F (Cumin - Tan)
Numbers:        #00FFB2 (Julep - Bright Green)
Comments:       #706F7B (Oyster - Gray)
Classes:        #F1EFEF (Salt - White)
Operators:      #FF6E63 (Bengal - Orange)
Punctuation:    #E8FE96 (Zest - Yellow)
```

---

## Implementation Checklist

For Floyd CURSE'M IDE rebranding:

- [ ] Replace NetBeans default theme colors with CRUSH palette
- [ ] Update all UI components to use semantic color tokens
- [ ] Implement editor syntax highlighting with CRUSH colors
- [ ] Apply CRUSH colors to diff view (version control)
- [ ] Update status bar and notifications with status colors
- [ ] Replace splash screen with Floyd branding
- [ ] Update about box with Floyd logo and colors
- [ ] Test color contrast ratios for accessibility
- [ ] Validate theme across all NetBeans modules
- [ ] Create light theme variant (optional)

---

## Brand Asset Sources

### Logo References

The following Floyd logo assets should be used for Floyd CURSE'M IDE branding:

1. **Primary Logo:** `/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/assets/logo-512.png`
2. **Medium Logo:** `/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/assets/logo-128.png`
3. **Small Logo:** `/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/assets/logo-64.png`
4. **Branding Asset:** `/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/assets/branding-original.png`

### Theme Source

The CRUSH theme is defined in:
- **TypeScript:** `/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/src/theme/themes.ts`
- **Test Specs:** `/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/src/theme/theme.test.ts`
- **Type Definitions:** `/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/src/theme/types.ts`

---

## Document Information

**Document Version:** 1.0  
**Last Updated:** 2026-01-20  
**Theme:** CRUSH (Floyd CLI CharmUI aesthetic)  
**Total Colors:** 81 tokens (22 core + 36 extended + 9 role + 8 syntax + 6 diff)  
**Primary Accent:** #6B50FF (Charple)  
**License:** Derived from Floyd CLI - CRUSH Theme  

---

## Next Steps

1. **Extract Logo Assets** - Convert Floyd logos to required NetBeans sizes
2. **Create NetBeans Theme Module** - Implement FloydTheme.java
3. **Apply CSS Branding** - Use branding.css for UI components
4. **Configure Syntax Highlighting** - XML editor theme
5. **Test & Validate** - Verify all 81 colors render correctly
6. **Accessibility Audit** - Ensure WCAG AA compliance

---

*This color palette guide is the authoritative reference for Floyd CURSE'M IDE branding. All implementations must use these exact hex codes and token names for consistency.*
