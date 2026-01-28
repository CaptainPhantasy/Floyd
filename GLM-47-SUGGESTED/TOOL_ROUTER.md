# Tool Router Spine (ALWAYS-ON)

Use this exact routing. Do not improvise.

## DISCOVERY
- Concept search => codebase_search
- Exact identifiers/literals => grep
- After any hit => read_file the owning file(s)

## EDIT LOOP (single file)
read_file => edit_file/write => verify(file_contains or file_exists) => run(relevant test) => verify(command_succeeds)

## MULTI-FILE CHANGE
impact_simulate => (if high/critical) safe_refactor with rollback => verify => run(tests) => verify

## GIT
git_status first always.
Before commit: git_diff
Commit loop: git_stage => run(tests) => verify => git_commit

## BATCHING RULES
- Batch: reads + searches only.
- Never batch: edits/writes, commits, destructive ops. Sequence + verify each.
