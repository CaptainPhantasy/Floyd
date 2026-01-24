# FLOYD CURSE'M IDE Theme

**Company:** Legacy AI
**Developer:** Douglas Talley

The official Floyd CRUSH theme for FLOYD CURSE'M IDE - a dark theme with vibrant purple-pink accents, designed to match the Floyd CLI terminal UI exactly.

## Theme Colors

### Background Colors
- **Base** `#201F26` (Pepper) - Main background
- **Elevated** `#2d2c35` (BBQ) - Elevated elements
- **Overlay** `#3A3943` (Charcoal) - Overlay backgrounds
- **Modal** `#4D4C57` (Iron) - Modal/Dialog backgrounds

### Primary Accent Colors
- **Primary** `#6B50FF` (Charple) - Purple accent
- **Secondary** `#FF60FF` (Dolly) - Pink accent
- **Tertiary** `#68FFD6` (Bok) - Teal accent
- **Highlight** `#E8FE96` (Zest) - Yellow accent
- **Info** `#00A4FF` (Malibu) - Blue accent

### Status Colors
- **Ready/Success** `#12C78F` (Guac) - Green
- **Working** `#6B50FF` (Charple) - Purple
- **Warning** `#E8FE96` (Zest) - Yellow
- **Error** `#EB4268` (Sriracha) - Red

## Features

- ✅ Complete VSCode theme with all UI elements
- ✅ Syntax highlighting for all major languages
- ✅ Integrated terminal colors
- ✅ Git decoration colors
- ✅ Diff editor colors
- ✅ Status bar, activity bar, sidebar styling
- ✅ Search, debug, and notification colors
- ✅ Exact color match with Floyd CLI terminal UI

## Installation

### From Marketplace (Coming Soon)

```bash
code --install-extension floyd-cursem-theme
```

### From VSIX

1. Download the latest `.vsix` file from [Releases](https://github.com/legacy-ai/floyd-cursem-theme/releases)
2. Install via command line:
   ```bash
   code --install-extension floyd-crush-x.x.x.vsix
   ```
3. Or via VSCode:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Install from VSIX"
   - Select the downloaded `.vsix` file

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/legacy-ai/floyd-cursem-theme.git
   cd floyd-cursem-theme
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Link to VSCode:
   ```bash
   code --install-extension .
   ```

## Development

### Package the Extension

```bash
npm run package
```

This creates a `floyd-cursem-theme-x.x.x.vsix` file that can be installed.

### Publish to Marketplace

```bash
npm run publish
```

## Theme Philosophy

The Floyd CRUSH theme follows the **CRUSH principles**:

- **CharmUI**: High-contrast neon/pink aesthetics with personality
- **Rustic**: Dark backgrounds (`#201F26`) for reduced eye strain
- **User-focused**: Clear visual hierarchy with purposeful color usage
- **Speedy**: Fast visual feedback with status colors (success=green, working=purple, error=red)
- **Hybrid**: Works across different UI capabilities

## Credits

- **Theme Design**: Based on CharmTone color system from [Charmbracelet](https://github.com/charmbracelet/x)
- **Implementation**: Floyd CLI by Douglas Talley @ Legacy AI
- **Color System**: 50+ semantic colors with 10% increased contrast for accessibility

## Screenshots

<img src="icons/cursem.png" alt="FLOYD CURSE'M IDE Icon" width="128">

## License

MIT © 2026 Legacy AI

## Support

- **Issues**: [GitHub Issues](https://github.com/legacy-ai/floyd-cursem-theme/issues)
- **Email**: doug@legacy.ai
- **Website**: https://legacy.ai

## Related Projects

- [Floyd CLI](https://github.com/legacy-ai/floyd-cli) - Terminal UI implementation
- [Floyd Desktop](https://github.com/legacy-ai/floyd-desktop) - Electron desktop app
- [floyd-agent-core](https://github.com/legacy-ai/floyd-agent-core) - Core agent library
