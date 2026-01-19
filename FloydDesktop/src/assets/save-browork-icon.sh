#!/bin/bash
# Script to save Browork feature icon
# Usage: ./save-browork-icon.sh <source-image.png>

if [ $# -eq 0 ]; then
    echo "Usage: ./save-browork-icon.sh <source-image.png>"
    echo "Example: ./save-browork-icon.sh ~/Downloads/browork-icon.png"
    exit 1
fi

SOURCE="$1"
ASSETS_DIR="$(dirname "$0")"

if [ ! -f "$SOURCE" ]; then
    echo "Error: Source image not found: $SOURCE"
    exit 1
fi

echo "Saving Browork icon from: $SOURCE"
echo "Output directory: $ASSETS_DIR"

# Copy source as browork-icon.png
cp "$SOURCE" "$ASSETS_DIR/browork-icon.png"

# Optionally generate a smaller version for UI use (if ImageMagick/sips available)
if command -v convert &> /dev/null; then
    convert "$SOURCE" -resize 64x64 "$ASSETS_DIR/browork-icon-small.png"
    echo "✓ Generated browork-icon-small.png (64×64px for UI)"
elif command -v sips &> /dev/null; then
    sips -z 64 64 "$SOURCE" --out "$ASSETS_DIR/browork-icon-small.png"
    echo "✓ Generated browork-icon-small.png (64×64px for UI)"
fi

echo "✓ Saved browork-icon.png"
echo ""
echo "Icon saved to: $ASSETS_DIR/browork-icon.png"
