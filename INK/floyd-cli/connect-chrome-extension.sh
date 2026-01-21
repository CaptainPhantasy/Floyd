#!/bin/bash

# Floyd Chrome Extension Connector
#
# Starts Floyd CLI with browser MCP support
# Chrome extension will auto-connect to ws://localhost:3000

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

FLOYD_CLI="/Volumes/Storage/FLOYD_CLI/INK/floyd-cli"

echo -e "${CYAN}🔌 FLOYD CHROME EXTENSION CONNECTOR${NC}"
echo "=============================================="
echo ""

# Check if Floyd CLI is running
if ps aux | grep -v grep | grep "floyd-cli.*app.tsx" > /dev/null; then
    echo -e "${YELLOW}⚠  Floyd CLI is already running${NC}"
    echo ""
    echo "Checking if browser MCP server is active..."
    
    if lsof -i :3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ WebSocket MCP server is running on port 3000${NC}"
        echo -e "${GREEN}✓ Chrome extension should be connected!${NC}"
        echo ""
        echo "To verify connection:"
        echo "  1. Open Chrome DevTools (F12) on any tab"
        echo "  2. Go to Console tab"
        echo "  3. Look for: \"FloydChrome Extension connected\""
        echo ""
        exit 0
    else
        echo -e "${YELLOW}⚠  Floyd CLI is running but browser MCP server is NOT active${NC}"
        echo ""
        echo "You need to restart Floyd CLI with browser support:"
        echo "  1. Stop the current Floyd CLI process (Ctrl+C)"
        echo "  2. Run this script again"
        exit 1
    fi
fi

echo -e "${BLUE}🚀 Starting Floyd CLI with Browser MCP support...${NC}"
echo ""

cd "$FLOYD_CLI"

# Start Floyd CLI with browser MCP
# This will:
# 1. Start Floyd CLI
# 2. Initialize MCP manager
# 3. Start WebSocket server on ws://localhost:3000
# 4. Chrome extension will auto-connect

echo -e "${CYAN}Waiting for WebSocket server to start...${NC}"
echo ""

# Run Floyd CLI with browser MCP
npm run dev 2>&1 | while IFS= read -r line; do
    # Highlight important messages
    if [[ "$line" =~ "Connected.*port" ]]; then
        echo -e "${GREEN}$line${NC}"
    elif [[ "$line" =~ "ChromeExtension" ]] || [[ "$line" =~ "MCP.*Browser" ]]; then
        echo -e "${CYAN}$line${NC}"
    elif [[ "$line" =~ "error|Error|ERROR" ]]; then
        echo -e "${YELLOW}$line${NC}"
    else
        echo "$line"
    fi
    
    # Check if server is ready
    if [[ "$line" =~ "ChromeExtension.*Connected.*port 3000" ]]; then
        echo ""
        echo -e "${GREEN}=============================================${NC}"
        echo -e "${GREEN}✅ CHROME EXTENSION CONNECTED!${NC}"
        echo -e "${GREEN}=============================================${NC}"
        echo ""
        echo -e "${BLUE}You can now use browser tools in Floyd!${NC}"
        echo ""
        echo -e "${CYAN}Available browser tools:${NC}"
        echo "  • browser_navigate      - Navigate to URL"
        echo "  • browser_read_page    - Read page structure"
        echo "  • browser_screenshot   - Capture screenshot"
        echo "  • browser_click        - Click element"
        echo "  • browser_type        - Type text"
        echo "  • browser_find        - Find element"
        echo ""
    fi
done

