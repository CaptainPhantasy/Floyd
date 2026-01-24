# Floyd CLI Tools Reference

Complete specification of all tools available to the Floyd AI development companion.

## Overview

This document provides comprehensive reference documentation for all 55+ tools available to Floyd across 8 categories. Each tool specification includes the name, description, input schema, permission level, and example usage.

---

## Tool Categories

| Category | Tool Count | Description |
|----------|------------|-------------|
| `file` | 6 | File operations (read, write, edit, search) |
| `search` | 4 | Code search and navigation |
| `build` | 8 | Build, test, and project automation |
| `git` | 9 | Git workflow operations |
| `browser` | 8 | Browser automation via FloydChrome |
| `cache` | 6 | SUPERCACHE operations |
| `patch` | 5 | Patch creation and application |
| `system` | 2 | Shell command execution |

**Total:** 48 tools

---

## File Operations

### `read_file`

Read the contents of a file.

**Category:** `file`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" },
    "offset": { "type": "number" },
    "limit": { "type": "number" }
  },
  "required": ["filePath"]
}
```

**Example:**
```json
{
  "filePath": "/path/to/file.ts",
  "offset": 0,
  "limit": 100
}
```

---

### `write_file`

Write content to a file, creating directories as needed.

**Category:** `file`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" },
    "content": { "type": "string" },
    "createBackup": { "type": "boolean" }
  },
  "required": ["filePath", "content"]
}
```

**Example:**
```json
{
  "filePath": "/path/to/output.txt",
  "content": "Hello, World!",
  "createBackup": true
}
```

---

### `edit_file`

Edit a file by replacing a string with another string.

**Category:** `file`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" },
    "oldStr": { "type": "string" },
    "newStr": { "type": "string" },
    "all": { "type": "boolean" }
  },
  "required": ["filePath", "oldStr", "newStr"]
}
```

**Example:**
```json
{
  "filePath": "/path/to/file.ts",
  "oldStr": "TODO",
  "newStr": "FIXME",
  "all": true
}
```

---

### `search_files`

Search for files matching a pattern.

**Category:** `file`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "pattern": { "type": "string" },
    "path": { "type": "string" },
    "excludePatterns": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["pattern"]
}
```

**Example:**
```json
{
  "pattern": "**/*.ts",
  "path": "/src",
  "excludePatterns": ["**/node_modules/**"]
}
```

---

### `list_directory`

List files and directories.

**Category:** `file`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "path": { "type": "string" },
    "recursive": { "type": "boolean" },
    "includeHidden": { "type": "boolean" }
  }
}
```

**Example:**
```json
{
  "path": "/src",
  "recursive": true,
  "includeHidden": false
}
```

---

### `get_file_info`

Get metadata about a file.

**Category:** `file`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" }
  },
  "required": ["filePath"]
}
```

**Example:**
```json
{
  "filePath": "/path/to/file.ts"
}
```

---

## Search Operations

### `grep_search`

Search for text patterns in files.

**Category:** `search`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "pattern": { "type": "string" },
    "path": { "type": "string" },
    "filePattern": { "type": "string" },
    "caseInsensitive": { "type": "boolean" },
    "contextLines": { "type": "number" }
  },
  "required": ["pattern"]
}
```

**Example:**
```json
{
  "pattern": "function.*execute",
  "path": "/src",
  "filePattern": "*.ts",
  "contextLines": 2
}
```

---

### `find_symbol`

Find symbol definitions in code.

**Category:** `search`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string" },
    "path": { "type": "string" },
    "symbolType": { "type": "string", "enum": ["function", "class", "interface", "variable", "constant"] }
  },
  "required": ["symbol"]
}
```

**Example:**
```json
{
  "symbol": "FloydAgentEngine",
  "path": "/src",
  "symbolType": "class"
}
```

---

### `search_codebase`

Search across the entire codebase.

**Category:** `search`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "includeTests": { "type": "boolean" },
    "includeDocs": { "type": "boolean" }
  },
  "required": ["query"]
}
```

**Example:**
```json
{
  "query": "GLMClient",
  "includeTests": true,
  "includeDocs": true
}
```

---

### `find_references`

Find references to a symbol.

**Category:** `search`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string" },
    "path": { "type": "string" }
  },
  "required": ["symbol"]
}
```

