# Changelog

All notable changes to the Floyd Wrapper project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-22

### Added - SHIP RELEASE

#### Core Infrastructure
- **Agent Execution Engine** - Autonomous task execution with streaming token support
- **GLM-4.7 Integration** - Chinese coding API with retry logic and error handling
- **Permission System** - Three-tier permission model (none, dangerous, supervisor)
- **Multi-Tier Cache** - L1 (memory), L2 (project), L3 (vault) caching system
- **Terminal UI** - Ora spinners, progress bars, and ASCII art branding
- **TypeScript Build System** - tsc + tsc-alias + post-processing pipeline

#### Git Operations (8 tools)
- `git_status` - Show working tree status with staged/unstaged files
- `git_diff` - Show changes between commits, working tree, and branches
- `git_log` - Show commit logs with formatting options
- `git_commit` - Create commits with automatic staging support
- `git_stage` - Stage files for commit
- `git_unstage` - Unstage files from index
- `git_branch` - List, create, and delete branches
- `is_protected_branch` - Check if branch is protected (main, master, develop)

#### File Operations (4 tools)
- `read_file` - Read file contents with offset/limit support
- `write` - Create or overwrite files with automatic directory creation
- `edit_file` - Edit specific file sections with uniqueness validation
- `search_replace` - Search and replace text globally with regex-safe handling

#### Cache System (12 tools)
- `cache_store` - Store entries in cache with TTL support
- `cache_retrieve` - Retrieve entries from any tier with automatic fallback
- `cache_delete` - Delete entries from cache
- `cache_clear` - Clear entire cache tiers
- `cache_list` - List entries from all tiers with filtering
- `cache_search` - Search cache contents across all tiers
- `cache_stats` - Show cache statistics (hit rate, size, distribution)
- `cache_prune` - Remove expired entries from cache
- `cache_store_pattern` - Store regex pattern-based cache entries
- `cache_store_reasoning` - Store reasoning chains with metadata
- `cache_load_reasoning` - Load reasoning chains from cache
- `cache_archive_reasoning` - Archive old reasoning chains to vault

#### Search (2 tools)
- `grep` - Search file contents with regex support
- `codebase_search` - Search entire codebase with glob patterns

#### System (2 tools)
- `run` - Execute shell commands with timeout and output capture
- `ask_user` - Prompt user for input with validation

#### Browser Automation (9 tools)
- `browser_status` - Check browser connection status
- `browser_navigate` - Navigate to URLs with wait-for-load
- `browser_read_page` - Extract page content as markdown
- `browser_screenshot` - Capture screenshots with full-page support
- `browser_click` - Click elements by selector
- `browser_type` - Type text into input fields
- `browser_find` - Find elements by selector
- `browser_get_tabs` - List all open browser tabs
- `browser_create_tab` - Open new browser tabs

#### Patch Operations (5 tools)
- `apply_unified_diff` - Apply unified diff patches with validation
- `edit_range` - Edit code ranges by line numbers
- `insert_at` - Insert text at specific line positions
- `delete_range` - Delete line ranges from files
- `assess_patch_risk` - Assess patch safety and potential conflicts

#### Build/Explorer (8 tools)
- `detect_project` - Auto-detect project type (Node, Python, Rust, Go)
- `run_tests` - Run project test suites with framework detection
- `format` - Format code with project formatter detection
- `lint` - Lint code with project linter detection
- `build` - Build projects with build tool detection
- `check_permission` - Check if operations require permissions
- `project_map` - Map project structure and dependencies
- `list_symbols` - List symbols (functions, classes) in source files

#### Testing
- **158 tests passing** across all tool categories
- **File tools:** 49/49 tests (100% coverage)
- **Cache tools:** Comprehensive tier testing
- **UI tests:** Streaming display and terminal testing
- **Permission tests:** Permission validation coverage

#### Build & Deployment
- **ES Module Resolution** - Fixed .js/.ts import compatibility
- **Post-processing Pipeline** - Automatic import extension fixing
- **Production Build** - `dist/cli.js` fully functional
- **Error Handling** - Comprehensive error recovery and reporting

#### Documentation
- **README.md** - Complete user guide with all 50 tools documented
- **CHANGELOG.md** - This file
- **CONTRIBUTING.md** - Development guidelines
- **docs/** - API documentation for each tool category

### Changed
- Migrated from `.js` to `.ts` imports for tsx compatibility
- Updated build process to use Node16 module resolution
- Added sed post-processing for import extension fixes

### Fixed
- **Test Infrastructure Bug** - Fixed `writeFile` vs `mkdir` for directory creation
- **ES Module Resolution** - Resolved 58 import path issues
- **TypeScript Compilation** - Fixed parameter property compatibility
- **CLI Timeout** - Improved readline cleanup (partial fix)
- **Ora Import** - Fixed ESM import compatibility

### Performance
- **Multi-tier caching** - Reduces API calls by up to 90%
- **Lazy loading** - Tools load on-demand
- **Streaming tokens** - Real-time LLM response display

### Security
- **Permission system** - Dangerous operations require confirmation
- **Protected branch checks** - Prevents direct main/commits
- **Input validation** - Zod schemas on all tool inputs
- **API key protection** - Environment-based configuration

---

## [Unreleased]

### Planned (Future Versions)
- Integration tests for browser automation
- Enhanced patch conflict resolution
- Interactive mode improvements
- Plugin system for custom tools
- Multi-language support
- Docker containerization

---

## Version History Summary

| Version | Date | Status | Tools | Tests |
|---------|------|--------|-------|-------|
| 0.1.0 | 2025-01-22 | SHIP READY | 50/50 | 158 passing |

---

**Note:** This project uses semantic versioning. Changes are documented as:
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes
