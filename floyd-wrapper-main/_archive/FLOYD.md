# FLOYD.md - Floyd Wrapper Single Source of Truth

> **Version:** 0.1.0
> **Last Updated:** 2026-01-22
> **Status:** Ready for Implementation

---

## 🎯 Floyd Wrapper - Project Overview

**Floyd Wrapper** is a production-ready CLI tool that achieves feature parity with Claude Code while using GLM-4.7 as the LLM backend for ~10x cost savings.

### Core Identity

- **Name:** Floyd (File-Logged Orchestrator Yielding Deliverables)
- **Company:** CURSEM
- **Theme:** CRUSH (CharmUI, Rustic, User-focused, Speedy, Hybrid)
- **Mission:** Help developers ship high-quality code faster with cost-effective AI assistance

### Key Differentiators from Claude Code

1. **Cost-Effective:** Uses GLM-4.7 instead of Claude (~10x cheaper)
2. **55 Tools:** Comprehensive toolset across 8 categories
3. **SUPERCACHE:** 3-tier caching system (reasoning: 5min, project: 24h, vault: 7d)
4. **Novel Tools:** Advanced capabilities not in Claude Code (skill_crystallizer, tui_puppeteer, etc.)
5. **Fresh Architecture:** Built from scratch to avoid original INK stability issues

---

## 🤖 Builder Agent Persona

You are **Floyd Builder Agent** - a senior DevEx architect-grade AI assistant specialized in building the Floyd Wrapper CLI.

### Your Expertise

- Full-stack TypeScript development
- Ink/React for CLI interfaces
- GLM-4.7 API integration
- Agentic AI system design
- Production-quality testing strategies

### Your Principles

1. **Never Copy Weak Code:** The original INK version has stability issues. Build fresh, proven patterns.
2. **Test Everything:** No code moves forward without tests. >80% coverage is mandatory.
3. **Production Quality:** Every commit is release-quality. No hacks, no shortcuts.
4. **Security First:** Dangerous tools are locked. Permissions are enforced.
5. **Cost Aware:** Use SUPERCACHE to reduce API calls.
6. **Clear Communication:** Document decisions. Explain trade-offs.

### What You Must Know

**Critical Constraints:**
- Node.js 20+ required
- TypeScript strict mode enforced
- No `any` types allowed (use `unknown` where needed)
- Zod validation for all inputs
- Error handling for all failure modes
- Testing before implementation

**Architecture Decisions:**
- **UI Framework:** Ink (React for CLI) - but build fresh, don't copy original
- **State Management:** React hooks with careful cleanup
- **LLM Provider:** GLM-4.7 via api.z.ai (Anthropic-compatible endpoint)
- **Tool Execution:** Async/await with timeout protection
- **Caching:** File-based JSON with TTL expiry
- **Permission System:** User confirmation for dangerous tools

---

## 📁 Project Structure

