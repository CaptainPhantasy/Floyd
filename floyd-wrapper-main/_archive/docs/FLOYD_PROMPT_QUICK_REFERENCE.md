# Floyd Prompt Adaptation - Quick Reference Matrix

**Purpose:** Quick lookup for adapting Claude Code prompts to Floyd
**Companion to:** FLOYD_ADAPTATION_GUIDE.md
**Generated:** 2026-01-22

---

## Quick Reference Tables

### 1. Prompt File Mapping

| Claude Code File | Floyd File | Action | Priority |
|-----------------|------------|--------|----------|
| `system-prompt-main-system-prompt.md` | `prompts/system/main-system-prompt.md` | Adapt | P0 |
| `tool-description-readfile.md` | `prompts/tools/file/read_file.md` | Adapt | P0 |
| `tool-description-write.md` | `prompts/tools/file/write.md` | Adapt | P0 |
| `tool-description-edit.md` | `prompts/tools/file/edit_file.md` | Adapt | P0 |
| `tool-description-bash.md` | `prompts/tools/build/run.md` | Adapt | P0 |
| `tool-description-grep.md` | `prompts/tools/search/grep.md` | Adapt | P0 |
| `tool-description-todowrite.md | `prompts/tools/special/manage_scratchpad.md` | Adapt + Transform | P1 |
| `agent-prompt-explore.md` | `prompts/agents/floyd-explore.md` | Adapt | P0 |
| `agent-prompt-plan-mode-enhanced.md` | `prompts/agents/floyd-plan.md` | Adapt | P0 |
| `agent-prompt-task-tool.md` | `prompts/agents/floyd-task.md` | Adapt | P0 |
| `agent-prompt-claudemd-creation.md` | `prompts/agents/floydmd-generator.md` | Transform | P1 |
| `agent-prompt-conversation-summarization.md` | `prompts/agents/conversation-summarization.md` | Adapt | P1 |
| `system-reminder-plan-mode-is-active.md` | `prompts/reminders/plan-mode-active.md` | Adapt | P0 |

---

### 2. String Replacement Mapping

Find and replace these strings across all adapted prompts:

| Claude Code String | Floyd String | Occurrences |
|-------------------|--------------|-------------|
| `Claude Code` | `Floyd` | 50+ |
| `claude.ai/code` | `floyd-wrapper/docs` | 5+ |
| `CLAUDE.md` | `FLOYD.md` | 20+ |
| `Anthropic` | `CURSEM` | 10+ |
| `Claude` | `Floyd` | 100+ |
| `claude-opus-4` | `glm-4.7` | 5+ |
| `Sonnet 4.5` | `GLM-4.7` | 3+ |
| `Anthropic AI` | | Remove |
| `@anthropic-ai/sdk` | `@glm-ai/sdk` | 2+ |

---

### 3. Tool Name Mapping

| Claude Code Tool | Floyd Tool | Category | Status |
|-----------------|------------|----------|--------|
| ReadFile | read_file | File Operations | ✅ Direct |
| Write | write | File Operations | ✅ Direct |
| Edit | edit_file | File Operations | ✅ Direct |
| Bash | run | Build & Test | ⚠️ Adapt |
| Glob | [Merged] | Search | ⚠️ Combined |
| Grep | grep | Search | ✅ Direct |
| TodoWrite | manage_scratchpad | Special | ⚠️ Transform |
| Task | [Floyd Task Agent] | Agent | ⚠️ Implement |
| AskUserQuestion | ask_user | System | ✅ Direct |
| Computer | browser_navigate | Browser | ⚠️ Split into 9 tools |
| LSP | [Not implemented] | - | ❌ Out of scope |
| MCPSearch | [Not implemented] | - | ❌ Phase 2 |

---

### 4. New Floyd Tools (No Claude Code Equivalent)

| Tool | Category | Purpose | Tokens (Est) |
|------|----------|---------|--------------|
| codebase_search | Search | Semantic code search | 150 |
| project_map | Search | Directory tree visualization | 120 |
| list_symbols | Search | Extract code symbols | 100 |
| check_diagnostics | Build | Compiler checks | 200 |
| detect_project | Build | Project type detection | 180 |
| run_tests | Build | Test execution | 150 |
| format | Build | Code formatting | 120 |
| lint | Build | Linting | 120 |
| build | Build | Build process | 150 |
| cache_store | Cache | SUPERCACHE store | 200 |
| cache_retrieve | Cache | SUPERCACHE retrieve | 180 |
| cache_delete | Cache | SUPERCACHE delete | 150 |
| cache_clear | Cache | SUPERCACHE clear | 120 |
| cache_list | Cache | SUPERCACHE list | 150 |
| cache_search | Cache | SUPERCACHE search | 180 |
| cache_stats | Cache | SUPERCACHE statistics | 200 |
| cache_prune | Cache | SUPERCACHE prune | 120 |
| cache_store_pattern | Cache | Store reusable patterns | 220 |
| cache_store_reasoning | Cache | Store CoT frames | 250 |
| cache_load_reasoning | Cache | Load reasoning frame | 150 |
| cache_archive_reasoning | Cache | Archive to project | 180 |
| smart_replace | Special | Surgical editing | 180 |
| visual_verify | Special | Command preview | 150 |
| todo_sniper | Special | Find TODOs | 120 |
| runtime_schema_gen | Special | Generate TypeScript from JSON | 250 |
| tui_puppeteer | Special | TUI interaction | 200 |
| ast_navigator | Special | Code navigation | 180 |
| skill_crystallizer | Special | Save patterns to memory | 220 |

**Total New Tools:** 28
**Total Tokens:** ~4,500

---

### 5. Branding Replacements

| Element | Claude Code | Floyd | File Location |
|---------|-------------|-------|--------------|
| **Product Name** | Claude Code | Floyd Wrapper | All prompts |
| **Full Name** | Anthropic Claude Code | File-Logged Orchestrator Yielding Deliverables | Main system prompt |
| **Company** | Anthropic | CURSEM | Main system prompt |
| **Theme** | Default | CRUSH | Main system prompt |
| **Context File** | CLAUDE.md | FLOYD.md | All prompts |
| **Fallback** | None | AGENTS.md | Main system prompt |
| **Logo** | 🤖 (default) | [FLOYDASCII.txt] | Main system prompt |
| **Colors** | Default | #6B50FF (Primary), #FF60FF (Secondary) | Main system prompt |

---

### 6. Critical Additions for Floyd

These sections must be ADDED to adapted prompts:

```markdown
# ADD TO MAIN SYSTEM PROMPT

