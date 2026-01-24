# Floyd Wrapper - Complete Tool Specifications

**Version:** 1.0.0
**Last Updated:** 2026-01-22
**Total Tools:** 55
**Repository:** Floyd Wrapper (File-Logged Orchestrator Yielding Deliverables)

---

## Table of Contents

1. [File Operations (4)](#file-operations)
2. [Code Search & Exploration (8)](#code-search--exploration)
3. [Build & Test (6)](#build--test)
4. [Git Operations (8)](#git-operations)
5. [Browser Operations (9)](#browser-operations)
6. [Cache Operations (11)](#cache-operations-supercache)
7. [Patch Operations (5)](#patch-operations)
8. [Special Tools (4)](#special-tools)

---

## Architecture & Best Practices

### Tool Interface (TypeScript)

All tools implement this strict interface:

```typescript
import { z } from 'zod';

/**
 * Base tool definition interface
 */
export interface FloydTool<TInput = any, TOutput = any> {
  /** Unique tool identifier */
  name: string;

  /** Human-readable display name */
  displayName: string;

  /** Tool category for UI organization */
  category: ToolCategory;

  /** Concise description of tool purpose */
  description: string;

  /** Icon for UI display (emoji) */
  icon: string;

  /** Default enabled state */
  defaultEnabled: boolean;

  /** Permission level required */
  permission: PermissionLevel;

  /** Zod schema for input validation */
  inputSchema: z.ZodType<TInput>;

  /** Output type definition */
  outputType: z.ZodType<TOutput>;

  /** Tool implementation */
  execute(input: TInput): Promise<TOutput>;
}

/** Tool categories */
export type ToolCategory =
  | 'file'
  | 'search'
  | 'build'
  | 'git'
  | 'browser'
  | 'cache'
  | 'patch'
  | 'special';

/** Permission levels */
export type PermissionLevel = 'none' | 'moderate' | 'dangerous';
```

### Error Handling Pattern

All tools return consistent error responses:

```typescript
interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Usage in tools
async function execute(input: TInput): Promise<ToolResult<TOutput>> {
  try {
    // 1. Validate input using Zod
    const validated = inputSchema.parse(input);

    // 2. Perform operation
    const result = await implement(validated);

    // 3. Return success
    return { success: true, data: result };
  } catch (error) {
    // 4. Return structured error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Input validation failed',
          details: error.errors,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
```

### Common Error Codes

| Code | Description | Retry |
|------|-------------|-------|
| `INVALID_INPUT` | Input validation failed (Zod) | No |
| `FILE_NOT_FOUND` | File doesn't exist at path | No |
| `PERMISSION_DENIED` | Insufficient filesystem access | No |
| `TIMEOUT` | Operation exceeded time limit | Yes |
| `NETWORK_ERROR` | Network request failed | Yes |
| `BROWSER_EXTENSION_UNAVAILABLE` | FloydChrome not connected | No |

---

## File Operations

### read_file

**Purpose:** Read file contents from disk with encoding detection.

**Interface:**
```typescript
interface ReadFileInput {
  filePath: string;
  encoding?: 'utf-8' | 'utf-16' | 'ascii';
}

interface ReadFileOutput {
  filePath: string;
  content: string;
  size: number;
  encoding: string;
  lastModified: number;
}
```

**Zod Schema:**
```typescript
import { z } from 'zod';

const readFileSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  encoding: z.enum(['utf-8', 'utf-16', 'ascii']).default('utf-8'),
});
```

**Permission:** `none`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist
- `PERMISSION_DENIED` - No read access
- `IS_DIRECTORY` - Path points to directory

---

### write

**Purpose:** Create or overwrite files with atomic writes.

**Interface:**
```typescript
interface WriteInput {
  filePath: string;
  content: string;
  encoding?: 'utf-8' | 'utf-16' | 'ascii';
  createDirectories?: boolean;
}

interface WriteOutput {
  filePath: string;
  bytesWritten: number;
  created: boolean;
}
```

**Zod Schema:**
```typescript
const writeSchema = z.object({
  filePath: z.string().min(1),
  content: z.string(),
  encoding: z.enum(['utf-8', 'utf-16', 'ascii']).default('utf-8'),
  createDirectories: z.boolean().default(false),
});
```

**Permission:** `dangerous`

**Errors:**
- `PARENT_DIRECTORY_NOT_FOUND` - Parent dir doesn't exist (unless createDirectories=true)
- `PERMISSION_DENIED` - No write access
- `DISK_FULL` - Insufficient disk space

---

### edit_file

**Purpose:** Surgical search/replace editing with uniqueness validation.

**Interface:**
```typescript
interface EditFileInput {
  filePath: string;
  oldString: string;
  newString: string;
  matchCase?: boolean;
}

interface EditFileOutput {
  filePath: string;
  replacements: number;
  preview?: string;
}
```

**Zod Schema:**
```typescript
const editFileSchema = z.object({
  filePath: z.string().min(1),
  oldString: z.string().min(1, 'Search string cannot be empty'),
  newString: z.string(),
  matchCase: z.boolean().default(true),
});
```

**Permission:** `dangerous`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist
- `STRING_NOT_FOUND` - oldString not in file
- `MULTIPLE_MATCHES` - oldString appears multiple times (ambiguous)
- `PERMISSION_DENIED` - No write access

---

### search_replace

**Purpose:** Global search and replace with optional match limits.

**Interface:**
```typescript
interface SearchReplaceInput {
  filePath: string;
  searchString: string;
  replaceString: string;
  replaceAll?: boolean;
  maxReplacements?: number;
}

interface SearchReplaceOutput {
  filePath: string;
  replacements: number;
  truncated: boolean;
}
```

**Zod Schema:**
```typescript
const searchReplaceSchema = z.object({
  filePath: z.string().min(1),
  searchString: z.string().min(1),
  replaceString: z.string(),
  replaceAll: z.boolean().default(false),
  maxReplacements: z.number().int().positive().optional(),
});
```

**Permission:** `dangerous`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist
- `STRING_NOT_FOUND` - searchString not found
- `PERMISSION_DENIED` - No write access

---

## Code Search & Exploration

### grep

**Purpose:** Search file contents using regex patterns with ripgrep-compatible options.

**Interface:**
```typescript
interface GrepInput {
  pattern: string;
  path?: string;
  filePattern?: string;
  caseInsensitive?: boolean;
  outputMode?: 'content' | 'files_with_matches' | 'count';
  contextLines?: number;
}

interface GrepOutput {
  matches: Array<{
    file: string;
    line: number;
    content: string;
    matchStart: number;
    matchEnd: number;
  }>;
  totalMatches: number;
  filesWithMatches: number;
}
```

**Zod Schema:**
```typescript
const grepSchema = z.object({
  pattern: z.string().min(1),
  path: z.string().default(process.cwd()),
  filePattern: z.string().default('**/*'),
  caseInsensitive: z.boolean().default(false),
  outputMode: z.enum(['content', 'files_with_matches', 'count']).default('content'),
  contextLines: z.number().int().min(0).max(10).default(0),
});
```

**Permission:** `none`

**Errors:**
- `INVALID_REGEX` - Pattern is not valid regex
- `DIRECTORY_NOT_FOUND` - Search path doesn't exist

---

### codebase_search

**Purpose:** Semantic code search using keyword matching and file analysis.

**Interface:**
```typescript
interface CodebaseSearchInput {
  query: string;
  path?: string;
  maxResults?: number;
  fileExtensions?: string[];
}

interface CodebaseSearchOutput {
  results: Array<{
    file: string;
    score: number;
    matches: Array<{
      line: number;
      content: string;
    }>;
  }>;
  totalResults: number;
}
```

**Zod Schema:**
```typescript
const codebaseSearchSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
  path: z.string().default(process.cwd()),
  maxResults: z.number().int().positive().max(100).default(20),
  fileExtensions: z.array(z.string()).default(['ts', 'tsx', 'js', 'jsx', 'rs', 'go', 'py']),
});
```

**Permission:** `none`

**Errors:**
- `QUERY_TOO_SHORT` - Query less than 3 characters
- `DIRECTORY_NOT_FOUND` - Search path invalid

---

### project_map

**Purpose:** Generate ASCII directory tree with configurable depth.

**Interface:**
```typescript
interface ProjectMapInput {
  maxDepth?: number;
  ignorePatterns?: string[];
  rootPath?: string;
}

interface ProjectMapOutput {
  tree: string;
  format: 'ascii';
  fileCount: number;
  directoryCount: number;
}
```

**Zod Schema:**
```typescript
const projectMapSchema = z.object({
  maxDepth: z.number().int().min(1).max(10).default(3),
  ignorePatterns: z.array(z.string()).default([
    'node_modules',
    '.git',
    'dist',
    'target',
    '.floyd',
    'build',
  ]),
  rootPath: z.string().default(process.cwd()),
});
```

**Permission:** `none`

**Errors:**
- `DIRECTORY_NOT_FOUND` - Root path invalid

---

### list_symbols

**Purpose:** Extract code symbols (classes, functions, interfaces) using regex parsing.

**Interface:**
```typescript
interface ListSymbolsInput {
  filePath: string;
  languages?: ('typescript' | 'rust' | 'go' | 'python')[];
}

interface ListSymbolsOutput {
  symbols: Array<{
    name: string;
    type: 'class' | 'function' | 'interface' | 'struct' | 'enum';
    line: number;
    preview: string;
  }>;
  file: string;
  totalSymbols: number;
}
```

**Zod Schema:**
```typescript
const listSymbolsSchema = z.object({
  filePath: z.string().min(1),
  languages: z.array(z.enum(['typescript', 'rust', 'go', 'python'])).optional(),
});
```

**Permission:** `none`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist

---

### semantic_search

**Purpose:** Concept-based code search with keyword extraction.

**Interface:**
```typescript
interface SemanticSearchInput {
  query: string;
  maxResults?: number;
}

interface SemanticSearchOutput {
  results: Array<{
    file: string;
    score: number;
    matches: Array<{
      line: number;
      content: string;
    }>;
  }>;
}
```

**Zod Schema:**
```typescript
const semanticSearchSchema = z.object({
  query: z.string().min(2),
  maxResults: z.number().int().positive().max(20).default(8),
});
```

**Permission:** `none`

**Errors:** None (always returns results)

---

### check_diagnostics

**Purpose:** Auto-detect project type and run compiler/linter checks.

**Interface:**
```typescript
interface CheckDiagnosticsInput {
  projectType?: 'typescript' | 'rust' | 'go' | 'python' | 'auto';
}

interface CheckDiagnosticsOutput {
  projectType: string;
  status: 'clean' | 'error' | 'skipped';
  output: string;
  errorCount?: number;
  warningCount?: number;
}
```

**Zod Schema:**
```typescript
const checkDiagnosticsSchema = z.object({
  projectType: z.enum(['typescript', 'rust', 'go', 'python', 'auto']).default('auto'),
});
```

**Permission:** `none`

**Errors:** None (returns status)

---

### fetch_docs

**Purpose:** Fetch and parse external documentation using jina.ai reader.

**Interface:**
```typescript
interface FetchDocsInput {
  url: string;
  maxLength?: number;
}

interface FetchDocsOutput {
  url: string;
  content: string;
  truncated: boolean;
  length: number;
}
```

**Zod Schema:**
```typescript
const fetchDocsSchema = z.object({
  url: z.string().url('Invalid URL format'),
  maxLength: z.number().int().positive().max(100000).default(15000),
});
```

**Permission:** `none`

**Errors:**
- `INVALID_URL` - URL format invalid
- `NETWORK_ERROR` - Failed to fetch URL

---

### dependency_xray

**Purpose:** Inspect installed npm package source code.

**Interface:**
```typescript
interface DependencyXrayInput {
  packageName: string;
}

interface DependencyXrayOutput {
  found: boolean;
  path?: string;
  preview?: string;
  message?: string;
}
```

**Zod Schema:**
```typescript
const dependencyXraySchema = z.object({
  packageName: z.string().min(1),
});
```

**Permission:** `none`

**Errors:** None (returns found status)

---

## Build & Test

### run

**Purpose:** Execute shell commands with timeout and output capture.

**Interface:**
```typescript
interface RunInput {
  command: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

interface RunOutput {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  duration: number;
  timedOut: boolean;
}
```

**Zod Schema:**
```typescript
const runSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  cwd: z.string().default(process.cwd()),
  timeout: z.number().int().positive().max(300000).default(120000),
  env: z.record(z.string()).optional(),
});
```

**Permission:** `dangerous`

**Errors:**
- `COMMAND_NOT_FOUND` - Executable not found
- `TIMEOUT` - Exceeded timeout limit
- `PERMISSION_DENIED` - No execute permission

---

### detect_project

**Purpose:** Auto-detect project type and available commands.

**Interface:**
```typescript
interface DetectProjectInput {
  projectPath?: string;
}

interface DetectProjectOutput {
  type: 'node' | 'go' | 'rust' | 'python' | 'unknown';
  confidence: number;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'go' | 'cargo' | 'pip' | 'poetry';
  commands: {
    test?: string;
    format?: string;
    lint?: string;
    build?: string;
  };
  hasConfigFiles: string[];
}
```

**Zod Schema:**
```typescript
const detectProjectSchema = z.object({
  projectPath: z.string().default(process.cwd()),
});
```

**Permission:** `none`

**Errors:** None (always returns result)

---

### run_tests

**Purpose:** Run project tests with permission gate.

**Interface:**
```typescript
interface RunTestsInput {
  projectPath?: string;
  command?: string;
  grantPermission?: boolean;
}

interface RunTestsOutput {
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

**Zod Schema:**
```typescript
const runTestsSchema = z.object({
  projectPath: z.string().default(process.cwd()),
  command: z.string().optional(),
  grantPermission: z.boolean().default(false),
});
```

**Permission:** `dangerous`

**Errors:**
- `PERMISSION_DENIED` - Permission not granted
- `NO_TEST_COMMAND` - No test command configured

---

### format

**Purpose:** Format code using project's configured formatter.

**Interface:**
```typescript
interface FormatInput {
  projectPath?: string;
  command?: string;
  grantPermission?: boolean;
}

interface FormatOutput {
  success: boolean;
  output: string;
  errorOutput: string;
  exitCode: number | null;
  duration: number;
  projectType: string;
  command: string;
}
```

**Zod Schema:**
```typescript
const formatSchema = z.object({
  projectPath: z.string().default(process.cwd()),
  command: z.string().optional(),
  grantPermission: z.boolean().default(false),
});
```

**Permission:** `dangerous` (modifies source files)

**Errors:**
- `PERMISSION_DENIED` - Permission not granted
- `NO_FORMAT_COMMAND` - No format command configured

---

### lint

**Purpose:** Run project's linter.

**Interface:**
```typescript
interface LintInput {
  projectPath?: string;
  command?: string;
  grantPermission?: boolean;
}

interface LintOutput {
  success: boolean;
  output: string;
  errorOutput: string;
  exitCode: number | null;
  duration: number;
  projectType: string;
  issueCount?: number;
}
```

**Zod Schema:**
```typescript
const lintSchema = z.object({
  projectPath: z.string().default(process.cwd()),
  command: z.string().optional(),
  grantPermission: z.boolean().default(false),
});
```

**Permission:** `moderate` (read-only analysis)

**Errors:**
- `PERMISSION_DENIED` - Permission not granted
- `NO_LINT_COMMAND` - No lint command configured

---

### build

**Purpose:** Build the project.

**Interface:**
```typescript
interface BuildInput {
  projectPath?: string;
  command?: string;
  grantPermission?: boolean;
}

interface BuildOutput {
  success: boolean;
  output: string;
  errorOutput: string;
  exitCode: number | null;
  duration: number;
  projectType: string;
}
```

**Zod Schema:**
```typescript
const buildSchema = z.object({
  projectPath: z.string().default(process.cwd()),
  command: z.string().optional(),
  grantPermission: z.boolean().default(false),
});
```

**Permission:** `dangerous` (runs build process)

**Errors:**
- `PERMISSION_DENIED` - Permission not granted
- `NO_BUILD_COMMAND` - No build command configured
- `BUILD_FAILED` - Build exited with errors

---

## Git Operations

### git_status

**Purpose:** Show repository working tree status.

**Interface:**
```typescript
interface GitStatusInput {
  repoPath?: string;
}

interface GitStatusOutput {
  isRepo: boolean;
  current?: string;
  tracking?: string | null;
  files: Array<{
    path: string;
    status: string;
    staged: boolean;
  }>;
  ahead: number;
  behind: number;
}
```

**Zod Schema:**
```typescript
const gitStatusSchema = z.object({
  repoPath: z.string().default(process.cwd()),
});
```

**Permission:** `none`

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository

---

### git_diff

**Purpose:** Show changes between commits, working tree.

**Interface:**
```typescript
interface GitDiffInput {
  repoPath?: string;
  files?: string[];
  staged?: boolean;
  cached?: boolean;
}

interface GitDiffOutput {
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
  }>;
  raw?: string;
}
```

**Zod Schema:**
```typescript
const gitDiffSchema = z.object({
  repoPath: z.string().default(process.cwd()),
  files: z.array(z.string()).optional(),
  staged: z.boolean().default(false),
  cached: z.boolean().default(false),
});
```

**Permission:** `none`

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository
- `FILE_NOT_FOUND` - Specified file(s) don't exist

---

### git_log

**Purpose:** Show commit history.

**Interface:**
```typescript
interface GitLogInput {
  repoPath?: string;
  maxCount?: number;
  since?: string;
  until?: string;
  author?: string;
  file?: string;
}

interface GitLogOutput {
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
}
```

**Zod Schema:**
```typescript
const gitLogSchema = z.object({
  repoPath: z.string().default(process.cwd()),
  maxCount: z.number().int().positive().max(100).default(20),
  since: z.string().optional(),
  until: z.string().optional(),
  author: z.string().optional(),
  file: z.string().optional(),
});
```

**Permission:** `none`

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository
- `INVALID_DATE_RANGE` - since/until format invalid

---

### git_commit

**Purpose:** Record changes to repository.

**Interface:**
```typescript
interface GitCommitInput {
  message: string;
  repoPath?: string;
  stageAll?: boolean;
  stageFiles?: string[];
  allowEmpty?: boolean;
  amend?: boolean;
}

interface GitCommitOutput {
  success: boolean;
  hash?: string;
  warnings?: string[];
}
```

**Zod Schema:**
```typescript
const gitCommitSchema = z.object({
  message: z.string().min(1, 'Commit message is required'),
  repoPath: z.string().default(process.cwd()),
  stageAll: z.boolean().default(true),
  stageFiles: z.array(z.string()).optional(),
  allowEmpty: z.boolean().default(false),
  amend: z.boolean().default(false),
});
```

**Permission:** `dangerous`

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository
- `NOTHING_TO_COMMIT` - No changes staged
- `PROTECTED_BRANCH` - Warning: committing to main/master/develop

---

### git_stage

**Purpose:** Stage files for commit.

**Interface:**
```typescript
interface GitStageInput {
  files?: string[];
  repoPath?: string;
}

interface GitStageOutput {
  success: boolean;
  staged: string[];
}
```

**Zod Schema:**
```typescript
const gitStageSchema = z.object({
  files: z.array(z.string()).default([]),
  repoPath: z.string().default(process.cwd()),
});
```

**Permission:** `moderate` (modifies git index)

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository
- `FILE_NOT_FOUND` - Specified file(s) don't exist

---

### git_unstage

**Purpose:** Unstage files from staging area.

**Interface:**
```typescript
interface GitUnstageInput {
  files?: string[];
  repoPath?: string;
}

interface GitUnstageOutput {
  success: boolean;
  unstaged: string[];
}
```

**Zod Schema:**
```typescript
const gitUnstageSchema = z.object({
  files: z.array(z.string()).default([]),
  repoPath: z.string().default(process.cwd()),
});
```

**Permission:** `moderate`

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository

---

### git_branch

**Purpose:** List, create, or switch branches.

**Interface:**
```typescript
interface GitBranchInput {
  repoPath?: string;
  action: 'list' | 'current' | 'create' | 'switch';
  name?: string;
}

interface GitBranchOutput {
  success?: boolean;
  branch?: string;
  branches?: Array<{
    name: string;
    current: boolean;
    tracked?: string;
  }>;
  created?: boolean;
  switched?: boolean;
}
```

**Zod Schema:**
```typescript
const gitBranchSchema = z.object({
  repoPath: z.string().default(process.cwd()),
  action: z.enum(['list', 'current', 'create', 'switch']).default('list'),
  name: z.string().optional(),
});
```

**Permission:** `moderate` for list/current, `dangerous` for create/switch

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository
- `BRANCH_NOT_FOUND` - Branch doesn't exist (switch)
- `BRANCH_ALREADY_EXISTS` - Branch already exists (create)

---

### is_protected_branch

**Purpose:** Check if branch is protected (main, master, develop).

**Interface:**
```typescript
interface IsProtectedBranchInput {
  branch?: string;
  repoPath?: string;
}

interface IsProtectedBranchOutput {
  branch: string;
  isProtected: boolean;
  protectedPatterns: string[];
}
```

**Zod Schema:**
```typescript
const isProtectedBranchSchema = z.object({
  branch: z.string().optional(),
  repoPath: z.string().default(process.cwd()),
});
```

**Permission:** `none`

**Errors:**
- `NOT_A_GIT_REPOSITORY` - Not a git repository
- `COULD_NOT_DETERMINE_BRANCH` - Unable to get current branch

---

## Browser Operations

All browser tools require **FloydChrome** extension connection.

### browser_navigate

**Purpose:** Navigate to URL in browser.

**Interface:**
```typescript
interface BrowserNavigateInput {
  url: string;
  tabId?: number;
}

interface BrowserNavigateOutput {
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    url: string;
    title?: string;
    loaded: boolean;
  };
}
```

**Zod Schema:**
```typescript
const browserNavigateSchema = z.object({
  url: z.string().url(),
  tabId: z.number().int().positive().optional(),
});
```

**Permission:** `moderate`

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - FloydChrome not running
- `INVALID_URL` - URL format invalid

---

### browser_read_page

**Purpose:** Get semantic accessibility tree of page.

**Interface:**
```typescript
interface BrowserReadPageInput {
  tabId?: number;
}

interface BrowserReadPageOutput {
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    url: string;
    title: string;
    tree: Array<{
      role: string;
      name: string;
      attributes?: Record<string, string>;
      children?: any[];
    }>;
  };
}
```

**Zod Schema:**
```typescript
const browserReadPageSchema = z.object({
  tabId: z.number().int().positive().optional(),
});
```

**Permission:** `moderate`

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `TAB_NOT_FOUND` - Tab doesn't exist

---

### browser_screenshot

**Purpose:** Capture screenshot for vision models.

**Interface:**
```typescript
interface BrowserScreenshotInput {
  fullPage?: boolean;
  selector?: string;
  tabId?: number;
}

interface BrowserScreenshotOutput {
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    imageData: string;
    width: number;
    height: number;
  };
}
```

**Zod Schema:**
```typescript
const browserScreenshotSchema = z.object({
  fullPage: z.boolean().default(false),
  selector: z.string().optional(),
  tabId: z.number().int().positive().optional(),
});
```

**Permission:** `moderate`

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `ELEMENT_NOT_FOUND` - Selector didn't match

---

### browser_click

**Purpose:** Click element by coordinates or selector.

**Interface:**
```typescript
interface BrowserClickInput {
  x?: number;
  y?: number;
  selector?: string;
  tabId?: number;
}

interface BrowserClickOutput {
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    clicked: boolean;
  };
}
```

**Zod Schema:**
```typescript
const browserClickSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  selector: z.string().optional(),
  tabId: z.number().int().positive().optional(),
}).refine(
  (data) => data.x !== undefined || data.selector !== undefined,
  { message: 'Either x/y coordinates or selector must be provided' }
);
```

**Permission:** `dangerous` (modifies page state)

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `ELEMENT_NOT_FOUND` - Selector didn't match

---

### browser_type

**Purpose:** Type text into focused element.

**Interface:**
```typescript
interface BrowserTypeInput {
  text: string;
  tabId?: number;
}

interface BrowserTypeOutput {
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    typed: boolean;
    characters: number;
  };
}
```

**Zod Schema:**
```typescript
const browserTypeSchema = z.object({
  text: z.string().min(1),
  tabId: z.number().int().positive().optional(),
});
```

**Permission:** `dangerous`

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `NO_FOCUSED_ELEMENT` - No element has focus
- `NOT_EDITABLE` - Focused element not editable

---

### browser_find

**Purpose:** Find element by natural language query.

**Interface:**
```typescript
interface BrowserFindInput {
  query: string;
  tabId?: number;
}

