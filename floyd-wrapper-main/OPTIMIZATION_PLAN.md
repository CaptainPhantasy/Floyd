# Floyd Wrapper Performance Optimization Plan

## Current Baseline Performance

| Query Type | Time | Target | Status |
|------------|------|--------|--------|
| Simple (no tool) | 2.0s | 2.0s | ❌ FAIL (barely) |
| File operation | 6.6s | 5.0s | ❌ FAIL (+1.6s) |
| Git operation | 7.4s | 5.0s | ❌ FAIL (+2.4s) |
| Code search | 99.1s | 5.0s | ❌ FAIL (20x!) |

## Root Cause Analysis

### 1. API Latency (Primary Bottleneck)
- Each LLM call takes ~2 seconds
- Tool-using queries require 2 API calls:
  - Call 1: LLM decides which tool to use (~2s)
  - Tool execution: varies (100ms-5s)
  - Call 2: LLM processes results and generates response (~2s)
- **Total for tool queries**: 4+ seconds BEFORE adding tool execution time

### 2. Search Tool Performance (Critical Issue)
- Current: JavaScript-based file reading and regex matching
- Pattern '.' matches every line in every file
- Reading entire files into memory
- **Solution**: Use native `grep` via run tool for large searches

### 3. System Prompt Length
- Current: ~900 characters
- Longer prompts = slower processing
- Can be optimized

## Optimization Strategy

### Phase 1: Quick Wins (Immediate)

1. **Lower Temperature** ✅
   - Current: 0.3
   - Target: 0.1 or 0.0 (deterministic = faster)
   - Impact: Minor (maybe 10-20%)

2. **Reduce Max Tokens** ✅
   - Current: 100,000
   - Target: 4,096 (sufficient for direct answers)
   - Impact: Minor (token generation is fast)

3. **Shorten System Prompt** ✅
   - Remove redundant instructions
   - Focus on "use tools, give direct answers"
   - Impact: Minor

### Phase 2: Tool Optimization (High Impact)

1. **Fix Search Tools** 🚨 CRITICAL
   - Replace JavaScript grep with native grep for large searches
   - Add file count limit warnings
   - Use run tool for complex searches

2. **Add Tool Execution Timeouts**
   - Prevent tools from hanging
   - Default timeout: 5 seconds

3. **Optimize File Tools**
   - Add size limits for read operations
   - Stream large files instead of loading into memory

### Phase 3: LLM Configuration Tuning (Medium Impact)

1. **Stream Optimization**
   - Reduce buffer flushes
   - Batch token processing

2. **Tool Schema Optimization**
   - Reduce tool descriptions
   - Simplify JSON schemas
   - Fewer tools registered by default

3. **Caching Strategy**
   - Cache tool definitions
   - Cache frequently accessed files
   - Cache LLM responses for idempotent queries

## Expected Improvements

| Optimization | Expected Impact | Effort |
|--------------|----------------|--------|
| Lower temperature (0.1) | +10-20% faster | Low |
| Reduce max_tokens (4K) | +5-10% faster | Low |
| Shorten system prompt | +5-10% faster | Low |
| Fix search tools | **+90% on searches** | Medium |
| Tool timeouts | Prevent hangs | Low |
| Stream optimization | +10-20% | Medium |
| **Combined** | **Target <5s** | Medium |

## Success Metrics

- Simple queries: <2s ✅ (already close)
- File operations: <5s (need -1.6s)
- Git operations: <5s (need -2.4s)
- Code search: <5s (need -94s!)

## Implementation Priority

1. **Phase 1** (Do first): Configuration changes
2. **Phase 2** (Critical): Fix search tools
3. **Phase 3** (If needed): Advanced optimizations

## Testing

After each optimization, run `test-performance.ts` to measure impact.
