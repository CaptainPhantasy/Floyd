# GLM-4.7-Flash Prompt System (Lean Core)

## Architecture
This system reduces contradictory instruction layering by separating:
- **ALWAYS-ON core** (5 files) — loaded every turn
- **INVOKE-ONLY packs** (4 files) — loaded only when needed

---

## ALWAYS-ON Load Order (exact sequence)

1. **SYSTEM_CORE.md** — Identity, non-negotiables, default turn shape
2. **MODES.md** — Truthful mode definitions with deterministic routing
3. **TOOL_ROUTER.md** — Spine for tool selection (no improvising)
4. **VERIFY_INVARIANTS.md** — Verification as state machine
5. **CONTEXT_BUDGET.md** — Context budget + loading rules

---

## INVOKE-ONLY Packs

Load these ONLY when the situation requires:

| Pack | When to Load |
|------|--------------|
| **packs/FORMAT.md** | Need formatting guidance |
| **packs/TOOLS_50.md** | Need tool signature or unsure |
| **packs/PATTERNS.md** | Running common workflows |
| **packs/EXAMPLES.md** | Want canonical walkthroughs |

---

## Why This Structure

| Issue | Fix |
|-------|-----|
| Contradictory instruction layers | Single always-on core |
| YOLO still asking for "dangerous tools" | Truthful mode definitions |
| Verify as "habit" vs requirement | Hard invariant state machine |
| Context bloat | On-demand packs |
| ONENESS confusion | Removed from runtime identity |

---

## Assembly Example

```typescript
const ALWAYS_ON = [
  readFileSync('SYSTEM_CORE.md', 'utf-8'),
  readFileSync('MODES.md', 'utf-8'),
  readFileSync('TOOL_ROUTER.md', 'utf-8'),
  readFileSync('VERIFY_INVARIANTS.md', 'utf-8'),
  readFileSync('CONTEXT_BUDGET.md', 'utf-8'),
].join('\n\n---\n\n');

// Add packs conditionally based on context
const PACKS = [];
if (needFormatting) PACKS.push(readFileSync('packs/FORMAT.md', 'utf-8'));
if (needToolsRef) PACKS.push(readFileSync('packs/TOOLS_50.md', 'utf-8'));

return ALWAYS_ON + '\n\n' + PACKS.join('\n\n');
```

---

## Version

**Created:** 2026-01-27
**For:** GLM-4.7-Flash (30B MoE, 3B active)
**Optimization:** Lean core reduces instruction conflict, improves tool routing
