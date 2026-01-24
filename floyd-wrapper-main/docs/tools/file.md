# File Operations API

Complete API reference for file manipulation tools.

## Tools Overview

- [read_file](#read_file) - Read file contents
- [write](#write) - Create or overwrite files
- [edit_file](#edit_file) - Edit specific file sections
- [search_replace](#search_replace) - Search and replace text globally

---

## read_file

Read file contents from disk with optional offset and limit.

### Input Schema

```typescript
{
  file_path: string;      // Required: Absolute path to file
  offset?: number;        // Optional: Starting line number (0-indexed)
  limit?: number;         // Optional: Maximum number of lines to read
}
```

### Response

```typescript
{
  success: true,
  data: {
    content: string;      // File content
    lineCount: number;    // Total number of lines in file
    file_path: string;    // Absolute path to file
  }
}
```

### Example

```typescript
// Read entire file
const result1 = await readFileTool.execute({
  file_path: '/path/to/file.txt'
});

// Read with offset and limit
const result2 = await readFileTool.execute({
  file_path: '/path/to/file.txt',
  offset: 10,
  limit: 20
});

// Returns lines 10-29 (20 lines total)
```

---

## write

Create or overwrite files with automatic directory creation.

### Input Schema

```typescript
{
  file_path: string;      // Required: Absolute path to file
  content: string;        // Required: File content
}
```

### Response

```typescript
{
  success: true,
  data: {
    file_path: string;    // Absolute path to file
    bytes_written: number; // Number of bytes written
  }
}
```

### Example

```typescript
// Create new file
const result = await writeTool.execute({
  file_path: '/path/to/file.txt',
  content: 'Hello, World!\nThis is a new file.'
});

// Automatically creates parent directories
const result2 = await writeTool.execute({
  file_path: '/path/to/nested/dir/file.txt',
  content: 'Nested file content'
});
```

---

## edit_file

Edit specific file sections using search/replace. Only replaces **first occurrence** of search string.

### Input Schema

```typescript
{
  file_path: string;      // Required: Absolute path to file
  old_string: string;     // Required: String to search for
  new_string: string;     // Required: Replacement string
}
```

### Response

```typescript
{
  success: true,
  data: {
    file_path: string;    // Absolute path to file
    replacements: number; // Number of replacements made (always 1)
  }
}
```

### Errors

| Code | Description |
|------|-------------|
| `MULTIPLE_MATCHES` | Old string appears multiple times |
| `STRING_NOT_FOUND` | Old string not found in file |

### Example

```typescript
// Replace function signature
const result = await editFileTool.execute({
  file_path: '/path/to/index.ts',
  old_string: 'function oldName(',
  new_string: 'function newName('
});

// Returns error if old_string appears multiple times
```

---

## search_replace

Search and replace text in files globally. Can replace first occurrence or all occurrences.

### Input Schema

```typescript
{
  file_path: string;      // Required: Absolute path to file
  search_string: string;  // Required: String to search for
  replace_string: string; // Required: Replacement string
  replace_all?: boolean;  // Optional: Replace all occurrences (default: false)
}
```

### Response

```typescript
{
  success: true,
  data: {
    file_path: string;    // Absolute path to file
    replacements: number; // Number of replacements made
  }
}
```

### Example

```typescript
// Replace first occurrence only
const result1 = await searchReplaceTool.execute({
  file_path: '/path/to/file.txt',
  search_string: 'oldValue',
  replace_string: 'newValue'
  // replace_all defaults to false
});

// Replace all occurrences
const result2 = await searchReplaceTool.execute({
  file_path: '/path/to/file.txt',
  search_string: 'oldValue',
  replace_string: 'newValue',
  replace_all: true
});
```

---

## Special Features

### Regex-Safe Handling

All file tools handle special regex characters safely:

```typescript
// These work correctly without escaping
await editFileTool.execute({
  file_path: 'prices.txt',
  old_string: '$100',     // No need to escape $
  new_string: '$80'
});

await searchReplaceTool.execute({
  file_path: 'file.txt',
  search_string: 'a+b',   // No need to escape +
  replace_string: 'c+d'
});
```

### Unicode Support

Full Unicode support for international text:

```typescript
await writeTool.execute({
  file_path: 'unicode.txt',
  content: 'Hello 世界 🌍 Привет мир'
});
```

### Large File Handling

Efficient handling of large files:

```typescript
// Read first 100 lines of large file
await readFileTool.execute({
  file_path: 'large-file.log',
  limit: 100
});
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `FILE_NOT_FOUND` | File does not exist |
| `NOT_A_FILE` | Path is a directory, not a file |
| `FILE_READ_ERROR` | Error reading file |
| `FILE_WRITE_ERROR` | Error writing file |
| `FILE_EDIT_ERROR` | Error editing file |
| `FILE_REPLACE_ERROR` | Error replacing text |
| `VALIDATION_ERROR` | Input validation failed |

---

## Best Practices

### Use edit_file for Single Replacements

```typescript
// Good: Edit specific function
await editFileTool.execute({
  file_path: 'index.ts',
  old_string: 'function process(',
  new_string: 'function processV2('
});
```

### Use search_replace for Global Replacements

```typescript
// Good: Replace all occurrences
await searchReplaceTool.execute({
  file_path: 'config.ts',
  search_string: 'localhost',
  replace_string: 'production.example.com',
  replace_all: true
});
```

### Always Check Success

```typescript
const result = await readFileTool.execute({
  file_path: '/path/to/file.txt'
});

if (result.success) {
  console.log(result.data.content);
} else {
  console.error(result.error.message);
  // Handle error appropriately
}
```

---

**Category:** file
**Tools:** 4
**Permission Level:** read=none, write/edit/replace=dangerous
