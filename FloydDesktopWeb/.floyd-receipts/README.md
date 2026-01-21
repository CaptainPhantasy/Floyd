# Floyd Receipts Directory

This directory contains validation receipts for all development work on the Floyd DesktopWeb feature parity implementation.

## Directory Structure

```
.floyd-receipts/
├── phase1/                 # Core Chat Organization
│   ├── task1-1/           # Manual Chat Renaming
│   ├── task1-2/           # Copy Message Button
│   ├── task1-3/           # Regenerate Response
│   ├── task1-4/           # Pin Important Chats
│   ├── human-lens/        # HUMAN LENS smoke tests
│   ├── performance/       # Performance benchmarks
│   └── phase-audit.md     # Phase 1 audit report
├── phase2/                 # Enhanced Message Management
├── phase3/                 # Search & Organization
├── phase4/                 # File Management Enhancements
├── phase5/                 # Artifacts System
├── phase6/                 # Polish & Advanced Features
└── templates/              # Receipt templates
```

## Receipt Naming Convention

All receipts follow the pattern:
```
YYYY-MM-DD-HHMMSS-[type].md
```

Example:
```
2026-01-21-143000-code-update.md
2026-01-21-150000-unit-tests.md
2026-01-21-154500-smoke-test.md
```

## Receipt Types

1. **code** - Code changes (git diffs, file modifications)
2. **command** - Command execution outputs
3. **screenshot** - Visual evidence with metadata
4. **test** - Test results (unit, integration, E2E)
5. **performance** - Performance metrics and benchmarks

## Required Receipts per Task

Each task MUST include:
- Code receipt for all file changes
- Command receipt for all CLI operations
- Test receipt for test execution
- Screenshot receipt for UI changes
- Performance receipt (if applicable)
- HUMAN LENS smoke test report

## Phase Completion

A phase is complete when:
1. All tasks have receipts
2. All tests pass
3. HUMAN LENS smoke tests pass
4. Phase audit report approved
5. Sign-off obtained from all stakeholders

## Templates

See `/templates/` directory for receipt templates:
- `code-receipt.md`
- `command-receipt.md`
- `screenshot-receipt.md`
- `test-receipt.md`
- `performance-receipt.md`
- `smoke-test.md`
- `phase-audit.md`

---

*Last Updated: 2026-01-20*
