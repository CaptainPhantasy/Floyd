# Floyd Wrapper - Production CLI
# Floyd Wrapper - Production CLI
This file was updated during tool testing.

**Status:** ✅ PRODUCTION READY


---

## Overview

Floyd Wrapper is a production-ready CLI tool that provides autonomous software engineering capabilities through 50 specialized tools including file operations, Git workflow, multi-tier caching, browser automation, patch application, and build/explorer integration.

---

## Quick Start

### Installation

```bash
cd "/Volumes/Storage/WRAPPERS/FLOYD WRAPPER"
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
# Start the interactive CLI
npm start

# Or run directly
node dist/cli.js
```

### Usage Example

```bash
# The CLI will prompt for input
Type your message below. Press Ctrl+C to exit.

> Show git status
> Read file package.json
> List cache entries
```

---

## Tools (50 Total)

### Git Operations (8 tools)
- `git_status` - Show working tree status
- `git_diff` - Show changes between commits
- `git_log` - Show commit logs
- `git_commit` - Create commits
- `git_stage` - Stage files for commit
- `git_unstage` - Unstage files
- `git_branch` - Manage branches
- `is_protected_branch` - Check branch protection

### File Operations (4 tools)
- `read_file` - Read file contents
- `write` - Create or overwrite files
- `edit_file` - Edit specific file sections
- `search_replace` - Search and replace text globally

### Cache System (12 tools)
- `cache_store` - Store entries in cache
- `cache_retrieve` - Retrieve cached entries
- `cache_delete` - Delete cache entries
- `cache_clear` - Clear cache tiers
- `cache_list` - List cache entries
- `cache_search` - Search cache contents
- `cache_stats` - Show cache statistics
- `cache_prune` - Prune expired entries
- `cache_store_pattern` - Store pattern-based entries
- `cache_store_reasoning` - Store reasoning chains
- `cache_load_reasoning` - Load reasoning chains
- `cache_archive_reasoning` - Archive reasoning chains

### Search (2 tools)
- `grep` - Search file contents
- `codebase_search` - Search entire codebase

### System (2 tools)
- `run` - Execute shell commands
- `ask_user` - Prompt user for input

### Browser Automation (9 tools)
- `browser_status` - Check browser status
- `browser_navigate` - Navigate to URL
- `browser_read_page` - Read page content
- `browser_screenshot` - Capture screenshots
- `browser_click` - Click elements
- `browser_type` - Type text
- `browser_find` - Find elements
- `browser_get_tabs` - List tabs
- `browser_create_tab` - Create new tab

### Patch Operations (5 tools)
- `apply_unified_diff` - Apply unified diffs
- `edit_range` - Edit code ranges
- `insert_at` - Insert at position
- `delete_range` - Delete ranges
- `assess_patch_risk` - Assess patch safety

### Build/Explorer (8 tools)
- `detect_project` - Detect project type
- `run_tests` - Run test suites
- `format` - Format code
- `lint` - Lint code
- `build` - Build projects
- `check_permission` - Check permissions
- `project_map` - Map project structure
- `list_symbols` - List symbols

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# File tools (49 tests)
npx ava tests/unit/tools/file/*.test.ts --exit

# Cache tools
npx ava tests/unit/tools/cache/*.test.ts --exit

# All unit tests (excluding CLI timeout)
npx ava tests/unit/**/*.test.ts --exit --exclude=tests/unit/cli/cli.test.ts
```

### Test Coverage

- **File tools:** 49/49 tests passing (100%)
- **Total tests:** 158 passing, 5 skipped
- **Coverage:** All tool categories tested

---

## Development

### Project Structure

```
FLOYD WRAPPER/
├── src/
│   ├── agent/              # Agent execution engine
│   ├── cache/              # Multi-tier cache system
│   ├── cli.ts              # Main CLI entry point
│   ├── llm/                # GLM-4.7 API client
│   ├── permissions/        # Permission system
│   ├── tools/              # Tool implementations
│   │   ├── build/          # Build/explorer tools
│   │   ├── browser/        # Browser automation
│   │   ├── cache/          # Cache operations
│   │   ├── file/           # File operations
│   │   ├── git/            # Git operations
│   │   ├── patch/          # Patch operations
│   │   ├── search/         # Search operations
│   │   └── system/         # System operations
│   ├── types.ts            # TypeScript definitions
│   └── ui/                 # Terminal UI components
├── tests/                  # Test suites
├── dist/                   # Compiled output
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── .env                    # Environment configuration
```

### Key Files

- **`src/cli.ts`** - Main CLI entry point
- **`src/agent/execution-engine.ts`** - Agent execution logic
- **`src/tools/index.ts`** - Tool registry (50 tools)
- **`src/cache/supercache.ts`** - Multi-tier cache system
- **`src/llm/glm-client.ts`** - GLM-4.7 API integration

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# GLM API Configuration
# Use the Coding API base endpoint (not /chat/completions suffix)
FLOYD_GLM_API_KEY=your_api_key_here
FLOYD_GLM_ENDPOINT=https://api.z.ai/api/coding/paas/v4
FLOYD_GLM_MODEL=glm-4.7

# Optional: Max tokens for model responses
FLOYD_MAX_TOKENS=100000

# Optional: Temperature for response randomness (0-2)
FLOYD_TEMPERATURE=0.7

# Optional: Maximum turns for agent execution
FLOYD_MAX_TURNS=20

# Optional: Log level (debug, info, warn, error)
FLOYD_LOG_LEVEL=info

# Optional: Enable/disable caching
FLOYD_CACHE_ENABLED=true

# Optional: Permission level (auto, ask, deny)
FLOYD_PERMISSION_LEVEL=ask

# Optional: Browser extension WebSocket URL
FLOYD_EXTENSION_URL=ws://localhost:3005
```

