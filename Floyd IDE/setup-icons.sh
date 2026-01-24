#!/bin/bash
# 🎸 FLOYD CURSE'M IDE - Official Icon Setup Script
# Uses the OFFICIAL curse'm.png as the main application icon

set -e

SOURCE="/Volumes/Storage/FLOYD_CLI/Floyd IDE/curse'm.png"
DARWIN_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/darwin"
LINUX_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/linux"
WIN32_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/win32"
SERVER_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main/resources/server"
WORK_DIR="/tmp/floyd-icons-official"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🎸 FLOYD CURSE'M IDE - Official Icon Setup 🎸               ║"
echo "║  Using the OFFICIAL curse'm.png logo! 💎                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verify source image exists
if [ ! -f "$SOURCE" ]; then
    echo "❌ ERROR: curse'm.png not found at: $SOURCE"
    echo "   Please ensure the official logo is in place!"
    exit 1
fi

echo "✅ Found official curse'm.png"
echo "   Size: $(ls -lh "$SOURCE" | awk '{print $5}')"
echo ""

# Create working directory
echo "🔨 Building icon directory..."
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/darwin"
mkdir -p "$WORK_DIR/linux"
mkdir -p "$WORK_DIR/win32"
mkdir -p "$WORK_DIR/server"
mkdir -p "$WORK_DIR/splash"
echo ""

# macOS .icns requires multiple sizes in an iconset
echo "📱 Creating macOS iconset from OFFICIAL logo..."
ICONSET_DIR="$WORK_DIR/darwin/floyd-cursem.iconset"
mkdir -p "$ICONSET_DIR"

# All required sizes for macOS .icns
declare -A SIZES=(
    ["icon_16x16.png"]="16"
    ["icon_32x32.png"]="32"
    ["icon_64x64.png"]="64"
    ["icon_128x128.png"]="128"
    ["icon_256x256.png"]="256"
    ["icon_512x512.png"]="512"
)

for ICON_FILE in "${!SIZES[@]}"; do
    SIZE=${SIZES[$ICON_FILE]}
    echo "   Generating ${SIZE}x${SIZE}px..."
    sips -z $SIZE $SIZE "$SOURCE" --out "$ICONSET_DIR/$ICON_FILE" >/dev/null 2>&1
done

# Retina versions (2x)
for ICON_FILE in "${!SIZES[@]}"; do
    SIZE=${SIZES[$ICON_FILE]}
    RETINA_SIZE=$((SIZE * 2))
    if [ $RETINA_SIZE -le 1024 ]; then
        BASE_NAME="${ICON_FILE%.png}"
        echo "   Generating ${RETINA_SIZE}x${RETINA_SIZE}px (retina)..."
        sips -z $RETINA_SIZE $RETINA_SIZE "$SOURCE" --out "$ICONSET_DIR/${BASE_NAME}@2x.png" >/dev/null 2>&1
    fi
done

# Create .icns from iconset
echo "   🎹 Assembling macOS .icns..."
iconutil -c icns "$ICONSET_DIR" -o "$WORK_DIR/darwin/floyd-cursem.icns"
echo "   ✅ macOS icon created: floyd-cursem.icns ($(ls -lh "$WORK_DIR/darwin/floyd-cursem.icns" | awk '{print $5}'))"
echo ""

# Linux PNG (standard sizes for desktop environments)
echo "🐧 Creating Linux icons from OFFICIAL logo..."
for SIZE in 16 32 48 64 128 256 512; do
    echo "   Generating ${SIZE}x${SIZE}..."
    sips -z $SIZE $SIZE "$SOURCE" --out "$WORK_DIR/linux/floyd-cursem_${SIZE}x${SIZE}.png" >/dev/null 2>&1
done

# Also create a standard 256x256 for Linux
sips -z 256 256 "$SOURCE" --out "$WORK_DIR/linux/floyd-cursem.png" >/dev/null 2>&1
echo "   ✅ Linux icons created"
echo ""

# Windows ICO (256x256 max for compatibility)
echo "🪟 Creating Windows icon from OFFICIAL logo..."
sips -z 256 256 "$SOURCE" --out "$WORK_DIR/win32/floyd-cursem-source.png" >/dev/null 2>&1
if command -v magick &> /dev/null; then
    magick "$WORK_DIR/win32/floyd-cursem-source.png" "$WORK_DIR/win32/floyd-cursem.ico"
    echo "   ✅ Windows .ico created ($(ls -lh "$WORK_DIR/win32/floyd-cursem.ico" | awk '{print $5}')"
