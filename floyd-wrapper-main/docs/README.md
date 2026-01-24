# Floyd Wrapper API Documentation

Complete API reference for all 50 Floyd Wrapper tools.

## Table of Contents

- [Git Operations](./tools/git.md) - 8 tools
- [File Operations](./tools/file.md) - 4 tools
- [Cache System](./tools/cache.md) - 12 tools
- [Search Operations](./tools/search.md) - 2 tools
- [System Operations](./tools/system.md) - 2 tools
- [Browser Automation](./tools/browser.md) - 9 tools
- [Patch Operations](./tools/patch.md) - 5 tools
- [Build/Explorer](./tools/build.md) - 8 tools

---

## Tool Categories

### Git Operations (8 tools)
Tools for Git workflow automation, version control, and branch management.

**[→ View Git Tools Documentation](./tools/git.md)**

### File Operations (4 tools)
Tools for reading, writing, and manipulating files.

**[→ View File Tools Documentation](./tools/file.md)**

### Cache System (12 tools)
Multi-tier caching system with L1 (memory), L2 (project), and L3 (vault) storage.

**[→ View Cache Tools Documentation](./tools/cache.md)**

### Search Operations (2 tools)
Search file contents and entire codebases with regex support.

**[→ View Search Tools Documentation](./tools/search.md)**

### System Operations (2 tools)
Execute shell commands and interact with the user.

**[→ View System Tools Documentation](./tools/system.md)**

### Browser Automation (9 tools)
Playwright-based browser automation for web interaction.

**[→ View Browser Tools Documentation](./tools/browser.md)**

### Patch Operations (5 tools)
Apply and manage code patches with validation.

**[→ View Patch Tools Documentation](./tools/patch.md)**

### Build/Explorer (8 tools)
Project detection, testing, formatting, and code exploration.

**[→ View Build Tools Documentation](./tools/build.md)**

---

## Common Patterns

### Tool Response Format

All tools return responses in this format:

```typescript
// Success Response
{
  success: true,
  data: {
    // Tool-specific data
  }
}

// Error Response
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable error message',
    details: {
      // Additional error context
    }
  }
}
```

### Input Validation

All tools use **Zod** schemas for input validation:

```typescript
inputSchema: z.object({
  param1: z.string().min(1, 'Required'),
  param2: z.number().optional(),
  param3: z.boolean().default(false)
})
```

### Permission Levels

- **none** - No restrictions (read operations, safe operations)
- **dangerous** - Requires confirmation (write operations, modifications)
- **supervisor** - Highest privilege (system-level operations)

---

## Usage Examples

### Basic Tool Execution

```typescript
import { toolRegistry } from './src/tools/index.ts';

// Get tool
const tool = toolRegistry.get('read_file');

// Execute tool
const result = await tool.execute({
  file_path: '/path/to/file.txt',
  offset: 0,
  limit: 100
});

if (result.success) {
  console.log(result.data.content);
} else {
  console.error(result.error.message);
}
```

### Error Handling

```typescript
const result = await tool.execute(input);

if (!result.success) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      console.error('Invalid input:', result.error.details);
      break;
    case 'FILE_NOT_FOUND':
      console.error('File not found:', result.error.details.file_path);
      break;
    default:
      console.error('Unknown error:', result.error.message);
  }
}
```

### Tool Discovery

```typescript
// List all tools
const allTools = toolRegistry.listAll();

// List tools by category
const gitTools = toolRegistry.listByCategory('git');

// Get tool metadata
const tool = toolRegistry.get('git_status');
console.log(tool.name);        // 'git_status'
console.log(tool.description); // 'Show working tree status'
console.log(tool.category);    // 'git'
console.log(tool.permission);  // 'none'
```

---

## Type Definitions

### ToolDefinition

```typescript
interface ToolDefinition {
  name: string;              // Unique tool identifier
  description: string;       // Human-readable description
  category: ToolCategory;    // Tool category
  inputSchema: z.ZodSchema;  // Zod validation schema
  permission: Permission;    // Permission level
  execute: (input: unknown) => Promise<ToolResult>;
}
```

### ToolResult

```typescript
type ToolResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: ToolError }
```

### ToolError

```typescript
interface ToolError {
  code: string;              // Error code
  message: string;           // Human-readable message
  details?: Record<string, unknown>; // Additional context
}
```

### ToolCategory

```typescript
type ToolCategory =
  | 'git'
  | 'file'
  | 'cache'
  | 'search'
  | 'system'
  | 'browser'
  | 'patch'
  | 'build';
```

### Permission

```typescript
type Permission = 'none' | 'dangerous' | 'supervisor';
```

---

## API Reference

For detailed API documentation of each tool, see the individual tool category documentation files listed above.

---

**Version:** 0.1.0
**Last Updated:** 2025-01-22
