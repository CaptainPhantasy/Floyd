# Phase 8: System Prompts & Agent System (Week 9)

## Objective
Adapt Claude Code prompts to Floyd and implement agent system.

## Tasks

### 8.1 System Prompts

#### 8.1.1 Create Prompt Directory Structure

- [ ] Create prompts/system/ directory
  - [ ] main-system-prompt.md
  - [ ] security-policy.md
  - [ ] branding-guidelines.md
- [ ] Create prompts/tools/ directory with subdirectories:
  - [ ] file/ (read_file.md, write.md, edit_file.md, search_replace.md)
  - [ ] search/ (grep.md, codebase_search.md)
  - [ ] build/ (detect_project.md, run_tests.md, format.md, lint.md, build.md, check_permission.md, project_map.md, list_symbols.md)
  - [ ] git/ (git_status.md, git_diff.md, git_log.md, git_commit.md, git_stage.md, git_unstage.md, git_branch.md, is_protected_branch.md)
  - [ ] browser/ (browser_status.md, browser_navigate.md, browser_read_page.md, browser_screenshot.md, browser_click.md, browser_type.md, browser_find.md, browser_get_tabs.md, browser_create_tab.md)
  - [ ] cache/ (all 12 cache tools)
  - [ ] patch/ (apply_unified_diff.md, edit_range.md, insert_at.md, delete_range.md, assess_patch_risk.md)
  - [ ] special/ (manage_scratchpad.md, smart_replace.md, visual_verify.md, todo_sniper.md, check_diagnostics.md)
- [ ] Create prompts/agents/ directory:
  - [ ] floyd-explore.md
  - [ ] floyd-plan.md
  - [ ] floyd-task.md
  - [ ] floydmd-generator.md
  - [ ] conversation-summarization.md
- [ ] Create prompts/reminders/ directory:
  - [ ] plan-mode-active.md
  - [ ] floyd-config-active.md

#### 8.1.2 Prompt Content Creation

- [ ] Adapt main system prompt from Claude Code
- [ ] Create all 55 tool description prompts
- [ ] Adapt all agent prompts
- [ ] Create system reminders
- [ ] Validate all prompts for Floyd branding (replace Claude references)
- [ ] Test prompt loading

### 8.2 Prompt Loader

**File:** src/prompts/loader.ts

- [ ] Implement loadSystemPrompt() function
- [ ] Implement loadToolPrompt() function
- [ ] Implement loadAgentPrompt() function
- [ ] Add error handling for missing prompts
- [ ] Add prompt caching
- [ ] Write tests

### 8.3 Agent System

#### 8.3.1 Agent Registry

**File:** src/agents/agent-registry.ts

- [ ] Implement AgentRegistry class
- [ ] Define AgentDefinition interface
- [ ] Register all agents from prompts
- [ ] Add agent execution logic
- [ ] Write tests

#### 8.3.2 Agent Implementations

- [ ] floyd-explore - Explore codebase structure
- [ ] floyd-plan - Plan implementation approach
- [ ] floyd-task - Execute tasks
- [ ] floydmd-generator - Generate documentation
- [ ] conversation-summarization - Summarize long conversations

## Exit Criteria
- All prompt files created and populated
- Main system prompt loaded correctly
- All tool prompts loaded
- All agent prompts loaded
- Prompt loader works without errors
- Agent registry functional
- All agents can be instantiated

## Success Metrics
- 55 tool prompts exist
- 5 agent prompts exist
- System prompt loads <100ms
- Agent registry contains all agents
- No "Claude" references remain (all replaced with "Floyd")

## Notes
- Prompts are critical for LLM behavior
- Must adapt Claude Code prompts carefully
- Branding must be consistent (Floyd, not Claude)
- Agent system allows specialized behaviors

---

# AUDIT REPORT

**Audit Date:** 2026-01-22
**Auditor:** Claude Code Agent
**Scope:** Phase 8 - System Prompts & Agent System
**Method:** Line-by-line code audit comparing planned implementation vs actual codebase

---

## Executive Summary

**Status:** ❌ **PHASE 8 NOT IMPLEMENTED**

Phase 8 (System Prompts & Agent System) was planned but **NOT implemented**. The codebase only contains Phases 1-5 as indicated by commit `35d308f` ("Implement Floyd Wrapper core - Phases 1-5 complete"). Phase 8 deliverables are entirely missing from the codebase.

