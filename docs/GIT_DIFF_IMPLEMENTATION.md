# Git Diff Tool - Implementation Status

**Status:** ✅ ALREADY IMPLEMENTED

---

## Overview

Floyd CLI is **already equipped** with a comprehensive `git_diff` tool through the built-in Git MCP server.

---

## Implementation Details

### Location
- **Server:** `INK/floyd-cli/src/mcp/git-server.ts`
- **Registration:** `INK/floyd-cli/src/config/builtin-servers.ts`
- **Startup:** `INK/floyd-cli/src/app.tsx:178` (started automatically)

### Tool Specification

```typescript
{
  name: 'git_diff',
  description: 'Show changes between commits, commit and working tree, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      repoPath: {
        type: 'string',
        description: 'Path to git repository',
      },
      files: {
        type: 'array',
        items: {type: 'string'},
        description: 'Specific files to diff (empty for all)',
      },
      staged: {
        type: 'boolean',
        description: 'Show staged changes instead of working directory',
        default: false,
      },
      cached: {
        type: 'boolean',
        description: 'Alias for staged',
        default: false,
      },
    },
  },
}
```

---

## Usage Examples

### Basic Usage - Show Working Directory Changes
```
User: Show me the git diff
```

### Show Staged Changes
```
User: Show git diff for staged files
```

### Diff Specific Files
```
User: Show git diff for src/app.tsx and src/cli.tsx
```

### Diff with Context
```
User: What changes are staged for commit?
```

---

## Tool Capabilities

### Features
✅ Working directory diff
✅ Staged (cached) diff
✅ Specific file diff
✅ Custom repository path
✅ Structured output (JSON)
✅ Raw diff text included
✅ File status tracking (modified, added, deleted, renamed)

### Output Format
```json
{
  "file": "path/to/file.ts",
  "status": "modified",
  "chunks": [
    {
      "oldStart": 10,
      "oldLines": 5,
      "newStart": 10,
      "newLines": 7,
      "content": "diff content..."
    }
  ]
}
```

For full raw diff output:
```json
{
  "file": "__raw__",
  "status": "modified",
  "chunks": [
    {
      "oldStart": 0,
      "oldLines": 0,
      "newStart": 0,
      "newLines": 0,
      "content": "diff --git a/file.ts b/file.ts\n..."
    }
  ]
}
```

---

## Verification

### Build and Test
```bash
# Navigate to CLI directory
cd INK/floyd-cli

# Build the project
npm run build

# Start Floyd CLI
npm start

# Test the tool (in Floyd CLI):
# "Show me the git diff"
```

### Verify Tool Availability
The `git_diff` tool is automatically available when Floyd CLI starts because:
1. Git server is registered in `BUILTIN_SERVERS` (enabled: true)
2. MCPClientManager is initialized with BUILTIN_SERVERS
3. `startBuiltinServers()` is called on app initialization

---

## Related Tools

The git-server provides these additional tools:

| Tool | Description |
|-------|-------------|
| `git_status` | Show repository status with staged/unstaged files |
| `git_diff` | Show changes between commits, commit and working tree |
| `git_log` | Show commit history |
| `git_commit` | Create commits with staging area management |
| `git_stage` | Stage files for commit |
| `git_unstage` | Unstage files from staging area |
| `git_branch` | List, create, or switch branches |
| `is_protected_branch` | Check if branch is protected (main, master, develop) |

---

## Configuration

### Enable/Disable Git Server
Edit `INK/floyd-cli/src/config/builtin-servers.ts`:

```typescript
git: {
  name: 'git',
  modulePath: join(serverDir, 'git-server.ts'),
  description: 'Git operations: status, diff, log, commit, branch management',
  enabled: true,  // Set to false to disable
},
```

### Protected Branch Patterns
Edit `INK/floyd-cli/src/mcp/git-server.ts` (lines 60-67):

```typescript
const PROTECTED_BRANCH_PATTERNS = [
  'main',
  'master',
  'development',
  'develop',
  'production',
  'release',
];
```

---

## Technical Implementation

### Key Functions

```typescript
// Main diff function (lines 149-249)
async function getGitDiff(options: {
  repoPath?: string;
  files?: string[];
  staged?: boolean;
  cached?: boolean;
}): Promise<GitDiff[] | {error: string}>

// MCP tool handler (lines 720-743)
case 'git_diff': {
  const {repoPath, files, staged, cached} = args;
  const diff = await getGitDiff({repoPath, files, staged, cached});
  return {content: [{type: 'text', text: JSON.stringify(diff)}]};
}
```

### Dependencies
- `simple-git` - Git operations library
- `@modelcontextprotocol/sdk` - MCP server implementation
- `path` - Path resolution

---

## Troubleshooting

### Tool Not Available
**Problem:** Agent doesn't see `git_diff` tool

**Solution:**
1. Check git server is enabled in `builtin-servers.ts`
2. Verify build is up to date: `npm run build`
3. Check MCP server startup logs
4. Ensure git repository exists in working directory

### Diff Returns Empty
**Problem:** No diff output shown

**Solution:**
1. Verify files have changes: `git status`
2. Check if changes are staged (use `staged: true` for staged changes)
3. Ensure correct repository path
4. Try running `git diff` manually to verify

### Repository Not Found
**Problem:** "Not a git repository" error

**Solution:**
1. Ensure Floyd CLI is running in a git repository
2. Provide explicit `repoPath` parameter
3. Initialize git repository: `git init`

---

## Future Enhancements

Potential improvements to the `git_diff` tool:

- [ ] Color-coded diff output (ANSI colors)
- [ ] Line-by-line navigation support
- [ ] Diff statistics (added/removed lines count)
- [ ] Unified diff format option
- [ ] Context lines configuration
- [ ] Binary file detection
- [ ] Merge conflict resolution suggestions

---

**Documented:** 2026-01-21
**Status:** ✅ Git diff tool is already implemented and functional
