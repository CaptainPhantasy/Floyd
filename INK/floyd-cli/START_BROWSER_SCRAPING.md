# Notion Scraping via FloydChrome Extension

## Setup Complete! ✅

Your Chrome extension is installed and trying to connect to Floyd.

## The Issue

**Extension says:** "FloydChrome Disconnected - Waiting for FLOYD CLI"

**This means:** The WebSocket MCP server (port 3000 or 3005) isn't running yet.

---

## How to Connect Floyd to Chrome Extension

### Option 1: Start Floyd CLI with Browser MCP (RECOMMENDED)

```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev
```

This will:
- Start Floyd CLI with browser MCP support
- Start WebSocket server on `ws://localhost:3000`
- Chrome extension will auto-connect

**Once connected, you should see:**
```
[ChromeExtension] Connected on port 3000
[MCP Browser] Connected to FloydChrome extension
```

### Option 2: Start FloydDesktopWeb (for port 3005)

```bash
cd /Volumes/Storage/FLOYD_CLI/FloydDesktopWeb
npm run dev
```

This will:
- Start web server on `http://localhost:3001`
- Start WebSocket MCP server on `ws://localhost:3005`
- Chrome extension will connect to port 3005

---

## Once Connected: Scrape Notion

### Step 1: Verify Extension Connection

1. Open Chrome DevTools (F12) on any tab
2. Check Console tab
3. Look for: `"FloydChrome Extension connected"`

### Step 2: Run Browork Scraper

**Via Floyd CLI:**
```bash
# Floyd CLI is already running with browser tools
# Ask Floyd to spawn the scraper:
```

Prompt to Floyd:
```
"Spawn a Browork agent named 'NotionPromptScraper' to extract all prompts from my currently open Notion database and save them to /Volumes/Storage/Prompt Library/"
```

**Via Floyd Desktop Web:**
1. Open `http://localhost:3001`
2. Click "Browork" button (or use Ctrl+Shift+B)
3. Click "Create Task"
4. Name: `NotionPromptScraper`
5. Description: `Extract prompts from open Notion database`
6. Click "Create"
7. Click "Play" to start

### Step 3: Monitor Progress

The agent will:
1. Read the Notion page structure
2. Find all database rows
3. Extract each prompt's content
4. Save as markdown files with frontmatter
5. Generate summary report

**Expected output:**
```
[MCP Browser] Tool called: browser_read_page
✓ Indexed 15/50 prompts (30%)
✓ Indexed 30/50 prompts (60%)
✓ Indexed 50/50 prompts (100%)

[NotionPromptScraper] Task completed
Extracted 50 prompts from Notion database
Saved to: /Volumes/Storage/Prompt Library/
```

### Step 4: Verify Extraction

```bash
ls -la "/Volumes/Storage/Prompt Library/"
# Look for new .md files

head -20 "/Volumes/Storage/Prompt Library/notion-prompt-1.md"
# Verify frontmatter is present
```

---

## Browser Tools Available

Once connected, Floyd has these tools:

| Tool | Description |
|-------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_read_page` | Get semantic accessibility tree |
| `browser_screenshot` | Capture screenshot (base64) |
| `browser_click` | Click element at coordinates |
| `browser_type` | Type text into focused element |
| `browser_find` | Find element by natural language |
| `browser_get_tabs` | List all open tabs |
| `browser_create_tab` | Create new tab |

---

## Troubleshooting

### Extension won't connect?

1. **Check which port extension expects:**
   - Open Chrome DevTools (F12) → Console
   - Look for connection messages
   - Should show trying to connect to `ws://localhost:3000` or `3005`

2. **Start the correct Floyd server:**
   - If port 3000: `cd floyd-cli && npm run dev`
   - If port 3005: `cd FloydDesktopWeb && npm run dev`

3. **Restart Chrome extension:**
   - Go to `chrome://extensions/`
   - Find "FloydChrome Extension"
   - Click "Reload" button

### Scraping incomplete?

1. **Scroll Notion page manually** to load all rows
2. **Check database view** - is it showing all entries?
3. **Increase timeout** - edit `.floyd/notion-scraper-task.json` to extend timeout

### No prompts found?

1. **Ensure Notion page is fully loaded**
2. **Check page structure** - use `browser_read_page` first
3. **Verify database is visible** - not hidden or filtered view

---

## Next Steps After Extraction

### 1. Re-index in Floyd
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
node scripts/index-via-mcp.sh
```

### 2. Browse Prompts
```bash
# Run Floyd CLI
npm run dev

# Press Ctrl+Shift+P
# Browse, search, and copy prompts
```

### 3. Use in Browork Agents

Agents can now:
```javascript
// Retrieve pattern from vault
const pattern = await cache_load_pattern("architecture-agent");

// Use in agent prompt
"You are acting as: ${pattern}"
```

---

## Quick Start

```bash
# Terminal 1: Start Floyd CLI
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev

# Terminal 2: Extract prompts
# In Floyd CLI, prompt:
"Spawn NotionPromptScraper agent to scrape my open Notion database"

# After extraction:
# Browse prompts with Ctrl+Shift+P
```

---

**Configuration Created:**
- ✓ Browork task: `.floyd/notion-scraper-task.json`
- ✓ Scraping script: `scripts/scrape-notion.sh`
- ✓ Prompt Library: `/Volumes/Storage/Prompt Library/`
- ✓ Obsidian vault: `.obsidian/` folder ready

**Ready to extract!** 🚀
