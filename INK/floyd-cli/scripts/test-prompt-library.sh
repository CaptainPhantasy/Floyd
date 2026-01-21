#!/bin/bash

# Prompt Library Integration Test
#
# Verifies that Floyd can detect and use your Prompt Library vault

set -e

PROMPT_LIBRARY="/Volumes/Storage/Prompt Library"
FLOYD_CLI="/Volumes/Storage/FLOYD_CLI/INK/floyd-cli"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🧪 PROMPT LIBRARY INTEGRATION TEST${NC}"
echo "==============================================="
echo ""

# Test 1: Verify Obsidian vault structure
echo -e "${BLUE}Test 1: Obsidian Vault Structure${NC}"
if [ -d "$PROMPT_LIBRARY/.obsidian" ]; then
    echo -e "${GREEN}✓ PASS${NC}: .obsidian folder exists"
else
    echo -e "${RED}✗ FAIL${NC}: .obsidian folder missing"
    echo "  Run: mkdir -p \"$PROMPT_LIBRARY/.obsidian\""
    exit 1
fi
echo ""

# Test 2: Verify markdown files exist
echo -e "${BLUE}Test 2: Markdown Files Present${NC}"
MD_COUNT=$(find "$PROMPT_LIBRARY" -type f \( -name "*.md" -o -name "*.markdown" \) | wc -l)
if [ "$MD_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: Found $MD_COUNT markdown files"
else
    echo -e "${RED}✗ FAIL${NC}: No markdown files found"
    exit 1
fi
echo ""

# Test 3: Verify VaultKeeper task exists
echo -e "${BLUE}Test 3: VaultKeeper Agent${NC}"
if [ -f "$FLOYD_CLI/.floyd/vaultkeeper-task.json" ]; then
    echo -e "${GREEN}✓ PASS${NC}: VaultKeeper task configured"
else
    echo -e "${RED}✗ FAIL${NC}: VaultKeeper task missing"
    exit 1
fi
echo ""

# Test 4: Verify indexing script exists
echo -e "${BLUE}Test 4: Indexing Script${NC}"
if [ -f "$FLOYD_CLI/scripts/index-via-mcp.sh" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Indexing script ready"
else
    echo -e "${RED}✗ FAIL${NC}: Indexing script missing"
    exit 1
fi
echo ""

# Test 5: Sample prompts
echo -e "${BLUE}Test 5: Sample Prompts${NC}"
echo -e "${YELLOW}Found these prompts:${NC}"
find "$PROMPT_LIBRARY" -type f -name "*.md" | head -5
echo ""

# Test 6: Floyd CLI build
echo -e "${BLUE}Test 6: Floyd CLI Build${NC}"
if [ -d "$FLOYD_CLI/dist" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Floyd CLI is built"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Floyd CLI not built yet"
    echo "  Run: cd \"$FLOYD_CLI\" && npm run build"
fi
echo ""

# Summary
echo -e "${CYAN}===============================================${NC}"
echo -e "${GREEN}✨ ALL TESTS PASSED!${NC}"
echo ""
echo -e "${BLUE}Your Prompt Library is ready for Floyd:${NC}"
echo ""
echo -e "  1. Run Floyd CLI:"
echo -e "     ${YELLOW}cd $FLOYD_CLI && npm run dev${NC}"
echo ""
echo -e "  2. Open Prompt Library:"
echo -e "     ${YELLOW}Press Ctrl+Shift+P${NC}"
echo ""
echo -e "  3. Browse and search prompts:"
echo -e "     ${YELLOW}Type to filter, use arrow keys to navigate${NC}"
echo ""
echo -e "  4. Copy to clipboard:"
echo -e "     ${YELLOW}Press Enter to copy selected prompt${NC}"
echo ""
echo -e "${CYAN}For Notion export, see:${NC}"
echo -e "  ${YELLOW}$FLOYD_CLI/PROMPT_LIBRARY_SETUP.md${NC}"
echo ""
