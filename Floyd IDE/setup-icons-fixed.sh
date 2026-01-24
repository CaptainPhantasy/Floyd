#!/bin/bash
# 🎸 FLOYD CURSE'M IDE - Official Icon Setup Script (Fixed)

set -e

SOURCE="/Volumes/Storage/FLOYD_CLI/Floyd IDE/curse'm.png"
DARWIN_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/darwin"
LINUX_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/linux"
SERVER_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/server"
WORK_DIR="/tmp/floyd-icons-official"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🎸 FLOYD CURSE'M IDE - Official Icon Setup 🎸               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verify source
if [ ! -f "$SOURCE" ]; then
    echo "❌ ERROR: curse'm.png not found!"
    exit 1
fi

echo "✅ Found official curse'm.png"
echo ""

# Create directories
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/darwin"
mkdir -p "$WORK_DIR/linux"
mkdir -p "$WORK_DIR/server"

# macOS iconset
echo "📱 Creating macOS icons..."
ICONSET_DIR="$WORK_DIR/darwin/floyd-cursem.iconset"
mkdir -p "$ICONSET_DIR"

# Generate all required sizes
for SIZE in 16 32 64 128 256 512; do
    sips -z $SIZE $SIZE "$SOURCE" --out "$ICONSET_DIR/icon_${SIZE}x${SIZE}.png" >/dev/null 2>&1
    if [ $((SIZE * 2)) -le 1024 ]; then
        sips -z $((SIZE * 2)) $((SIZE * 2)) "$SOURCE" --out "$ICONSET_DIR/icon_${SIZE}x${SIZE}@2x.png" >/dev/null 2>&1
    fi
done

# Create .icns
iconutil -c icns "$ICONSET_DIR" -o "$WORK_DIR/darwin/floyd-cursem.icns"
echo "   ✅ macOS icon created"
echo ""

# Linux icons
echo "🐧 Creating Linux icons..."
for SIZE in 16 32 48 64 128 256 512; do
    sips -z $SIZE $SIZE "$SOURCE" --out "$WORK_DIR/linux/floyd-cursem_${SIZE}x${SIZE}.png" >/dev/null 2>&1
done
sips -z 256 256 "$SOURCE" --out "$WORK_DIR/linux/floyd-cursem.png" >/dev/null 2>&1
echo "   ✅ Linux icons created"
echo ""

# Server icons
echo "🌐 Creating server icons..."
sips -z 192 192 "$SOURCE" --out "$WORK_DIR/server/floyd-cursem-192.png" >/dev/null 2>&1
sips -z 512 512 "$SOURCE" --out "$WORK_DIR/server/floyd-cursem-512.png" >/dev/null 2>&1
echo "   ✅ Server icons created"
echo ""

# Install
echo "📦 Installing icons..."
cp "$WORK_DIR/darwin/floyd-cursem.icns" "$DARWIN_DIR/"
cp "$WORK_DIR/linux/floyd-cursem.png" "$LINUX_DIR/"
cp "$WORK_DIR/server/floyd-cursem-192.png" "$SERVER_DIR/"
cp "$WORK_DIR/server/floyd-cursem-512.png" "$SERVER_DIR/"
echo "   ✅ Installation complete!"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✨ Official Icons Installed! ✨                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🎸 The OFFICIAL curse'm.png is now your IDE icon!"
