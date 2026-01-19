---
name: Floyd P0 Bug Resolution
overview: Systematic resolution of all 77 identified bugs across the Floyd ecosystem with mandatory verification gates. Revised after simulation to fix dependency ordering, add parallelization, and include rollback points.
todos:
  - id: phase-0-api-verify
    content: "Phase 0: Verify API endpoint behavior and document findings"
    status: pending
  - id: phase-1a-quick-wins
    content: "Phase 1A: Quick critical fixes with no dependencies (#63, #69, #73)"
    status: pending
  - id: phase-1b-llmclient
    content: "Phase 1B: LLMClient abstraction + StreamChunk type (#1, #7, #8, #17)"
    status: pending
  - id: phase-1c-dependent
    content: "Phase 1C: Dependent critical fixes (#4, #65) - REQUIRES 1B complete"
    status: pending
  - id: phase-1d-abort
    content: "Phase 1D: Abort/Cancel mechanism (#64) - spans 4 files across 2 packages"
    status: pending
  - id: phase-2-config
    content: "Phase 2: Configuration defaults (#2, #3, #5, #6)"
    status: pending
  - id: phase-3-errors
    content: "Phase 3: Error handling - PARALLELIZABLE by component"
    status: pending
  - id: phase-4-journey
    content: "Phase 4: User journey (#36, #37, #52, #56, #57)"
    status: pending
  - id: phase-5-resources
    content: "Phase 5: Resource management (#68, #70)"
    status: pending
  - id: phase-6-polish
    content: "Phase 6: Remaining polish bugs"
    status: pending
  - id: final-integration
    content: "Final: Integration test all 4 components"
    status: pending
---

# Floyd P0 Bug Resolution - Implementation Plan v2.0

**Version:** 2.0 (Post-Simulation Revision)

**Total Bugs:** 77

**Estimated Duration:** Multi-session effort

---

## Critical Rules

1. **BUILD ORDER IS SACRED:** floyd-agent-core MUST build before Desktop/CLI/Chrome
2. **NO SKIP ALLOWED:** Every bug requires verification receipt before marking complete
3. **GIT CHECKPOINT:** Commit after each sub-phase for rollback capability
4. **STOP ON FAILURE:** If any build fails, STOP and fix before proceeding

---

## Dependency Graph

```
                          ┌─────────────────────────────────────────┐
                          │       INDEPENDENT (DO FIRST)            │
                          │  #63 JSON.parse  #69 Session  #73 Proj  │
                          └─────────────────────────────────────────┘
                                            │
                                            ▼
                          ┌─────────────────────────────────────────┐
                          │            LLMClient (#1)               │
                          │                  │                      │
                          │    ┌─────────────┴─────────────┐        │
                          │    ▼                           ▼        │
                          │ StreamChunk (#8)        Constants (#7)  │
                          │    │                           │        │
                          │    ▼                           ▼        │
                          │ Tool Mapping (#4)    Config Defaults    │
                          │                      (#2, #3, #5, #6)   │
                          └─────────────────────────────────────────┘
                                            │
                          ┌─────────────────┴─────────────────┐
                          │                                   │
                          ▼                                   ▼
                   History Trim (#65)                  Abort (#64)
                   (needs LLMClient)                (needs LLMClient)
```

---

## Build Commands Reference

```bash
# MUST execute in this order:
1. cd /Volumes/Storage/FLOYD_CLI/packages/floyd-agent-core && npm run build
2. cd /Volumes/Storage/FLOYD_CLI/FloydDesktop && npm run build
3. cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli && npm run build
4. cd /Volumes/Storage/FLOYD_CLI/FloydChromeBuild/floydchrome && npm run build

# Full rebuild shortcut:
cd /Volumes/Storage/FLOYD_CLI && \
  (cd packages/floyd-agent-core && npm run build) && \
  (cd FloydDesktop && npm run build) && \
  (cd INK/floyd-cli && npm run build) && \
  (cd FloydChromeBuild/floydchrome && npm run build)
```

