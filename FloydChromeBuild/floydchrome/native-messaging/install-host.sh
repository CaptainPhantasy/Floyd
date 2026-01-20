#!/bin/bash

# FloydChrome Native Messaging Host Installation Script
# This script installs the native messaging host for Chrome on macOS

set -e

HOST_MANIFEST="/Volumes/Storage/FLOYD_CLI/FloydChromeBuild/floydchrome/native-messaging/com.floyd.chrome.json"
HOST_BINARY="/Volumes/Storage/FLOYD_CLI/INK/floyd-cli/bin/floyd-chrome-host.js"

# Chrome native messaging directory
CHROME_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
CHROME_MANIFEST="$CHROME_DIR/com.floyd.chrome.json"

# Chrome Beta native messaging directory (optional)
CHROME_BETA_DIR="$HOME/Library/Application Support/Google/Chrome Beta/NativeMessagingHosts"
CHROME_BETA_MANIFEST="$CHROME_BETA_DIR/com.floyd.chrome.json"

# Brave browser native messaging directory (optional)
BRAVE_DIR="$HOME/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts"
BRAVE_MANIFEST="$BRAVE_DIR/com.floyd.chrome.json"

# Edge browser native messaging directory (optional)
EDGE_DIR="$HOME/Library/Application Support/Microsoft/Edge/NativeMessagingHosts"
EDGE_MANIFEST="$EDGE_DIR/com.floyd.chrome.json"

echo "🚀 Installing FloydChrome Native Messaging Host..."

# Verify host binary exists
if [ ! -f "$HOST_BINARY" ]; then
    echo "❌ Error: Host binary not found at $HOST_BINARY"
    exit 1
fi

# Make host binary executable
chmod +x "$HOST_BINARY"
echo "✅ Made host binary executable"

# Create temporary manifest with actual path
TEMP_MANIFEST="/tmp/com.floyd.chrome.json"
cat > "$TEMP_MANIFEST" << EOF
{
  "name": "com.floyd.chrome",
  "description": "FloydChrome Native Messaging Host",
  "path": "$HOST_BINARY",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://*"
  ]
}
EOF

# Install for Google Chrome
if [ -d "$CHROME_DIR" ] || mkdir -p "$CHROME_DIR"; then
    cp "$TEMP_MANIFEST" "$CHROME_MANIFEST"
    echo "✅ Installed for Google Chrome"
fi

# Install for Chrome Beta (if directory exists)
if [ -d "$CHROME_BETA_DIR" ]; then
    cp "$TEMP_MANIFEST" "$CHROME_BETA_MANIFEST"
    echo "✅ Installed for Chrome Beta"
fi

# Install for Brave (if directory exists)
if [ -d "$BRAVE_DIR" ]; then
    cp "$TEMP_MANIFEST" "$BRAVE_MANIFEST"
    echo "✅ Installed for Brave"
fi

# Install for Edge (if directory exists)
if [ -d "$EDGE_DIR" ]; then
    cp "$TEMP_MANIFEST" "$EDGE_MANIFEST"
    echo "✅ Installed for Edge"
fi

# Clean up
rm "$TEMP_MANIFEST"

echo ""
echo "✨ Installation complete!"
echo ""
echo "The FloydChrome native messaging host has been installed for:"
echo "  - Google Chrome"
if [ -d "$CHROME_BETA_DIR" ]; then echo "  - Chrome Beta"; fi
if [ -d "$BRAVE_DIR" ]; then echo "  - Brave"; fi
if [ -d "$EDGE_DIR" ]; then echo "  - Edge"; fi
echo ""
echo "To use native messaging:"
echo "  1. Make sure Floyd CLI MCP browser server is running"
echo "  2. Reload the FloydChrome extension"
echo "  3. The extension will connect via native messaging"
echo ""
echo "To uninstall:"
echo "  rm \"$CHROME_MANIFEST\""
echo ""
