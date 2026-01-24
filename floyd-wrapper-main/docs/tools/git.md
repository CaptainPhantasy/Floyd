# Git Operations API

Complete API reference for Git workflow tools.

## Tools Overview

- [git_status](#git_status) - Show working tree status
- [git_diff](#git_diff) - Show changes between commits
- [git_log](#git_log) - Show commit logs
- [git_commit](#git_commit) - Create commits
- [git_stage](#git_stage) - Stage files for commit
- [git_unstage](#git_unstage) - Unstage files from index
- [git_branch](#git_branch) - Manage branches
- [is_protected_branch](#is_protected_branch) - Check branch protection

---

## git_status

Show working tree status with staged and unstaged files.

### Input Schema

```typescript
{
  repo_path?: string;  // Optional: Repository path (defaults to current directory)
}
```

### Response

```typescript
// Success
{
  success: true,
  data: {
    current_branch: string;
    staged: FileStatus[];
    unstaged: FileStatus[];
    untracked: string[];
  }
}

interface FileStatus {
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
}
```

### Example

```typescript
const result = await gitStatusTool.execute({
  repo_path: '/path/to/repo'
});

// Returns files staged, unstaged, and untracked
```

---

## git_diff

Show changes between commits, working tree, and branches.

### Input Schema

```typescript
{
  repo_path?: string;     // Optional: Repository path
  file_path?: string;     // Optional: Specific file to diff
  target?: string;        // Optional: Target commit/branch
  source?: string;        // Optional: Source commit/branch
  cached?: boolean;       // Optional: Show staged changes only
}
```

### Response

```typescript
{
  success: true,
  data: {
    diff: string;         // Unified diff output
    files_changed: number;
    insertions: number;
    deletions: number;
  }
}
```

### Example

```typescript
// Diff working tree
const result1 = await gitDiffTool.execute({
  repo_path: '/path/to/repo'
});

// Diff specific file
const result2 = await gitDiffTool.execute({
  file_path: 'src/index.ts'
});

// Diff two commits
const result3 = await gitDiffTool.execute({
  source: 'main',
  target: 'develop'
});
```

---

## git_log

Show commit logs with formatting options.

### Input Schema

```typescript
{
  repo_path?: string;     // Optional: Repository path
  max_count?: number;     // Optional: Maximum number of commits
  offset?: number;        // Optional: Skip first N commits
  author?: string;        // Optional: Filter by author
  since?: string;         // Optional: Since date (e.g., "2024-01-01")
  until?: string;         // Optional: Until date
  file?: string;          // Optional: Show commits for file
}
```

### Response

```typescript
{
  success: true,
  data: {
    commits: CommitInfo[];
  }
}

interface CommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
  files?: string[];
}
```

### Example

```typescript
// Get last 10 commits
const result = await gitLogTool.execute({
  max_count: 10
});

// Get commits by author
const result2 = await gitLogTool.execute({
  author: 'John Doe'
});
```

---

## git_commit

Create commits with optional automatic staging.

### Input Schema

```typescript
{
  repo_path?: string;     // Optional: Repository path
  message: string;        // Required: Commit message
  stage_all?: boolean;    // Optional: Stage all changes before committing
  amend?: boolean;        // Optional: Amend last commit
}
```

### Response

```typescript
{
  success: true,
  data: {
    commit_hash: string;
    message: string;
  }
}
```

### Example

```typescript
// Commit staged changes
const result = await gitCommitTool.execute({
  message: 'feat: add new feature'
});

// Stage all and commit
const result2 = await gitCommitTool.execute({
  message: 'feat: add feature',
  stage_all: true
});
```

---

## git_stage

Stage files for commit.

### Input Schema

```typescript
{
  repo_path?: string;     // Optional: Repository path
  files: string[];        // Required: Files to stage
}
```

### Response

```typescript
{
  success: true,
  data: {
    staged: string[];
  }
}
```

### Example

```typescript
const result = await gitStageTool.execute({
  files: ['src/index.ts', 'README.md']
});
```

---

## git_unstage

Unstage files from index.

### Input Schema

```typescript
{
  repo_path?: string;     // Optional: Repository path
  files: string[];        // Required: Files to unstage
}
```

### Response

```typescript
{
  success: true,
  data: {
    unstaged: string[];
  }
}
```

### Example

```typescript
const result = await gitUnstageTool.execute({
  files: ['src/index.ts']
});
```

---

## git_branch

List, create, and delete branches.

### Input Schema

```typescript
{
  repo_path?: string;     // Optional: Repository path
  action?: 'list' | 'create' | 'delete';  // Optional: Action (default: list)
  name?: string;          // Optional: Branch name (for create/delete)
  force?: boolean;        // Optional: Force deletion
}
```

### Response

```typescript
// List action
{
  success: true,
  data: {
    branches: string[];
    current: string;
  }
}

// Create/Delete action
{
  success: true,
  data: {
    branch: string;
    action: 'created' | 'deleted';
  }
}
```

### Example

```typescript
// List branches
const result1 = await gitBranchTool.execute();

// Create branch
const result2 = await gitBranchTool.execute({
  action: 'create',
  name: 'feature/new-tool'
});

// Delete branch
const result3 = await gitBranchTool.execute({
  action: 'delete',
  name: 'feature/old-branch',
  force: true
});
```

---

## is_protected_branch

Check if branch is protected (main, master, develop).

### Input Schema

```typescript
{
  branch?: string;        // Optional: Branch name (defaults to current)
  repo_path?: string;     // Optional: Repository path
}
```

### Response

```typescript
{
  success: true,
  data: {
    branch: string;
    protected: boolean;
    reason?: string;
  }
}
```

### Example

```typescript
const result = await isProtectedBranchTool.execute({
  branch: 'main'
});

// Returns: { protected: true, reason: 'main branch is protected' }
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `GIT_ERROR` | General Git operation error |
| `NOT_A_REPOSITORY` | Path is not a Git repository |
| `INVALID_BRANCH` | Branch name is invalid |
| `PROTECTED_BRANCH` | Cannot modify protected branch |
| `NOTHING_TO_COMMIT` | No changes to commit |

---

**Category:** git
**Tools:** 8
**Permission Level:** varies (none/dangerous)
