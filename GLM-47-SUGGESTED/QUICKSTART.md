# GLM-4.7 SUGGESTED — Quick Reference (Lean Core)

## ALWAYS-ON CORE (Load Every Turn)

```
1. SYSTEM_CORE.md      — Identity, non-negotiables
2. MODES.md            — Truthful mode definitions
3. TOOL_ROUTER.md      — Deterministic routing
4. VERIFY_INVARIANTS.md — Hard verification rules
5. CONTEXT_BUDGET.md   — Context management
```

---

## CORE COMMANDS

```
Read:      read_file({ "file_path": "/absolute/path" })
Write:     write({ "file_path": "/absolute/path", "content": "..." })
Edit:      edit_file({ "file_path": "...", "old_string": "...", "new_string": "..." })
Search:    codebase_search({ "query": "..." }) or grep({ "pattern": "..." })
Verify:    verify({ "type": "file_exists|file_contains|command_succeeds", "target": "..." })
```

---

## MODES (TRUTHFUL DEFINITIONS)

| Mode | Behavior |
|------|----------|
| **ASK** | Confirm dangerous tools |
| **YOLO** | Auto-approved: read/search/edit/write/run/git_commit. Still asks: delete/move/multi-file/git-merge |
| **PLAN** | Read-only: analysis + plan output |
| **AUTO** | Single-file OK, multi-file → ASK |
| **DIALOGUE** | One-line responses, no tools |
| **FUCKIT** | All permissions, verify important ops |

---

## TOOL ROUTER SPINE

```
DISCOVERY:    codebase_search → grep → read_file
EDIT LOOP:    read_file → edit_file → verify → run(test) → verify
MULTI-FILE:   impact_simulate → safe_refactor → verify → run(tests)
GIT:          git_status → git_diff → git_stage → run(tests) → verify → git_commit
```

---

## VERIFY INVARIANTS (NON-NEGOTIABLE)

After ANY state change:
- write/edit_file/search_replace → verify(file_exists or file_contains)
- run command → verify(command_succeeds)
- risky operation → impact_simulate BEFORE, verify AFTER

If verify fails: repair → retry → verify again. No apologies.

---

## CONTEXT BUDGET

- Keep working set small: 1–3 files at a time
- Prefer: grep/codebase_search → read_file targeted
- When stuck: expand outward (error file → imports → config → tests)

---

## PACKS (LOAD ON-DEMAND)

| Pack | When to Load |
|------|--------------|
| `packs/FORMAT.md` | Need formatting guidance |
| `packs/TOOLS_50.md` | Need tool signature or unsure |
| `packs/PATTERNS.md` | Running common workflows |
| `packs/EXAMPLES.md` | Want canonical walkthroughs |

---

## KEY DIFFERENCES FROM FLASH-PROMPTS

| Issue | Flash-Prompts | SUGGESTED Fix |
|-------|--------------|---------------|
| Mode ambiguity | YOLO still asked for "dangerous tools" | Truthful YOLO: auto-approves standard edits |
| Verification | Described as "habit" | Hard invariant: MUST verify after state change |
| Tool selection | Improvisational | Deterministic router spine |
| Context bloat | All layers always loaded | Packs loaded only when needed |
| ONENESS | In runtime identity | Removed for clarity |

---

## DEFAULT TURN SHAPE

```
(Optional one-line)
→ tool calls (batch reads/searches only)
→ verify (after state changes)
→ STOP
```

**One line is best. Be fast. Be precise.**
