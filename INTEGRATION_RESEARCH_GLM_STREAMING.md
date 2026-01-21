# Floyd CLI - GLM Streaming Integration Research & Planning

**Date:** 2026-01-21
**Document Type:** Research & Planning (NO IMPLEMENTATION)

---

## Executive Summary

Research objective: Evaluate GLM-4.7 model's streaming capabilities for potential integration into Floyd CLI to replace or augment current Anthropic SDK implementation.

**Key Finding:** GLM's `streaming` format differs fundamentally from Anthropic's approach. GLM uses **server-sent events (SSE)** with incremental deltas, not a single SSE stream.

---

## Current Floyd Architecture

### Streaming Layer (`src/streaming/stream-engine.ts`)
```typescript
export interface StreamChunk {
  text: string;
  timestamp: number;
  type: 'text' | 'tool_start' | 'tool_delta' | 'tool_end' | 'error';
  sequence: number;
}

export class StreamProcessor extends EventEmitter {
  private buffer: string[] = [];
  private bufferSize = 0;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private config: Required<StreamProcessorConfig>;
  
  processChunk(chunk: Partial<StreamChunk>): StreamChunk { /* ... */ }
  flush(): void { /* Synchronous flush */ }
}
```

**Characteristics:**
- **Blocking:** Flush method is synchronous (no `await`)
- **Rate Limiting:** Disabled by default (`rateLimitEnabled: false`)
- **Flush Interval:** Fixed at 50ms, now adaptive based on content velocity
- **Architecture:** Single EventEmitter, client subscribes to events
- **Token Tracking:** Sequence numbers for ordering

### Configuration System (`src/config/ApiSettings.tsx`)
```typescript
// Current state
- Writes to .env.local
- Stores: GLM_API_KEY, GLM_ENDPOINT, GLM_MODEL (NEW)
- Existing: apiEndpoint, apiModel, maxTokensPerSecond

// Configuration interface
interface ApiConfig {
  endpoint: string;
  model: string;
  maxTokensPerSecond: number;
}
```

**Current Model Mapping:**
- Anthropic models: `claude-sonnet-4-20250514`, `claude-3-5-sonnet-20240207`, etc.
- GLM models: `glm-4.7`, `glm-4.6`, `glm-4.5`, `glm-4-flash`, `glm-4.6v`, etc.

### MCP Server (`src/mcp/explorer-server.ts`)
- Uses Model Context Protocol SDK
- Handles tool calls (14 built-in tools)
- Safety sandbox: `spawn_shadow_workspace`

---

## GLM Streaming Format

### Request Format
```json
{
  "model": "glm-4.7",
  "messages": [{"role": "user", "content": "..."}],
  "stream": true,
  "tool_stream": true
}
```

### Response Format (Server-Sent Events - SSE)

**Delta Structure:**
```
data: {
  "id": "1",
  "choices": [{
    "index": 0,
    "delta": {
      "content": "Hello",           // Final assistant message
      "role": "assistant"
    }
  }]
}
```

**GLM Streaming Format (Z.ai API):**
```json
{
  "id": "1",
  "choices": [{
    "index": 0,
    "delta": {
      "reasoning_content": "I need to...",  // Reasoning stream
      "content": "Hello"              // Response content stream
    }
  }, {
    "index": 1,
    "delta": {
      "content": "world"
    }
  }],
  "tool_calls": [...]                    // Tool calls in separate array
}
```

### Key Differences

| Aspect | Anthropic | GLM |
|--------|---------|-------|
| **Stream Type** | Single SSE stream | Server-sent events |
| **Reasoning Display** | Mixed in content | Separate `reasoning_content` |
| **Tool Calls** | Block with `tool_use` | Separate `tool_calls` array |
| **Delta Type** | `choices[0].delta.content` | `delta.reasoning_content`, `delta.content`, `delta.tool_calls` |
| **Progress Indication** | None obvious | Available via `usage` field |
| **Error Handling** | Single `error` in delta | Separate `finish_reason` |

---

## Integration Strategy Options