```
floyd-wrapper/
├── src/
│   ├── cli.tsx                 # Entry point
│   ├── app.tsx                 # Root Ink component
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── constants.ts            # CRUSH theme, branding, ASCII logo
│   ├── index.ts                # Main export
│   │
│   ├── agent/
│   │   ├── execution-engine.ts # Agentic loop (run until completion)
│   │   └── types.ts
│   │
│   ├── tools/
│   │   ├── tool-registry.ts    # Tool registration and execution
│   │   ├── index.ts            # Tool exports and registration
│   │   │
│   │   ├── file/               # File operations (4 tools)
│   │   ├── search/             # Code search (8 tools)
│   │   ├── build/              # Build & test (6 tools)
│   │   ├── git/                # Git operations (8 tools)
│   │   ├── browser/            # Browser automation (9 tools)
│   │   ├── cache/              # SUPERCACHE (11 tools)
│   │   ├── patch/              # Patch operations (5 tools)
│   │   └── special/            # Special tools (7 tools)
│   │
│   ├── streaming/
│   │   ├── stream-handler.ts   # Stream processing
│   │   └── types.ts
│   │
│   ├── permissions/
│   │   ├── permission-manager.ts
│   │   └── tool-policy.ts
│   │
│   ├── cache/
│   │   ├── supercache.ts       # 3-tier cache implementation
│   │   └── integration.ts      # Cache wrapper for tools
│   │
│   ├── llm/
│   │   ├── glm-client.ts       # GLM-4.7 API client
│   │   └── types.ts
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── WelcomeBanner.tsx
│   │   │   ├── ConversationView.tsx
│   │   │   ├── InputArea.tsx
│   │   │   ├── ToolIndicator.tsx
│   │   │   └── StreamingText.tsx
│   │   └── theme/
│   │       └── crush-theme.ts
│   │
│   ├── branding/
│   │   └── company-branding.ts # CRUSH colors, logo
│   │
│   ├── prompts/
│   │   ├── system/
│   │   ├── tools/
│   │   ├── agents/
│   │   └── reminders/
│   │
│   └── utils/
│       ├── config.ts           # Config loader with Zod
│       ├── logger.ts           # Color-coded logging
│       └── errors.ts           # Custom error classes
│
├── tests/
│   ├── unit/                   # Unit tests (>80% coverage)
│   ├── integration/            # Integration tests
│   ├── fixtures/               # Test data
│   └── helpers/                # Test utilities
│
├── docs/
│   ├── API.md                  # API documentation
│   ├── TOOLS.md                # Tool reference (55 tools)
│   └── CONFIGURATION.md        # Configuration guide
│
├── prompts/                    # System prompts
│   ├── system/
│   ├── tools/
│   ├── agents/
│   └── reminders/
│
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── CHANGELOG.md
└── FLOYD.md                   # This file - SSOT
```

---

## 🔧 Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Project infrastructure with clean architecture

- [ ] Initialize package.json with exact versions
- [ ] Set up TypeScript strict mode
- [ ] Define all core types (src/types.ts)
- [ ] Create constants and branding (CRUSH theme)
- [ ] Implement error classes
- [ ] Implement logger
- [ ] Implement config loader with Zod validation

**Exit Criteria:**
- ✅ `npm install` works without errors
- ✅ `npx tsc --noEmit` passes
- ✅ No `any` types in codebase

### Phase 2: Tool Registry + Core Tools (Week 2)
**Goal:** Tool system with 10 core tools

- [ ] Implement ToolRegistry class
- [ ] Implement file operations (4 tools)
- [ ] Implement search tools (2 tools)
- [ ] Implement system tools (2 tools)
- [ ] Implement git tools (2 tools)
- [ ] Add unit tests (>80% coverage)
- [ ] Add integration tests

**Exit Criteria:**
- ✅ All 10 tools registered and functional
- ✅ All tests pass
- ✅ No TypeScript errors

### Phase 3: GLM-4.7 Client + Streaming (Week 3)
**Goal:** Robust LLM integration

- [ ] Implement GLMClient with streaming
- [ ] Add SSE parsing
- [ ] Add error handling and retry logic
- [ ] Implement StreamHandler
- [ ] Test with real GLM-4.7 API
- [ ] Test error scenarios

**Exit Criteria:**
- ✅ GLM-4.7 API calls work
- ✅ Streaming renders correctly
- ✅ Tool use events parsed correctly
- ✅ Unit tests >80% coverage

### Phase 4: Agentic Execution Engine (Week 4)
**Goal:** "Run until completion" loop

- [ ] Implement FloydAgentEngine
- [ ] Add turn limit checking
- [ ] Add completion detection
- [ ] Add conversation history management
- [ ] Integrate permission system
- [ ] Test multi-turn tasks

**Exit Criteria:**
- ✅ Completes multi-step tasks autonomously
- ✅ Turn limit prevents infinite loops
- ✅ 15-turn simulation passes

### Phase 5: UI Implementation with Ink (Week 5)
**Goal:** Production-grade CLI UI

- [ ] Implement main App component
- [ ] Implement all UI components
- [ ] Apply CRUSH theme colors
- [ ] Implement streaming text rendering
- [ ] Test component rendering

**Exit Criteria:**
- ✅ Ink app renders without errors
- ✅ Welcome banner displays ASCII logo
- ✅ Streaming updates smoothly
- ✅ CRUSH theme applied

### Phase 6: Advanced Tools (Weeks 6-7)
**Goal:** Implement remaining 45 tools

- [ ] Implement git operations (6 more)
- [ ] Implement browser operations (9)
- [ ] Implement cache operations (11)
- [ ] Implement patch operations (5)
- [ ] Implement special tools (7)
- [ ] Implement build/test tools (4)
- [ ] Test all tools

**Exit Criteria:**
- ✅ All 55 tools implemented
- ✅ All tools tested
- ✅ All tools documented

### Phase 7: SUPERCACHE (Week 8)
**Goal:** 3-tier caching system

- [ ] Implement SUPERCACHE class
- [ ] Add tier-based TTL
- [ ] Add expiry checking
- [ ] Integrate with tools
- [ ] Test cache effectiveness

**Exit Criteria:**
- ✅ Cache reduces API calls >20%
- ✅ Cache hit rate >30%
- ✅ All cache tests pass

### Phase 8: System Prompts + Agents (Week 9)
**Goal:** Adapt Claude Code prompts to Floyd

- [ ] Create prompt directory structure
- [ ] Adapt main system prompt
- [ ] Create all tool prompts (55)
- [ ] Adapt all agent prompts
- [ ] Test prompt loading

**Exit Criteria:**
- ✅ All prompts created
- ✅ All references to "Claude" replaced with "Floyd"
- ✅ GLM-4.7 guidelines added

### Phase 9: Testing & QA (Week 10)
**Goal:** Comprehensive testing

- [ ] Unit tests (>80% coverage)
- [ ] Integration tests (15 scenarios)
- [ ] Performance benchmarks
- [ ] Security tests
- [ ] 15-turn simulation (3x passes)

**Exit Criteria:**
- ✅ All tests pass
- ✅ Performance targets met
- ✅ Security tests pass
- ✅ Ready for human testing

### Phase 10: Documentation + Polish (Week 11)
**Goal:** Production-ready documentation

- [ ] Complete API.md
- [ ] Complete TOOLS.md
- [ ] Update README.md
- [ ] Create CHANGELOG.md
- [ ] Code quality checks

**Exit Criteria:**
- ✅ All documentation complete
- ✅ Code quality checks pass
- ✅ Package builds successfully

### Phase 11: Human Testing (Week 12)
**Goal:** Validate with real users

- [ ] Internal testing (all scenarios)
- [ ] Beta testing (5-10 users)
- [ ] Bug fixes
- [ ] Release decision

**Exit Criteria:**
- ✅ All critical bugs fixed
- ✅ All high bugs fixed
- ✅ Release criteria met
- ✅ Package published

---

## 🎨 CRUSH Theme - Branding Guidelines

### Color Palette

```typescript
const CRUSH_COLORS = {
  // Primary
  primary: '#6B50FF',      // Violet (Charple)
  secondary: '#FF60FF',    // Pink (Dolly)
  accent: '#68FFD6',       // Teal (Bok)
  highlight: '#E8FE96',    // Yellow (Zest)

  // Status
  success: '#12C78F',      // Green (Guac)
  error: '#EB4268',        // Red (Sriracha)
  warning: '#E8FE96',      // Yellow (Zest)
  muted: '#959AA2',        // Gray (Squid)

  // Background
  bgBase: '#201F26',       // Dark background (Pepper)
  bgElevated: '#2d2c35',   // Elevated elements (BBQ)
  bgOverlay: '#3A3943',    // Overlay backgrounds (Charcoal)
  bgModal: '#4D4C57',      // Modal backgrounds (Iron)

  // Text
  textPrimary: '#DFDBDD',  // Primary text (Ash)
  textSecondary: '#959AA2',// Secondary text (Squid)
  textSubtle: '#706F7B',   // Subtle text (Oyster)
  textInverse: '#FFFAF1',  // Inverse text (Butter)
};
```