**Key Finding:** The prompt directory structure exists but is completely empty. No prompt files, no prompt loader, and no agent registry were implemented.

---

## Detailed Findings

### ✅ ITEMS THAT MATCH THE PLAN

#### 1. Prompt Directory Structure Created
**Status:** ⚠️ **PARTIAL** - Directories exist but are empty

**Location:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/`

**Evidence:**
```bash
src/prompts/
├── agents/      # Empty directory
├── reminders/   # Empty directory
├── system/      # Empty directory
└── tools/       # Empty directory
```

**Issue:** Directories exist but contain **ZERO** files.

---

### ❌ ITEMS MISSING FROM CODEBASE

#### 8.1.1 System Prompt Files - NOT IMPLEMENTED

**Planned:** 3 system prompt files in `prompts/system/`
**Actual:** 0 files (directory exists but empty)

**Missing Files:**
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/system/main-system-prompt.md`
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/system/security-policy.md`
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/system/branding-guidelines.md`

**Note:** System prompts exist as TypeScript constants in `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/constants.ts` (lines 133-183), but NOT as markdown files as planned.

---

#### 8.1.1 Tool Prompt Files - NOT IMPLEMENTED

**Planned:** 55 tool description files across 8 categories
**Actual:** 0 files (directory exists but empty)

**Missing Tool Prompts by Category:**

1. **File Tools** (4 planned, 0 implemented)
   - ❌ `prompts/tools/file/read_file.md`
   - ❌ `prompts/tools/file/write.md`
   - ❌ `prompts/tools/file/edit_file.md`
   - ❌ `prompts/tools/file/search_replace.md`

2. **Search Tools** (2 planned, 0 implemented)
   - ❌ `prompts/tools/search/grep.md`
   - ❌ `prompts/tools/search/codebase_search.md`

3. **Build Tools** (8 planned, 0 implemented)
   - ❌ `prompts/tools/build/detect_project.md`
   - ❌ `prompts/tools/build/run_tests.md`
   - ❌ `prompts/tools/build/format.md`
   - ❌ `prompts/tools/build/lint.md`
   - ❌ `prompts/tools/build/build.md`
   - ❌ `prompts/tools/build/check_permission.md`
   - ❌ `prompts/tools/build/project_map.md`
   - ❌ `prompts/tools/build/list_symbols.md`

4. **Git Tools** (8 planned, 0 implemented)
   - ❌ `prompts/tools/git/git_status.md`
   - ❌ `prompts/tools/git/git_diff.md`
   - ❌ `prompts/tools/git/git_log.md`
   - ❌ `prompts/tools/git/git_commit.md`
   - ❌ `prompts/tools/git/git_stage.md`
   - ❌ `prompts/tools/git/git_unstage.md`
   - ❌ `prompts/tools/git/git_branch.md`
   - ❌ `prompts/tools/git/is_protected_branch.md`

5. **Browser Tools** (9 planned, 0 implemented)
   - ❌ `prompts/tools/browser/browser_status.md`
   - ❌ `prompts/tools/browser/browser_navigate.md`
   - ❌ `prompts/tools/browser/browser_read_page.md`
   - ❌ `prompts/tools/browser/browser_screenshot.md`
   - ❌ `prompts/tools/browser/browser_click.md`
   - ❌ `prompts/tools/browser/browser_type.md`
   - ❌ `prompts/tools/browser/browser_find.md`
   - ❌ `prompts/tools/browser/browser_get_tabs.md`
   - ❌ `prompts/tools/browser/browser_create_tab.md`

6. **Cache Tools** (12 planned, 0 implemented)
   - ❌ `prompts/tools/cache/cache_store.md`
   - ❌ `prompts/tools/cache/cache_retrieve.md`
   - ❌ `prompts/tools/cache/cache_delete.md`
   - ❌ `prompts/tools/cache/cache_clear.md`
   - ❌ `prompts/tools/cache/cache_list.md`
   - ❌ `prompts/tools/cache/cache_search.md`
   - ❌ `prompts/tools/cache/cache_stats.md`
   - ❌ `prompts/tools/cache/cache_prune.md`
   - ❌ `prompts/tools/cache/cache_store_pattern.md`
   - ❌ `prompts/tools/cache/cache_store_reasoning.md`
   - ❌ `prompts/tools/cache/cache_load_reasoning.md`
   - ❌ `prompts/tools/cache/cache_archive_reasoning.md`

