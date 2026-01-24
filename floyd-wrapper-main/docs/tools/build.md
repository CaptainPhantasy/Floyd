# Build/Explorer API

Complete API reference for project detection, testing, formatting, and code exploration.

## Tools Overview

- [detect_project](#detect_project) - Auto-detect project type
- [run_tests](#run_tests) - Run test suites
- [format](#format) - Format code
- [lint](#lint) - Lint code
- [build](#build) - Build projects
- [check_permission](#check_permission) - Check operation permissions
- [project_map](#project_map) - Map project structure
- [list_symbols](#list_symbols) - List code symbols

---

## detect_project

Auto-detect project type and configuration.

### Input Schema

```typescript
{
  path?: string;           // Optional: Project path (default: current directory)
}
```

### Response

```typescript
{
  success: true,
  data: {
    project_type: 'node' | 'python' | 'rust' | 'go' | 'unknown';
    config_files: string[];
    package_manager?: string;  // For Node: 'npm' | 'yarn' | 'pnpm'
    test_framework?: string;
    build_tool?: string;
    has_tests: boolean;
    dependencies: {
      production: number;
      development: number;
    };
  }
}
```

### Example

```typescript
const result = await detectProjectTool.execute({
  path: '/path/to/project'
});

console.log('Project type:', result.data.project_type);
console.log('Package manager:', result.data.package_manager);
console.log('Test framework:', result.data.test_framework);
```

---

## run_tests

Run project test suites with framework detection.

### Input Schema

```typescript
{
  path?: string;           // Optional: Project path (default: current)
  pattern?: string;        // Optional: Test file pattern
  coverage?: boolean;      // Optional: Generate coverage report
  watch?: boolean;         // Optional: Watch mode
}
```

### Response

```typescript
{
  success: true,
  data: {
    framework: string;
    tests_run: number;
    tests_passed: number;
    tests_failed: number;
    tests_skipped: number;
    duration: number;      // Duration in milliseconds
    coverage?: {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    };
  }
}
```

### Example

```typescript
// Run all tests
const result1 = await runTestsTool.execute({});

// Run specific pattern
const result2 = await runTestsTool.execute({
  pattern: '*.test.ts'
});

// Run with coverage
const result3 = await runTestsTool.execute({
  coverage: true
});
```

---

## format

Format code with project formatter detection.

### Input Schema

```typescript
{
  path?: string;           // Optional: Path to format (default: current)
  files?: string[];        // Optional: Specific files to format
  check?: boolean;         // Optional: Check only, don't modify (default: false)
}
```

### Response

```typescript
{
  success: true,
  data: {
    formatter: string;     // 'prettier' | 'black' | 'rustfmt' | 'gofmt'
    files_checked: number;
    files_formatted: number;
    files_changed: string[];
  }
}
```

### Example

```typescript
// Format entire project
await formatTool.execute({});

// Check if formatting needed
const check = await formatTool.execute({
  check: true
});

// Format specific files
await formatTool.execute({
  files: ['src/index.ts', 'src/utils.ts']
});
```

---

## lint

Lint code with project linter detection.

### Input Schema

```typescript
{
  path?: string;           // Optional: Path to lint (default: current)
  files?: string[];        // Optional: Specific files to lint
  fix?: boolean;           // Optional: Auto-fix issues (default: false)
}
```

### Response

```typescript
{
  success: true,
  data: {
    linter: string;        // 'eslint' | 'pylint' | 'clippy' | 'golint'
    files_checked: number;
    issues: {
      error: number;
      warning: number;
      info: number;
    };
  }
}
```

### Example

```typescript
// Lint entire project
await lintTool.execute({});

// Lint and fix
await lintTool.execute({
  fix: true
});

// Lint specific files
await lintTool.execute({
  files: ['src/**/*.ts']
});
```

---

## build

Build projects with build tool detection.

### Input Schema

```typescript
{
  path?: string;           // Optional: Project path (default: current)
  target?: string;         // Optional: Build target (e.g., 'production')
  watch?: boolean;         // Optional: Watch mode
}
```

### Response

```typescript
{
  success: true,
  data: {
    build_tool: string;    // 'webpack' | 'vite' | 'tsc' | 'cargo' | 'go build'
    output_dir?: string;
    duration: number;
    warnings: number;
    errors: number;
  }
}
```

### Example

```typescript
// Build project
await buildTool.execute({});

// Build for production
await buildTool.execute({
  target: 'production'
});
```

---

## check_permission

Check if operations require permissions.

### Input Schema

```typescript
{
  operation: string;       // Required: Operation to check
  target?: string;         // Optional: Target file/directory
}
```

### Response

```typescript
{
  success: true,
  data: {
    operation: string;
    required_permission: 'none' | 'dangerous' | 'supervisor';
    reason?: string;
    allowed: boolean;
  }
}
```

### Example

```typescript
// Check if delete requires permission
const result1 = await checkPermissionTool.execute({
  operation: 'delete',
  target: '/important/file.txt'
});

// Returns: { required_permission: 'dangerous', allowed: true }

// Check if system command requires permission
const result2 = await checkPermissionTool.execute({
  operation: 'run_command',
  target: 'rm -rf /'
});

// Returns: { required_permission: 'supervisor', allowed: false }
```

---

## project_map

Map project structure and dependencies.

### Input Schema

```typescript
{
  path?: string;           // Optional: Project path (default: current)
  include_dependencies?: boolean;  // Optional (default: true)
  depth?: number;          // Optional: Scan depth (default: 3)
}
```

### Response

```typescript
{
  success: true,
  data: {
    structure: TreeNode[];
    dependencies: Dependency[];
    metrics: {
      total_files: number;
      total_lines: number;
      languages: Record<string, number>;
    };
  }
}

interface TreeNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: TreeNode[];
}

interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
}
```

### Example

```typescript
const map = await projectMapTool.execute({
  path: '/path/to/project',
  include_dependencies: true
});

console.log('Files:', map.data.metrics.total_files);
console.log('Lines:', map.data.metrics.total_lines);
console.log('Languages:', map.data.metrics.languages);
```

---

## list_symbols

List symbols (functions, classes, interfaces) in source files.

### Input Schema

```typescript
{
  path: string;            // Required: File or directory path
  kind?: 'function' | 'class' | 'interface' | 'variable' | 'all';  // Optional (default: 'all')
  export_only?: boolean;   // Optional: Only exported symbols (default: false)
}
```

### Response

```typescript
{
  success: true,
  data: {
    symbols: SymbolInfo[];
    total_count: number;
  }
}

interface SymbolInfo {
  name: string;
  kind: string;
  file: string;
  line: number;
  exported: boolean;
  signature?: string;
}
```

### Example

```typescript
// List all symbols in file
const all = await listSymbolsTool.execute({
  path: 'src/index.ts'
});

// List only exported functions
const exported = await listSymbolsTool.execute({
  path: 'src',
  kind: 'function',
  export_only: true
});
```

---

## Supported Project Types

### Node.js Projects
- **Package managers:** npm, yarn, pnpm
- **Test frameworks:** jest, vitest, mocha, ava
- **Formatters:** prettier
- **Linters:** eslint
- **Build tools:** webpack, vite, tsc, rollup

### Python Projects
- **Package managers:** pip, poetry
- **Test frameworks:** pytest, unittest
- **Formatters:** black, autopep8
- **Linters:** pylint, flake8, mypy
- **Build tools:** setuptools, poetry build

### Rust Projects
- **Package managers:** cargo
- **Test frameworks:** cargo test
- **Formatters:** rustfmt
- **Linters:** clippy
- **Build tools:** cargo build

### Go Projects
- **Package managers:** go mod
- **Test frameworks:** go test
- **Formatters:** gofmt
- **Linters:** golint, staticcheck
- **Build tools:** go build

---

## Error Codes

| Code | Description |
|------|-------------|
| `PROJECT_NOT_FOUND` | No project detected at path |
| `BUILD_FAILED` | Build operation failed |
| `TEST_FAILED` | Tests failed |
| `FORMAT_FAILED` | Format operation failed |
| `LINT_FAILED` | Lint operation failed |
| `PERMISSION_DENIED` | Operation requires higher permission |
| `UNSUPPORTED_PROJECT` | Project type not supported |

---

## Best Practices

### 1. Always Detect Project First

```typescript
const project = await detectProjectTool.execute({});

if (project.data.project_type !== 'unknown') {
  // Project is recognized, proceed with operations
}
```

### 2. Check Permissions Before Operations

```typescript
const perm = await checkPermissionTool.execute({
  operation: 'delete',
  target: '/path/to/file'
});

if (perm.data.required_permission === 'supervisor') {
  // Ask for confirmation
}
```

### 3. Use Map for Project Understanding

```typescript
const map = await projectMapTool.execute({});

// Understand project structure before making changes
if (map.data.metrics.total_files > 1000) {
  // Large project, use caution
}
```

---

**Category:** build
**Tools:** 8
**Permission Level:** varies (none/dangerous)
