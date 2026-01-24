# Contributing to Floyd Wrapper

Thank you for your interest in contributing to Floyd Wrapper! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Tool Development](#tool-development)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

---

## Development Setup

### Prerequisites

- **Node.js:** 20.0.0 - 20.x (strict version requirement)
- **npm:** 10.0.0 or higher
- **Git:** For version control

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd "FLOYD WRAPPER"

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Build the project
npm run build

# Run tests to verify setup
npm test
```

### Development Workflow

```bash
# Watch mode for development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

---

## Project Structure

```
FLOYD WRAPPER/
├── src/
│   ├── agent/              # Agent execution engine
│   │   └── execution-engine.ts
│   ├── cache/              # Multi-tier cache system
│   │   └── supercache.ts
│   ├── cli.ts              # Main CLI entry point
│   ├── llm/                # LLM API client
│   │   └── glm-client.ts
│   ├── permissions/        # Permission system
│   │   └── permission-manager.ts
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
│   └── unit/               # Unit tests
├── dist/                   # Compiled output (generated)
├── docs/                   # API documentation
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── .env                    # Environment configuration
```

---

## Coding Standards

### TypeScript Guidelines

#### 1. Type Safety
- **Always** use TypeScript types (no `any` unless absolutely necessary)
- Enable strict mode in `tsconfig.json`
- Use interfaces for object shapes
- Use type aliases for union/intersection types

```typescript
// Good
interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  execute: (input: unknown) => Promise<ToolResult>;
}

// Bad
const tool: any = { ... };
```

#### 2. Async/Await
- Use `async/await` instead of promises
- Always handle errors with try/catch
- Return meaningful error messages

```typescript
// Good
async function executeTool(input: ToolInput): Promise<ToolResult> {
  try {
    const result = await someAsyncOperation(input);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'TOOL_ERROR',
        message: (error as Error).message
      }
    };
  }
}

// Bad
function executeTool(input: ToolInput) {
  return someAsyncOperation(input).then(result => ({ data: result }));
}
```

#### 3. Import Organization
- Group imports by type: external, internal, relative
- Use `.ts` extensions for internal imports (for tsx compatibility)
- Use type-only imports when possible

```typescript
// External dependencies
import { z } from 'zod';
import ora from 'ora';
import type { Ora } from 'ora';

// Internal imports
import type { ToolDefinition } from './types.ts';
import { toolRegistry } from './tool-registry.ts';

// Relative imports
import { fileCore } from './file-core.ts';
```

#### 4. Naming Conventions
- **Files:** `kebab-case.ts` (e.g., `tool-registry.ts`)
- **Classes:** `PascalCase` (e.g., `ToolRegistry`)
- **Functions/Variables:** `camelCase` (e.g., `executeTool`)
- **Constants:** `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Interfaces/Types:** `PascalCase` (e.g., `ToolDefinition`)

#### 5. Error Handling
- Always return structured errors
- Include error codes and messages
- Log errors appropriately

```typescript
// Good error handling
return {
  success: false,
  error: {
    code: 'FILE_NOT_FOUND',
    message: `File not found: ${filePath}`,
    details: { filePath, operation: 'read' }
  }
};

// Bad error handling
throw new Error('Failed');
```

### Code Style

#### 1. Formatting
- Use **Prettier** for code formatting
- Configure editor to format on save
- Run `npm run format` before committing

```bash
npm run format
```

#### 2. Linting
- Use **ESLint** for linting
- Fix all linting errors before committing
- Run `npm run lint` before pushing

```bash
npm run lint
```

#### 3. Line Length
- Maximum line length: **120 characters**
- Break long lines logically
- Use template literals for long strings

#### 4. Comments
- Use JSDoc comments for public APIs
- Comment complex logic
- Keep comments up to date

```typescript
/**
 * Registers a tool with the tool registry.
 * @param tool - The tool definition to register
 * @throws {Error} If tool with same name already exists
 */
export function registerTool(tool: ToolDefinition): void {
  // Implementation
}
```

---

## Testing Guidelines

### Test Structure

- **Unit tests:** Test individual functions/classes
- **Integration tests:** Test tool interactions
- **E2E tests:** Test complete workflows

### Writing Tests

#### 1. Test Organization
- Group tests by feature/file
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
test.serial('read_file:execute - successfully reads entire file', async (t) => {
  // Arrange
  const testContent = 'Hello, World!';
  await writeFile(TEST_FILE, testContent);

  // Act
  const result = await readFileTool.execute({
    file_path: TEST_FILE
  });

  // Assert
  t.true(result.success, 'Read should succeed');
  if (result.success) {
    t.is(result.data.content, testContent, 'Content should match');
  }
});
```

#### 2. Test Coverage
- Aim for **80%+** coverage
- Test both success and failure paths
- Test edge cases (empty input, null values, etc.)

#### 3. Test Best Practices
- Use `test.serial` for tests with shared state
- Clean up test files in `after.always` hooks
- Use unique test data (UUIDs, timestamps)

```typescript
test.serial('cache:execute - handles concurrent operations', async (t) => {
  const uniqueKey = `test-${Date.now()}-${randomUUID()}`;

  // Test implementation

  test.after.always(async () => {
    // Cleanup
    await cacheDeleteTool.execute({ key: uniqueKey });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run specific test file
npx ava tests/unit/tools/file/read.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npx ava --watch
```

---

## Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks
- **perf:** Performance improvements

### Examples

```
feat(tools): add browser_screenshot tool

Implements screenshot capture with:
- Full-page support
- Multiple format options
- Automatic filename generation

Closes #123

```

```
fix(cache): resolve race condition in cache_store

Added mutex lock to prevent concurrent writes
to the same cache key.

Fixes #456
```

```
docs(readme): update installation instructions

Clarified Node.js version requirements and
added troubleshooting section.
```

### Commit Best Practices

- **One logical change per commit**
- **Write clear, descriptive subjects**
- **Use imperative mood** ("add" not "added" or "adds")
- **Limit subject line to 72 characters**
- **Reference issues** in commit body

---

## Pull Request Process

### Before Submitting

1. **Update documentation** (README, API docs, etc.)
2. **Add/update tests** for your changes
3. **Run all tests** and ensure they pass
4. **Run linting** and fix issues
5. **Format code** with Prettier
6. **Update CHANGELOG.md** with your changes

### Pull Request Checklist

- [ ] Code follows project coding standards
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No breaking changes (or documented)

## Related Issues
Closes #(issue number)
```

---

## Tool Development

### Creating a New Tool

#### 1. Define Tool Interface

Create a new file in `src/tools/<category>/`:

```typescript
// src/tools/<category>/my-tool.ts
import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';

export const myTool: ToolDefinition = {
  name: 'my_tool',
  description: 'Does something useful',
  category: '<category>',
  inputSchema: z.object({
    param1: z.string().min(1, 'Parameter is required'),
    param2: z.number().optional(),
  }),
  permission: 'none', // 'none' | 'dangerous' | 'supervisor'
  execute: async (input) => {
    // Validate input
    const validationResult = myTool.inputSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Validation failed: ${validationResult.error.errors}`,
          details: { errors: validationResult.error.errors }
        }
      };
    }

    // Execute tool logic
    try {
      const result = await doSomething(validationResult.data);
      return {
        success: true,
        data: { result }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TOOL_ERROR',
          message: (error as Error).message
        }
      };
    }
  }
} as ToolDefinition;
```

#### 2. Register Tool

Add to `src/tools/index.ts`:

```typescript
import { myTool } from './<category>/my-tool.ts';

export function registerCoreTools(): void {
  // ...
  toolRegistry.register(myTool);
}
```

#### 3. Add Tests

Create test file in `tests/unit/tools/<category>/`:

```typescript
// tests/unit/tools/<category>/my-tool.test.ts
import test from 'ava';
import { myTool } from '../../../../src/tools/<category>/my-tool.ts';

test.serial('my_tool:tool - returns correct tool definition', (t) => {
  t.is(myTool.name, 'my_tool');
  t.is(myTool.category, '<category>');
  t.true(typeof myTool.execute === 'function');
});

test.serial('my_tool:execute - executes successfully', async (t) => {
  const result = await myTool.execute({
    param1: 'test'
  });

  t.true(result.success);
  // Add more assertions
});
```

#### 4. Update Documentation

Add to `docs/tools/<category>.md` with API documentation.

### Tool Categories

Available categories:
- `git` - Git operations
- `file` - File operations
- `cache` - Cache operations
- `search` - Search operations
- `system` - System operations
- `browser` - Browser automation
- `patch` - Patch operations
- `build` - Build/explorer operations

### Permission Levels

- **none** - No restrictions (read operations, safe operations)
- **dangerous** - Requires confirmation (write operations, modifications)
- **supervisor** - Highest privilege (system-level operations)

---

## Getting Help

### Questions?
- Check existing documentation in `docs/`
- Review test files for examples
- Open an issue on GitHub

### Reporting Bugs
- Use GitHub issues
- Include steps to reproduce
- Provide environment details (Node version, OS, etc.)
- Attach error logs if available

---

## License

By contributing to Floyd Wrapper, you agree that your contributions will be licensed under the **PROPRIETARY** license.

---

**Thank you for contributing!** 🚀
