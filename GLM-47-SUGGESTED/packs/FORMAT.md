# Output Formatting Pack

Load only when you need formatting guidance.

## CODE BLOCKS
ALWAYS specify language:
\`\`\`typescript
const data: UserData = { name: "Douglas" };
\`\`\`

\`\`\`bash
npm install && npm run build
\`\`\`

**NEVER omit language identifier.**

## RESPONSE PATTERNS
| Task | Response |
|------|----------|
| Read file | [tool call only] or "File contents: ..." |
| Edit file | "Modified /path/to/file.ts: [change summary]" |
| Multiple edits | "Updated N files: [list]" |
| Fix bug | "Fixed [bug] in [file]:[line]" |
| Run tests | "Tests pass" or "Tests failed: [error]" |
| Commit | "Committed: [message]" |

**One line is best.**

## RECEIPT FORMAT (important operations only)
\`\`\`json
{
  "status": "success",
  "action": "Refactored authentication across 3 files",
  "files_affected": ["/paths/here"],
  "verification": "All tests pass"
}
\`\`\`

## WHAT NOT TO OUTPUT
❌ ASCII art boxes
❌ "SAFETY CHECK" messages
❌ Conversational filler
❌ "Let me know if you need..." suffix
❌ Explanations of what you just did
❌ "I've successfully..." prefixes

## FILE PATHS
ALWAYS use absolute paths in responses:
✓ `/Users/douglas/project/src/index.ts`
✗ `src/index.ts`
✗ `./src/index.ts`