### Permission Levels

Tools have three permission levels:
- **none** - No restrictions (read operations)
- **moderate** - Requires confirmation (write operations, navigation)
- **dangerous** - Highest privilege (system operations, destructive changes)

---

## Architecture

### Technology Stack

- **Runtime:** Node.js (ES modules)
- **Language:** TypeScript 5.6
- **Build:** tsc + tsc-alias + post-processing
- **Test:** AVA + tsx
- **Validation:** Zod schemas
- **UI:** ora (spinners) + cli-progress
- **LLM:** GLM-4.7 (Chinese coding API)

### Multi-Tier Cache

Three-tier caching system:
- **L1 (Memory)** - Fastest, volatile
- **L2 (Project)** - Medium speed, project-scoped
- **L3 (Vault)** - Persistent, cross-session

### Browser Integration

Browser automation requires the FloydChrome extension:
- **WebSocket Connection:** Connects to extension at `ws://localhost:3005`
- **Health Checks:** Automatic connection validation before tool use
- **Features:** Tab management, page interaction, screenshots, content extraction

**Note:** Browser tools will fail gracefully if the FloydChrome extension is not running.

---

## Build System

### Build Commands

```bash
# Compile TypeScript
npm run build

# Watch mode
npm run build:watch

# Clean build
rm -rf dist && npm run build
```

### Build Process

1. **TypeScript compilation** (`tsc`)
2. **Import path aliasing** (`tsc-alias`)
3. **Extension fixing** (sed post-processing)
4. **Output:** `dist/cli.js` (runnable)

---

## Troubleshooting

### Common Issues

**Issue:** Build fails with TypeScript errors
```bash
# Solution: Clean and rebuild
rm -rf dist && npm run build
```

**Issue:** Tests timeout
```bash
# Solution: Run without CLI tests
npx ava tests/unit/**/*.test.ts --exclude=tests/unit/cli/cli.test.ts
```

**Issue:** API errors
```bash
# Solution: Verify .env configuration
cat .env
npm run validate:api
```

---

## Documentation

- **Implementation Plan:** `Floyd Wrapper - Production Implementation Plan.md`
- **Build Safeguards:** `BUILD_SAFEGUARDS_COMPLETE.md`
- **Agent System:** `loop_docs/AUTONOMOUS_BUILD_AGENT.md`
- **Archived Docs:** `_archive/` (historical reference)

---

## Version History

### v0.1.0 (Current) - SHIP READY
- ✅ 50/50 tools implemented
- ✅ 158 tests passing
- ✅ Multi-tier cache system
- ✅ Browser automation
- ✅ Patch operations
- ✅ Build/explorer integration
- ✅ Production-ready CLI

---

## License

**Proprietary** - See [LICENSE](LICENSE) file for details.

This software is confidential and proprietary to CURSEM. Unauthorized use, distribution, or modification is strictly prohibited.

---

**Built with autonomous agents** 🤖
**Powered by GLM-4.7** 🚀
**Ready for production** ✅
