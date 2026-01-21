# Prompt Library Integration Guide

## Quick Start

### 1. Vault Setup ✅ COMPLETED
Your Prompt Library at `/Volumes/Storage/Prompt Library/` is now ready for Floyd:
- ✓ `.obsidian` folder created
- ✓ 25 markdown files detected
- ✓ Floyd can auto-detect this vault

### 2. Access Prompts in Floyd

```bash
# Run Floyd CLI
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev

# Trigger prompt library
Press Ctrl+Shift+P
```

**Floyd will automatically:**
- Detect your Prompt Library vault
- Index all markdown files
- Enable fuzzy search
- Provide instant preview
- Copy to clipboard with Enter key

### 3. Test Integration

**Manual Test:**
```
1. Press Ctrl+Shift+P
2. Type "architecture" (should show architecture-agent.md)
3. Use arrow keys to select
4. Press Enter to copy to clipboard
5. Paste into your chat or editor
```

**API Test:**
```bash
# Floyd will read prompts via VaultManager
# Tools available:
# - read_file: Read specific prompt
# - list_directory: Browse vault
# - cache_store_pattern: Store in SUPERCACHE
# - cache_search: Find by keyword
```

## VaultKeeper Agent

### Automated Weekly Maintenance

A Browork agent is configured to maintain your Prompt Library:

**Location:** `.floyd/vaultkeeper-task.json`

**Responsibilities:**
- ✓ Scan for new prompts weekly
- ✓ Index all prompts into SUPERCACHE vault
- ✓ Extract metadata (title, tags, category)
- ✓ Calculate quality scores (0-100)
- ✓ Generate weekly health reports
- ✓ Clean up obsolete prompts (>90 days unused)

**To Run Manually:**
```bash
# Spawn VaultKeeper via Browork
# This will scan and index your prompts
```

## Notion Export (via RUBE)

### Option 1: RUBE MCP Integration (RECOMMENDED)

**RUBE** is an MCP server that provides unified access to 500+ apps including Notion.

**Setup Steps:**

1. **Configure RUBE MCP Server in Floyd:**
```json
{
  "name": "rube",
  "enabled": true,
  "transport": {
    "type": "http",
    "url": "https://rube.app/mcp",
    "headers": {
      "Authorization": "Bearer YOUR_JWT_TOKEN"
    }
  }
}
```

2. **Add to `.floyd/mcp.json`:**
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
cat .floyd/mcp.json | jq '.servers += [{
  "name": "rube",
  "enabled": true,
  "transport": {
    "type": "sse",
    "url": "https://rube.app/mcp",
    "env": {
      "RUBE_API_KEY": "YOUR_JWT_TOKEN"
    }
  }
}]' > .floyd/mcp.json.tmp && mv .floyd/mcp.json.tmp .floyd/mcp.json
```

3. **Use RUBE to Export Notion Prompts:**
```
Prompt to Floyd:
"Use RUBE to export all pages from my Notion database called 'Prompt Library'. 
Save each page as a markdown file in /Volumes/Storage/Prompt Library/ with proper frontmatter."
```

**RUBE Notion Tools Available:**
- `notion_list_pages` - List all pages in database
- `notion_read_page` - Read page content
- `notion_search` - Search for specific pages
- `notion_export` - Export page as markdown

### Option 2: Manual Notion Export

If RUBE integration isn't ready:

1. **Export from Notion:**
   - Open your Prompt Library database
   - Select "Export" from menu
   - Choose "Markdown & CSV" format
   - Download the `.zip` file

2. **Extract to Floyd Vault:**
```bash
# Unzip export
cd /tmp
unzip ~/Downloads/Notion-Prompts.zip