7. **Patch Tools** (5 planned, 0 implemented)
   - ❌ `prompts/tools/patch/apply_unified_diff.md`
   - ❌ `prompts/tools/patch/edit_range.md`
   - ❌ `prompts/tools/patch/insert_at.md`
   - ❌ `prompts/tools/patch/delete_range.md`
   - ❌ `prompts/tools/patch/assess_patch_risk.md`

8. **Special Tools** (5 planned, 0 implemented)
   - ❌ `prompts/tools/special/manage_scratchpad.md`
   - ❌ `prompts/tools/special/smart_replace.md`
   - ❌ `prompts/tools/special/visual_verify.md`
   - ❌ `prompts/tools/special/todo_sniper.md`
   - ❌ `prompts/tools/special/check_diagnostics.md`

**Actual Tool Count:** 50 tools implemented (5 missing from planned 55)
**Missing:** Special tools category completely unimplemented

---

#### 8.1.1 Agent Prompt Files - NOT IMPLEMENTED

**Planned:** 5 agent prompt files in `prompts/agents/`
**Actual:** 0 files (directory exists but empty)

**Missing Files:**
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/agents/floyd-explore.md`
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/agents/floyd-plan.md`
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/agents/floyd-task.md`
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/agents/floydmd-generator.md`
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/agents/conversation-summarization.md`

---

#### 8.1.1 System Reminder Files - NOT IMPLEMENTED

**Planned:** 2 system reminder files in `prompts/reminders/`
**Actual:** 0 files (directory exists but empty)

**Missing Files:**
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/reminders/plan-mode-active.md`
- ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/reminders/floyd-config-active.md`

---

#### 8.2 Prompt Loader - NOT IMPLEMENTED

**Planned File:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/loader.ts`
**Status:** ❌ File does not exist

**Missing Functions:**
- ❌ `loadSystemPrompt()`
- ❌ `loadToolPrompt()`
- ❌ `loadAgentPrompt()`
- ❌ Error handling for missing prompts
- ❌ Prompt caching
- ❌ Tests for prompt loader

**Evidence:**
```bash
$ find /Volumes/Storage/WRAPPERS/FLOYD\ WRAPPER -name "loader.ts"
# No results found
```

---

#### 8.3.1 Agent Registry - NOT IMPLEMENTED

**Planned File:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/agents/agent-registry.ts`
**Status:** ❌ File does not exist

**Missing Components:**
- ❌ `AgentRegistry` class
- ❌ `AgentDefinition` interface
- ❌ Agent registration logic
- ❌ Agent execution logic
- ❌ Tests for agent registry

**What Exists Instead:**
- `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/agent/execution-engine.ts` - General execution engine, NOT agent-specific
- `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/tools/tool-registry.ts` - Tool registry, NOT agent registry

**Evidence:**
```bash
$ find /Volumes/Storage/WRAPPERS/FLOYD\ WRAPPER -name "*agent*registry*" -o -name "*registry*agent*"
# No results found
```

---

#### 8.3.2 Agent Implementations - NOT IMPLEMENTED

**Planned:** 5 specialized agents
**Actual:** 0 agents implemented

**Missing Agents:**
- ❌ **floyd-explore** - Codebase exploration agent
- ❌ **floyd-plan** - Implementation planning agent
- ❌ **floyd-task** - Task execution agent
- ❌ **floydmd-generator** - Documentation generation agent
- ❌ **conversation-summarization** - Conversation summarization agent

**Evidence:**
```bash
$ grep -r "floyd-explore\|floyd-plan\|floyd-task" /Volumes/Storage/WRAPPERS/FLOYD\ WRAPPER/src/
# No results found
```

---

### ⚠️ ITEMS THAT DON'T MATCH THE PLAN

#### System Prompts in Wrong Format

**Planned:** Markdown files in `prompts/system/`
**Actual:** TypeScript constants in `src/constants.ts`

**Location:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/constants.ts` (lines 127-183)

**Evidence:**
- `MAIN_SYSTEM_PROMPT` (line 133)
- `EXPLORE_SYSTEM_PROMPT` (line 155)
- `PLAN_SYSTEM_PROMPT` (line 171)

