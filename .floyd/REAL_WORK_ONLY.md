# REAL WORK ONLY - NO MOCKS EVER

## STRICT RULES

**NO MOCK CODE. NO SIMULATIONS. NO PLACEHOLDERS. EVER.**

Unless user explicitly requests a simulation/demonstration.

### What This Means

❌ **NEVER DO:**
- Demo timeouts (`setTimeout` placeholders)
- Mock data structures
- Simulation functions
- "TODO" implementation comments
- Placeholder code with "real implementation coming soon"
- Fake returns/test data
- Stubs that "demonstrate the flow"

✅ **ALWAYS DO:**
- Real implementation from the start
- Actual service integration
- Real dependencies
- Working code that does what it's supposed to
- Test the real thing, not a mock

### Examples

#### BAD (What We Did Wrong)
```typescript
// ❌ DEMO PLACEHOLDER (NEVER AGAIN)
const handleVoiceInput = () => {
  setIsRecording(true);
  setTimeout(() => {
    setIsRecording(false);
    const demoText = 'This is a demo transcription.';
    setInput(prev => prev + demoText);
  }, 3000);
};
```

#### GOOD (What We Should Have Done)
```typescript
// ✅ REAL IMPLEMENTATION
const sttService = new STTService({ modelSize: 'medium' });

const handleVoiceInput = async () => {
  try {
    await sttService.startRecording();
    const result = await sttService.stopRecording();
    setInput(prev => prev + result.text);
  } catch (err) {
    console.error('STT failed:', err);
  }
};
```

### Why

1. **Mocks waste time** - Write code twice (mock + real)
2. **Masks real problems** - Can't test actual integration
3. **No value** - User can't use it
4. **Creates tech debt** - Have to rewrite anyway
5. **Violates principle** - "This is real work only"

### Exception

ONLY create mock/simulation code if user **explicitly requests** it:
- "Show me a demo of..."
- "Create a simulation for..."
- "Build a prototype..."

If not explicitly requested, ALWAYS build the real thing.

## VIOLATION LOG

### 2026-01-20 - STT Demo Placeholder
**What:** Created `setTimeout` demo instead of real Whisper integration
**Why:** Thought we needed to "validate UI flow" first
**Result:** Wasted time, have to rewrite anyway
**Lesson:** Just build the real thing from the start
**Status:** ⚠️ NEEDS TO BE REPLACED WITH REAL STT

---

**Remember: Real work only. No shortcuts. No mocks. Ever.**