**Example:**
```json
{
  "symbol": "toolRegistry",
  "path": "/src"
}
```

---

## Build & Project Operations

### `detect_project`

Auto-detect project type and available commands.

**Category:** `build`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "projectPath": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "projectPath": "/path/to/project"
}
```

---

### `run_tests`

Run tests for the detected project.

**Category:** `build`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "projectPath": { "type": "string" },
    "command": { "type": "string" },
    "grantPermission": { "type": "boolean" }
  }
}
```

**Example:**
```json
{
  "projectPath": "/path/to/project",
  "command": "npm test",
  "grantPermission": true
}
```

---

### `format`

Format code using the project's configured formatter.

**Category:** `build`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "projectPath": { "type": "string" },
    "command": { "type": "string" },
    "grantPermission": { "type": "boolean" }
  }
}
```

**Example:**
```json
{
  "projectPath": "/path/to/project",
  "command": "npm run format"
}
```

---

### `lint`

Run the project's linter.

**Category:** `build`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "projectPath": { "type": "string" },
    "command": { "type": "string" },
    "grantPermission": { "type": "boolean" }
  }
}
```

**Example:**
```json
{
  "projectPath": "/path/to/project",
  "command": "npm run lint"
}
```

---

### `build`

Build the project.

**Category:** `build`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "projectPath": { "type": "string" },
    "command": { "type": "string" },
    "grantPermission": { "type": "boolean" }
  }
}
```

**Example:**
```json
{
  "projectPath": "/path/to/project",
  "command": "npm run build"
}
```

---

### `check_permission`

Check if permission is granted for a runner operation.

**Category:** `build`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "toolName": { "type": "string", "enum": ["run_tests", "format", "lint", "build"] },
    "projectPath": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "toolName": "run_tests",
  "projectPath": "/path/to/project"
}
```

---

### `project_map`

Get directory tree structure.

**Category:** `build`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "maxDepth": { "type": "number" }
  }
}
```

**Example:**
```json
{
  "maxDepth": 3
}
```

---

### `list_symbols`

List symbols (classes, functions, interfaces) in a file.

**Category:** `build`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" }
  },
  "required": ["filePath"]
}
```

**Example:**
```json
{
  "filePath": "/src/agent/execution-engine.ts"
}
```

---

## Git Operations

### `git_status`

Show the working tree status.

**Category:** `git`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "repoPath": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "repoPath": "/path/to/repo"
}
```

---

### `git_commit`

Record changes to the repository.

**Category:** `git`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "message": { "type": "string" },
    "repoPath": { "type": "string" },
    "stageAll": { "type": "boolean" },
    "stageFiles": { "type": "array", "items": { "type": "string" } },
    "allowEmpty": { "type": "boolean" },
    "amend": { "type": "boolean" }
  },
  "required": ["message"]
}
```

**Example:**
```json
{
  "message": "Add new feature",
  "repoPath": "/path/to/repo",
  "stageAll": true
}
```

---

### `git_diff`

Show changes between commits.

**Category:** `git`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "repoPath": { "type": "string" },
    "files": { "type": "array", "items": { "type": "string" } },
    "staged": { "type": "boolean" },
    "cached": { "type": "boolean" }
  }
}
```

**Example:**
```json
{
  "repoPath": "/path/to/repo",
  "files": ["src/file.ts"],
  "staged": false
}
```

---

### `git_log`

Show commit logs.

**Category:** `git`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "repoPath": { "type": "string" },
    "maxCount": { "type": "number" },
    "since": { "type": "string" },
    "until": { "type": "string" },
    "author": { "type": "string" },
    "file": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "repoPath": "/path/to/repo",
  "maxCount": 20
}
```

---

### `git_stage`

Stage files for commit.

**Category:** `git`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "files": { "type": "array", "items": { "type": "string" } },
    "repoPath": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "files": ["src/file.ts"],
  "repoPath": "/path/to/repo"
}
```

---

### `git_unstage`

Unstage files from the staging area.

**Category:** `git`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "files": { "type": "array", "items": { "type": "string" } },
    "repoPath": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "files": ["src/file.ts"],
  "repoPath": "/path/to/repo"
}
```