**Issue:** Prompts are hardcoded as constants rather than loaded from markdown files, reducing flexibility and making updates harder.

---

#### Tool Count Discrepancy

**Planned:** 55 tools
**Actual:** 50 tools implemented

**Breakdown:**
- Git: 8 tools ✅
- Cache: 12 tools (includes archive tools not in original plan)
- File: 4 tools ✅
- Search: 2 tools ✅
- System: 2 tools ✅
- Browser: 9 tools ✅
- Patch: 5 tools ✅
- Build: 8 tools ✅
- **Special: 0 tools** ❌ (5 planned)

**Total:** 50/55 tools (91% completion)

---

#### Agent System Architecture Different

**Planned:** Separate agent registry with 5 specialized agents
**Actual:** Single general-purpose execution engine

**File:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/agent/execution-engine.ts`

**What Exists:**
- `FloydAgentEngine` class - General agentic loop
- Conversation history management
- Turn limiting (max 20 turns)
- Tool execution through toolRegistry

**What's Missing:**
- Specialized agent behaviors (explore, plan, task, etc.)
- Agent selection logic
- Agent-specific prompts
- Agent registry

---

### 📝 EXISTING IMPLEMENTATIONS (Not in Phase 8 Plan)

#### Tool Registry - Phases 1-5

**File:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/tools/tool-registry.ts`

**Implemented:**
- ✅ `ToolRegistry` class (446 lines)
- ✅ Tool registration and execution
- ✅ Permission system
- ✅ Category management
- ✅ API definition generation

**Status:** Fully functional, but this is from Phase 2, not Phase 8

---

#### Execution Engine - Phases 1-5

**File:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/agent/execution-engine.ts`

**Implemented:**
- ✅ `FloydAgentEngine` class (261 lines)
- ✅ Multi-turn conversation loop
- ✅ Tool execution and result feeding
- ✅ Streaming support
- ✅ Turn limiting

**Status:** Functional agentic loop, but not the specialized agent system planned for Phase 8

---

#### Tools Implemented - Phases 1-5

**File:** `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/tools/index.ts`

**Count:** 50 tools registered across 8 categories

**Distribution:**
- Git: 8 tools (status, diff, log, commit, stage, unstage, branch, is-protected)
- Cache: 12 tools (store, retrieve, delete, clear, list, search, stats, prune, store-pattern, store-reasoning, load-reasoning, archive-reasoning)
- File: 4 tools (read, write, edit, search-replace)
- Search: 2 tools (grep, codebase-search)
- System: 2 tools (run, ask-user)
- Browser: 9 tools (status, navigate, read-page, screenshot, click, type, find, get-tabs, create-tab)
- Patch: 5 tools (apply-unified-diff, edit-range, insert-at, delete-range, assess-patch-risk)
- Build: 8 tools (detect-project, run-tests, format, lint, build, check-permission, project-map, list-symbols)

**Status:** Tools are implemented but lack prompt documentation

---

### 🔧 FILE PATHS AND LINE NUMBERS

#### Key Files Referenced

**Implemented (Phases 1-5):**
1. `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/tools/tool-registry.ts` - Lines 1-446
2. `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/tools/index.ts` - Lines 1-132
3. `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/agent/execution-engine.ts` - Lines 1-261
4. `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/constants.ts` - Lines 127-183 (system prompts as constants)
5. `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/cache/supercache.ts` - Cache implementation
6. `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/cli.ts` - CLI entry point
7. `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/ui/terminal.ts` - Terminal UI

**Not Implemented (Phase 8):**
1. ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/loader.ts`
2. ❌ `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/agents/agent-registry.ts`
3. ❌ All files in `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/system/`
4. ❌ All files in `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/tools/`
5. ❌ All files in `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/agents/`
6. ❌ All files in `/Volumes/Storage/WRAPPERS/FLOYD WRAPPER/src/prompts/reminders/`

---

## Exit Criteria Status

