# Icon Assets for FloydDesktop

Place your app icons here for electron-builder packaging.

## Required Files

### Base Icon
- `icon.png` - **512×512px** PNG (base icon, used by electron-builder to generate platform-specific formats)

### Platform-Specific (Optional - electron-builder can generate these)
- `icon.icns` - macOS icon set (can be generated from icon.png)
- `icon.ico` - Windows icon (can be generated from icon.png)
- `icon.png` - Linux icon (512×512px, same as base)

## Current Icon

The FloydDesktop icon features:
- **"FLOYD"** in pixelated light blue with purple neon glow
- **"DESKTOP"** in bold yellow with purple shadow
- **"Legacy AI"** tagline in yellow
- Retro-futuristic neon aesthetic on brick wall background

## Usage

The `package.json` is configured to use `build/icon.png` as the source. electron-builder will automatically generate platform-specific formats during packaging.

## Generating Platform Icons

If you need to generate `.icns` (macOS) or `.ico` (Windows) manually:

### macOS (.icns)
```bash
# Using iconutil (macOS only)
mkdir icon.iconset
# Copy icon.png at various sizes into icon.iconset/
iconutil -c icns icon.iconset
```

### Windows (.ico)
Use online tools or ImageMagick:
```bash
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
```
