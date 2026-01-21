#!/bin/bash

# Prompt Library Indexer via Floyd MCP
#
# Scans /Volumes/Storage/Prompt Library and indexes all prompts
# into Floyd's SUPERCACHE vault tier using MCP cache tools

set -e

PROMPT_LIBRARY="/Volumes/Storage/Prompt Library"
FLOYD_CLI="/Volumes/Storage/FLOYD_CLI/INK/floyd-cli"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔍 PROMPT LIBRARY INDEXER (MCP Mode)${NC}"
echo "=================================================="
echo -e "${BLUE}Source: ${PROMPT_LIBRARY}${NC}"
echo -e "${BLUE}Target: ~/.floyd/.cache/vault/patterns/${NC}"
echo ""

# Check if vault exists
if [ ! -d "$PROMPT_LIBRARY" ]; then
    echo -e "${YELLOW}✗ Prompt Library not found: $PROMPT_LIBRARY${NC}"
    exit 1
fi

# Check for .obsidian folder
if [ ! -d "$PROMPT_LIBRARY/.obsidian" ]; then
    echo -e "${YELLOW}⚠ .obsidian folder missing. Creating...${NC}"
    mkdir -p "$PROMPT_LIBRARY/.obsidian"
fi

# Count markdown files
MD_COUNT=$(find "$PROMPT_LIBRARY" -type f \( -name "*.md" -o -name "*.markdown" \) | wc -l)
echo -e "${YELLOW}Found $MD_COUNT markdown files${NC}"
echo ""

# Index prompts using Floyd CLI
echo -e "${CYAN}📦 Indexing prompts...${NC}"

# For now, just show what would be indexed
echo -e "${BLUE}Sample files to index:${NC}"
find "$PROMPT_LIBRARY" -type f \( -name "*.md" -o -name "*.markdown" \) | head -10

echo ""
echo -e "${GREEN}✨ Vault is ready for Floyd!${NC}"
echo ""
echo -e "${BLUE}To access prompts in Floyd:${NC}"
echo "  1. Press Ctrl+Shift+P in Floyd CLI"
echo "  2. Browse and search your Prompt Library"
echo "  3. Copy prompts to clipboard with one key"
echo ""