### Option 1: Hybrid Approach (Recommended)
**Approach:** Add GLM as an **additional provider**, not replacement

**Architecture:**
```
src/providers/
  ├── AnthropicStreamProvider.ts     // Existing
  ├── GLMStreamProvider.ts        // NEW: GLM SDK integration
  └── StreamProviderInterface.ts     // Abstraction layer
```

**Implementation:**
- Keep Anthropic as default
- Add GLM provider selector in settings
- Use factory pattern: `createStreamProvider(config) -> returns appropriate provider
- Maintain backward compatibility

**Pros:**
- Gradual migration path
- A/B testing of both providers
- No breaking changes
- Users can compare results

**Cons:**
- More complex architecture
- Configuration burden increases

---

### Option 2: Direct Replacement (Riskier)
**Approach:** Replace Anthropic with GLM as default

**Architecture:**
```
src/streaming/
  ├── stream-engine.ts               // MODIFY for GLM format
  ├── zai-stream-provider.ts       // GLM SDK integration
  └── stream-provider-interface.ts   // Define provider contract
```

**Implementation Required:**
1. Rewrite `StreamProcessor` for GLM's delta format
2. Separate `reasoning_content` and `content` streams
3. Accumulate `tool_calls` array across multiple deltas
4. Handle `finish_reason` for completion detection
5. Merge streams at appropriate point for display

**Pros:**
- Single source of truth
- Simpler streaming logic
- Full GLM feature parity

**Cons:**
- **HIGH RISK**: Breaking change to core streaming
- Extensive testing required
- Potential for user confusion (different feel for different providers)

---

### Option 3: Dual-Stream Parallel
**Approach:** Run both Anthropic and GLM streams in parallel, merge at display

**Architecture:**
- Two StreamProcessor instances
- Merge their outputs in App component
- Show which provider is being used

**Pros:**
- Direct comparison possible
- Failover capability
- No data loss

**Cons:**
- Doubles API costs
- Complex UI state management
- Token usage tracking complications

---

## Recommended Approach: Option 1 (Hybrid)

**Rationale:**
1. **Lower Risk:** Preserves existing Anthropic integration
2. **User Choice:** Allows users to select provider per use case
3. **Testing:** Can test GLM alongside Anthropic without breaking current flow
4. **Cost Control:** Users can opt out of GLM if not needed
5. **Learning Opportunity:** Can refine GLM prompts while Anthropic remains stable

---

## Configuration Requirements

### New Settings Fields
```typescript
interface ApiConfig {
  // Existing Anthropic fields
  apiEndpoint?: string;
  apiModel?: string;
  maxTokensPerSecond?: number;

  // GLM-specific fields
  glmEndpoint?: string;           // Z.ai endpoint
  glmModel?: string;             // GLM model name
  provider?: 'anthropic' | 'glm'; // Provider selector
  enableThinkingMode?: boolean;   // GLM-specific feature
}
```

### Settings UI Updates Needed

**File:** `src/config/ApiSettings.tsx`

**Changes Required:**
1. Add dropdown for provider selection (`'anthropic' | 'glm'`)
2. Add GLM model selector dropdown with GLM-4.x variants
3. Add endpoint input for Z.ai (default: Anthropic)
4. Add thinking mode toggle (GLM-only feature)
5. Update save/load logic to handle new fields

---

## Streaming Engine Modifications

### Changes to `src/streaming/stream-engine.ts`

**New Interfaces Needed:**
```typescript
export interface GLMStreamConfig extends StreamProcessorConfig {
  provider?: 'anthropic' | 'glm';
  glmEndpoint?: string;
  glmModel?: string;
  enableThinkingMode?: boolean;
  toolStreamEnabled?: boolean;  // GLM feature
}

