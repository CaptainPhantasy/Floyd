# Search Operations API

Complete API reference for search tools.

## Tools Overview

- [grep](#grep) - Search file contents with regex
- [codebase_search](#codebase_search) - Search entire codebase

---

## grep

Search file contents using regex patterns.

### Input Schema

```typescript
{
  pattern: string;        // Required: Regex pattern to search for
  path?: string;          // Optional: Directory to search (default: current)
  file_pattern?: string;  // Optional: Glob pattern for files (default: "**/*")
  case_insensitive?: boolean;  // Optional: Case-insensitive search (default: false)
  invert_match?: boolean; // Optional: Show non-matching lines (default: false)
  line_number?: boolean;  // Optional: Show line numbers (default: true)
  max_results?: number;   // Optional: Maximum results (default: unlimited)
}
```

### Response

```typescript
{
  success: true,
  data: {
    matches: MatchResult[];
    total_count: number;
  }
}

interface MatchResult {
  file: string;
  line: number;
  content: string;
  match_start: number;
  match_end: number;
}
```

### Example

```typescript
// Search for "TODO" comments
const result1 = await grepTool.execute({
  pattern: 'TODO',
  path: './src'
});

// Case-insensitive search
const result2 = await grepTool.execute({
  pattern: 'error',
  case_insensitive: true,
  file_pattern: '**/*.ts'
});

// Search with regex
const result3 = await grepTool.execute({
  pattern: 'function\\s+\\w+\\s*\\(',
  path: './src'
});
```

---

## codebase_search

Search entire codebase with glob patterns.

### Input Schema

```typescript
{
  query: string;          // Required: Search query
  path?: string;          // Optional: Root directory (default: current)
  file_patterns?: string[]; // Optional: File glob patterns (default: all files)
  exclude_patterns?: string[]; // Optional: Exclude patterns
  context_lines?: number; // Optional: Lines of context (default: 2)
  max_results?: number;   // Optional: Maximum results per file
}
```

### Response

```typescript
{
  success: true,
  data: {
    results: FileResult[];
    total_files: number;
    total_matches: number;
  }
}

interface FileResult {
  file: string;
  matches: MatchWithContext[];
  match_count: number;
}

interface MatchWithContext {
  line: number;
  content: string;
  context_before: string[];
  context_after: string[];
}
```

### Example

```typescript
// Search for specific function call
const result1 = await codebaseSearchTool.execute({
  query: 'executeTool(',
  path: './src',
  file_patterns: ['**/*.ts', '**/*.js']
});

// Search with context
const result2 = await codebaseSearchTool.execute({
  query: 'import.*Tool',
  context_lines: 3
});

// Exclude test files
const result3 = await codebaseSearchTool.execute({
  query: 'interface Tool',
  exclude_patterns: ['**/*.test.ts', '**/node_modules/**']
});
```

---

## Common Patterns

### Search for Functions

```typescript
await grepTool.execute({
  pattern: 'function\\s+\\w+\\s*\\(',
  file_pattern: '**/*.ts'
});
```

### Search for Imports

```typescript
await grepTool.execute({
  pattern: '^import\\s+.*from',
  file_pattern: '**/*.ts'
});
```

### Search for TODO/FIXME

```typescript
await grepTool.execute({
  pattern: 'TODO|FIXME|HACK',
  case_insensitive: true
});
```

### Search for Console Logs

```typescript
await grepTool.execute({
  pattern: 'console\\.(log|warn|error|debug)',
  file_pattern: '**/*.ts'
});
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `SEARCH_ERROR` | General search error |
| `INVALID_PATTERN` | Invalid regex pattern |
| `PATH_NOT_FOUND` | Search path does not exist |
| `PATTERN_TOO_COMPLEX` | Regex pattern too complex |

---

## Performance Tips

1. **Use specific file patterns** to limit search scope
2. **Set `max_results`** for large codebases
3. **Use `case_insensitive`** sparingly (slower)
4. **Narrow search path** to relevant directories

---

**Category:** search
**Tools:** 2
**Permission Level:** none