interface BrowserFindOutput {
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    elements: Array<{
      selector: string;
      role: string;
      name: string;
      score: number;
    }>;
  };
}
```

**Zod Schema:**
```typescript
const browserFindSchema = z.object({
  query: z.string().min(3),
  tabId: z.number().int().positive().optional(),
});
```

**Permission:** `moderate`

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `NO_RESULTS` - No matching elements found

---

### browser_get_tabs

**Purpose:** List all open browser tabs.

**Interface:**
```typescript
interface BrowserGetTabsInput {
  // No parameters required
}

interface BrowserGetTabsOutput {
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
}
```

**Zod Schema:**
```typescript
const browserGetTabsSchema = z.object({});
```

**Permission:** `moderate`

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected

---

### browser_create_tab

**Purpose:** Open new browser tab.

**Interface:**
```typescript
interface BrowserCreateTabInput {
  url?: string;
}

interface BrowserCreateTabOutput {
  ok: boolean;
  code: string;
  data?: {
    tabId: number;
    url: string;
    created: boolean;
  };
}
```

**Zod Schema:**
```typescript
const browserCreateTabSchema = z.object({
  url: z.string().url().optional(),
});
```

**Permission:** `moderate`

**Errors:**
- `BROWSER_EXTENSION_UNAVAILABLE` - Extension not connected
- `INVALID_URL` - URL format invalid

---

### browser_status

**Purpose:** Check FloydChrome connection status.

**Interface:**
```typescript
interface BrowserStatusInput {
  // No parameters required
}