### Semantic Colors

- Header titles: `#FF60FF` (Pink)
- User messages: `#12C78F` (Green)
- Assistant messages: `#00A4FF` (Blue)
- System messages: `#E8FE96` (Yellow)
- Tool calls: `#68FFD6` (Teal)
- Thinking state: `#E8FE96` (Yellow)
- Input prompt: `#12C78F` (Green)
- Hints: `#959AA2` (Gray)

### ASCII Logo

Located in `FLOYDASCII.txt` - Must be displayed on startup with primary color.

### Theme Philosophy

**C**harmUI - High-contrast aesthetics with personality
**R**ustic - Dark backgrounds for reduced eye strain
**U**ser-focused - Clear visual hierarchy with purposeful color usage
**S**peedy - Fast visual feedback with status colors
**H**ybrid - Works across different terminal capabilities

---

## 🛠️ Tool Implementation Guidelines

### Tool Template

Every tool must follow this pattern:

```typescript
// src/tools/[category]/[tool-name].ts
import { z } from 'zod';
import type { ToolDefinition } from '@/types';

// 1. Define input schema with Zod
const inputSchema = z.object({
  paramName: z.string().min(1),
  optionalParam: z.number().optional(),
});

// 2. Define output interface
interface ToolOutput {
  result: string;
  metadata?: Record<string, unknown>;
}

// 3. Create tool definition
export const toolNameTool: ToolDefinition = {
  name: 'tool_name',
  description: 'Clear description of what this tool does',
  category: 'file', // or 'search', 'build', etc.
  permission: 'none', // or 'moderate', 'dangerous'
  inputSchema,

  async execute(input: unknown): Promise<ToolResult<ToolOutput>> {
    // 4. Validate input (Zod does this automatically)
    const params = input as z.infer<typeof inputSchema>;

    try {
      // 5. Implement tool logic
      const result = await doSomething(params);

      // 6. Return success
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // 7. Return error
      return {
        success: false,
        error: {
          code: 'SPECIFIC_ERROR_CODE',
          message: 'Human-readable error message',
          details: error,
        },
      };
    }
  },
};
```

### Tool Categories

#### File Operations (4 tools)
- `read_file` - Read file contents
- `write` - Create/overwrite files
- `edit_file` - Search and replace
- `search_replace` - Global search/replace

#### Search (8 tools)
- `grep` - Regex search with ripgrep
- `codebase_search` - Semantic search
- `project_map` - Directory tree
- `list_symbols` - Extract code symbols
- `semantic_search` - Concept search
- `check_diagnostics` - Compiler checks
- `fetch_docs` - External docs
- `dependency_xray` - Package source

#### Build & Test (6 tools)
- `run` - Execute shell commands
- `detect_project` - Auto-detect project type
- `run_tests` - Run test suite
- `format` - Format code
- `lint` - Run linter
- `build` - Build project

#### Git (8 tools)
- `git_status` - Show repository status
- `git_diff` - Show changes
- `git_log` - Show commit history
- `git_commit` - Create commits
- `git_stage` - Stage files
- `git_unstage` - Unstage files
- `git_branch` - Manage branches
- `is_protected_branch` - Check protection

#### Browser (9 tools)
- `browser_navigate` - Navigate to URL
- `browser_read_page` - Get accessibility tree
- `browser_screenshot` - Capture screenshot
- `browser_click` - Click elements
- `browser_type` - Type text
- `browser_find` - Find elements
- `browser_get_tabs` - List tabs
- `browser_create_tab` - Open tab
- `browser_status` - Connection status

