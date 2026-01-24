# Floyd CLI Tools - Complete Specifications

**Version:** 0.1.0
**Last Updated:** 2026-01-22
**Repository:** FLOYD CLI (File-Logged Orchestrator Yielding Deliverables)

---

## Table of Contents

1. [File Operations](#file-operations)
2. [Code Search & Exploration](#code-search--exploration)
3. [Build & Test](#build--test)
4. [Git Operations](#git-operations)
5. [Browser Operations](#browser-operations)
6. [Cache Operations (SUPERCACHE)](#cache-operations-supercache)
7. [Patch Operations](#patch-operations)
8. [Explorer Operations](#explorer-operations)

---

## File Operations

### read_file
**Category:** File Operations
**Purpose:** Read file contents from disk
**Icon:** 📄

**Input Schema:**
```typescript
{
  filePath: string;           // Absolute path to file (required)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  filePath: string;
  content?: string;           // File contents if successful
  error?: string;             // Error message if failed
}
```

**Permissions:** None (read-only)
**Errors:**
- `FileNotFound` - File does not exist at path
- `PermissionDenied` - No read access to file
- `IsDirectory` - Path points to directory, not file

---

### write
**Category:** File Operations
**Purpose:** Create or overwrite files
**Icon:** ✍️

**Input Schema:**
```typescript
{
  filePath: string;           // Absolute path to file (required)
  content: string;            // File contents (required)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  filePath: string;
  bytesWritten?: number;      // Number of bytes written
  error?: string;
}
```

**Permissions:** Dangerous (requires user confirmation)
**Errors:**
- `ParentDirectoryNotFound` - Parent directory doesn't exist
- `PermissionDenied` - No write access to location
- `DiskFull` - Insufficient disk space

---

### edit_file
**Category:** File Operations
**Purpose:** Edit specific file sections using search/replace
**Icon:** ✏️

**Input Schema:**
```typescript
{
  filePath: string;           // Absolute path to file (required)
  oldString: string;          // Exact string to replace (required)
  newString: string;          // Replacement string (required)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  filePath: string;
  replacements: number;       // Count of replacements made
  error?: string;
}
```

**Permissions:** Dangerous (requires user confirmation)
**Errors:**
- `FileNotFound` - File does not exist
- `StringNotFound` - oldString not found in file
- `MultipleMatches` - oldString appears multiple times (ambiguous)
- `PermissionDenied` - No write access

---

### search_replace
**Category:** File Operations
**Purpose:** Search and replace text in files (globally)
**Icon:** 🔄

**Input Schema:**
```typescript
{
  filePath: string;           // Absolute path to file (required)
  searchString: string;       // Text to search for (required)
  replaceString: string;      // Replacement text (required)
 replaceAll?: boolean;        // Replace all occurrences (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  filePath: string;
  replacements: number;       // Count of replacements made
  error?: string;
}
```

**Permissions:** Dangerous (requires user confirmation)
**Errors:**
- `FileNotFound` - File does not exist
- `StringNotFound` - searchString not found
- `PermissionDenied` - No write access

---

## Code Search & Exploration

### grep
**Category:** Search
**Purpose:** Search file contents with regex patterns
**Icon:** 🔍

**Input Schema:**
```typescript
{
  pattern: string;            // Regex pattern to search for (required)
  path?: string;              // Directory to search in (default: cwd)
  filePattern?: string;       // Glob pattern for files (default: **/*)
  caseInsensitive?: boolean;  // Case-insensitive search (default: false)
  outputMode?: 'content' | 'files_with_matches' | 'count';  // default: content
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  matches: Array<{
    file: string;
    line: number;
    content: string;
    matchStart: number;
    matchEnd: number;
  }>;
  totalMatches: number;
  filesWithMatches: number;
  error?: string;
}
```

**Permissions:** None (read-only)
**Errors:**
- `InvalidRegex` - Pattern is not a valid regex
- `DirectoryNotFound` - Search path doesn't exist
- `PermissionDenied` - No read access to search path

---

### codebase_search
**Category:** Search
**Purpose:** Search entire codebase with semantic understanding
**Icon:** 🌐

**Input Schema:**
```typescript
{
  query: string;              // Natural language search query (required)
  path?: string;              // Directory to search (default: cwd)
  maxResults?: number;        // Maximum results to return (default: 20)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  results: Array<{
    file: string;
    score: number;            // Relevance score 0-1
    line: number;
    content: string;
    context: string;          // Surrounding code context
  }>;
  totalResults: number;
  error?: string;
}
```

**Permissions:** None (read-only)
**Errors:**
- `QueryTooShort` - Search query less than 3 characters
- `IndexNotBuilt` - Codebase index not available
- `PermissionDenied` - No read access

---

## Build & Test

### run
**Category:** Build
**Purpose:** Execute terminal commands
**Icon:** ▶️

**Input Schema:**
```typescript
{
  command: string;            // Command to execute (required)
  args?: string[];            // Command arguments
  cwd?: string;               // Working directory (default: cwd)
  timeout?: number;           // Timeout in milliseconds (default: 120000)
  env?: Record<string, string>; // Environment variables
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  duration: number;           // Execution time in ms
  error?: string;
}
```

**Permissions:** Dangerous (requires user confirmation)
**Errors:**
- `CommandNotFound` - Command executable not found
- `Timeout` - Command exceeded timeout limit
- `PermissionDenied` - No execute permission
- `Killed` - Process terminated by signal

---

## Git Operations

### git_status
**Category:** Git
**Purpose:** Show repository status with staged/unstaged files
**Icon:** 📦

**Input Schema:**
```typescript
{
  repoPath?: string;          // Path to git repository (default: cwd)
}
```

**Output Schema:**
```typescript
{
  isRepo: boolean;
  current?: string;           // Current branch name
  tracking?: string | null;   // Remote tracking branch
  files: Array<{
    path: string;
    status: string;           // M, M?, MM, A, D, R, etc.
    staged: boolean;
  }>;
  ahead: number;              // Commits ahead of remote
  behind: number;             // Commits behind remote
  error?: string;
}
```

**Permissions:** None (read-only)
**Errors:**
- `NotAGitRepository` - Path is not a git repository
- `PermissionDenied` - No read access to .git directory

---

### git_diff
**Category:** Git
**Purpose:** Show changes between commits, commit and working tree
**Icon:** 📦

**Input Schema:**
```typescript
{
  repoPath?: string;          // Path to git repository
  files?: string[];           // Specific files to diff (empty = all)
  staged?: boolean;           // Show staged changes (default: false)
  cached?: boolean;           // Alias for staged (default: false)
}
```

**Output Schema:**
```typescript
{
  files: Array<{
    file: string;
    status: 'modified' | 'added' | 'deleted' | 'renamed';
    chunks: Array<{
      oldStart: number;
      oldLines: number;
      newStart: number;
      newLines: number;
      content: string;
    }>;
  }> | {
    error: string;
  };
  raw?: string;               // Raw diff output
}
```

**Permissions:** None (read-only)
**Errors:**
- `NotAGitRepository` - Not a git repository
- `FileNotFound` - Specified file(s) don't exist

---

### git_log
**Category:** Git
**Purpose:** Show commit history
**Icon:** 📦

**Input Schema:**
```typescript
{
  repoPath?: string;
  maxCount?: number;          // Maximum commits to show (default: 20)
  since?: string;             // Show commits since date (e.g., "1 week ago")
  until?: string;             // Show commits until date
  author?: string;            // Filter by author
  file?: string;              // Show commits affecting specific file
}
```

**Output Schema:**
```typescript
{
  commits: Array<{
    hash: string;             // Commit SHA
    message: string;          // Commit message
    author: string;           // Author name
    date: string;             // ISO date string
  }> | {
    error: string;
  };
}
```

**Permissions:** None (read-only)
**Errors:**
- `NotAGitRepository` - Not a git repository
- `InvalidDateRange` - since/until date format invalid

---

### git_commit
**Category:** Git
**Purpose:** Record changes to repository with protected branch warnings
**Icon:** 📦

**Input Schema:**
```typescript
{
  message: string;            // Commit message (required)
  repoPath?: string;
  stageAll?: boolean;         // Stage all modified files (default: true)
  stageFiles?: string[];      // Specific files to stage (overrides stageAll)
  allowEmpty?: boolean;       // Allow empty commit (default: false)
  amend?: boolean;            // Amend previous commit (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  hash?: string;              // Commit SHA if successful
  error?: string;
  warnings?: string[];        // Protected branch warnings, etc.
}
```

**Permissions:** Dangerous (requires user confirmation)
**Errors:**
- `NotAGitRepository` - Not a git repository
- `NothingToCommit` - No changes staged and allowEmpty=false
- `ProtectedBranch` - Warning: committing to main/master/develop
- `PermissionDenied` - No write access to .git

---

### git_stage
**Category:** Git
**Purpose:** Stage files for commit
**Icon:** 📦

**Input Schema:**
```typescript
{
  files?: string[];           // Files to stage (empty = stage all)
  repoPath?: string;
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  staged: string[];           // Files that were staged
  error?: string;
}
```

**Permissions:** Moderate (modifies git index)
**Errors:**
- `NotAGitRepository` - Not a git repository
- `FileNotFound` - Specified file(s) don't exist
- `PermissionDenied` - No write access to .git

---

### git_unstage
**Category:** Git
**Purpose:** Unstage files from staging area
**Icon:** 📦

**Input Schema:**
```typescript
{
  files?: string[];           // Files to unstage (empty = unstage all)
  repoPath?: string;
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  unstaged: string[];         // Files that were unstaged
  error?: string;
}
```

**Permissions:** Moderate (modifies git index)
**Errors:**
- `NotAGitRepository` - Not a git repository
- `PermissionDenied` - No write access to .git

---

### git_branch
**Category:** Git
**Purpose:** List, create, or switch branches
**Icon:** 📦

**Input Schema:**
```typescript
{
  repoPath?: string;
  action: 'list' | 'current' | 'create' | 'switch';  // (default: 'list')
  name?: string;              // Branch name (for create/switch actions)
}
```

**Output Schema:**
```typescript
// action='list'
{
  branches: Array<{
    name: string;
    current: boolean;
    tracked?: string;
  }>;
  error?: string;
}

// action='current'
{
  branch?: string;
  error?: string;
}

// action='create' | 'switch'
{
  success: boolean;
  branch: string;
  created?: boolean;          // For create action
  switched?: boolean;         // For switch action
  error?: string;
}
```

**Permissions:** Moderate for list/current, Dangerous for create/switch
**Errors:**
- `NotAGitRepository` - Not a git repository
- `BranchNotFound` - Branch doesn't exist (switch action)
- `BranchAlreadyExists` - Branch already exists (create action)
- `PermissionDenied` - No write access to .git

---

### is_protected_branch
**Category:** Git
**Purpose:** Check if branch is protected (main, master, develop, etc.)
**Icon:** 📦

**Input Schema:**
```typescript
{
  branch?: string;            // Branch name to check (default: current)
  repoPath?: string;
}
```

**Output Schema:**
```typescript
{
  branch: string;             // Branch that was checked
  isProtected: boolean;       // Protection status
  protectedPatterns: string[];  // Patterns: main, master, develop, etc.
  error?: string;
}
```

**Permissions:** None (read-only)
**Errors:**
- `NotAGitRepository` - Not a git repository
- `CouldNotDetermineBranch` - Unable to get current branch

---

## Browser Operations

### browser_navigate
**Category:** Browser
**Purpose:** Navigate to a URL in the browser
**Icon:** 🌍

**Input Schema:**
```typescript
{
  url: string;                // URL to navigate to (required)
  tabId?: number;             // Tab ID (optional, uses active tab if not provided)
}
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;               // Status code
  data?: {
    tabId: number;
    url: string;
    title?: string;
    loaded: boolean;
  };
  error?: string;
}
```

**Permissions:** Moderate (browser automation)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - FloydChrome extension not running
- `InvalidURL` - URL format invalid
- `NavigationFailed` - Navigation blocked or failed
- `TabNotFound` - Specified tabId doesn't exist

---

### browser_read_page
**Category:** Browser
**Purpose:** Get semantic accessibility tree of current page
**Icon:** 🌍

**Input Schema:**
```typescript
{
  tabId?: number;             // Tab ID (optional, uses active tab)
}
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    url: string;
    title: string;
    tree: Array<{
      role: string;           // button, link, text, etc.
      name: string;           // Accessible name
      attributes?: Record<string, string>;
      children?: any[];
    }>;
  };
  error?: string;
}
```

**Permissions:** Moderate (browser automation)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `TabNotFound` - Tab doesn't exist
- `PageNotLoaded` - Page still loading or failed

---

### browser_screenshot
**Category:** Browser
**Purpose:** Capture screenshot for Computer Use/vision models
**Icon:** 🌍

**Input Schema:**
```typescript
{
  fullPage?: boolean;         // Capture full scrollable page (default: false)
  selector?: string;          // CSS selector for specific element
  tabId?: number;             // Tab ID (optional)
}
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    imageData: string;        // Base64-encoded PNG
    width: number;
    height: number;
    fullPage: boolean;
    selector?: string;
  };
  error?: string;
}
```

**Permissions:** Moderate (browser automation)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `TabNotFound` - Tab doesn't exist
- `ElementNotFound` - Selector didn't match any element
- `ScreenshotFailed` - Chrome screenshot API failed

---

### browser_click
**Category:** Browser
**Purpose:** Click element at coordinates or by CSS selector
**Icon:** 🌍

**Input Schema:**
```typescript
{
  x?: number;                 // X coordinate (alternative to selector)
  y?: number;                 // Y coordinate (alternative to selector)
  selector?: string;          // CSS selector (alternative to coordinates)
  tabId?: number;             // Tab ID (optional)
}
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    clicked: boolean;
    selector?: string;
    coordinates?: { x: number; y: number };
  };
  error?: string;
}
```

**Permissions:** Dangerous (modifies page state)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `ElementNotFound` - Selector didn't match element
- `CoordinatesInvalid` - X/Y out of viewport bounds
- `ClickFailed` - Element not clickable

---

### browser_type
**Category:** Browser
**Purpose:** Type text into the focused element
**Icon:** 🌍

**Input Schema:**
```typescript
{
  text: string;               // Text to type (required)
  tabId?: number;             // Tab ID (optional)
}
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    typed: boolean;
    characters: number;
  };
  error?: string;
}
```

**Permissions:** Dangerous (modifies page state)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `NoFocusedElement` - No element has focus
- `NotEditable` - Focused element is not editable
- `TypeFailed` - Input injection failed

---

### browser_find
**Category:** Browser
**Purpose:** Find element by natural language query
**Icon:** 🌍

**Input Schema:**
```typescript
{
  query: string;              // Natural language description (required)
  tabId?: number;             // Tab ID (optional)
}
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    elements: Array<{
      selector: string;
      role: string;
      name: string;
      score: number;          // Confidence score 0-1
    }>;
  };
  error?: string;
}
```

**Permissions:** Moderate (browser automation)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `NoResults` - No matching elements found
- `QueryTooShort` - Query less than 3 characters

---

### browser_get_tabs
**Category:** Browser
**Purpose:** List all open browser tabs
**Icon:** 🌍

**Input Schema:**
```typescript
{}  // No parameters required
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data?: {
    tabs: Array<{
      id: number;
      url: string;
      title: string;
      active: boolean;
    }>;
  };
  error?: string;
}
```

**Permissions:** Moderate (browser automation)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected

---

### browser_create_tab
**Category:** Browser
**Purpose:** Open a new browser tab
**Icon:** 🌍

**Input Schema:**
```typescript
{
  url?: string;               // URL to open (optional)
}
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    url: string;
    created: boolean;
  };
  error?: string;
}
```

**Permissions:** Moderate (browser automation)
**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `InvalidURL` - URL format invalid

---

### browser_status
**Category:** Browser
**Purpose:** Check connection status to FloydChrome extension
**Icon:** 🌍

**Input Schema:**
```typescript
{}  // No parameters required
```

**Output Schema:**
```typescript
{
  ok: boolean;
  code: string;
  data: {
    connected: boolean;
    extension_url: string;    // ws://localhost:3005
    reconnect_attempts: number;
    max_reconnect_attempts: number;
    reconnect_interval_ms: number;
    message: string;
  };
}
```

**Permissions:** None (status check only)
**Errors:** None (always succeeds)

---

## Cache Operations (SUPERCACHE)

### cache_store
**Category:** Cache
**Purpose:** Store data to a cache tier with optional metadata
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier: 'reasoning' | 'project' | 'vault';  // Cache tier (required)
  key: string;                // Unique key for entry (required)
  value: string;              // Value to store (required)
  metadata?: Record<string, any>;  // Optional metadata
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  tier: string;
  key: string;
  message: string;
  expires?: number;           // Unix timestamp when entry expires
}
```

**Permissions:** None (local cache storage)
**Errors:**
- `InvalidTier` - Tier not one of: reasoning, project, vault
- `EmptyKey` - Cache key cannot be empty
- `EmptyValue` - Cache value cannot be empty
- `PermissionDenied` - No write access to cache directory

**TTL by Tier:**
- `reasoning`: 5 minutes (300,000ms)
- `project`: 24 hours (86,400,000ms)
- `vault`: 7 days (604,800,000ms)

---

### cache_retrieve
**Category:** Cache
**Purpose:** Retrieve data from a cache tier by key
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier: 'reasoning' | 'project' | 'vault';  // Cache tier (required)
  key: string;                // Key to retrieve (required)
}
```

**Output Schema:**
```typescript
{
  tier: string;
  key: string;
  found: boolean;             // true if entry exists and not expired
  value?: string;             // Entry value if found
  expires?: number;           // Expiry timestamp if found
  metadata?: Record<string, any>;
}
```

**Permissions:** None (local cache read)
**Errors:**
- `InvalidTier` - Tier not valid
- `EmptyKey` - Key cannot be empty
- `PermissionDenied` - No read access to cache directory

---

### cache_delete
**Category:** Cache
**Purpose:** Delete a cache entry by key
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier: 'reasoning' | 'project' | 'vault';  // Cache tier (required)
  key: string;                // Key to delete (required)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  tier: string;
  key: string;
  deleted: boolean;           // true if entry existed and was deleted
  message: string;
}
```

**Permissions:** Moderate (deletes cache data)
**Errors:**
- `InvalidTier` - Tier not valid
- `EmptyKey` - Key cannot be empty
- `PermissionDenied` - No write access to cache directory

---

### cache_clear
**Category:** Cache
**Purpose:** Clear all entries from a cache tier, or all tiers if not specified
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier?: 'reasoning' | 'project' | 'vault';  // Tier to clear (omits = clear all)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  deleted: number;            // Number of entries deleted
  tier: string;               // 'all' or specific tier
  message: string;
}
```

**Permissions:** Dangerous (deletes all cache data)
**Errors:**
- `InvalidTier` - Specified tier not valid
- `PermissionDenied` - No write access to cache directory

---

### cache_list
**Category:** Cache
**Purpose:** List all non-expired entries in a cache tier
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier?: 'reasoning' | 'project' | 'vault';  // Tier to list (omits = list all)
}
```

**Output Schema:**
```typescript
{
  count: number;
  entries: Array<{
    key: string;
    tier: string;
    timestamp: number;        // Creation timestamp
    expires: number;          // Expiry timestamp
    metadata?: Record<string, any>;
  }>;
}
```

**Permissions:** None (read-only)
**Errors:**
- `InvalidTier` - Specified tier not valid
- `PermissionDenied` - No read access to cache directory

---

### cache_search
**Category:** Cache
**Purpose:** Search for entries in a cache tier by key or value
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier: 'reasoning' | 'project' | 'vault';  // Cache tier (required)
  query: string;              // Search query (matches key or value) (required)
}
```

**Output Schema:**
```typescript
{
  query: string;
  tier: string;
  count: number;
  results: Array<{
    key: string;
    timestamp: number;
    expires: number;
    metadata?: Record<string, any>;
    matchScore?: number;      // Relevance score
  }>;
}
```

**Permissions:** None (read-only)
**Errors:**
- `InvalidTier` - Tier not valid
- `QueryTooShort` - Query less than 2 characters
- `PermissionDenied` - No read access

---

### cache_stats
**Category:** Cache
**Purpose:** Get statistics for cache tiers (entry count, size, oldest/newest)
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier?: 'reasoning' | 'project' | 'vault';  // Tier for stats (omits = all)
}
```

**Output Schema:**
```typescript
{
  [tier: string]: {
    entries: number;          // Total entries (including expired)
    active: number;           // Non-expired entries
    sizeBytes: number;        // Total size in bytes
    oldest?: {
      key: string;
      timestamp: number;
    };
    newest?: {
      key: string;
      timestamp: number;
    };
  };
}
```

**Permissions:** None (read-only statistics)
**Errors:**
- `InvalidTier` - Specified tier not valid
- `PermissionDenied` - No read access

---

### cache_prune
**Category:** Cache
**Purpose:** Remove all expired entries from cache tiers
**Icon:** 💾

**Input Schema:**
```typescript
{
  tier?: 'reasoning' | 'project' | 'vault';  // Tier to prune (omits = prune all)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  pruned: number;             // Number of entries removed
  tier: string;               // 'all' or specific tier
  message: string;
}
```

**Permissions:** Moderate (deletes expired data only)
**Errors:**
- `InvalidTier` - Specified tier not valid
- `PermissionDenied` - No write access

---

### cache_store_pattern
**Category:** Cache
**Purpose:** Store a reusable pattern to the vault tier
**Icon:** 💾

**Input Schema:**
```typescript
{
  name: string;               // Pattern name (required)
  pattern: string;            // Pattern content (code, solution, etc.) (required)
  tags?: string[];            // Optional tags for categorization
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  name: string;
  tags?: string[];
  message: string;
  storedAt: number;           // Storage timestamp
}
```

**Permissions:** None (stores to vault)
**Errors:**
- `EmptyName` - Pattern name cannot be empty
- `EmptyPattern` - Pattern content cannot be empty
- `InvalidTagFormat` - Tags must be strings
- `PermissionDenied` - No write access to vault

---

### cache_store_reasoning
**Category:** Cache
**Purpose:** Store a reasoning frame to the active reasoning frame
**Icon:** 💾

**Input Schema:**
```typescript
{
  frame: string;              // Reasoning frame as JSON string (required)
}
```

**Frame Structure (JSON):**
```typescript
{
  frame_id: string;
  timestamp: number;
  cog_steps: Array<{
    step: number;
    thought: string;
  }>;
  metadata?: Record<string, any>;
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  steps: number;              // Number of cognitive steps stored
  message: string;
  frameId: string;
}
```

**Permissions:** None (stores to reasoning tier)
**Errors:**
- `InvalidJSON` - Frame is not valid JSON
- `MissingFrameId` - frame_id field required
- `MissingCogSteps` - cog_steps array required
- `PermissionDenied` - No write access

---

### cache_load_reasoning
**Category:** Cache
**Purpose:** Load the active reasoning frame
**Icon:** 💾

**Input Schema:**
```typescript
{}  // No parameters required
```

**Output Schema:**
```typescript
{
  found: boolean;
  frame?: {
    frame_id: string;
    timestamp: number;
    cog_steps: Array<{
      step: number;
      thought: string;
    }>;
    metadata?: Record<string, any>;
  };
}
```

**Permissions:** None (read-only)
**Errors:**
- `PermissionDenied` - No read access to reasoning tier

---

### cache_archive_reasoning
**Category:** Cache
**Purpose:** Archive the active reasoning frame to project tier
**Icon:** 💾

**Input Schema:**
```typescript
{}  // No parameters required
```

**Output Schema:**
```typescript
{
  success: boolean;
  message: string;
  archivedFrameId?: string;
  archivedTo?: string;        // Project tier entry key
}
```

**Permissions:** Moderate (moves reasoning to project tier)
**Errors:**
- `NoActiveFrame` - No reasoning frame to archive
- `PermissionDenied` - No write access to project tier

---

## Patch Operations

### apply_unified_diff
**Category:** Code
**Purpose:** Apply a unified diff patch to files with dry-run support
**Icon:** 🩹

**Input Schema:**
```typescript
{
  diff: string;               // The unified diff content (required)
  dryRun?: boolean;           // Preview changes without applying (default: false)
  rootPath?: string;          // Root path for resolving files (default: cwd)
  assessRisk?: boolean;       // Perform risk assessment (default: true)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  appliedFiles: string[];     // Files successfully patched
  errors: string[];           // Error messages for failed files
  preview?: string[];         // Dry-run preview messages
  risk?: {
    riskLevel: 'low' | 'medium' | 'high';
    warnings: string[];
    isBinary: boolean;
    affectsMultipleFiles: boolean;
    totalChanges: number;
  };
  parsedFiles?: Array<{
    path: string;
    status: 'added' | 'deleted' | 'modified' | 'renamed';
    hunks: number;
  }>;
}
```

**Permissions:** Dangerous (modifies multiple files)
**Errors:**
- `NoValidDiff` - Input contains no valid unified diff
- `PatchFailed` - Failed to apply patch to file(s)
- `BinaryFile` - Attempting to patch binary file
- `RiskLevelHigh` - Risk assessment shows high risk (warning only)

---

### edit_range
**Category:** Code
**Purpose:** Edit a specific range of lines in a file with automatic backups
**Icon:** 🩹

**Input Schema:**
```typescript
{
  filePath: string;           // Path to file (required)
  startLine: number;          // Start line number (0-indexed) (required)
  endLine: number;            // End line number (0-indexed, inclusive) (required)
  content: string;            // New content to insert (required)
  dryRun?: boolean;           // Preview without applying (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  originalLines?: string[];   // Original lines that were replaced
  modifiedLines?: string[];   // New lines that replaced them
  backupPath?: string;        // Path to .backup file if created
  error?: string;
}
```

**Permissions:** Dangerous (modifies file)
**Errors:**
- `FileNotFound` - File doesn't exist
- `InvalidLineRange` - startLine/endLine out of bounds or invalid
- `PermissionDenied` - No write access

---

### insert_at
**Category:** Code
**Purpose:** Insert content at a specific line with automatic backups
**Icon:** 🩹

**Input Schema:**
```typescript
{
  filePath: string;           // Path to file (required)
  lineNumber: number;         // Line number to insert at (0-indexed) (required)
  content: string;            // Content to insert (required)
  dryRun?: boolean;           // Preview without applying (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  insertedLines?: string[];   // Lines that were inserted
  backupPath?: string;        // Path to .backup file if created
  error?: string;
}
```

**Permissions:** Dangerous (modifies file)
**Errors:**
- `FileNotFound` - File doesn't exist
- `InvalidLineNumber` - lineNumber out of bounds
- `PermissionDenied` - No write access

---

### delete_range
**Category:** Code
**Purpose:** Delete a range of lines from a file with automatic backups
**Icon:** 🩹

**Input Schema:**
```typescript
{
  filePath: string;           // Path to file (required)
  startLine: number;          // Start line number (0-indexed) (required)
  endLine: number;            // End line number (0-indexed, inclusive) (required)
  dryRun?: boolean;           // Preview without applying (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  deletedLines?: string[];    // Lines that were deleted
  backupPath?: string;        // Path to .backup file if created
  error?: string;
}
```

**Permissions:** Dangerous (modifies file)
**Errors:**
- `FileNotFound` - File doesn't exist
- `InvalidLineRange` - startLine/endLine out of bounds or invalid
- `PermissionDenied` - No write access

---

### assess_patch_risk
**Category:** Code
**Purpose:** Assess the risk level of a patch before applying
**Icon:** 🩹

**Input Schema:**
```typescript
{
  diff: string;               // The unified diff content (required)
}
```

**Output Schema:**
```typescript
{
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];         // Risk warnings
  isBinary: boolean;          // Binary files detected
  affectsMultipleFiles: boolean;
  totalChanges: number;       // Total hunks across all files
  files: Array<{
    path: string;
    status: 'added' | 'deleted' | 'modified' | 'renamed';
    hunkCount: number;
  }>;
}
```

**Risk Assessment Rules:**
- **High**: Binary files, sensitive files (.env, credentials), file deletions
- **Medium**: Large hunks (>50 lines), multiple files (>3)
- **Low**: Small surgical changes to non-sensitive files

**Permissions:** None (read-only analysis)
**Errors:** None (always returns assessment)

---

## Explorer Operations

### detect_project
**Category:** Build
**Purpose:** Auto-detect project type (Node/Go/Rust/Python) and available commands
**Icon:** 🗺️

**Input Schema:**
```typescript
{
  projectPath?: string;       // Path to project directory (default: cwd)
}
```

**Output Schema:**
```typescript
{
  type: 'node' | 'go' | 'rust' | 'python' | 'unknown';
  confidence: number;         // 0.0 - 1.0
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'go' | 'cargo' | 'pip' | 'poetry';
  commands: {
    test?: string;            // Test command
    format?: string;          // Format command
    lint?: string;            // Lint command
    build?: string;           // Build command
  };
  hasConfigFiles: string[];   // Detected config files
}
```

**Permissions:** None (read-only detection)
**Errors:** None (always returns result)

---

### run_tests
**Category:** Build
**Purpose:** Run tests for the detected project (requires permission)
**Icon:** 🏃

**Input Schema:**
```typescript
{
  projectPath?: string;       // Path to project directory
  command?: string;           // Custom test command (overrides detected)
  grantPermission?: boolean;  // Grant permission for this session (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  output: string;             // Stdout
  errorOutput: string;        // Stderr
  exitCode: number | null;
  duration: number;           // Execution time in ms
  projectType: 'node' | 'go' | 'rust' | 'python' | 'unknown';
  command: string;            // Command that was run
  permissionGranted: boolean;
}
```

**Permissions:** Dangerous (requires explicit permission)
**Errors:**
- `PermissionDenied` - Permission not granted, use grantPermission=true
- `NoTestCommand` - No test command configured for project type
- `CommandFailed` - Test command exited with non-zero code

---

### format
**Category:** Build
**Purpose:** Format code using project's configured formatter (requires permission)
**Icon:** 🏃

**Input Schema:**
```typescript
{
  projectPath?: string;
  command?: string;           // Custom format command (overrides detected)
  grantPermission?: boolean;  // Grant permission (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  output: string;
  errorOutput: string;
  exitCode: number | null;
  duration: number;
  projectType: string;
  command: string;
  permissionGranted: boolean;
}
```

**Permissions:** Dangerous (modifies source files)
**Errors:**
- `PermissionDenied` - Permission not granted
- `NoFormatCommand` - No format command configured

---

### lint
**Category:** Build
**Purpose:** Run project's linter (requires permission)
**Icon:** 🏃

**Input Schema:**
```typescript
{
  projectPath?: string;
  command?: string;           // Custom lint command (overrides detected)
  grantPermission?: boolean;  // Grant permission (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  output: string;
  errorOutput: string;
  exitCode: number | null;
  duration: number;
  projectType: string;
  command: string;
  permissionGranted: boolean;
}
```

**Permissions:** Moderate (read-only code analysis)
**Errors:**
- `PermissionDenied` - Permission not granted
- `NoLintCommand` - No lint command configured

---

### build
**Category:** Build
**Purpose:** Build the project (requires permission)
**Icon:** 🏃

**Input Schema:**
```typescript
{
  projectPath?: string;
  command?: string;           // Custom build command (overrides detected)
  grantPermission?: boolean;  // Grant permission (default: false)
}
```

**Output Schema:**
```typescript
{
  success: boolean;
  output: string;
  errorOutput: string;
  exitCode: number | null;
  duration: number;
  projectType: string;
  command: string;
  permissionGranted: boolean;
}
```

**Permissions:** Dangerous (runs build process)
**Errors:**
- `PermissionDenied` - Permission not granted
- `NoBuildCommand` - No build command configured
- `BuildFailed` - Build exited with errors

---

### check_permission
**Category:** Build
**Purpose:** Check if permission is granted for a runner operation
**Icon:** 🏃

**Input Schema:**
```typescript
{
  toolName: 'run_tests' | 'format' | 'lint' | 'build';  // Tool name (required)
  projectPath?: string;
}
```

**Output Schema:**
```typescript
{
  tool: string;
  projectPath: string;
  hasPermission: boolean;
}
```

**Permissions:** None (status check only)
**Errors:** None (always returns status)

---

### project_map
**Category:** Search
**Purpose:** Get directory tree structure
**Icon:** 🗺️

**Input Schema:**
```typescript
{
  maxDepth?: number;          // Maximum depth to traverse (default: 3)
}
```

**Output Schema:**
```typescript
{
  tree: string;               // ASCII tree representation
  format: 'ascii';            // Always ascii for now
}
```

**Permissions:** None (read-only)
**Errors:** None (always returns tree)

---

### semantic_search
**Category:** Search
**Purpose:** Search codebase by concept/keywords
**Icon:** 🗺️

**Input Schema:**
```typescript
{
  query: string;              // Search query (required)
}
```

**Output Schema:**
```typescript
{
  results: Array<{
    file: string;
    score: number;            // Relevance score
    matches: Array<{
      line: number;
      content: string;
    }>;
  }>;
  totalResults: number;
}
```

**Permissions:** None (read-only)
**Errors:** None (always returns results)

---

### list_symbols
**Category:** Search
**Purpose:** List symbols (classes, functions, interfaces) in a file
**Icon:** 🗺️

**Input Schema:**
```typescript
{
  filePath: string;           // Path to file (required)
}
```

**Output Schema:**
```typescript
{
  symbols: Array<{
    name: string;
    type: 'class' | 'function' | 'interface' | 'rust_fn' | 'rust_struct';
    line: number;
    preview: string;          // Line content
  }>;
}
```

**Permissions:** None (read-only)
**Errors:**
- `FileNotFound` - File doesn't exist

---

---

## Permission Levels

| Level | Description | Examples |
|-------|-------------|----------|
| **None** | Read-only operations, no side effects | read_file, grep, browser_status, cache_list |
| **Moderate** | Non-destructive writes, may affect state | git_stage, git_unstage, cache_delete |
| **Dangerous** | Destructive operations, requires confirmation | write, edit_file, run, git_commit |

---

## Common Error Codes

| Code | Description | Tools |
|------|-------------|-------|
| `FileNotFound` | File doesn't exist at path | All file operations |
| `PermissionDenied` | No filesystem access | All write operations |
| `InvalidInput` | Parameter validation failed | All tools |
| `Timeout` | Operation exceeded time limit | run, browser tools |
| `BROWSER_EXTENSION_UNAVAILABLE` | FloydChrome not connected | All browser tools |

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `FLOYD_EXTENSION_URL` | WebSocket URL for FloydChrome | `ws://localhost:3005` |
| `MAX_RECONNECT` | Max reconnection attempts for browser | `3` |
| `RECONNECT_INTERVAL` | Delay between reconnects (ms) | `5000` |

---

## Cache Directory Structure

```
~/.floyd/cache/
├── reasoning/           # 5-minute TTL (conversation state)
├── project/            # 24-hour TTL (project context)
└── vault/              # 7-day TTL (reusable patterns)
```

---

## Browser Extension Connection

The browser tools require **FloydChrome** extension to be running:

1. Install FloydChrome extension
2. Extension starts WebSocket server on `ws://localhost:3005`
3. MCP Browser Server connects automatically
4. All browser tools proxy through extension

If extension is unavailable, browser tools return graceful error with `connected: false` in status.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-01-22 | Initial documentation from MCP server implementations |

---

**Generated from:** `/Volumes/Storage/FLOYD_CLI/INK/floyd-cli/src/mcp/`
**Document ID:** `FLOYD-TOOLS-SPEC-001`
