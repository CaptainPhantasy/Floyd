# Cleanup & Streaming Fixes Plan

## Issues Found

### 1. Obsolete Go Files Still in Root
**Problem:** Many Go files still exist in root directories despite being "archived"
- `agent/`, `tui/`, `ui/`, `cmd/`, `cache/`, `mcp/`, `main.go`, `spinners/`, `animations/`
- These should be moved to `.archive/2026-01-16-go-tui-retirement/` or removed

**Action:** Archive remaining Go files

### 2. StreamProcessor Not Wired Up
**Problem:** `StreamProcessor` exists with rate limiting (100 tokens/sec) but is NOT used
- `app.tsx` directly consumes generator without throttling
- Tokens stream at full speed (too fast to read)

**Current Code:**
```typescript
// app.tsx - NO throttling
for await (const chunk of generator) {
  currentAssistantMessage += chunk;
  appendStreamingContent(chunk); // Direct append, no delay
}
```

**Fix:** Wire up `StreamProcessor` to throttle output

### 3. Whimsical Sayings Missing
**Problem:** Whimsical thinking phrases exist in Go code and `WHIMSY_MAPPING.md` but NOT in TypeScript CLI
- 50 phrases available but not displayed
- `ThinkingStream.tsx` just shows "Thinking..." spinner

**Fix:** Add whimsical phrases to TypeScript CLI, display randomly during thinking

### 4. No Thinking Pauses
**Problem:** No delay between thinking blocks and output
- Code detects `</thinking>` but immediately starts streaming
- Should pause 500-1000ms after thinking completes

**Fix:** Add pause after thinking blocks

### 5. Token Rate Too High
**Problem:** Default 100 tokens/sec is still too fast for readable output
- Should be configurable, default to ~20-30 tokens/sec for coding
- User mentioned "insanely fast" output

**Fix:** Lower default rate, make configurable

---

## Implementation Plan

### Phase 1: Archive Go Files
1. Move remaining Go directories to `.archive/2026-01-16-go-tui-retirement/`
2. Update `.gitignore` if needed
3. Update README to reflect cleanup

### Phase 2: Wire Up StreamProcessor
1. Import `StreamProcessor` in `app.tsx`
2. Create processor instance with configurable rate
3. Pipe generator through processor
4. Handle processor events (data, end, error)

### Phase 3: Add Whimsical Sayings
1. Create `src/utils/whimsical-phrases.ts` with phrases from `WHIMSY_MAPPING.md`
2. Add hook `useWhimsicalPhrase()` that returns random phrase
3. Update `ThinkingStream.tsx` to display phrases
4. Show phrase when `status === 'thinking'`

### Phase 4: Add Thinking Pauses
1. Detect `</thinking>` marker
2. Add 500-1000ms delay before resuming output
3. Show "Processing..." or whimsical phrase during pause

### Phase 5: Configure Token Rate
1. Add config option for `maxTokensPerSecond` (default: 25)
2. Make it configurable via `.floyd/settings.json` or CLI flag
3. Update `StreamProcessor` to use configured rate

---

## Files to Modify

1. **Archive:**
   - Move `agent/`, `tui/`, `ui/`, `cmd/`, `cache/`, `mcp/`, `main.go`, `spinners/`, `animations/` to `.archive/`

2. **Stream Throttling:**
   - `src/app.tsx` - Wire up StreamProcessor
   - `src/streaming/stream-engine.ts` - Lower default rate

3. **Whimsical Sayings:**
   - `src/utils/whimsical-phrases.ts` - NEW - Phrase list
   - `src/ui/agent/ThinkingStream.tsx` - Display phrases
   - `src/app.tsx` - Use phrases during thinking

4. **Thinking Pauses:**
   - `src/app.tsx` - Add delay after `</thinking>`

5. **Configuration:**
   - `src/utils/config.ts` - Add `streamingRate` option
   - `.floyd/settings.json.example` - Document setting

---

## Configuration Options

Add to `.floyd/settings.json`:
```json
{
  "streaming": {
    "maxTokensPerSecond": 25,
    "thinkingPauseMs": 800,
    "showWhimsicalPhrases": true
  }
}
```

---

## Testing

After implementation:
1. Run `floyd-cli` and send a message
2. Verify output streams at readable rate (~25 tokens/sec)
3. Verify whimsical phrase appears during thinking
4. Verify pause after thinking completes
5. Verify no Go files in root (except archived)
