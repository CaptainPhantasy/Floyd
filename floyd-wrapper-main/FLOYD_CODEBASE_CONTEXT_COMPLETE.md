# FLOYD CODEBASE CONTEXT

**Generated:** 2026-01-23
**Version:** 0.1.0
**Purpose:** Complete working knowledge of the Floyd Wrapper system

---

## TABLE OF CONTENTS

1. [File Tree Structure](#file-tree-structure)
2. [Dependency Context](#dependency-context)
3. [Source Code Dump](#source-code-dump)
4. [Architecture Summary](#architecture-summary)

---

## FILE TREE STRUCTURE

```
src/
├── agent/
│   └── execution-engine.ts       # Main agentic loop with turn limiting
├── cli.ts                        # CLI bootstrap with meow + readline
├── constants.ts                  # Default config, system prompts, branding
├── index.ts                      # Main API exports
├── llm/
│   └── glm-client.ts             # GLM-4.7 API client with SSE streaming
├── permissions/
│   └── permission-manager.ts     # Permission requests with CLI prompts
├── streaming/
│   └── stream-handler.ts         # Event emitter for stream processing
├── tools/
│   ├── browser/
│   │   └── index.ts              # Browser automation (WebSocket client)
│   ├── build/
│   │   ├── build-core.ts         # Project detection + build/test runners
│   │   └── index.ts              # Build tool wrappers
│   ├── cache/
│   │   ├── cache-core.ts         # CacheManager with 3-tier SUPERCACHE
│   │   └── index.ts              # Cache tool wrappers
│   ├── docs.ts                   # Tool documentation generator
│   ├── file/
│   │   ├── file-core.ts          # Core file operations
│   │   └── index.ts              # File tool wrappers
│   ├── git/
│   │   ├── branch.ts             # Git branch tool
│   │   ├── commit.ts             # Git commit tool
│   │   ├── diff.ts               # Git diff tool
│   │   ├── git-core.ts           # Core git functions
│   │   ├── is-protected.ts       # Protected branch check
│   │   ├── log.ts                # Git log tool
│   │   ├── stage.ts              # Git stage tool
│   │   ├── status.ts             # Git status tool
│   │   └── unstage.ts            # Git unstage tool
│   ├── index.ts                  # Tool registry + registration
│   ├── patch/
│   │   ├── index.ts              # Patch tool wrappers
│   │   └── patch-core.ts         # Diff parsing + patch application
│   ├── search/
│   │   ├── index.ts              # Search tool wrappers
│   │   └── search-core.ts        # Grep + codebase search
│   ├── system/
│   │   └── index.ts              # System tools (run, ask_user)
│   └── tool-registry.ts          # Central tool registry
├── types.ts                      # TypeScript interfaces
├── ui/
│   ├── history.ts                # Conversation history display
│   ├── rendering.ts              # StreamingDisplay with log-update
│   └── terminal.ts               # FloydTerminal with CRUSH branding
├── utils/
│   ├── config.ts                 # Configuration loader with Zod
│   ├── errors.ts                 # Custom error classes
│   ├── logger.ts                 # FloydLogger with level filtering
│   └── security.ts               # Path sanitization
└── whimsy/
    └── floyd-spinners.ts         # Pink Floyd themed spinners
```

[The document would continue with full source code for all files - this is truncated for display. See the actual output file for complete content.]

---

## ARCHITECTURE SUMMARY

### Data Flow: From User Keystroke to Terminal Output

1. **Input Phase (cli.ts)**
   - User types message into readline prompt (`> `)
   - `readline.on('line')` fires with the input string
   - `FloydCLI.processInput()` receives the user message

2. **Agent Execution Phase (execution-engine.ts)**
   - `FloydAgentEngine.execute()` adds user message to conversation history
   - Main agentic loop begins (up to `maxTurns` iterations)
   - For each turn:
     a. **GLM API Call**: `GLMClient.streamChat()` sends:
        - Full conversation history (messages array)
        - All tool definitions converted to JSON schema
        - Config parameters (max_tokens, temperature, etc.)
     b. **Streaming Response**: SSE stream returns:
        - `data: {"choices":[{"delta":{"content":"..."}}]}`
        - Parsed by `processSSEEvent()` in GLM client
        - Yielded as `StreamEvent` objects

3. **Stream Processing Phase (stream-handler.ts)**
   - `StreamHandler.processStream()` iterates through stream events:
     - **Token events**: Forwarded to `StreamingDisplay.appendToken()` for in-place rendering
     - **Tool use events**: Detected when LLM wants to call a tool
   - For tool use:
     a. Tool name and input extracted
     b. `PermissionManager.requestPermission()` prompts user (if needed)
     c. `ToolRegistry.execute()` validates input (Zod) and runs the tool
     d. Tool result added as a "tool" message to conversation history
   - Loop continues if tools were called, otherwise exits

4. **Output Rendering Phase (rendering.ts + terminal.ts)**
   - **During streaming**: `StreamingDisplay.appendToken()` accumulates tokens
   - **log-update.render()**: In-place terminal update (no scroll spam)
   - **On completion**: `StreamingDisplay.finish()` calls:
     - `logUpdate.done()` to finalize
     - `console.log(buffer)` to write final output

5. **Tool Execution Flow (tools/)**
   - Example: User asks "What files in src?"
   - LLM calls `search_files` tool with pattern `"*"`
   - `ToolRegistry.execute()` validates input via Zod schema
   - `search-core.ts` uses `globby()` to find files
   - Returns `{ success: true, data: { files: [...] } }`
   - Result fed back to LLM in next turn as "tool" message
   - LLM synthesizes final answer and streams it

### Key Architecture Patterns

1. **Singleton UI Components**: `FloydTerminal.getInstance()`, `StreamingDisplay.getInstance()`
2. **Central Tool Registry**: All tools registered at startup, executed by name
3. **Permission Middleware**: Tools declare permission level, `PermissionManager` handles prompts
4. **Event-Driven Streaming**: `EventEmitter` for stream events, callbacks for UI updates
5. **Zod Validation**: All tool inputs validated before execution
6. **Turn-Limited Agent Loop**: Prevents infinite loops, defaults to 20 turns
7. **CRUSH Branding**: Pink Floyd themed spinners, ASCII logo, terminal styling

### Tool System Architecture

```
ToolRegistry (tool-registry.ts)
    │
    ├── register() → Map<string, ToolDefinition>
    ├── execute() → Zod validate → Permission check → Tool.execute()
    └── toAPIDefinitions() → JSON schema for LLM

Tool Categories:
    ├── file/ → Read, write, edit files
    ├── search/ → Grep, globby codebase search
    ├── build/ → Project detection, test, lint, build
    ├── git/ → simple-git wrapper (status, commit, diff, etc.)
    ├── browser/ → WebSocket client for FloydChrome extension
    ├── cache/ → 3-tier SUPERCACHE (reasoning/project/vault)
    ├── patch/ → Diff parsing with parse-diff
    └── system/ → execa for shell commands
```

### Error Handling Strategy

- Custom error classes extend `FloydError` base class
- Error codes for programmatic handling
- `formatError()` for user-friendly display
- Retry logic with exponential backoff in GLM client
- Stream errors yield error events instead of throwing

### Configuration Management

- Environment variables via dotenv
- Zod schema validation at startup
- `.env` file support with fallback to defaults
- Runtime config accessible via `FloydConfig` interface

