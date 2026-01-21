# @floyd/ui-theme

**CRUSH Design System** - Shared theme tokens for all Floyd platforms.

## Overview

This package contains the canonical source of truth for the CRUSH (CharmUI + Rustic + User-focused + Speedy + Hybrid) theme used across all Floyd platforms:

- Floyd CLI (Ink-based terminal UI)
- FloydDesktopWeb (React + Tailwind)
- FloydChrome (Chrome Extension)
- Floyd IDE (Tauri desktop app)

## Installation

```bash
npm install @floyd/ui-theme
```

## Usage

### TypeScript/JavaScript

```ts
import { colors, spacing, role } from '@floyd/ui-theme';

// Use colors directly
const primaryBg = colors.background.base;      // #201F26
const primaryText = colors.text.primary;       // #DFDBDD
const accentColor = colors.accent.primary;     // #6B50FF

// Use semantic role colors
const userColor = role.userLabel;              // #12C78F
const errorColor = colors.status.error;        // #EB4268

// Use spacing
const padding = spacing.md;                    // 16
```

### Tailwind CSS

In `tailwind.config.js`:

```js
import { generateTailwindConfig } from '@floyd/ui-theme/platform/tailwind';

export default generateTailwindConfig();
```

Then in your components:

```jsx
<div className="bg-crush-base text-crush-text-primary">
  <h1 className="text-crush-secondary">Header</h1>
</div>
```

### CSS Variables

Generate and include the CSS variables:

```bash
node dist/platform/css.js > theme.css
```

Then in your CSS:

```css
.header {
  background: var(--crush-bg-elevated);
  color: var(--crush-text-primary);
  border-color: var(--crush-bg-overlay);
}
```

## Token Reference

### Background Colors (Rustic)

| Token | Value | Usage |
|-------|-------|-------|
| `background.base` | #201F26 | Main background |
| `background.elevated` | #2d2c35 | Cards, panels |
| `background.overlay` | #3A3943 | Overlays |
| `background.modal` | #4D4C57 | Modals |

### Text Colors (Ash)

| Token | Value | Usage |
|-------|-------|-------|
| `text.primary` | #DFDBDD | Primary text |
| `text.secondary` | #959AA2 | Secondary text |
| `text.tertiary` | #BFBCC8 | Tertiary text |
| `text.subtle` | #706F7B | Hints, subtle |

### Accent Colors (Charm)

| Token | Value | Usage |
|-------|-------|-------|
| `accent.primary` | #6B50FF | Charple - CTAs, focus |
| `accent.secondary` | #FF60FF | Dolly - branding |
| `accent.tertiary` | #68FFD6 | Bok - tools |
| `accent.highlight` | #E8FE96 | Zest - warnings |
| `accent.info` | #00A4FF | Malibu - info |

### Status Colors (Speedy)

| Token | Value | Usage |
|-------|-------|-------|
| `status.ready` | #12C78F | Guac - success |
| `status.working` | #6B50FF | Charple - processing |
| `status.warning` | #E8FE96 | Zest - warning |
| `status.error` | #EB4268 | Sriracha - error |
| `status.blocked` | #FF60FF | Dolly - blocked |
| `status.offline` | #858392 | Squid - offline |

## Platform-Specific Notes

### CLI (Ink)

Ink uses color strings directly. Import from the theme:

```ts
import { crushTheme, roleColors } from '@floyd/ui-theme';

<Box backgroundColor={crushTheme.bg.elevated}>
  <Text color={roleColors.userLabel}>User:</Text>
</Box>
```

### DesktopWeb (Tailwind)

Use the Tailwind config generator. Classes are prefixed with `crush-`:

```jsx
// Colors
bg-crush-base, text-crush-primary, bg-crush-primary

// Status
text-crush-ready, text-crush-error, bg-crush-working

// Opacity variants
bg-crush-secondary/20, text-crush-primary/80
```

### Chrome Extension / IDE

Use CSS variables for consistency:

```css
.header {
  background: var(--crush-bg-elevated);
  color: var(--crush-text-primary);
}
```

## Development

```bash
# Build TypeScript
npm run build

# Generate CSS variables
npm run generate:css

# Watch mode
npm run watch
```

## Philosophy

The CRUSH theme embodies:

- **CharmUI**: Whimsical, personality-driven design from Charmbracelet
- **Rustic**: Dark, muted foundation colors
- **User-focused**: Semantic color roles for clear communication
- **Speedy**: Fast visual feedback with status colors
- **Hybrid**: Works across CLI, web, and native platforms

## License

MIT