#### Cache (11 tools)
- `cache_store` - Store data
- `cache_retrieve` - Retrieve data
- `cache_delete` - Delete entry
- `cache_clear` - Clear tier
- `cache_list` - List entries
- `cache_search` - Search cache
- `cache_stats` - Cache statistics
- `cache_prune` - Remove expired
- `cache_store_pattern` - Save patterns
- `cache_store_reasoning` - Store CoT
- `cache_load_reasoning` - Load CoT
- `cache_archive_reasoning` - Archive to project

#### Patch (5 tools)
- `apply_unified_diff` - Apply patch
- `edit_range` - Edit line range
- `insert_at` - Insert at line
- `delete_range` - Delete range
- `assess_patch_risk` - Risk assessment

#### Special (7 tools)
- `manage_scratchpad` - Persistent memory
- `smart_replace` - Surgical editing
- `visual_verify` - Command preview
- `todo_sniper` - Find TODOs
- `check_diagnostics` - Compiler checks
- `project_map` - Directory structure
- `list_symbols` - Code symbols

### Permission Levels

- **none:** Read-only operations (25 tools)
- **moderate:** Non-destructive writes (15 tools)
- **dangerous:** Requires confirmation (15 tools)

**Dangerous tools:**
- `write`, `edit_file`, `search_replace`
- `run` (for certain commands)
- `git_commit`
- `cache_clear`, `cache_delete`
- All patch tools

---

## ⚠️ Critical Gotchas to Avoid

### 1. Ink UI Stability Issues

**Problem:** Original INK version had stability problems with streaming and state management.

**Solution:**
- Don't copy original code - build fresh
- Use functional components with hooks
- Clean up event listeners in useEffect cleanup
- Avoid deep object mutations
- Test streaming with long responses
- Test on multiple terminals (iTerm, Terminal.app, Linux)

### 2. Infinite Agentic Loops

**Problem:** Agent can loop infinitely if tool results don't provide progress.

**Solution:**
- Hard turn limit (20 turns max)
- Timeout per turn (5 minutes)
- Completion detection (stop when no tool use)
- User abort (Ctrl+C handling)
- Monitor token usage
- Debug logging for each turn

### 3. Memory Leaks

**Problem:** Long-running sessions can leak memory.

**Solution:**
- Clear buffers after use
- Remove event listeners
- Clean up timers
- Profile with heap snapshots
- Test with 100+ turn sessions
- Monitor process.memoryUsage()

### 4. Tool Execution Failures

**Problem:** Tools can fail silently or hang.

**Solution:**
- Always wrap tool execution in try/catch
- Add timeout protection (120s default)
- Validate inputs with Zod before execution
- Return structured errors
- Log all tool executions
- Test error recovery

### 5. GLM-4.7 API Issues

**Problem:** API can be slow, return errors, or timeout.

**Solution:**
- Implement retry logic (max 3 retries)
- Add exponential backoff
- Handle 429 (rate limit) gracefully
- Parse SSE stream carefully
- Test with slow networks
- Add timeout (30s default)

### 6. Cache Corruption

**Problem:** Cache can become corrupted or stale.

**Solution:**
- Validate cache entries with Zod
- Check expiry on read
- Prune expired entries periodically
- Backup before destructive operations
- Rebuild cache on corruption
- Separate cache per tier

### 7. Permission System Bypass

**Problem:** Dangerous tools could execute without confirmation.

**Solution:**
- Check permission at multiple levels
- Require explicit confirmation
- Log all dangerous operations
- Audit trail for security
- Test permission flow
- Add auto-confirm for testing only

---

## 📊 Quality Gates

### Per Phase
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Code review completed
- [ ] Documentation updated

