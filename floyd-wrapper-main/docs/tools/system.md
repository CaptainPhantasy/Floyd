# System Operations API

Complete API reference for system tools.

## Tools Overview

- [run](#run) - Execute shell commands
- [ask_user](#ask_user) - Prompt user for input

---

## run

Execute shell commands with timeout and output capture.

### Input Schema

```typescript
{
  command: string;         // Required: Command to execute
  cwd?: string;            // Optional: Working directory
  env?: Record<string, string>; // Optional: Environment variables
  timeout?: number;        // Optional: Timeout in milliseconds (default: 30000)
  silent?: boolean;        // Optional: Suppress output (default: false)
}
```

### Response

```typescript
{
  success: true,
  data: {
    exit_code: number;
    stdout: string;
    stderr: string;
    timed_out: boolean;
  }
}
```

### Example

```typescript
// Run simple command
const result1 = await runTool.execute({
  command: 'ls -la'
});

// Run with timeout
const result2 = await runTool.execute({
  command: 'npm test',
  timeout: 60000  // 60 seconds
});

// Run with custom working directory
const result3 = await runTool.execute({
  command: 'git status',
  cwd: '/path/to/repo'
});

// Run with environment variables
const result4 = await runTool.execute({
  command: 'node script.js',
  env: {
    NODE_ENV: 'production',
    API_KEY: 'secret'
  }
});
```

---

## ask_user

Prompt user for input with validation.

### Input Schema

```typescript
{
  prompt: string;          // Required: Prompt message
  default?: string;        // Optional: Default value
  validation?: {
    pattern?: string;      // Optional: Regex pattern
    min_length?: number;   // Optional: Minimum length
    max_length?: number;   // Optional: Maximum length
    allowed_values?: string[]; // Optional: List of allowed values
  }
  password?: boolean;      // Optional: Hide input (default: false)
}
```

### Response

```typescript
{
  success: true,
  data: {
    value: string;
    validated: boolean;
  }
}
```

### Example

```typescript
// Simple prompt
const result1 = await askUserTool.execute({
  prompt: 'Enter your name:'
});

// Prompt with default
const result2 = await askUserTool.execute({
  prompt: 'Enter port:',
  default: '3000'
});

// Prompt with validation
const result3 = await askUserTool.execute({
  prompt: 'Enter email:',
  validation: {
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
  }
});

// Password prompt
const result4 = await askUserTool.execute({
  prompt: 'Enter password:',
  password: true
});
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `COMMAND_FAILED` | Command returned non-zero exit code |
| `COMMAND_TIMEOUT` | Command execution timed out |
| `COMMAND_NOT_FOUND` | Command not found |
| `INVALID_INPUT` | User input validation failed |
| `USER_CANCELLED` | User cancelled input |

---

## Security Considerations

### Command Injection Prevention

**DANGER:** Never pass unsanitized user input to commands:

```typescript
// BAD - Command injection vulnerability
const userInput = 'file.txt; rm -rf /';
await runTool.execute({
  command: `cat ${userInput}`  // DANGER!
});

// GOOD - Use proper escaping
await runTool.execute({
  command: `cat ${escapeShellArg(userInput)}`
});
```

### Allowed Commands

Consider whitelisting allowed commands:

```typescript
const ALLOWED_COMMANDS = ['git', 'npm', 'node', 'ls'];

function isCommandSafe(command: string): boolean {
  const baseCommand = command.split(' ')[0];
  return ALLOWED_COMMANDS.includes(baseCommand);
}
```

---

**Category:** system
**Tools:** 2
**Permission Level:** supervisor
