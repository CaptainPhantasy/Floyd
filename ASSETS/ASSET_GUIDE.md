# FLOYD CLI - Asset Guide

## Overview

This document describes all the branding and splash screen assets available for FLOYD CLI applications.

## Source Assets

All source assets are 1024x1024 PNG images located in `/Volumes/Storage/FLOYD_CLI/ASSETS/`:

| File | App | Description |
|------|-----|-------------|
| `chrome.png` | FloydChromeBuild | Chrome extension branding |
| `code_cli.png` | INK CLI | Terminal CLI branding |
| `desktop.png` | FloydDesktopWeb | Desktop web app branding |
| `curse'm.png` | Floyd IDE | Tauri IDE app branding |
| `browork.png` | FloydDesktopWeb (addon) | Browork addon branding |

## Generated Assets

Each app has an `assets/` directory containing multiple sizes for different use cases:

### Asset Sizes Available

| File | Size | Use Case |
|------|------|----------|
| `branding-original.png` | 1024x1024 | Original source, full quality |
| `splash.png` | 1024x1024 | Splash screens, loading screens |
| `logo-512.png` | 512x512 | Large logos, hero sections |
| `logo-256.png` | 256x256 | Medium logos, headers |
| `logo-128.png` | 128x128 | Small logos, navbars |
| `logo-64.png` | 64x64 | Thumbnails, avatars |
| `banner.png` | 1200x300 | Wide banners, headers |
| `icon-small.png` | 32x32 | UI icons, buttons |
| `icon-tiny.png` | 24x24 | Small UI elements |
| `icon-mini.png` | 16x16 | Minimal icons |

## App-Specific Locations

### FloydChromeBuild
```
FloydChromeBuild/floydchrome/assets/
├── branding-original.png
├── splash.png
├── logo-512.png
├── logo-256.png
├── logo-128.png
├── logo-64.png
├── banner.png
├── icon-small.png
├── icon-tiny.png
└── icon-mini.png
```

### INK CLI
```
INK/floyd-cli/assets/
├── branding-original.png
├── splash.png
├── logo-512.png
├── logo-256.png
├── logo-128.png
├── logo-64.png
├── banner.png
├── icon-small.png
├── icon-tiny.png
└── icon-mini.png
```

### FloydDesktopWeb
```
FloydDesktopWeb/assets/
├── branding-original.png
├── splash.png
├── logo-512.png
├── logo-256.png
├── logo-128.png
├── logo-64.png
├── banner.png
├── icon-small.png
├── icon-tiny.png
└── icon-mini.png

FloydDesktopWeb/assets/browork/ (addon)
├── branding-original.png
├── logo-512.png
├── logo-256.png
├── logo-128.png
├── logo-64.png
└── icon-small.png
```

### Floyd IDE
```
Floyd IDE/floyd-ide/assets/
├── branding-original.png
├── splash.png
├── logo-512.png
├── logo-256.png
├── logo-128.png
├── logo-64.png
├── banner.png
├── icon-small.png
├── icon-tiny.png
└── icon-mini.png
```

## Usage Examples

### React (FloydDesktopWeb, Floyd IDE)

```jsx
// Import assets
import splashLogo from './assets/splash.png';
import appLogo from './assets/logo-128.png';
import smallIcon from './assets/icon-small.png';

// Use in component
function Header() {
  return (
    <header className="app-header">
      <img src={appLogo} alt="Floyd" className="logo" />
      <h1>FLOYD CLI</h1>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="splash-screen">
      <img src={splashLogo} alt="Loading..." />
    </div>
  );
}
```

### Ink (INK CLI)

```jsx
import { Image } from 'ink';
import splashLogo from './assets/splash.png';
import appLogo from './assets/logo-64.png';

function SplashScreen() {
  return (
    <Box flexDirection="column">
      <Image source={splashLogo} width={50} />
      <Text bold>FLOYD CLI</Text>
    </Box>
  );
}
```

### Chrome Extension (FloydChromeBuild)

```jsx
// In React component
import logo from './assets/logo-128.png';

function Popup() {
  return (
    <div className="popup">
      <img src={logo} alt="Floyd" />
    </div>
  );
}
```

### CSS Background

```css
/* Using as background */
.splash-screen {
  background-image: url('./assets/splash.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.app-header {
  background-image: url('./assets/banner.png');
  background-size: cover;
  height: 100px;
}

.icon-button {
  background-image: url('./assets/icon-small.png');
  background-size: contain;
  width: 32px;
  height: 32px;
}
```

## Adding New Assets

If you need to add new assets or regenerate existing ones:

1. Place source image in `/Volumes/Storage/FLOYD_CLI/ASSETS/`
2. Run the asset processing script (if available)
3. Or manually resize using ImageMagick:

```bash
# Example: Generate 128x128 logo
convert source.png -resize 128x128 logo-128.png

# Example: Generate banner
convert source.png -resize 1200x300 banner.png
```

## Design Guidelines

### When to use each size:

- **1024x1024 (splash, branding-original)**: Full-screen displays, loading screens, hero sections
- **512x512**: Large logos, main branding, featured content
- **256x256**: Medium logos, headers, cards
- **128x128**: Small logos, navigation bars, thumbnails
- **64x64**: Avatars, list icons, small badges
- **32x32**: Button icons, UI controls
- **24x24**: Compact UI elements
- **16x16**: Minimal indicators, tiny icons
- **1200x300 (banner)**: Wide headers, banners, page tops

## Best Practices

1. **Use appropriate sizes**: Don't use a 1024x1024 image for a 16x16 icon
2. **Optimize for performance**: Smaller images load faster
3. **Maintain aspect ratio**: All generated assets maintain original proportions
4. **Use meaningful alt text**: For accessibility
5. **Consider dark mode**: Test how branding looks in different themes

## Notes

- All assets are in PNG format with transparency support
- Original assets are high-resolution (1024x1024)
- Generated assets maintain quality while optimizing for size
- Backups of previous assets are saved with `.bak` extension
