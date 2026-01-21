#!/bin/bash

# Notion Prompt Scraper via FloydChrome Extension
#
# Uses browser automation tools to extract all prompts
# from currently open Notion database and save to Prompt Library

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
NOTION_URL="https://www.notion.so/LAI-OS-2cb8cbcf57bc80ddbe60cc4b51b126c4"
PROMPT_LIBRARY="/Volumes/Storage/Prompt Library"
BROWORK_DIR="/Volumes/Storage/FLOYD_CLI/FloydDesktopWeb/.floyd"
WS_PORT=3005

echo -e "${MAGENTA}🎯 NOTION PROMPT SCRAPER SETUP${NC}"
echo "================================================"
echo ""
echo -e "${CYAN}Target:${NC} ${NOTION_URL}"
echo -e "${CYAN}Output:${NC} ${PROMPT_LIBRARY}/"
echo ""

# Check prerequisites
echo -e "${CYAN}🔍 CHECKING PREREQUISITES${NC}"
echo "================================================"

# 1. Prompt Library exists
if [ -d "$PROMPT_LIBRARY" ]; then
    echo -e "${GREEN}✓${NC} Prompt Library exists"
else
    echo -e "${YELLOW}⚠${NC} Prompt Library not found. Creating..."
    mkdir -p "$PROMPT_LIBRARY"
fi

# 2. .obsidian folder
if [ -d "$PROMPT_LIBRARY/.obsidian" ]; then
    echo -e "${GREEN}✓${NC} .obsidian folder exists"
else
    mkdir -p "$PROMPT_LIBRARY/.obsidian"
    echo -e "${GREEN}✓${NC} Created .obsidian folder"
fi

# 3. Check FloydDesktopWeb is running
if curl -s "http://localhost:3001" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} FloydDesktopWeb is running (port 3001)"
else
    echo -e "${YELLOW}⚠${NC} FloydDesktopWeb may not be running"
    echo "  Start it with: cd /Volumes/Storage/FLOYD_CLI/FloydDesktopWeb && npm run dev"
fi

# 4. Check WebSocket MCP server
if curl -s "http://localhost:3005" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} WebSocket MCP server is running (port 3005)"
else
    echo -e "${YELLOW}⚠${NC} WebSocket MCP server may not be running"
fi

echo ""

# Create Browork task
echo -e "${CYAN}📋 CREATING BROWORK TASK${NC}"
echo "================================================"

mkdir -p "$BROWORK_DIR"

cat > "$BROWORK_DIR/notion-scraper-task.json" << 'EOF'
{
  "name": "NotionPromptScraper",
  "description": "Extract ALL prompts from currently open Notion database at https://www.notion.so/LAI-OS-2cb8cbcf57bc80ddbe60cc4b51b126c4 and save to /Volumes/Storage/Prompt Library/

Use browser automation tools (via FloydChrome extension):
1. browser_read_page - Read Notion page structure
2. browser_click - Click elements (pagination, expand rows)
3. browser_find - Find specific prompt entries
4. browser_screenshot - Capture screenshots for verification

Save each prompt as markdown:
---
title: \"Prompt Name\"
tags: [tag1, tag2]
category: \"agent|tool|skill|prompt\"
source: \"Notion - LAI-OS\"
indexedAt: ISO timestamp
---

[Prompt content]

EXTRACTION STEPS:
1. Read current Notion page structure
2. Identify all database rows/prompts
3. For each prompt:
   - Extract title/name
   - Extract content/body
   - Capture tags/metadata
   - Save as markdown with frontmatter
4. Handle pagination (if more than visible)
5. Generate summary report

Start by reading the page to understand its structure.",
  "tools": [
    "browser_read_page",
    "browser_click",
    "browser_find",
    "browser_screenshot",
    "write_file"
  ],
  "timeout": 300000
}
EOF

echo -e "${GREEN}✓${NC} Browork task created at: $BROWORK_DIR/notion-scraper-task.json"

echo ""

# Print instructions
echo -e "${CYAN}📋 MANUAL SCRAPING INSTRUCTIONS${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Step 1: Ensure FloydDesktopWeb is running${NC}"
echo "  cd /Volumes/Storage/FLOYD_CLI/FloydDesktopWeb"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Step 2: Ensure Chrome extension is connected${NC}"
echo "  - Open Chrome DevTools (F12)"
echo "  - Check Console for: \"FloydChrome Extension connected\""
echo "  - If not connected, reload the extension"
echo ""
echo -e "${BLUE}Step 3: Open Notion in Chrome${NC}"
echo "  Navigate to: $NOTION_URL"
echo "  - Make sure database is fully loaded"
echo "  - Wait for all rows to render"
echo ""
echo -e "${BLUE}Step 4: Spawn Browork Task${NC}"
echo "  - Open Floyd Desktop Web in browser (http://localhost:3001)"
echo "  - Click \"Browork\" button (or use Ctrl+Shift+B)"
echo "  - Click \"Create Task\""
echo "  - Name: NotionPromptScraper"
echo "  - Description: Extract prompts from Notion database"
echo "  - Click \"Create\""
echo ""
echo -e "${BLUE}Step 5: Run the Task${NC}"
echo "  - Click the \"Play\" button next to the task"
echo "  - Watch the logs for progress"
echo "  - Wait for completion (max 5 minutes)"
echo ""
echo -e "${BLUE}Step 6: Verify Extraction${NC}"
echo "  - Check: $PROMPT_LIBRARY/"
echo "  - Look for new .md files (e.g., prompt-1.md)"
echo "  - Verify frontmatter is present"
echo "  - Open Floyd CLI and press Ctrl+Shift+P to browse"
echo ""
echo -e "${YELLOW}⚠ TROUBLESHOOTING${NC}"
echo ""
echo "Chrome extension not connecting?"
echo "  - Restart FloydDesktopWeb"
echo "  - Reload Chrome extension"
echo "  - Check browser console for errors"
echo ""
echo "Scraping fails or incomplete?"
echo "  - Ensure Notion page is fully loaded"
echo "  - Try manually scrolling to load all rows"
echo "  - Check if prompts are in a database view or table"
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo -e "${CYAN}Quick Start Command:${NC}"
echo "  cd /Volumes/Storage/FLOYD_CLI/FloydDesktopWeb && npm run dev"
echo ""