# Copy to Prompt Library
cp -r "Notion-Prompts"/* "/Volumes/Storage/Prompt Library/"

# Verify
ls -la "/Volumes/Storage/Prompt Library/"
```

3. **Re-index in Floyd:**
```bash
# Run indexer
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
./scripts/index-via-mcp.sh
```

### Option 3: Notion API Script

For automated export:

```bash
# Install Notion SDK
npm install @notionhq/client

# Create export script
cat > export-notion.js << 'EOF'
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = 'YOUR_DATABASE_ID';

async function exportPrompts() {
  // Query all pages
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
  });

  // Convert to markdown
  for (const page of response.results) {
    const title = page.properties.Name.title[0].plain_text;
    const content = await notion.blocks.children.list({
      block_id: page.id,
    });

    // Extract text content
    const markdown = content.results.map(block => 
      block.type === 'paragraph' 
        ? block.paragraph.text[0].plain_text 
        : ''
    ).join('\n');

    // Save to Prompt Library
    const filename = `${title}.md`;
    const filepath = path.join('/Volumes/Storage/Prompt Library', filename);
    
    await fs.promises.writeFile(filepath, markdown, 'utf-8');
    console.log(`✓ Exported: ${filename}`);
  }
}

exportPrompts();
EOF

# Run with Notion token
NOTION_TOKEN=YOUR_TOKEN node export-notion.js
```

## SUPERCACHE Vault Integration

### How Patterns Are Stored

Prompts are indexed in `~/.floyd/.cache/vault/patterns/`:

```
~/.floyd/.cache/vault/patterns/
├── pattern:architecture-agent.json
├── pattern:testing-agent.json
├── pattern:unau-orchestrator.json
└── ...
```

**Pattern Structure:**
```json
{
  "key": "pattern:architecture-agent",
  "value": "[full markdown content]",
  "timestamp": 1234567890,
  "ttl": 604800000,  // 7 days
  "tier": "vault",
  "metadata": {
    "category": "agent",
    "tags": ["architecture", "design"],
    "keywords": ["react", "components"],
    "qualityScore": 85,
    "filePath": "/Volumes/Storage/Prompt Library/files/architecture-agent.md"
  }
}
```

### Cache Operations

```bash
# In Floyd, agents can use these tools:

# Store pattern
cache_store_pattern(name, pattern, {tags, category})

# Retrieve pattern
cache_load_pattern(name)

# Search patterns
cache_search("vault", "architecture")

# List all patterns
cache_list("vault")

# Get vault statistics
cache_stats("vault")
```

## Troubleshooting

### Vault Not Detected
```bash
# Check .obsidian folder exists
ls -la "/Volumes/Storage/Prompt Library/.obsidian"

# If missing, create it
mkdir -p "/Volumes/Storage/Prompt Library/.obsidian"
```

### Prompts Not Appearing
```bash
# Check Floyd can read the vault
ls "/Volumes/Storage/Prompt Library/" | head -5

# Verify file permissions
chmod -R 755 "/Volumes/Storage/Prompt Library/"
```

### Cache Issues
```bash
# Clear cache and re-index
rm -rf ~/.floyd/.cache/vault/patterns/*
node /Volumes/Storage/FLOYD_CLI/INK/floyd-cli/src/mcp/cache-server.ts
```

## Next Steps

1. **Test Prompt Library:** Open Floyd CLI and press Ctrl+Shift+P
2. **Set Up RUBE:** Configure RUBE MCP server for Notion access
3. **Export Notion Prompts:** Use RUBE to export your prompts
4. **Index All Prompts:** Run VaultKeeper agent to index everything
5. **Enjoy Fast Access:** Browse, search, and use prompts instantly

## File Locations

- **Prompt Library:** `/Volumes/Storage/Prompt Library/`
- **Floyd CLI:** `/Volumes/Storage/FLOYD_CLI/INK/floyd-cli/`
- **Vault Config:** `.floyd/obsidian-vaults.json`
- **SUPERCACHE:** `~/.floyd/.cache/vault/patterns/`
- **VaultKeeper Task:** `.floyd/vaultkeeper-task.json`
- **Indexing Script:** `scripts/index-via-mcp.sh`

---

**Generated:** 2026-01-21  
**Floyd CLI Version:** 0.1.0  
**Status:** ✅ Ready for Use
