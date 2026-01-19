#!/bin/bash
# Script to save and resize Chrome extension icons
# Usage: ./save-icons.sh <source-image.png>

if [ $# -eq 0 ]; then
    echo "Usage: ./save-icons.sh <source-image.png>"
    echo "Example: ./save-icons.sh ~/Downloads/floyd-chrome-icon.png"
    exit 1
fi

SOURCE="$1"
ASSETS_DIR="$(dirname "$0")"

if [ ! -f "$SOURCE" ]; then
    echo "Error: Source image not found: $SOURCE"
    exit 1
fi

echo "Generating Chrome extension icons from: $SOURCE"
echo "Output directory: $ASSETS_DIR"

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert "$SOURCE" -resize 16x16 "$ASSETS_DIR/icon-16.png"
    convert "$SOURCE" -resize 48x48 "$ASSETS_DIR/icon-48.png"
    convert "$SOURCE" -resize 128x128 "$ASSETS_DIR/icon-128.png"
elif command -v sips &> /dev/null; then
    echo "Using sips (macOS)..."
    sips -z 16 16 "$SOURCE" --out "$ASSETS_DIR/icon-16.png"
    sips -z 48 48 "$SOURCE" --out "$ASSETS_DIR/icon-48.png"
    sips -z 128 128 "$SOURCE" --out "$ASSETS_DIR/icon-128.png"
else
    echo "Error: Neither ImageMagick nor sips found."
    echo "Please install ImageMagick or use macOS with sips"
    exit 1
fi

echo "✓ Generated icon-16.png (16×16px)"
echo "✓ Generated icon-48.png (48×48px)"
echo "✓ Generated icon-128.png (128×128px)"
echo ""
echo "Icons saved to: $ASSETS_DIR"
