#!/bin/bash
# Script to save FloydDesktop app icon
# Usage: ./save-icon.sh <source-image.png>

if [ $# -eq 0 ]; then
    echo "Usage: ./save-icon.sh <source-image.png>"
    echo "Example: ./save-icon.sh ~/Downloads/floyd-desktop-icon.png"
    exit 1
fi

SOURCE="$1"
BUILD_DIR="$(dirname "$0")"

if [ ! -f "$SOURCE" ]; then
    echo "Error: Source image not found: $SOURCE"
    exit 1
fi

echo "Saving FloydDesktop icon from: $SOURCE"
echo "Output directory: $BUILD_DIR"

# Copy source as icon.png (electron-builder will generate platform-specific formats)
cp "$SOURCE" "$BUILD_DIR/icon.png"

echo "✓ Saved icon.png"
echo ""
echo "Icon saved to: $BUILD_DIR/icon.png"
echo "electron-builder will generate .icns (macOS) and .ico (Windows) during packaging"
