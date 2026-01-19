# Icon Assets for FloydChrome Extension

Place your Chrome extension icons here. Chrome Web Store requires multiple sizes.

## Required Icon Files

Save your "FLOYD for Chrome" icon in these sizes:

- **`icon-16.png`** - 16×16px (toolbar icon)
- **`icon-48.png`** - 48×48px (extension management page)
- **`icon-128.png`** - 128×128px (Chrome Web Store)

## Current Icon Design

The FloydChrome icon features:
- **"FLOYD"** in pixelated light blue with purple neon glow
- **"for Chrome"** in metallic silver/chrome with golden outline
- **"Legacy AI"** tagline in yellow with red shadow
- Retro-futuristic neon aesthetic on brick wall background

## Icon Specifications

- **Format:** PNG with transparency
- **Sizes:** 16×16, 48×48, 128×128 pixels
- **Style:** Should be recognizable at small sizes (16px)
- **Background:** Transparent or solid (Chrome will handle display)

## Usage

The `manifest.json` is configured to use these icons. Once you save the files:
- `icon-16.png` appears in the Chrome toolbar
- `icon-48.png` appears in `chrome://extensions`
- `icon-128.png` appears in Chrome Web Store listing

## Generating Icon Sizes

If you have a high-resolution source image, you can generate the required sizes using:

```bash
# Using ImageMagick
convert source-icon.png -resize 16x16 assets/icon-16.png
convert source-icon.png -resize 48x48 assets/icon-48.png
convert source-icon.png -resize 128x128 assets/icon-128.png

# Or using sips on macOS
sips -z 16 16 source-icon.png --out assets/icon-16.png
sips -z 48 48 source-icon.png --out assets/icon-48.png
sips -z 128 128 source-icon.png --out assets/icon-128.png
```

## Publishing

These icons are required before publishing to Chrome Web Store. The manifest.json already references them.
