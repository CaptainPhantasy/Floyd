#!/bin/bash
# Generate Floyd CURSE'M IDE icons from curse'm.png
# "We don't need no thought control... just proper icon sizes!"

set -e

SOURCE="/Volumes/Storage/FLOYD_CLI/Floyd IDE/curse'm.png"
DARWIN_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/darwin"
LINUX_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/linux"
WIN32_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/win32"
SERVER_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/server"
WORK_DIR="/tmp/floyd-icons"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🎸 Floyd CURSE'M IDE Icon Generator 🎸                     ║"
echo "║  Shine On, You Crazy Icon! ✨                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Create working directory
echo "🔨 Building the wall... creating icon directory..."
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/darwin"
mkdir -p "$WORK_DIR/linux"
mkdir -p "$WORK_DIR/win32"
mkdir -p "$WORK_DIR/server"

echo ""
echo "🌙 The Dark Side of the Icons - Generating sizes..."
echo ""

# macOS .icns requires multiple sizes in an iconset
echo "📱 Creating macOS iconset..."
ICONSET_DIR="$WORK_DIR/darwin/floyd-cursem.iconset"
mkdir -p "$ICONSET_DIR"

# Required sizes for macOS .icns
SIZES=(
    "16:16x16"
    "32:32x32"
    "64:64x64"
    "128:128x128"
    "256:256x256"
    "512:512x512"
    "1024:1024x1024"
)

for SIZE_INFO in "${SIZES[@]}"; do
    IFS=":" read -r MULTIPLIER SIZE <<< "$SIZE_INFO"
    echo "   Generating ${SIZE}px... (${MULTIPLIER}x)"

    # Regular
    sips -z $SIZE $SIZE "$SOURCE" --out "$ICONSET_DIR/icon_${MULTIPLIER}x${MULTIPLIER}.png" >/dev/null 2>&1

    # Retina (2x)
    RETINA_SIZE=$((SIZE * 2))
    if [ $RETINA_SIZE -le 1024 ]; then
        sips -z $RETINA_SIZE $RETINA_SIZE "$SOURCE" --out "$ICONSET_DIR/icon_${MULTIPLIER}x${MULTIPLIER}@2x.png" >/dev/null 2>&1
    fi
done

# Create .icns from iconset
echo "   🎹 Assembling macOS .icns..."
iconutil -c icns "$ICONSET_DIR" -o "$WORK_DIR/darwin/floyd-cursem.icns"
echo "   ✅ macOS icon created: floyd-cursem.icns"
echo ""

# Linux PNG (multiple sizes)
echo "🐧 Generating Linux PNG icons..."
LINUX_SIZES=(16 32 48 64 128 256 512)
for SIZE in "${LINUX_SIZES[@]}"; do
    echo "   Generating ${SIZE}x${SIZE}..."
    sips -z $SIZE $SIZE "$SOURCE" --out "$WORK_DIR/linux/floyd-cursem_${SIZE}x${SIZE}.png" >/dev/null 2>&1
done
# Also create a standard 256x256 for Linux
sips -z 256 256 "$SOURCE" --out "$WORK_DIR/linux/floyd-cursem.png" >/dev/null 2>&1
echo "   ✅ Linux icons created"
echo ""

# Windows ICO (256x256)
echo "🪟 Generating Windows icon..."
sips -z 256 256 "$SOURCE" --out "$WORK_DIR/win32/floyd-cursem_256.png" >/dev/null 2>&1
# Use ImageMagick to create .ico if available
if command -v convert &> /dev/null; then
    convert "$WORK_DIR/win32/floyd-cursem_256.png" "$WORK_DIR/win32/floyd-cursem.ico"
    echo "   ✅ Windows .ico created"
else
    echo "   ⚠️  ImageMagick not found, .ico not created (PNG available)"
fi
echo ""

# Server icons
echo "🌐 Generating server icons..."
sips -z 192 192 "$SOURCE" --out "$WORK_DIR/server/floyd-cursem-192.png" >/dev/null 2>&1
sips -z 512 512 "$SOURCE" --out "$WORK_DIR/server/floyd-cursem-512.png" >/dev/null 2>&1
echo "   ✅ Server icons created"
echo ""

# Copy to destination
echo "📦 Installing icons to VSCode resources..."
echo ""

# Backup originals
echo "💾 Backing up original icons..."
cp "$DARWIN_DIR/code.icns" "$DARWIN_DIR/code.icns.backup" 2>/dev/null || true
cp "$LINUX_DIR/code.png" "$LINUX_DIR/code.png.backup" 2>/dev/null || true
cp "$SERVER_DIR/code-192.png" "$SERVER_DIR/code-192.png.backup" 2>/dev/null || true
cp "$SERVER_DIR/code-512.png" "$SERVER_DIR/code-512.png.backup" 2>/dev/null || true
echo "   ✅ Backups created"
echo ""

# Install new icons
echo "🚀 Installing Floyd icons..."
cp "$WORK_DIR/darwin/floyd-cursem.icns" "$DARWIN_DIR/floyd-cursem.icns"
cp "$WORK_DIR/linux/floyd-cursem.png" "$LINUX_DIR/floyd-cursem.png"
cp "$WORK_DIR/server/floyd-cursem-192.png" "$SERVER_DIR/floyd-cursem-192.png"
cp "$WORK_DIR/server/floyd-cursem-512.png" "$SERVER_DIR/floyd-cursem-512.png"
echo "   ✅ Icons installed!"
echo ""

# Create a splash screen too
echo "🎨 Creating splash screen..."
SPLASH_WIDTH=800
SPLASH_HEIGHT=600
sips -z $SPLASH_HEIGHT $SPLASH_WIDTH "$SOURCE" --out "$WORK_DIR/splash.png" >/dev/null 2>&1
echo "   ✅ Splash screen created: $WORK_DIR/splash.png"
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✨ Icon Generation Complete! Shine On! ✨                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Generated Files:"
echo "   ├── macOS:   $DARWIN_DIR/floyd-cursem.icns"
echo "   ├── Linux:   $LINUX_DIR/floyd-cursem.png"
echo "   ├── Server:  $SERVER_DIR/floyd-cursem-192.png"
echo "   │           $SERVER_DIR/floyd-cursem-512.png"
echo "   └── Splash:  $WORK_DIR/splash.png"
echo ""
echo "🎸 All your base are belong to Floyd... er, icons!"
echo ""
echo "💡 Next steps:"
echo "   1. Update product.json to reference floyd-cursem.icns"
echo "   2. Update build scripts to use new icons"
echo "   3. Build the app with: yarn run compile"
echo ""
echo "🌙 The Dark Side of the Code awaits..."