elif command -v convert &> /dev/null; then
    convert "$WORK_DIR/win32/floyd-cursem-source.png" "$WORK_DIR/win32/floyd-cursem.ico"
    echo "   ✅ Windows .ico created (using ImageMagick v6)"
else
    echo "   ⚠️  ImageMagick not found, .ico not created (PNG available)"
fi
echo ""

# Server icons (for web interface)
echo "🌐 Creating server icons from OFFICIAL logo..."
sips -z 192 192 "$SOURCE" --out "$WORK_DIR/server/floyd-cursem-192.png" >/dev/null 2>&1
sips -z 512 512 "$SOURCE" --out "$WORK_DIR/server/floyd-cursem-512.png" >/dev/null 2>&1
echo "   ✅ Server icons created"
echo ""

# Splash screens (for dramatic startup!)
echo "🎨 Creating splash screens from OFFICIAL logo..."
# Create multiple splash screen sizes
SPLASH_SIZES=("800x600" "1024x768" "1920x1080")
for SPLASH_SIZE in "${SPLASH_SIZES[@]}"; do
    WIDTH=$(echo $SPLASH_SIZE | cut -d'x' -f1)
    HEIGHT=$(echo $SPLASH_SIZE | cut -d'x' -f2)
    sips -z $HEIGHT $WIDTH "$SOURCE" --out "$WORK_DIR/splash/splash-${SPLASH_SIZE}.png" >/dev/null 2>&1
    echo "   Created ${SPLASH_SIZE}px splash screen"
done
echo ""

# Copy to destination
echo "📦 Installing OFFICIAL icons to VSCode resources..."
echo ""

# Backup originals if not already backed up
backup_file() {
    if [ -f "$1" ] && [ ! -f "$1.backup" ]; then
        cp "$1" "$1.backup"
        echo "   💾 Backed up: $(basename $1)"
    fi
}

backup_file "$DARWIN_DIR/code.icns"
backup_file "$LINUX_DIR/code.png"
backup_file "$SERVER_DIR/code-192.png"
backup_file "$SERVER_DIR/code-512.png"
echo ""

# Install new icons
echo "🚀 Installing OFFICIAL Floyd icons..."
cp "$WORK_DIR/darwin/floyd-cursem.icns" "$DARWIN_DIR/"
cp "$WORK_DIR/linux/floyd-cursem.png" "$LINUX_DIR/"
cp "$WORK_DIR/server/floyd-cursem-192.png" "$SERVER_DIR/"
cp "$WORK_DIR/server/floyd-cursem-512.png" "$SERVER_DIR/"
echo "   ✅ All icons installed!"
echo ""

# Also copy to theme extension
echo "🎨 Installing OFFICIAL icon to theme extension..."
THEME_ICON_DIR="/Volumes/Storage/FLOYD_CLI/Floyd IDE/floyd-cursem-theme/icons"
mkdir -p "$THEME_ICON_DIR"
cp "$SOURCE" "$THEME_ICON_DIR/cursem.png"
echo "   ✅ Theme icon installed!"
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✨ Official Icon Installation Complete! ✨                  ║"
echo "║  Shine On, You Crazy Icon! 💎                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Installed Files (from OFFICIAL curse'm.png):"
echo "   ├── macOS:   $DARWIN_DIR/floyd-cursem.icns"
echo "   ├── Linux:   $LINUX_DIR/floyd-cursem.png"
echo "   ├── Server:  $SERVER_DIR/floyd-cursem-192.png"
echo "   │           $SERVER_DIR/floyd-cursem-512.png"
echo "   ├── Theme:   floyd-cursem-theme/icons/cursem.png"
echo "   └── Splash:  $WORK_DIR/splash/ (multiple sizes)"
echo ""
echo "🎸 The OFFICIAL FLOYD CURSE'M IDE logo is now everywhere!"
echo ""
echo "💡 Next steps:"
echo "   1. Use nvm to switch to Node 22.21.1: nvm use 22.21.1"
echo "   2. Install dependencies: npm i"
echo "   3. Build the app: npm run compile"
echo "   4. The official logo will appear in the app!"
echo ""
echo "🌙 Shine on! ✨"