| Criterion | Planned | Actual | Status |
|-----------|---------|--------|--------|
| All prompt files created and populated | 65+ files | 0 files | ❌ FAILED |
| Main system prompt loaded correctly | Yes | As constant only | ⚠️ PARTIAL |
| All tool prompts loaded | 55 files | 0 files | ❌ FAILED |
| All agent prompts loaded | 5 files | 0 files | ❌ FAILED |
| Prompt loader works without errors | Yes | Not implemented | ❌ FAILED |
| Agent registry functional | Yes | Not implemented | ❌ FAILED |
| All agents can be instantiated | 5 agents | 0 agents | ❌ FAILED |

**Overall Exit Criteria:** ❌ **0/7 PASSED**

---

## Success Metrics Status

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Tool prompts exist | 55 files | 0 files | ❌ 0% |
| Agent prompts exist | 5 files | 0 files | ❌ 0% |
| System prompt load time | <100ms | N/A | ❌ N/A |
| Agent registry contains agents | 5 agents | 0 agents | ❌ 0% |
| "Claude" references removed | 0 references | 0 references | ✅ PASS |

**Overall Success Metrics:** ❌ **1/5 PASSED (20%)**

---

## 🔧 Recommendations

### Critical Issues

1. **Phase 8 Not Started**
   - All Phase 8 deliverables are missing
   - Only Phases 1-5 were implemented (per commit `35d308f`)
   - **Recommendation:** Implement Phase 8 if system prompts and agent specialization are needed

### High Priority

2. **Missing Prompt Loader**
   - Prompts hardcoded in `constants.ts` are not flexible
   - **Recommendation:** Implement `src/prompts/loader.ts` with:
     - `loadSystemPrompt(category: string): Promise<string>`
     - `loadToolPrompt(toolName: string): Promise<string>`
     - `loadAgentPrompt(agentName: string): Promise<string>`
     - Error handling for missing files
     - Caching for performance

3. **Missing Agent Registry**
   - Current execution engine is generic, not specialized
   - **Recommendation:** Implement `src/agents/agent-registry.ts` with:
     - `AgentDefinition` interface
     - `AgentRegistry` class
     - Agent execution logic
     - Agent selection based on task type

4. **Missing Special Tools**
   - 5 special tools planned but 0 implemented
   - **Recommendation:** Implement if needed:
     - `manage_scratchpad`
     - `smart_replace`
     - `visual_verify`
     - `todo_sniper`
     - `check_diagnostics`

### Medium Priority

5. **Prompt Documentation Missing**
   - 50 tools implemented but 0 have prompt documentation
   - **Recommendation:** Create markdown files in `prompts/tools/` for each tool
   - **Alternative:** If not needed, remove Phase 8 from implementation plan

6. **Agent Implementations Missing**
   - 5 specialized agents planned but 0 implemented
   - **Recommendation:** Either:
     - Implement agents as planned, OR
     - Update plan to reflect that generic execution engine is sufficient

### Low Priority

7. **Directory Structure Incomplete**
   - Prompt directories exist but are empty
   - **Recommendation:** Either populate them or remove them if not needed

---

## Parity Assessment

**Overall Parity:** ❌ **0%** (Phase 8 not implemented)

**Breakdown:**
- Prompt Directory Structure: 20% (directories exist but empty)
- System Prompts: 30% (exist as constants, not files)
- Tool Prompts: 0% (none of 55 planned files exist)
- Agent Prompts: 0% (none of 5 planned files exist)
- Reminder Prompts: 0% (none of 2 planned files exist)
- Prompt Loader: 0% (not implemented)
- Agent Registry: 0% (not implemented)
- Agent Implementations: 0% (none of 5 agents implemented)

---

## Conclusion

**Phase 8 is completely unimplemented.** The codebase contains a functional Floyd Wrapper with:
- ✅ 50 tools across 8 categories
- ✅ Tool registry with permission system
- ✅ General execution engine
- ✅ System prompts as TypeScript constants

But **lacks** all Phase 8 deliverables:
- ❌ 65+ prompt markdown files
- ❌ Prompt loader system
- ❌ Agent registry
- ❌ 5 specialized agents

**Decision Point:** The project appears functional without Phase 8 implementations. Consider whether:
1. Phase 8 is still needed (if yes, full implementation required)
2. Phase 8 should be removed from the plan (if generic system is sufficient)
3. A simplified version of Phase 8 should be implemented (e.g., just prompt loader, no agents)

---

**Audit Completed:** 2026-01-22
**Next Steps:** Review with team to determine if Phase 8 implementation is required
