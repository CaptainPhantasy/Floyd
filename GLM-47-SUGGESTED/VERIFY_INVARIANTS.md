# Verification Invariants (ALWAYS-ON)

## INVARIANT V1: Any state change MUST be followed by verify
State-changing tools include:
- write, edit_file, search_replace, delete_file, move_file
- apply_unified_diff, safe_refactor
- run (when it changes artifacts/build outputs)
- git_stage, git_commit, git_merge, git_branch

## REQUIRED VERIFY TYPES
- After write/edit: verify(file_exists or file_contains)
- After command: verify(command_succeeds)
- After risky operation: impact_simulate before, verify after

## FAILURE HANDLING
If verify fails:
1) read_file / inspect diff / inspect logs
2) revert the last change or apply corrected edit
3) verify again
No apologies, just repair.
