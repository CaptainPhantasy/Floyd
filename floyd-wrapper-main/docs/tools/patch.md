# Patch Operations API

Complete API reference for code patch tools.

## Tools Overview

- [apply_unified_diff](#apply_unified_diff) - Apply unified diff patches
- [edit_range](#edit_range) - Edit code ranges by line numbers
- [insert_at](#insert_at) - Insert text at line positions
- [delete_range](#delete_range) - Delete line ranges
- [assess_patch_risk](#assess_patch_risk) - Assess patch safety

---

## apply_unified_diff

Apply unified diff patches to files.

### Input Schema

```typescript
{
  file_path: string;      // Required: Path to file
  diff: string;           // Required: Unified diff content
  strip?: number;         // Optional: Strip leading path components (default: 1)
  reverse?: boolean;      // Optional: Apply patch in reverse (default: false)
}
```

### Response

```typescript
{
  success: true,
  data: {
    file_path: string;
    hunks_applied: number;
    lines_added: number;
    lines_removed: number;
    rejected: string[];   // List of rejected hunks
  }
}
```

### Example

```typescript
const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line 1
-old line
+new line
 line 3`;

const result = await applyUnifiedDiffTool.execute({
  file_path: '/path/to/file.txt',
  diff: diff
});
```

---

## edit_range

Edit specific line ranges in files.

### Input Schema

```typescript
{
  file_path: string;      // Required: Path to file
  start_line: number;     // Required: Starting line number (1-indexed)
  end_line: number;       // Required: Ending line number (inclusive)
  new_content: string;    // Required: Replacement content
}
```

### Response

```typescript
{
  success: true,
  data: {
    file_path: string;
    lines_replaced: number;
    old_content: string;
    new_content: string;
  }
}
```

### Example

```typescript
// Replace lines 5-10
await editRangeTool.execute({
  file_path: '/path/to/file.ts',
  start_line: 5,
  end_line: 10,
  new_content: 'function newCode() {\n  return true;\n}'
});
```

---

## insert_at

Insert text at specific line positions.

### Input Schema

```typescript
{
  file_path: string;      // Required: Path to file
  line_number: number;    // Required: Line number to insert at (1-indexed)
  content: string;        // Required: Content to insert
  position?: 'before' | 'after';  // Optional (default: 'before')
}
```

### Response

```typescript
{
  success: true,
  data: {
    file_path: string;
    inserted_at: number;
    content_length: number;
  }
}
```

### Example

```typescript
// Insert before line 10
await insertAtTool.execute({
  file_path: '/path/to/file.ts',
  line_number: 10,
  content: '// New import statement\nimport { Logger } from "./logger";\n',
  position: 'before'
});
```

---

## delete_range

Delete specific line ranges from files.

### Input Schema

```typescript
{
  file_path: string;      // Required: Path to file
  start_line: number;     // Required: Starting line number (1-indexed)
  end_line: number;       // Required: Ending line number (inclusive)
}
```

### Response

```typescript
{
  success: true,
  data: {
    file_path: string;
    lines_deleted: number;
    deleted_content: string;
  }
}
```

### Example

```typescript
// Delete lines 15-20
await deleteRangeTool.execute({
  file_path: '/path/to/file.ts',
  start_line: 15,
  end_line: 20
});
```

---

## assess_patch_risk

Assess patch safety and potential conflicts.

### Input Schema

```typescript
{
  file_path: string;      // Required: Path to file
  diff: string;           // Required: Unified diff content
}
```

### Response

```typescript
{
  success: true,
  data: {
    risk_level: 'low' | 'medium' | 'high';
    conflicts: ConflictInfo[];
    warnings: string[];
    recommendations: string[];
  }
}

interface ConflictInfo {
  line: number;
  type: 'overlap' | 'context_mismatch' | 'missing_context';
  severity: 'low' | 'medium' | 'high';
}
```

### Example

```typescript
const assessment = await assessPatchRiskTool.execute({
  file_path: '/path/to/file.ts',
  diff: diffContent
});

console.log('Risk level:', assessment.data.risk_level);
console.log('Conflicts:', assessment.data.conflicts);
console.log('Warnings:', assessment.data.warnings);
```

---

## Common Patch Formats

### Unified Diff Format

```diff
--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 context line
-old content
+new content
 another context
```

### Multiple Hunks

```diff
--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
-old 1
+new 1
 context
@@ -5,3 +5,3 @@
 context
-old 2
+new 2
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `PATCH_APPLY_FAILED` | Failed to apply patch |
| `HUNK_FAILED` | Specific hunk failed to apply |
| `FILE_NOT_FOUND` | Target file not found |
| `INVALID_RANGE` | Invalid line range |
| `CONTEXT_MISMATCH` | Patch context doesn't match |
| `CONFLICT_DETECTED` | Patch conflicts detected |

---

## Best Practices

### 1. Assess Risk First

```typescript
// Always assess before applying
const assessment = await assessPatchRiskTool.execute({
  file_path: 'file.ts',
  diff: diff
});

if (assessment.data.risk_level !== 'high') {
  await applyUnifiedDiffTool.execute({
    file_path: 'file.ts',
    diff: diff
  });
}
```

### 2. Use Line Numbers Carefully

```typescript
// Get current line count first
const file = await readFileTool.execute({
  file_path: 'file.ts'
});

const lines = file.data.content.split('\n').length;

// Delete last 5 lines
await deleteRangeTool.execute({
  file_path: 'file.ts',
  start_line: lines - 4,
  end_line: lines
});
```

### 3. Validate Patches

```typescript
// Check if patch applies cleanly
const result = await applyUnifiedDiffTool.execute({
  file_path: 'file.ts',
  diff: diff
});

if (result.data.rejected.length > 0) {
  console.error('Some hunks were rejected:', result.data.rejected);
}
```

---

**Category:** patch
**Tools:** 5
**Permission Level:** dangerous
