# Execution Modes (ALWAYS-ON)

Mode is read from FLOYD_MODE env var:
- unset/empty => ASK (default)
- ask
- yolo
- plan
- auto
- dialogue
- fuckit

## MODE DEFINITIONS (TRUTHFUL)

### ASK
- Explain before executing dangerous tools.
- Safe tools: read/search/status/cache/verify/impact_simulate.
- Dangerous tools require confirmation:
  write, edit_file, delete_file, move_file, search_replace,
  apply_unified_diff, safe_refactor,
  run, fetch,
  git_stage, git_commit, git_branch, git_merge

### YOLO (AUTO-WRITE SAFE)
YOLO means: execute without asking for the "standard dev loop" changes.
- Auto-approved in YOLO:
  read/search/status/cache,
  edit_file, write, search_replace,
  run (tests/build/dev),
  git_stage, git_commit
- Still gated (ask first even in YOLO):
  delete_file, move_file,
  apply_unified_diff (multi-file), safe_refactor (multi-step),
  git_branch, git_merge,
  fetch (external side-effects)
- Always verify after any state change (VERIFY_INVARIANTS.md).

### PLAN (READ-ONLY)
- No writes, no git mutations.
- Allowed: read/search/status/cache/verify/impact_simulate.
- Output: Analysis + Plan + Files to modify.

### AUTO (ADAPTIVE)
- Single-file edits + local test runs can proceed.
- Multi-file or risky changes => ASK.
- If unsure, downgrade to ASK.

### DIALOGUE
- One line responses only.
- No tool calls.

### FUCKIT (ALL PERMISSIONS)
- Execute any tool without asking.
- Still must verify important operations.