---

### `git_branch`

List, create, or switch branches.

**Category:** `git`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "repoPath": { "type": "string" },
    "action": { "type": "string", "enum": ["list", "current", "create", "switch"] },
    "name": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "action": "list",
  "repoPath": "/path/to/repo"
}
```

---

### `is_protected_branch`

Check if a branch is protected.

**Category:** `git`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "branch": { "type": "string" },
    "repoPath": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "branch": "main",
  "repoPath": "/path/to/repo"
}
```

---

## Browser Automation

### `browser_status`

Check connection status to FloydChrome extension.

**Category:** `browser`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {}
}
```

**Example:**
```json
{}
```

---

### `browser_navigate`

Navigate to a URL in the browser.

**Category:** `browser`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "url": { "type": "string" },
    "tabId": { "type": "number" }
  },
  "required": ["url"]
}
```

**Example:**
```json
{
  "url": "https://example.com"
}
```

---

### `browser_read_page`

Get semantic accessibility tree of the current page.

**Category:** `browser`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "tabId": { "type": "number" }
  }
}
```

**Example:**
```json
{
  "tabId": 1
}
```

---

### `browser_screenshot`

Capture screenshot for Computer Use/vision models.

**Category:** `browser`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "fullPage": { "type": "boolean" },
    "selector": { "type": "string" },
    "tabId": { "type": "number" }
  }
}
```

**Example:**
```json
{
  "fullPage": true
}
```

---

### `browser_click`

Click element at coordinates or by CSS selector.

**Category:** `browser`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "x": { "type": "number" },
    "y": { "type": "number" },
    "selector": { "type": "string" },
    "tabId": { "type": "number" }
  }
}
```

**Example:**
```json
{
  "selector": "#submit-button"
}
```

---

### `browser_type`

Type text into the focused element.

**Category:** `browser`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "text": { "type": "string" },
    "tabId": { "type": "number" }
  },
  "required": ["text"]
}
```

**Example:**
```json
{
  "text": "Hello, World!"
}
```

---

### `browser_find`

Find element by natural language query.

**Category:** `browser`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "tabId": { "type": "number" }
  },
  "required": ["query"]
}
```

**Example:**
```json
{
  "query": "submit button"
}
```

---

### `browser_get_tabs`

List all open browser tabs.

**Category:** `browser`
**Permission:** `moderate`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {}
}
```

**Example:**
```json
{}
```

---

## Cache Operations

### `cache_store`

Store data in SUPERCACHE with TTL.

**Category:** `cache`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "key": { "type": "string" },
    "value": { "type": "string" },
    "tier": { "type": "string", "enum": ["reasoning", "project", "vault"] },
    "ttl": { "type": "number" }
  },
  "required": ["key", "value"]
}
```

**Example:**
```json
{
  "key": "computation-result",
  "value": "{\"result\": 42}",
  "tier": "reasoning",
  "ttl": 3600000
}
```

---

### `cache_retrieve`

Retrieve data from SUPERCACHE.

**Category:** `cache`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "key": { "type": "string" }
  },
  "required": ["key"]
}
```

**Example:**
```json
{
  "key": "computation-result"
}
```

---

### `cache_delete`

Delete entry from SUPERCACHE.

**Category:** `cache`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "key": { "type": "string" }
  },
  "required": ["key"]
}
```

**Example:**
```json
{
  "key": "old-result"
}
```

---

### `cache_clear`

Clear all entries or by tier.

**Category:** `cache`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "tier": { "type": "string", "enum": ["reasoning", "project", "vault"] }
  }
}
```

**Example:**
```json
{
  "tier": "reasoning"
}
```

---

### `cache_stats`

Get cache statistics.

**Category:** `cache`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {}
}
```

**Example:**
```json
{}
```

---

### `cache_keys`

List all keys in cache.

**Category:** `cache`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "tier": { "type": "string", "enum": ["reasoning", "project", "vault"] },
    "pattern": { "type": "string" }
  }
}
```

**Example:**
```json
{
  "tier": "project",
  "pattern": "computation-*"
}
```

---

## Patch Operations

### `apply_unified_diff`

Apply a unified diff patch to files with dry-run support.

