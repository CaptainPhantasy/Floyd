# Feature Icons for FloydDesktop

This directory contains custom icons for features and panels within FloydDesktop.

## Current Icons

### Browork Icon
- **File:** `browork-icon.png`
- **Size:** 512×512px (recommended)
- **Usage:** Used in BroworkPanel header and ContextPanel tab
- **Description:** Retro-futuristic neon design featuring "FLOYD" in pixelated blue neon, "Browork" in bold lime green 3D text, and "Legacy AI" tagline

## Adding New Icons

1. Place icon file in this directory (`src/assets/`)
2. Import in component: `import broworkIcon from '../assets/browork-icon.png';`
3. Use as `<img src={broworkIcon} alt="Browork" />` or in CSS background

## Icon Requirements

- **Format:** PNG (with transparency preferred)
- **Size:** 512×512px for high-DPI displays
- **Style:** Should match FloydDesktop's retro-futuristic aesthetic
- **Naming:** Use kebab-case: `feature-name-icon.png`