---

## Phase 0: API Endpoint Verification

**Purpose:** Determine correct API integration before LLMClient work

**Gate:** At least one endpoint must return 200

### Step 0.1: Check API Key

```bash
cd /Volumes/Storage/FLOYD_CLI
# Check environment
echo "GLM_API_KEY set: $([ -n "$GLM_API_KEY" ] && echo YES || echo NO)"

# Check .env files
grep -l "GLM_API_KEY\|ANTHROPIC" INK/floyd-cli/.env FloydDesktop/.env 2>/dev/null
```

**If No Key Found:** STOP - cannot proceed without valid API credentials

### Step 0.2: Test Anthropic-format Endpoint

```bash
curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-opus-4","max_tokens":50,"messages":[{"role":"user","content":"Say hi"}]}' \
  > /tmp/test_anthropic.txt 2>&1

cat /tmp/test_anthropic.txt
```

### Step 0.3: Test OpenAI-format Endpoint

```bash
curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST https://api.z.ai/api/paas/v4/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GLM_API_KEY" \
  -d '{"model":"glm-4.7","max_tokens":50,"messages":[{"role":"user","content":"Say hi"}]}' \
  > /tmp/test_openai.txt 2>&1

cat /tmp/test_openai.txt
```

### Step 0.4: Document Findings

Create `.floyd/API_ENDPOINT_VERIFICATION.md` with results.

**Verification Receipt:**

- [ ] API key confirmed available
- [ ] At least one endpoint returns 200
- [ ] Response format documented
- [ ] `.floyd/API_ENDPOINT_VERIFICATION.md` created
- [ ] Decision made: use [Anthropic SDK / OpenAI SDK / both]

**Git Checkpoint:**

```bash
git add .floyd/API_ENDPOINT_VERIFICATION.md
git commit -m "Phase 0: API endpoint verification complete"
```

---

## Phase 1A: Quick Critical Fixes (No Dependencies)

**Why First:** These 3 bugs affect reliability. Fixing them makes testing other fixes reliable.

**Time Estimate:** 1 hour

### Bug #63: JSON.parse Crash Risk

**Location:** `packages/floyd-agent-core/src/agent/AgentEngine.ts:241`

**Pre-Fix Verification:**

```bash
grep -n "JSON.parse(currentBlock.input" packages/floyd-agent-core/src/agent/AgentEngine.ts
# EXPECT: Line ~241 with unguarded JSON.parse
```

**Implementation:**

Replace the JSON.parse line with try-catch:

```typescript
let parsedInput: Record<string, unknown> = {};
try {
  parsedInput = JSON.parse(currentBlock.input || '{}');
} catch (parseError) {
  console.warn('[AgentEngine] Malformed JSON in tool input:', parseError);
  parsedInput = { _parseError: true, _raw: currentBlock.input };
}

const toolCall: ToolCall = {
  id: currentBlock.id,
  name: currentBlock.name,
  input: parsedInput,
  status: 'pending',
};
```

**Build Test:**

```bash
cd packages/floyd-agent-core && npm run build
echo "BUILD EXIT CODE: $?"
# MUST be 0
```

**Individual Test:**

```bash
node -e "
try {
  JSON.parse('{invalid');
} catch(e) {
  console.log('PASS: Exception caught as expected');
}
"
```

**Verification Receipt #63:**

- [ ] Pre-fix grep shows unguarded JSON.parse
- [ ] Code now has try-catch
- [ ] Build exit code 0
- [ ] No TypeScript errors

---

### Bug #69: SessionManager Race Condition

**Location:** `packages/floyd-agent-core/src/store/conversation-store.ts:33-34`

**Pre-Fix Verification:**

```bash
grep -A3 "constructor(options" packages/floyd-agent-core/src/store/conversation-store.ts
# EXPECT: this.ensureDir() without await
```

**Implementation:**

Add initialization promise pattern:

```typescript
private initialized = false;
private initPromise: Promise<void>;

constructor(options: SessionManagerOptions = {}) {
  this.sessionsDir = options.sessionsDir || path.join(process.cwd(), '.floyd', 'sessions');
  this.initPromise = this.doInit();
}

private async doInit(): Promise<void> {
  await this.ensureDir();
  this.initialized = true;
}

private async waitForInit(): Promise<void> {
  if (!this.initialized) await this.initPromise;
}

// Then add `await this.waitForInit();` as first line of:
// - createSession()
// - loadSession()
// - listSessions()
// - saveSession()
// - deleteSession()
```

**Build Test:**

```bash
cd packages/floyd-agent-core && npm run build
echo "BUILD EXIT CODE: $?"
```

**Verification Receipt #69:**

- [ ] Constructor no longer calls ensureDir() directly
- [ ] initPromise pattern implemented
- [ ] All public methods call waitForInit()
- [ ] Build passes

---

### Bug #73: ProjectManager Race Condition

**Location:** `FloydDesktop/electron/project-manager.ts:38-44`

**Pre-Fix Verification:**

```bash
grep -A5 "constructor()" FloydDesktop/electron/project-manager.ts
# EXPECT: loadProjects().catch() without await
```

**Implementation:** Same initPromise pattern as #69

**Build Test:**

```bash
cd FloydDesktop && npm run build
echo "BUILD EXIT CODE: $?"
```

**Verification Receipt #73:**

- [ ] initPromise pattern implemented
- [ ] Build passes

---

### Phase 1A Gate Check