**Category:** `patch`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "diff": { "type": "string" },
    "dryRun": { "type": "boolean" },
    "rootPath": { "type": "string" },
    "assessRisk": { "type": "boolean" }
  },
  "required": ["diff"]
}
```

**Example:**
```json
{
  "diff": "--- a/file.ts\n+++ b/file.ts\n@@ -1,1 +1,2 @@",
  "dryRun": false,
  "assessRisk": true
}
```

---

### `edit_range`

Edit a specific range of lines in a file.

**Category:** `patch`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" },
    "startLine": { "type": "number" },
    "endLine": { "type": "number" },
    "content": { "type": "string" },
    "dryRun": { "type": "boolean" }
  },
  "required": ["filePath", "startLine", "endLine", "content"]
}
```

**Example:**
```json
{
  "filePath": "/path/to/file.ts",
  "startLine": 10,
  "endLine": 20,
  "content": "new content"
}
```

---

### `insert_at`

Insert content at a specific line.

**Category:** `patch`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" },
    "lineNumber": { "type": "number" },
    "content": { "type": "string" },
    "dryRun": { "type": "boolean" }
  },
  "required": ["filePath", "lineNumber", "content"]
}
```

**Example:**
```json
{
  "filePath": "/path/to/file.ts",
  "lineNumber": 5,
  "content": "// New comment"
}
```

---

### `delete_range`

Delete a range of lines from a file.

**Category:** `patch`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "filePath": { "type": "string" },
    "startLine": { "type": "number" },
    "endLine": { "type": "number" },
    "dryRun": { "type": "boolean" }
  },
  "required": ["filePath", "startLine", "endLine"]
}
```

**Example:**
```json
{
  "filePath": "/path/to/file.ts",
  "startLine": 10,
  "endLine": 15
}
```

---

### `assess_patch_risk`

Assess the risk level of a patch before applying.

**Category:** `patch`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "diff": { "type": "string" }
  },
  "required": ["diff"]
}
```

**Example:**
```json
{
  "diff": "--- a/file.ts\n+++ b/file.ts\n..."
}
```

---

## System Operations

### `run`

Execute terminal commands.

**Category:** `system`
**Permission:** `dangerous`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "command": { "type": "string" },
    "args": { "type": "array", "items": { "type": "string" } },
    "cwd": { "type": "string" },
    "timeout": { "type": "number" },
    "env": { "type": "object" }
  },
  "required": ["command"]
}
```

**Example:**
```json
{
  "command": "ls",
  "args": ["-la", "/src"],
  "cwd": "/path/to/project"
}
```

---

### `ask_user`

Ask the user for input.

**Category:** `system`
**Permission:** `none`
**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "question": { "type": "string" }
  },
  "required": ["question"]
}
```

**Example:**
```json
{
  "question": "What would you like to name this feature?"
}
```

---

## Permission Levels

### `none`

Always allowed, no user confirmation required.

**Tools:** Most file operations, search, cache, git status/log

### `moderate`

Ask user once per session.

**Tools:** git stage/unstage, lint, some browser operations

### `dangerous`

Ask user for every execution.

**Tools:** write, edit, build, run tests, run commands, browser click/type

---

## Tool Result Format

All tools return a standardized result:

```typescript
interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## Complete Tool List

```
File Operations:
  read_file, write_file, edit_file, search_files, list_directory, get_file_info

Search Operations:
  grep_search, find_symbol, search_codebase, find_references

Build Operations:
  detect_project, run_tests, format, lint, build, check_permission,
  project_map, list_symbols

Git Operations:
  git_status, git_commit, git_diff, git_log, git_stage, git_unstage,
  git_branch, is_protected_branch

Browser Operations:
  browser_status, browser_navigate, browser_read_page, browser_screenshot,
  browser_click, browser_type, browser_find, browser_get_tabs

Cache Operations:
  cache_store, cache_retrieve, cache_delete, cache_clear, cache_stats,
  cache_keys

Patch Operations:
  apply_unified_diff, edit_range, insert_at, delete_range,
  assess_patch_risk

System Operations:
  run, ask_user
```

---

**Total Tools:** 48
**Categories:** 8
**Last Updated:** 2026-01-23
