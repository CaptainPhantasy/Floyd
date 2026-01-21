## NotionPromptScraper Browork Agent Plan

**Objective**: Extract all prompts from the Notion database at https://www.notion.so/LAI-OS-2cb8cbcf57bc80ddbe60cc4b51b126c4

**Current Status**:
- ✅ Chrome Extension Bridge active on ws://localhost:3005
- ✅ Navigation command sent to browser
- ⏳ Waiting for page accessibility tree

**Next Steps**:
1. Read page structure using browser_read_page
2. Identify all prompt entries in the Notion database
3. Extract prompt content (title, description, tags, etc.)
4. Compile extracted prompts into structured format
5. Save to /Volumes/Storage/Prompt Library/prompts.json

**Tools**: browser_navigate, browser_read_page, browser_click (if needed for pagination)

**Target Output**: JSON file with all prompts from the database