interface BrowserStatusOutput {
  ok: boolean;
  code: string;
  data: {
    connected: boolean;
    extension_url: string;
    reconnect_attempts: number;
    max_reconnect_attempts: number;
    reconnect_interval_ms: number;
    message: string;
  };
}
```

**Zod Schema:**
```typescript
const browserStatusSchema = z.object({});
```

**Permission:** `none`

**Errors:** None (always succeeds)

---

## Cache Operations (SUPERCACHE)

SUPERCACHE provides 3-tier caching with automatic TTL expiration.

### cache_store

**Purpose:** Store data to cache tier with metadata.

**Interface:**
```typescript
interface CacheStoreInput {
  tier: 'reasoning' | 'project' | 'vault';
  key: string;
  value: string;
  metadata?: Record<string, unknown>;
}

interface CacheStoreOutput {
  success: boolean;
  tier: string;
  key: string;
  expires: number;
}
```

**Zod Schema:**
```typescript
const cacheStoreSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']),
  key: z.string().min(1, 'Cache key required'),
  value: z.string().min(1, 'Cache value required'),
  metadata: z.record(z.unknown()).optional(),
});
```

**Permission:** `none`

**TTL by Tier:**
- `reasoning`: 5 minutes (300,000ms)
- `project`: 24 hours (86,400,000ms)
- `vault`: 7 days (604,800,000ms)

**Errors:**
- `EMPTY_KEY` - Cache key cannot be empty
- `EMPTY_VALUE` - Cache value cannot be empty

---

### cache_retrieve

**Purpose:** Retrieve data from cache tier.

**Interface:**
```typescript
interface CacheRetrieveInput {
  tier: 'reasoning' | 'project' | 'vault';
  key: string;
}

