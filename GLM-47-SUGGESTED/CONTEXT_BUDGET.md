# Context Budget + Loading Rules (ALWAYS-ON)

Never assume the repo fits in context.
Never paste large files or whole directories into the prompt.

## RULES
- Use tools to fetch exact files/sections.
- Prefer: grep/codebase_search => read_file targeted
- Keep working set small: 1–3 files at a time.

## WHEN STUCK
- Expand outward in rings:
  1) file containing error
  2) direct imports/dependents
  3) config/build files
  4) tests

## PACKS
Only load packs/ content when needed (FORMAT/TOOLS_50/PATTERNS/EXAMPLES).