```bash
# Verify all builds pass
cd /Volumes/Storage/FLOYD_CLI
(cd packages/floyd-agent-core && npm run build) && echo "✓ Core OK" || echo "✗ Core FAILED"
(cd FloydDesktop && npm run build) && echo "✓ Desktop OK" || echo "✗ Desktop FAILED"
```

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 1A: Quick critical fixes (#63, #69, #73)"
```

---

## Phase 1B: LLMClient Abstraction

**Purpose:** Fix the core API format mismatch issue

**Bugs Addressed:** #1, #7, #8, #17

**Time Estimate:** 2-3 hours

### Step 1B.1: Create Constants File

**File:** `packages/floyd-agent-core/src/constants.ts` (NEW)

```typescript
export type Provider = 'glm' | 'anthropic' | 'openai' | 'deepseek';

export const DEFAULT_GLM_CONFIG = {
  baseURL: 'https://api.z.ai/api/paas/v4/chat/completions',
  model: 'glm-4.7',
  maxTokens: 8192,
} as const;

export const DEFAULT_ANTHROPIC_CONFIG = {
  baseURL: 'https://api.anthropic.com',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 8192,
} as const;

export const PROVIDER_DEFAULTS: Record<Provider, { baseURL: string; model: string; maxTokens: number }> = {
  glm: DEFAULT_GLM_CONFIG,
  anthropic: DEFAULT_ANTHROPIC_CONFIG,
  openai: { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o', maxTokens: 8192 },
  deepseek: { baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat', maxTokens: 8192 },
};
```

### Step 1B.2: Create LLM Types

**File:** `packages/floyd-agent-core/src/llm/types.ts` (NEW)

```typescript
export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

export interface StreamChunk {
  type: 'text' | 'tool_start' | 'tool_input' | 'tool_end' | 'done' | 'error';
  text?: string;
  tool_call_id?: string;  // Bug #8: This was missing!
  tool_name?: string;
  tool_input?: string;
  error?: string;
}

export interface LLMClientOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
}

export interface LLMClient {
  stream(messages: LLMMessage[], tools?: LLMTool[], signal?: AbortSignal): AsyncGenerator<StreamChunk>;
  complete(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMMessage>;
}

export interface LLMTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
```

### Step 1B.3: Create OpenAI Client

**File:** `packages/floyd-agent-core/src/llm/openai-client.ts` (NEW)

Implements LLMClient using OpenAI SDK format (for GLM, DeepSeek, OpenAI).

### Step 1B.4: Create Anthropic Client

**File:** `packages/floyd-agent-core/src/llm/anthropic-client.ts` (NEW)

Implements LLMClient using Anthropic SDK.

### Step 1B.5: Create Factory

**File:** `packages/floyd-agent-core/src/llm/factory.ts` (NEW)

```typescript
import { Provider, PROVIDER_DEFAULTS } from '../constants.js';
import { LLMClient, LLMClientOptions } from './types.js';
import { OpenAIClient } from './openai-client.js';
import { AnthropicClient } from './anthropic-client.js';

export function createLLMClient(provider: Provider, options: LLMClientOptions): LLMClient {
  const defaults = PROVIDER_DEFAULTS[provider];
  const config = {
    ...defaults,
    ...options,
  };

  switch (provider) {
    case 'anthropic':
      return new AnthropicClient(config);
    case 'glm':
    case 'openai':
    case 'deepseek':
      return new OpenAIClient(config);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
```

### Step 1B.6: Update AgentEngine

Modify `AgentEngine.ts` to use `createLLMClient()` instead of direct Anthropic SDK.

### Step 1B.7: Update package.json

Add `openai` dependency to `packages/floyd-agent-core/package.json`:

```json
"dependencies": {
  "openai": "^4.0.0",
  // ... existing deps
}
```

**Build Test:**

```bash
cd packages/floyd-agent-core
npm install
npm run build
echo "BUILD EXIT CODE: $?"
```

**Verification Receipt Phase 1B:**

- [ ] constants.ts created with PROVIDER_DEFAULTS
- [ ] llm/types.ts created with StreamChunk including tool_call_id
- [ ] llm/openai-client.ts created
- [ ] llm/anthropic-client.ts created
- [ ] llm/factory.ts created
- [ ] AgentEngine.ts uses createLLMClient
- [ ] package.json has openai dependency
- [ ] Build passes
- [ ] Export index.ts updated

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 1B: LLMClient abstraction (#1, #7, #8, #17)"
```

---

## Phase 1C: Dependent Critical Fixes

**Requires:** Phase 1B complete (LLMClient must exist)

### Bug #4: Tool Output Mapping

**Location:** `FloydDesktop/src/hooks/useAgentStream.ts:93-98`

**Pre-Fix Verification:**

```bash
grep -n "activeToolCalls\[0\]" FloydDesktop/src/hooks/useAgentStream.ts
# EXPECT: Line ~94 showing always using first tool
```

**Implementation:**

Use `tool_call_id` from StreamChunk (now available from Phase 1B):

```typescript
// Handle tool completion - use tool_call_id for matching
if (chunk.tool_use_complete && chunk.tool_call_id) {
  setActiveToolCalls((prev) =>
    prev.map((t) =>
      t.id === chunk.tool_call_id  // Use actual ID, not [0]
        ? { ...t, output: chunk.output || t.output }
        : t
    )
  );
}
```

**Verification Receipt #4:**

- [ ] No longer uses activeToolCalls[0]
- [ ] Uses chunk.tool_call_id for matching
- [ ] Build passes

---

### Bug #65: Unbounded History

**Location:** `packages/floyd-agent-core/src/agent/AgentEngine.ts`

**Implementation:**

Add history trimming before sending to API:

```typescript
private estimateTokens(messages: Message[]): number {
  return messages.reduce((acc, m) => {
    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
    return acc + Math.ceil(content.length / 4);  // Rough: 4 chars ≈ 1 token
  }, 0);
}

private trimHistory(maxTokens: number = 120000): void {
  const systemMsg = this.history.find(m => m.role === 'system');
  while (this.estimateTokens(this.history) > maxTokens && this.history.length > 3) {
    // Remove oldest non-system messages
    const idx = this.history.findIndex(m => m.role !== 'system');
    if (idx >= 0) this.history.splice(idx, 1);
  }
}

// Call in sendMessage before API call:
async *sendMessage(content: string, callbacks?: AgentCallbacks) {
  this.history.push({ role: 'user', content });
  this.trimHistory();  // ADD THIS
  // ... rest
}
```

**Verification Receipt #65:**

- [ ] trimHistory() method added
- [ ] Called before API request
- [ ] Build passes

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 1C: Dependent fixes (#4, #65)"
```

---

## Phase 1D: Abort/Cancel Mechanism

**Bug #64**

**Files:** 4 files across 2 packages

### Step 1: Update types

`packages/floyd-agent-core/src/agent/types.ts`:

```typescript
export interface AgentCallbacks {
  onChunk?: (chunk: string) => void;
  onToolStart?: (toolCall: ToolCall) => void;
  onToolComplete?: (toolCall: ToolCall) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;  // NEW
}
```

### Step 2: Update AgentEngine

Check signal in streaming loop:

```typescript
async *sendMessage(content: string, callbacks?: AgentCallbacks) {
  // ... setup
  while (!currentTurnDone && turns < this.maxTurns) {
    if (callbacks?.signal?.aborted) {
      yield '\n[Cancelled]\n';
      callbacks?.onDone?.();
      return;
    }
    // ... rest of loop
  }
}
```

### Step 3: Update useAgentStream.ts

Add AbortController:

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const sendMessage = useCallback(async (content: string) => {
  abortControllerRef.current = new AbortController();
  // Pass signal to API
  await window.floydAPI.sendStreamedMessage(content, abortControllerRef.current.signal);
}, []);

const cancelMessage = useCallback(() => {
  abortControllerRef.current?.abort();
}, []);

return { ..., cancelMessage };
```

### Step 4: Add Cancel Button

`FloydDesktop/src/components/InputBar.tsx`:

```typescript
{isLoading && (
  <button onClick={onCancel} className="...">
    Cancel
  </button>
)}
```

**Verification Receipt #64:**

- [ ] AgentCallbacks has signal property
- [ ] AgentEngine checks signal.aborted
- [ ] useAgentStream has AbortController
- [ ] Cancel button visible during loading
- [ ] Clicking cancel stops response

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 1D: Abort mechanism (#64)"
```

---

## Phase 2: Configuration Defaults

**Bugs:** #2, #3, #5, #6

Import and use `PROVIDER_DEFAULTS` from floyd-agent-core in:

- `FloydDesktop/src/components/SettingsModal.tsx`
- `FloydDesktop/electron/ipc/agent-ipc.ts`
- `INK/floyd-cli/src/app.tsx`

**Verification:**

```bash
# Should find NO hardcoded endpoints outside constants.ts
grep -r "api.z.ai" --include="*.ts" --include="*.tsx" \
  packages/floyd-agent-core/src FloydDesktop/src INK/floyd-cli/src \
  | grep -v constants.ts | grep -v node_modules
# EXPECT: No results
```

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 2: Unified configuration defaults (#2, #3, #5, #6)"
```

---

## Phase 3: Error Handling (PARALLELIZABLE)

These can be done simultaneously by different agents/sessions:

### Track A: Floyd Desktop

- Bug #66: Retry duplicate chunks (agent-ipc.ts)
- Bug #67: Stale closure (useAgentStream.ts)

### Track B: Floyd CLI

- Bug #72: Streaming cleanup (app.tsx)

### Track C: floyd-agent-core

- Bug #38, #40, #47, #51, #53: Error humanization
- Create `src/utils/error-humanizer.ts`

**Verification:** Each track can build and test independently.

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 3: Error handling (#38, #40, #47, #51, #53, #66, #67, #72)"
```

---

## Phase 4: User Journey

- Bug #36, #37, #52: First-run experience (setup wizard)
- Bug #56, #57: Empty states

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 4: User journey improvements"
```

---

## Phase 5: Resource Management

- Bug #68: WebSocket memory leak cleanup
- Bug #70: Session limit enforcement

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 5: Resource management"
```

---

## Phase 6: Polish

All remaining bugs from #71-#77 and any others.

**Git Checkpoint:**

```bash
git add -A
git commit -m "Phase 6: Polish and remaining fixes"
```

---

## Final Integration Test

### All-Component Smoke Test

```bash
# 1. Build everything
cd /Volumes/Storage/FLOYD_CLI
(cd packages/floyd-agent-core && npm run build) && \
(cd FloydDesktop && npm run build) && \
(cd INK/floyd-cli && npm run build) && \
(cd FloydChromeBuild/floydchrome && npm run build)

# 2. Start Desktop
cd FloydDesktop && npm run start &

# 3. Test CLI
cd INK/floyd-cli && npm run dev

# 4. Load Chrome extension and test
```

### Test Checklist

- [ ] FloydDesktop starts without error
- [ ] Can send message and receive response
- [ ] Tool calls work (multiple in sequence)
- [ ] Cancel button stops streaming
- [ ] Long conversation doesn't crash (history trimming)
- [ ] Settings save and load correctly
- [ ] Floyd CLI starts and responds
- [ ] Chrome extension connects to Desktop

---

## Verification Receipt Template

For each bug, agent MUST produce:

```markdown
## Bug #XX: [Title]

### Pre-Fix Evidence
Command: `[exact command]`
Output:
```

[paste actual output]

```

### Implementation
Files changed:
- `path/to/file.ts` - [description of change]

### Build Verification
```

[paste npm run build output, including exit code]

```

### Test Result
Test: [description]
Output:
```

[paste test output]

```
Result: PASS / FAIL

### Smoke Test
Action: [what manual test was done]
Result: [observation]

### Checklist
- [ ] Bug confirmed fixed
- [ ] Build passes
- [ ] No regressions observed
- [ ] Ready for next bug
```

---

## Rollback Procedure

If a phase breaks something:

```bash
# Find last working commit
git log --oneline -10

# Reset to that commit
git reset --hard <commit-hash>

# Rebuild everything
cd packages/floyd-agent-core && npm run build
cd FloydDesktop && npm run build
# etc.
```

---

## Summary

| Phase | Bugs | Est. Time | Parallelizable |

|-------|------|-----------|----------------|

| 0 | - | 30 min | No |

| 1A | #63, #69, #73 | 1 hr | No |

| 1B | #1, #7, #8, #17 | 3 hr | No |

| 1C | #4, #65 | 1 hr | No |

| 1D | #64 | 1 hr | No |

| 2 | #2, #3, #5, #6 | 1 hr | No |

| 3 | #38,40,47,51,53,66,67,72 | 2 hr | YES (3 tracks) |

| 4 | #36, #37, #52, #56, #57 | 2 hr | Partial |

| 5 | #68, #70 | 1 hr | Yes |

| 6 | #71-#77, etc. | 2 hr | Yes |

| Final | - | 1 hr | No |

**Total Estimated:** 15-18 hours across multiple sessions

## VERIFICATION PROTOCOL (NON-NEGOTIABLE)

**A verification receipt is NOT a claim. It is PROOF.**

### What Counts as Proof

For EACH bug fix, you MUST paste:
1. The ACTUAL command you ran (copy-paste from terminal)
2. The ACTUAL output (copy-paste, NOT summarized, MINIMUM 5 lines)
3. If tests exist: full test output showing pass/fail
4. If no tests: manual verification with observable output

### Required Format

BUG #XX VERIFICATION:
---------------------
Command: [exact command you ran]
Output:
[paste actual terminal output here - MINIMUM 5 lines]

Result: PASS/FAIL

### FORBIDDEN

- Summarizing output as "no errors"
- Claiming "tests passed" without showing output
- Claiming "build succeeded" without pasting build output
- Tables that hide whether verification actually happened
- Producing completion summaries without inline proof

### Enforcement

ASSUME you will be challenged: "Prove it."

If you cannot paste the actual terminal output, you did not verify.
If you did not verify, you are not done.
If you claim completion without proof, you will be cast out.

BEFORE producing ANY completion summary:
1. Count your verification receipts
2. Each receipt MUST have actual terminal output pasted inline
3. If ANY receipt is missing output - you are NOT done