interface CacheRetrieveOutput {
  tier: string;
  key: string;
  found: boolean;
  value?: string;
  expires?: number;
  metadata?: Record<string, unknown>;
}
```

**Zod Schema:**
```typescript
const cacheRetrieveSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']),
  key: z.string().min(1),
});
```

**Permission:** `none`

**Errors:**
- `EMPTY_KEY` - Key cannot be empty

---

### cache_delete

**Purpose:** Delete cache entry by key.

**Interface:**
```typescript
interface CacheDeleteInput {
  tier: 'reasoning' | 'project' | 'vault';
  key: string;
}

interface CacheDeleteOutput {
  success: boolean;
  tier: string;
  key: string;
  deleted: boolean;
}
```

**Zod Schema:**
```typescript
const cacheDeleteSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']),
  key: z.string().min(1),
});
```

**Permission:** `moderate`

**Errors:**
- `EMPTY_KEY` - Key cannot be empty

---

### cache_clear

**Purpose:** Clear all entries from tier(s).

**Interface:**
```typescript
interface CacheClearInput {
  tier?: 'reasoning' | 'project' | 'vault';
}

interface CacheClearOutput {
  success: boolean;
  deleted: number;
  tier: string;
}
```

**Zod Schema:**
```typescript
const cacheClearSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']).optional(),
});
```

**Permission:** `dangerous` (deletes all cache data)

**Errors:** None (always succeeds)

---

### cache_list

**Purpose:** List non-expired entries in tier.

**Interface:**
```typescript
interface CacheListInput {
  tier?: 'reasoning' | 'project' | 'vault';
}