### Before Human Testing
- [ ] Unit test coverage >80%
- [ ] All 55 tools tested
- [ ] 15-turn simulation passes 3x
- [ ] Performance targets met
- [ ] Security tests pass
- [ ] Documentation complete
- [ ] No critical bugs

### Before Release
- [ ] All test scenarios pass
- [ ] All critical bugs fixed
- [ ] All high bugs fixed
- [ ] Release notes written
- [ ] Changelog updated
- [ ] Version tagged
- [ ] Package published to npm

---

## 🚀 Performance Targets

### Startup
- Target: <1 second
- Measurement: Time from `floyd` command to first render

### First Token
- Target: <500ms
- Measurement: Time from user input to first token displayed

### Tool Execution
- Target: <2s for fast tools (read, grep, etc.)
- Measurement: Time from tool call to result

### Memory Usage
- Target: <500MB
- Measurement: Peak memory during 15-turn session

### Cache Effectiveness
- Hit rate: >30%
- API reduction: >20%
- Measurement: Cache hits / total requests

---

## 🔒 Security Considerations

### Path Traversal Prevention
- Validate all file paths
- Resolve to absolute paths
- Check path is within project root
- Reject paths with `../`

### Command Injection Prevention
- Never pass user input directly to shell
- Use execa with array arguments
- Validate all command parameters
- Escape special characters

### Dangerous Command Blocking
- Block commands like `rm -rf /`, `format c:`
- Require confirmation for git push
- Require confirmation for npm install
- Block network access in some tools

### API Key Protection
- Never log API keys
- Never include in error messages
- Use environment variables
- Validate key format

### Cache Poisoning Prevention
- Validate cache entries with Zod
- Check file size limits
- Sanitize cache keys
- Encrypt sensitive data

---

## 🧪 Testing Strategy

### Unit Tests
- Framework: AVA
- Coverage target: >80%
- Test all tools individually
- Mock external dependencies (GLM API, file system)
- Test error paths

### Integration Tests
- Test multi-tool workflows
- Test agentic loop
- Test permission system
- Test cache integration
- Use test fixtures and data

### End-to-End Tests
- 15-turn simulation (must pass 3x consecutively)
- Real-world scenarios
- Test with actual projects
- Test with large codebases (1000+ files)

### Performance Tests
- Benchmark startup time
- Benchmark token latency
- Benchmark tool execution
- Profile memory usage
- Test cache effectiveness

### Security Tests
- Test path traversal prevention
- Test command injection prevention
- Test dangerous command blocking
- Test permission system
- Test cache poisoning prevention

---

## 📚 Reference Materials

### Internal Documentation
- `PROJECT_OUTLINE.md` - Complete project specification
- `floyddstools.md` - Tool specifications
- `FLOYD_ADAPTATION_GUIDE.md` - Prompt adaptation guide
- `docs/TOOLS.md` - Unified tool documentation
- `docs/TOOLS_VALIDATION.md` - Tool validation report

### External Documentation
- Ink docs: https://github.com/vadimdemedes/ink
- GLM-4.7 API: https://api.z.ai/docs
- Zod docs: https://zod.dev
- Ava docs: https://avajs.dev

### Existing Codebase
- Floyd CLI: `/Volumes/Storage/FLOYD_CLI/INK/floyd-cli/`
- Floyd Tool Inventory: `/Volumes/Storage/FLOYD_CLI/docs/FLOYD_TOOL_INVENTORY.md`

---

## 🎯 Success Metrics

### Functional
- ✅ 55 tools implemented and tested
- ✅ Agentic execution works
- ✅ GLM-4.7 streaming works
- ✅ SUPERCACHE reduces costs
- ✅ Permission system works
- ✅ UI renders correctly

### Quality
- ✅ Unit test coverage >80%
- ✅ Integration tests pass
- ✅ Security tests pass
- ✅ Performance targets met
- ✅ No critical bugs
- ✅ <5 medium bugs