export interface GLMStreamChunk extends StreamChunk {
  reasoning_content?: string;  // GLM reasoning
  tool_calls?: ToolCall[];      // Accumulated tool calls
  usage?: TokenUsage;           // GLM usage metadata
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
```

**New Class Required:**
```typescript
export class GLMStreamProcessor extends EventEmitter {
  private provider: 'anthropic' | 'glm';
  private config: GLMStreamConfig;
  private accumulatedToolCalls: ToolCall[] = [];
  private accumulatedUsage: TokenUsage | null;
  private streamingState: {
    reasoningContent: string = '';
    content: string = '';
    isComplete: false;
  };

  // Main streaming method (replaces processChunk)
  async processStream(response: Response, onChunk: (chunk: GLMStreamChunk) => void {
    // Parse Z.ai SSE format
    for await response of event; 
      const line = await response.text();
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(5));
        // Handle delta
        if (data.delta) {
          await this.handleDelta(data.delta);
        }
      }
    }
  }

  private async handleDelta(delta: any): Promise<void> {
    // Handle reasoning_content stream
    if (delta.reasoning_content) {
      this.streamingState.reasoningContent += delta.reasoning_content;
      onChunk({
        reasoning_content: this.streamingState.reasoningContent,
        content: '',
        type: 'reasoning'
      });
    }

    // Handle content stream
    if (delta.content) {
      this.streamingState.content += delta.content;
      onChunk({
        content: this.streamingState.content,
        type: 'text'
      });
    }

    // Handle tool_calls stream
    if (delta.tool_calls) {
      this.accumulatedToolCalls.push(...delta.tool_calls);
      onChunk({
        tool_calls: this.accumulatedToolCalls,
        type: 'tool_calls'
      });
    }

    // Handle finish_reason (completion)
    if (data.finish_reason || data.usage) {
      this.streamingState.isComplete = true;
      this.streamingState.reasoningContent = ''; // Final reasoning
      onChunk({
        content: this.streamingState.content,
        type: 'content',
        tool_calls: this.accumulatedToolCalls,
        usage: this.accumulatedUsage
      });
    }
  }
}
```

---

## App Component Modifications

### Changes to `src/app.tsx`

**New State Needed:**
```typescript
const [selectedProvider, setSelectedProvider] = useState<'anthropic' | 'glm'>('anthropic');
const [enableThinkingMode, setEnableThinkingMode] = useState(false);
```

**Changes Required:**
1. Import `GLMStreamProcessor` instead of `StreamProcessor` when GLM selected
2. Add provider selection UI in settings
3. Conditionally enable thinking mode toggle for GLM only
4. Update ConfigLoader to read new fields
5. Pass provider configuration to AgentEngine

---

## Backward Compatibility Strategy

### Preserving Anthropic Behavior

**Migration Path:**
1. **Phase 1:** Add GLM provider without touching Anthropic
2. **Phase 2:** Set GLM as opt-in (behind flag)
3. **Phase 3:** A/B test both for 2 weeks
4. **Phase 4:** Make GLM default if stable

**Rollback Plan:**
- If users report GLM quality issues: Revert to Anthropic-only
- Keep Anthropic as fallback if GLM endpoint fails

### Data Format Compatibility

**Challenge:** Floyd's components expect single message with content field

**Solution:**
1. GLMStreamProcessor merges reasoning + content into single string for display
2. Tool calls provided as structured array
3. Token usage included from final chunk
4. Completion detected via `finish_reason` or `usage` field

---

## Implementation Phases

### Phase 1: Configuration (Week 1-2)
- [ ] Add provider selector to ApiSettings component
- [ ] Add GLM model dropdown
- [ ] Add Z.ai endpoint input
- [ ] Add thinking mode toggle (hidden for Anthropic)
- [ ] Update ConfigLoader for new fields
- [ ] Test settings save/load

### Phase 2: Streaming Engine (Week 2-3)
- [ ] Create `StreamProviderInterface.ts` abstraction
- [ ] Implement `AnthropicStreamProvider` (existing)
- [ ] Create `GLMStreamProvider.ts` (Z.ai SDK)
- [ ] Create factory function `createStreamProvider()`
- [ ] Update app.tsx to use factory pattern
- [ ] Write comprehensive tests

### Phase 3: Integration (Week 3-4)
- [ ] Integrate GLM provider into App.tsx
- [ ] Update AgentEngine to accept provider interface
- [ ] Add tool call streaming support
- [ ] Update MessageRenderer to show tool call UI
- [ ] Add fallback/retry logic for provider failures

### Phase 4: Testing & Refinement (Week 5-6)
- [ ] A/B test both providers with same prompts
- [ ] Measure token efficiency
- [ ] Test tool call accuracy
- [ ] Compare response quality
- [ ] Collect user feedback

### Phase 5: Documentation (Week 7)
- [ ] Update user docs with GLM guide
- [ ] Document model selection trade-offs
- [ ] Create migration guide
- [ ] Add troubleshooting section

---

## Risk Assessment

| Risk Category | Severity | Mitigation |
|--------------|----------|----------|
| **API Format Mismatch** | HIGH | Provider abstraction layer |
| **Streaming Complexity** | MEDIUM | Dual-stream management |
| **User Confusion** | MEDIUM | Two providers, different behaviors |
| **Token Efficiency** | LOW | Track usage accurately |
| **Rollback Complexity** | MEDIUM | Need fallback mechanism |

**Overall Risk:** MEDIUM - Manageable with phased approach and thorough testing

---

## Testing Checklist

### Unit Tests
- [ ] Stream processor correctly parses GLM SSE format
- [ ] Tool calls accumulated across deltas
- [ ] Completion detection works
- [ ] Provider factory returns correct instance
- [ ] Settings load/save handles new fields
- [ ] Provider switching works in-flight

### Integration Tests
- [ ] User can switch providers without errors
- [ ] GLM messages render correctly
- [ ] Thinking mode shows/hides correctly
- [ ] Tool calls display in UI
- [ ] Token usage shown in monitoring
- [ ] Anthropic fallback activates on GLM errors

### Performance Tests
- [ ] Streaming remains smooth with GLM
- [ ] No performance regression vs. Anthropic-only
- [ ] Memory usage stable (no leaks in dual-stream)
- [ ] Event loop remains healthy

### User Acceptance Tests
- [ ] Settings UI is intuitive
- [ ] Provider selection is clear
- [ ] Model selection options are discoverable
- [ ] Performance characteristics are similar between providers
- [ ] Cost transparency is maintained

---

## Next Steps

1. **Review with user** - Confirm integration strategy (hybrid vs replacement)
2. **Get approval** - User sign-off before implementing
3. **Create design specs** - UI mockups for provider selection
4. **Plan A/B testing** - Define test scenarios
5. **Set timeline** - Establish release schedule
6. **Begin implementation** - Start with Phase 1 (Configuration)

---

## Success Criteria

Integration is **READY** when:
1. Research document is reviewed and approved
2. Implementation phases are defined with clear exit criteria
3. Risk mitigation strategies are documented
4. Testing checklist is comprehensive
5. Rollback plan is established

---

## Questions for Reviewer

1. **Architecture:** Should we use a provider abstraction layer (StreamProviderInterface) or directly integrate GLM SDK into existing StreamProcessor?

2. **Streaming Strategy:** Do you prefer hybrid (dual parallel streams) or single provider with fallback?

3. **Thinking Mode:** GLM's `reasoning_content` stream - should we show this as a "thinking" indicator, hide it, or show it alongside streaming content?

4. **Tool Calls:** How should tool calls be displayed in the UI? As a panel? Inline in message content?

5. **Rollback:** If we add GLM, should we keep Anthropic as hidden fallback or remove it entirely?

---

## Conclusion

GLM integration is **technically feasible** with the current Floyd architecture, but requires **significant work**:

- **Minimum Viable Path:** 3-4 months (hybrid approach with Anthropic fallback)
- **Recommended Path:** 6+ months (GLM as default, phased rollout)
- **Key Challenge:** GLM's SSE format differs from Anthropic - requires adapter layer

**Risk Level:** MEDIUM - Not experimental, but complex integration that could affect stability

**Ready for design review and implementation planning.**