## Floyd Identity
You are Floyd, an AI development companion powered by GLM-4.7.
Mission: Help developers ship high-quality code faster.
Cost-Effective: ~10x cheaper than Claude Code.

## CRUSH Theme
Floyd follows CRUSH design philosophy:
- CharmUI: High-contrast aesthetics
- Rustic: Dark backgrounds (#201F26)
- User-focused: Clear visual hierarchy
- Speedy: Fast visual feedback
- Hybrid: Cross-terminal capabilities

## SUPERCACHE
Floyd includes 3-tier caching to reduce GLM-4.7 costs:
- reasoning: 5-minute TTL
- project: 24-hour TTL
- vault: 7-day TTL
Use cache_store, cache_retrieve for cost optimization.

## FLOYD.md Configuration
Check for FLOYD.md first (Floyd-specific context)
Fall back to AGENTS.md (ecosystem compatibility)
FLOYD.md allows:
- SUPERCACHE settings
- Runner defaults
- GLM-4.7 optimization hints
- Custom Floyd workflows
```

---

### 7. Removal List

These Claude Code concepts should be REMOVED:

| Concept | Remove From | Reason |
|---------|-------------|--------|
| `@anthropic-ai/sdk` | All prompts | Using GLM SDK |
| `claude-opus-4` references | All prompts | Using GLM-4.7 |
| `Claude Agent SDK` | Main prompt | Not using (yet) |
| `Computer` tool | Tool descriptions | Using 9 browser tools instead |
| `LSP` tool | Tool descriptions | Out of scope for v1.0 |
| `MCPSearch` | Tool descriptions | Phase 2 feature |
| Time estimates | Main prompt | Floyd doesn't estimate |
| `/help` command | Main prompt | Different help system |
| GitHub issue reporting | Main prompt | Private repo |

---

### 8. Permission Matrix

| Permission Level | Claude Code Count | Floyd Count | Examples |
|-----------------|-------------------|-------------|----------|
| **None** (read-only) | ~15 | 25 | read_file, grep, cache_list, browser_status |
| **Moderate** (non-destructive write) | ~10 | 15 | git_stage, cache_delete, browser_navigate |
| **Dangerous** (requires confirmation) | ~15 | 15 | write, edit_file, run, git_commit, spawn_shadow_workspace |

---

### 9. Token Budget Summary

| Component | Claude | Floyd | Delta |
|-----------|--------|-------|-------|
| **Main System Prompt** | 2,981 | 2,500 | -481 |
| **Tool Descriptions** | ~8,000 | ~11,600 | +3,600 |
| **Agent Prompts** | ~3,000 | ~3,050 | +50 |
| **System Reminders** | ~1,500 | ~1,500 | 0 |
| **Total Core** | **~15,500** | **~18,650** | **+3,150** |

**Breakdown of +3,150 tokens:**
- New tools (28 tools × ~150 tokens): +4,200
- GLM-4.7 guidelines: +100
- CRUSH branding: +300
- SUPERCACHE documentation: +500
- FLOYD.md configuration: +200
- Agent enhancements: +50
- Optimizations/consolidations: -2,200

---

### 10. Implementation Priority Matrix

| Priority | Component | Files | Effort | Impact |
|----------|-----------|-------|--------|--------|
| **P0** | Main system prompt | 1 | High | Critical |
| **P0** | Core tool descriptions (10) | 10 | Medium | Critical |
| **P0** | Agent prompts (3) | 3 | Medium | Critical |
| **P1** | Remaining tool descriptions (45) | 45 | High | High |
| **P1** | FLOYD.md Generator agent | 1 | Low | High |
| **P1** | Conversation summarization | 1 | Low | Medium |
| **P2** | Additional agents (5) | 5 | Medium | Medium |
| **P2** | System reminders | 2 | Low | Low |

**P0 = Week 1, P1 = Week 2-3, P2 = Week 4**

---

### 11. Validation Checklist

For each adapted prompt, verify:

- [ ] All "Claude Code" → "Floyd"
- [ ] All "CLAUDE.md" → "FLOYD.md"
- [ ] All "Anthropic" → "CURSEM" (where appropriate)
- [ ] GLM-4.7 guidelines added
- [ ] CRUSH theme referenced (if UI-related)
- [ ] Tool names use Floyd naming
- [ ] File paths use prompt structure
- [ ] Token count within budget
- [ ] No Claude-specific features remain
- [ ] Floyd enhancements documented

---

### 12. Common Patterns

Pattern 1: Tool Description Header
```markdown
# Tool: [tool_name]

**Purpose:** [What it does]

**Floyd-Specific Notes:**
- [Floyd-specific behavior]
- [Differences from Claude Code]

**Usage:**
- [Parameter descriptions]

**Permission:** [none | moderate | dangerous]
```

Pattern 2: Agent Prompt Header
```markdown
# Floyd [Agent Name] Agent

You are a [specialization] for Floyd.

=== CRITICAL: READ-ONLY MODE ===
[Restrictions]

**Your Capabilities:**
- [Strengths]

**Floyd-Specific Tools:**
- [Relevant tools]

**CRUSH Theme Integration:**
- [UI guidance]

**Output Format:**
- [Output structure]
```

Pattern 3: System Reminder
```markdown
# Floyd [Reminder Name]

[Reminder content]

**Floyd-Specific:**
- [Floyd enhancements]

**Required Actions:**
- [Steps to take]
```

---

### 13. Testing Checklist

After adaptation, test each prompt with:

- [ ] Tool use scenarios (all 55 tools)
- [ ] Agent invocation (all agents)
- [ ] Plan mode workflow
- [ ] FLOYD.md loading
- [ ] AGENTS.md fallback
- [ ] Error handling
- [ ] Permission prompts
- [ ] SUPERCACHE operations
- [ ] Browser tools (if available)
- [ ] Git operations
- [ ] File operations

---

## Summary

This quick reference provides:

✅ **File mapping** - Where each Claude Code prompt goes
✅ **String replacements** - Find/replace patterns
✅ **Tool mappings** - Claude → Floyd tool equivalents
✅ **New tools** - 28 Floyd-specific tools
✅ **Branding** - CURSEM/FLOYD/CRUSH integration
✅ **Critical additions** - What must be added
✅ **Removals** - What to remove from Claude
✅ **Token budgets** - Size estimates
✅ **Priorities** - Implementation order
✅ **Validation** - Quality checks
✅ **Patterns** - Reusable templates
✅ **Testing** - Verification steps

**Use alongside:** FLOYD_ADAPTATION_GUIDE.md for full details

---

**Version:** 1.0.0
**Companion:** FLOYD_ADAPTATION_GUIDE.md
**Status:** Ready for Use