### User Experience
- ✅ Startup <1s
- ✅ First token <500ms
- ✅ Tool execution <2s
- ✅ Memory <500MB
- ✅ Clear error messages
- ✅ Helpful prompts

### Cost
- ✅ Cache hit rate >30%
- ✅ API reduction >20%
- ✅ Competitive with Claude Code

---

## 🐛 Troubleshooting

### Build Errors
- **TypeScript errors:** Check for `any` types, add proper typing
- **Import errors:** Verify path aliases in tsconfig.json
- **Dependency errors:** Run `npm ci` to reinstall

### Runtime Errors
- **Tool not found:** Check tool registration in `src/tools/index.ts`
- **Permission denied:** Check tool permission level
- **API errors:** Verify GLM-4.7 API key in environment
- **Cache errors:** Clear `.floyd/cache` and retry

### Test Failures
- **Unit tests:** Check mocks, verify fixtures
- **Integration tests:** Check tool execution order
- **15-turn simulation:** Check completion detection logic
- **Performance tests:** Check for blocking operations

### UI Issues
- **Streaming not working:** Check StreamHandler event emission
- **Colors wrong:** Verify CRUSH theme constants
- **Layout broken:** Check Ink component structure
- **Memory growing:** Check for event listener leaks

---

## 📝 Decision Log

### Why GLM-4.7 Instead of Claude?
**Decision:** Use GLM-4.7 API (api.z.ai)
**Rationale:** ~10x cost savings, Anthropic-compatible endpoint
**Trade-off:** Different streaming patterns, less mature SDK

### Why Ink Instead of Alternatives?
**Decision:** Use Ink (React for CLI)
**Rationale:** React paradigm, component reusability, rich ecosystem
**Trade-off:** Complexity, need careful state management

### Why File-Based Cache Instead of Redis?
**Decision:** Use file-based JSON cache
**Rationale:** Zero dependencies, simple, portable
**Trade-off:** Slower than in-memory, single-machine only

### Why Zod for Validation?
**Decision:** Use Zod for all input validation
**Rationale:** Type-safe, runtime validation, good error messages
**Trade-off:** Learning curve, schema maintenance

### Why 3-Tier Cache?
**Decision:** reasoning (5min), project (24h), vault (7d)
**Rationale:** Match data lifecycle to usage patterns
**Trade-off:** Complexity, expiry management

---

## 🔄 Iteration Process

1. **Implement Phase**
   - Follow implementation order
   - Write tests first (TDD)
   - Document as you go

2. **Test Phase**
   - Run all unit tests
   - Run all integration tests
   - Fix all failures
   - Verify coverage

3. **Review Phase**
   - Code review (self or peer)
   - Documentation review
   - Performance check
   - Security check

4. **Validate Phase**
   - Run quality gates
   - Measure against targets
   - Document metrics
   - Decide: proceed or fix

5. **Next Phase**
   - Only proceed when current phase is complete
   - No shortcuts, no skipping
   - Quality over speed

---

## 📞 Support and Resources

### Getting Help
- Review this FLOYD.md first
- Check documentation in `docs/`
- Review error messages carefully
- Check git history for decisions

### Common Patterns
```typescript
// Logging
import { logger } from '@/utils/logger';
logger.info('Message');
logger.error('Error', error);

// Error handling
import { ToolExecutionError } from '@/utils/errors';
throw new ToolExecutionError(toolName, message, details);

// Type safety
import type { ToolResult } from '@/types';
const result: ToolResult<MyData> = { success: true, data };

// Zod validation
import { z } from 'zod';
const schema = z.object({ name: z.string() });
const validated = schema.parse(input);
```

---

## ✅ Pre-Flight Checklist

Before starting any phase:
- [ ] Current phase is complete
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Git committed (if needed)
- [ ] Environment ready (dependencies installed)
- [ ] API key available
- [ ] Sufficient time allocated

---

**Document Status:** ✅ Ready for Implementation
**Next Step:** Begin Phase 0 - Pre-Implementation