interface CacheListOutput {
  count: number;
  entries: Array<{
    key: string;
    tier: string;
    timestamp: number;
    expires: number;
    metadata?: Record<string, unknown>;
  }>;
}
```

**Zod Schema:**
```typescript
const cacheListSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']).optional(),
});
```

**Permission:** `none`

**Errors:** None (always returns list)

---

### cache_search

**Purpose:** Search entries by key or value.

**Interface:**
```typescript
interface CacheSearchInput {
  tier: 'reasoning' | 'project' | 'vault';
  query: string;
}

interface CacheSearchOutput {
  query: string;
  tier: string;
  count: number;
  results: Array<{
    key: string;
    timestamp: number;
    expires: number;
    matchScore?: number;
  }>;
}
```

**Zod Schema:**
```typescript
const cacheSearchSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']),
  query: z.string().min(2, 'Query must be at least 2 characters'),
});
```

**Permission:** `none`

**Errors:**
- `QUERY_TOO_SHORT` - Query less than 2 characters

---

### cache_stats

**Purpose:** Get cache tier statistics.

**Interface:**
```typescript
interface CacheStatsInput {
  tier?: 'reasoning' | 'project' | 'vault';
}

interface CacheStatsOutput {
  [tier: string]: {
    entries: number;
    active: number;
    sizeBytes: number;
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

**Zod Schema:**
```typescript
const cacheStatsSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']).optional(),
});
```

**Permission:** `none`

**Errors:** None (always returns stats)

---

### cache_prune

**Purpose:** Remove expired entries from tier(s).

**Interface:**
```typescript
interface CachePruneInput {
  tier?: 'reasoning' | 'project' | 'vault';
}

interface CachePruneOutput {
  success: boolean;
  pruned: number;
  tier: string;
}
```

**Zod Schema:**
```typescript
const cachePruneSchema = z.object({
  tier: z.enum(['reasoning', 'project', 'vault']).optional(),
});
```

**Permission:** `moderate` (deletes expired data only)

**Errors:** None (always succeeds)

---

### cache_store_pattern

**Purpose:** Store reusable pattern to vault tier.

**Interface:**
```typescript
interface CacheStorePatternInput {
  name: string;
  pattern: string;
  tags?: string[];
}

interface CacheStorePatternOutput {
  success: boolean;
  name: string;
  tags?: string[];
  storedAt: number;
}
```

**Zod Schema:**
```typescript
const cacheStorePatternSchema = z.object({
  name: z.string().min(1, 'Pattern name required'),
  pattern: z.string().min(1, 'Pattern content required'),
  tags: z.array(z.string()).optional(),
});
```

**Permission:** `none`

**Errors:**
- `EMPTY_NAME` - Pattern name cannot be empty
- `EMPTY_PATTERN` - Pattern content cannot be empty

---

### cache_store_reasoning

**Purpose:** Store reasoning frame (CoT steps) to active reasoning tier.

**Interface:**
```typescript
interface CacheStoreReasoningInput {
  frame: string; // JSON string of reasoning frame
}

interface CacheStoreReasoningOutput {
  success: boolean;
  steps: number;
  frameId: string;
}
```

**Frame Schema (JSON):**
```typescript
interface ReasoningFrame {
  frame_id: string;
  timestamp: number;
  cog_steps: Array<{
    step: number;
    thought: string;
  }>;
  metadata?: Record<string, unknown>;
}
```

**Zod Schema:**
```typescript
const cacheStoreReasoningSchema = z.object({
  frame: z.string().refine(
    (str) => {
      try {
        const parsed = JSON.parse(str);
        return parsed.frame_id && parsed.cog_steps && Array.isArray(parsed.cog_steps);
      } catch {
        return false;
      }
    },
    { message: 'Frame must be valid JSON with frame_id and cog_steps' }
  ),
});
```

**Permission:** `none`

**Errors:**
- `INVALID_JSON` - Frame is not valid JSON
- `MISSING_FRAME_ID` - frame_id field required
- `MISSING_COG_STEPS` - cog_steps array required

---

### cache_load_reasoning

**Purpose:** Load active reasoning frame.

**Interface:**
```typescript
interface CacheLoadReasoningInput {
  // No parameters required
}

interface CacheLoadReasoningOutput {
  found: boolean;
  frame?: ReasoningFrame;
}
```

**Zod Schema:**
```typescript
const cacheLoadReasoningSchema = z.object({});
```

**Permission:** `none`

**Errors:** None (always returns found status)

---

### cache_archive_reasoning

**Purpose:** Archive active reasoning frame to project tier.

**Interface:**
```typescript
interface CacheArchiveReasoningInput {
  // No parameters required
}

interface CacheArchiveReasoningOutput {
  success: boolean;
  archivedFrameId?: string;
  archivedTo?: string;
}
```

**Zod Schema:**
```typescript
const cacheArchiveReasoningSchema = z.object({});
```

**Permission:** `moderate` (moves reasoning to project tier)

**Errors:**
- `NO_ACTIVE_FRAME` - No reasoning frame to archive

---

## Patch Operations

### apply_unified_diff

**Purpose:** Apply unified diff patch with risk assessment.

**Interface:**
```typescript
interface ApplyUnifiedDiffInput {
  diff: string;
  dryRun?: boolean;
  rootPath?: string;
  assessRisk?: boolean;
}

interface ApplyUnifiedDiffOutput {
  success: boolean;
  appliedFiles: string[];
  errors: string[];
  preview?: string[];
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

**Zod Schema:**
```typescript
const applyUnifiedDiffSchema = z.object({
  diff: z.string().min(1, 'Diff content required'),
  dryRun: z.boolean().default(false),
  rootPath: z.string().default(process.cwd()),
  assessRisk: z.boolean().default(true),
});
```

**Permission:** `dangerous` (modifies multiple files)

**Errors:**
- `NO_VALID_DIFF` - Input contains no valid unified diff
- `PATCH_FAILED` - Failed to apply patch
- `BINARY_FILE` - Attempting to patch binary file

---

### edit_range

**Purpose:** Edit specific line range with automatic backups.

**Interface:**
```typescript
interface EditRangeInput {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  dryRun?: boolean;
}

interface EditRangeOutput {
  success: boolean;
  originalLines?: string[];
  modifiedLines?: string[];
  backupPath?: string;
}
```

**Zod Schema:**
```typescript
const editRangeSchema = z.object({
  filePath: z.string().min(1),
  startLine: z.number().int().min(0),
  endLine: z.number().int().min(0),
  content: z.string(),
  dryRun: z.boolean().default(false),
}).refine(
  (data) => data.endLine >= data.startLine,
  { message: 'endLine must be >= startLine' }
);
```

**Permission:** `dangerous`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist
- `INVALID_LINE_RANGE` - startLine/endLine out of bounds

---

### insert_at

**Purpose:** Insert content at specific line with backups.

**Interface:**
```typescript
interface InsertAtInput {
  filePath: string;
  lineNumber: number;
  content: string;
  dryRun?: boolean;
}

interface InsertAtOutput {
  success: boolean;
  insertedLines?: string[];
  backupPath?: string;
}
```

**Zod Schema:**
```typescript
const insertAtSchema = z.object({
  filePath: z.string().min(1),
  lineNumber: z.number().int().min(0),
  content: z.string(),
  dryRun: z.boolean().default(false),
});
```

**Permission:** `dangerous`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist
- `INVALID_LINE_NUMBER` - lineNumber out of bounds

---

### delete_range

**Purpose:** Delete line range with backups.

**Interface:**
```typescript
interface DeleteRangeInput {
  filePath: string;
  startLine: number;
  endLine: number;
  dryRun?: boolean;
}

interface DeleteRangeOutput {
  success: boolean;
  deletedLines?: string[];
  backupPath?: string;
}
```

**Zod Schema:**
```typescript
const deleteRangeSchema = z.object({
  filePath: z.string().min(1),
  startLine: z.number().int().min(0),
  endLine: z.number().int().min(0),
  dryRun: z.boolean().default(false),
}).refine(
  (data) => data.endLine >= data.startLine,
  { message: 'endLine must be >= startLine' }
);
```

**Permission:** `dangerous`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist
- `INVALID_LINE_RANGE` - Line range invalid

---

### assess_patch_risk

**Purpose:** Assess patch risk before applying.

**Interface:**
```typescript
interface AssessPatchRiskInput {
  diff: string;
}

interface AssessPatchRiskOutput {
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
  isBinary: boolean;
  affectsMultipleFiles: boolean;
  totalChanges: number;
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

**Zod Schema:**
```typescript
const assessPatchRiskSchema = z.object({
  diff: z.string().min(1, 'Diff content required'),
});
```

**Permission:** `none` (read-only analysis)

**Errors:** None (always returns assessment)

---

## Special Tools

Novel tools with advanced capabilities.

### smart_replace

**Purpose:** Surgical file editing with uniqueness validation.

**Interface:**
```typescript
interface SmartReplaceInput {
  filePath: string;
  searchString: string;
  replaceString: string;
  dryRun?: boolean;
}

interface SmartReplaceOutput {
  success: boolean;
  filePath: string;
  replacements: number;
  preview?: string;
}
```

**Zod Schema:**
```typescript
const smartReplaceSchema = z.object({
  filePath: z.string().min(1),
  searchString: z.string().min(1, 'Search string cannot be empty'),
  replaceString: z.string(),
  dryRun: z.boolean().default(false),
});
```

**Permission:** `dangerous`

**Errors:**
- `FILE_NOT_FOUND` - File doesn't exist
- `STRING_NOT_FOUND` - searchString not in file
- `MULTIPLE_MATCHES` - searchString appears multiple times

---

### visual_verify

**Purpose:** Run command briefly to preview output.

**Interface:**
```typescript
interface VisualVerifyInput {
  command: string;
  timeoutMs?: number;
}

interface VisualVerifyOutput {
  command: string;
  preview: string;
  note: string;
}
```

**Zod Schema:**
```typescript
const visualVerifySchema = z.object({
  command: z.string().min(1),
  timeoutMs: z.number().int().positive().max(10000).default(2000),
});
```

**Permission:** `moderate`

**Errors:** None (always returns preview)

---

### todo_sniper

**Purpose:** List all TODO/FIXME/HACK comments in codebase.

**Interface:**
```typescript
interface TodoSniperInput {
  // No parameters required
}

interface TodoSniperOutput {
  todos: Array<{
    file: string;
    line: number;
    text: string;
    type: 'TODO' | 'FIXME' | 'HACK';
  }>;
  totalCount: number;
}
```

**Zod Schema:**
```typescript
const todoSniperSchema = z.object({});
```

**Permission:** `none`

**Errors:** None (always returns array)

---

### runtime_schema_gen

**Purpose:** Generate TypeScript/Zod schemas from live JSON data.

**Interface:**
```typescript
interface RuntimeSchemaGenInput {
  source: string;
  type: 'url' | 'file';
}

interface RuntimeSchemaGenOutput {
  source: string;
  sampleKeys: string[];
  generatedInterface: string;
}
```

**Zod Schema:**
```typescript
const runtimeSchemaGenSchema = z.object({
  source: z.string().min(1, 'Source URL or file path required'),
  type: z.enum(['url', 'file']),
});
```

**Permission:** `none`

**Errors:**
- `FAILED_TO_FETCH` - Could not fetch data from URL/file

---

### tui_puppeteer

**Purpose:** Simulate user interaction with TUI applications.

**Interface:**
```typescript
interface TuiPuppeteerInput {
  command: string;
  keys: string[];
}

interface TuiPuppeteerOutput {
  status: string;
  message: string;
  command: string;
  keysSent: string[];
  output: string;
}
```

**Zod Schema:**
```typescript
const tuiPuppeteerSchema = z.object({
  command: z.string().min(1),
  keys: z.array(z.string()).min(1, 'At least one key required'),
});
```

**Permission:** `moderate` (requires node-pty for full functionality)

**Errors:** None (returns simulation mode warning if node-pty missing)

---

### ast_navigator

**Purpose:** Navigate code structure using smart grep heuristics.

**Interface:**
```typescript
interface AstNavigatorInput {
  query: string;
  type: 'def' | 'refs';
}

interface AstNavigatorOutput {
  query: string;
  type: string;
  matches: string[];
}
```

**Zod Schema:**
```typescript
const astNavigatorSchema = z.object({
  query: z.string().min(1, 'Query required'),
  type: z.enum(['def', 'refs']),
});
```

**Permission:** `none`

**Errors:** None (always returns matches array)

---

### skill_crystallizer

**Purpose:** Save code pattern to long-term memory (.floyd/patterns).

**Interface:**
```typescript
interface SkillCrystallizerInput {
  skillName: string;
  filePath: string;
  description: string;
}

interface SkillCrystallizerOutput {
  success: boolean;
  skillName: string;
  filePath: string;
  savedTo: string;
}
```

**Zod Schema:**
```typescript
const skillCrystallizerSchema = z.object({
  skillName: z.string().min(1, 'Skill name required'),
  filePath: z.string().min(1, 'File path required'),
  description: z.string().min(1, 'Description required'),
});
```

**Permission:** `moderate` (creates pattern file)

**Errors:**
- `FILE_NOT_FOUND` - Source file doesn't exist

---

### manage_scratchpad

**Purpose:** Persistent scratchpad memory for session.

**Interface:**
```typescript
interface ManageScratchpadInput {
  action: 'read' | 'write' | 'append' | 'clear';
  content?: string;
}

interface ManageScratchpadOutput {
  action: string;
  content?: string;
  message: string;
}
```

**Zod Schema:**
```typescript
const manageScratchpadSchema = z.object({
  action: z.enum(['read', 'write', 'append', 'clear']),
  content: z.string().optional(),
});
```

**Permission:** `moderate` (modifies .floyd/scratchpad.md)

**Errors:**
- `INVALID_ACTION` - Invalid action string

---

### spawn_shadow_workspace

**Purpose:** Create safe clone of project for testing dangerous changes.

**Interface:**
```typescript
interface SpawnShadowWorkspaceInput {
  id: string;
}

interface SpawnShadowWorkspaceOutput {
  success: boolean;
  shadowPath: string;
  originalPath: string;
  id: string;
}
```

**Zod Schema:**
```typescript
const spawnShadowWorkspaceSchema = z.object({
  id: z.string().min(1, 'Workspace ID required'),
});
```

**Permission:** `dangerous` (creates full project clone)

**Errors:**
- `PERMISSION_DENIED` - No write access to create shadow workspace
- `DISK_FULL` - Insufficient space for clone

---

## Permission Levels

| Level | Description | Examples |
|-------|-------------|----------|
| **None** | Read-only operations, no side effects | read_file, grep, cache_list, browser_status |
| **Moderate** | Non-destructive writes, may affect state | git_stage, cache_delete, browser_navigate |
| **Dangerous** | Destructive operations, requires confirmation | write, edit_file, run, git_commit, spawn_shadow_workspace |

---

## Implementation Checklist

For each tool implementation:

- [ ] Input validation using Zod schema
- [ ] Output type definition
- [ ] Error handling with structured error codes
- [ ] Permission level enforcement
- [ ] TypeScript strict mode compliance
- [ ] JSDoc comments for public APIs
- [ ] Unit tests for happy path
- [ ] Unit tests for error conditions
- [ ] Integration test with real filesystem
- [ ] Performance benchmark (if applicable)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-22 | Initial unified documentation from floyddstools.md + Tools.md |

---

**Document ID:** `FLOYD-TOOLS-SPEC-UNIFIED-001`
**Generated for:** Floyd Wrapper v1.0.0
**Total Tools:** 55
