# Hardened Prompt System - Staged Rollout Plan

**Version:** 0.2.0-HARDENED-PROMPT
**Date:** 2026-01-25
**Status:** READY FOR TESTING

---

## Executive Summary

Floyd now has a GLM-4.7-optimized hardened prompt system that replaces conflicting legacy prompts with a production-ready 5-layer architecture. The system is deployed behind feature flags for safe, gradual rollout.

---

## What Changed

### New Components

1. **Hardened Prompt Stack** (`src/prompts/hardened/`)
   - 5-layer GLM-4.7 optimized architecture
   - Personal context (Douglas Allen Talley, Legacy AI)
   - 50-tool accurate descriptions
   - Batch operation guidance
   - Verification gates and stop conditions

2. **Feature Flags** (`.env` and `config.ts`)
   - `FLOYD_USE_HARDENED_PROMPT` - Enable/disable hardened prompts
   - `FLOYD_PRESERVED_THINKING` - GLM-4.7 preserved thinking
   - `FLOYD_TURN_LEVEL_THINKING` - Turn-level thinking control
   - `FLOYD_JSON_PLANNING` - JSON planning for complex tasks

3. **Evaluation Harness** (`tests/hardened-prompt-evaluation.ts`)
   - 25+ tests covering golden tasks, adversarial cases, regression tests
   - GLM-4.7 specific validation
   - Metrics and keyword density checks

### Fixed Issues

1. **GLM-4.7 Conflicts**
   - Language switching: Now enforces English throughout
   - Thinking format: Uses `reasoning_content` blocks instead of `<thinking>`
   - Front-loading: Critical directives at very top of prompt
   - Tool count: Accurate 50-tool descriptions (was 13)

2. **Tool Utilization**
   - Batch operations: Added guidance for multi-file operations
   - Tool selection: Heuristics for optimal tool choice
   - Workflow patterns: Common workflows documented
   - Turn optimization: Minimize exploratory reads

3. **Prompt Architecture**
   - Separated concerns: Identity, Policy, Process, Tools, Format
   - Verification gates: Multiple checkpoints throughout execution
   - Stop conditions: Clear halt criteria
   - Structured rules: 15 operational rules with examples

---

## Rollout Strategy

### Phase 1: Internal Testing (Days 1-3)

**Goal:** Validate hardened prompt system doesn't break existing workflows.

**Actions:**
1. Run evaluation harness:
   ```bash
   cd /Volumes/Storage/FLOYD_CLI/floyd-wrapper-main
   npx ava tests/hardened-prompt-evaluation.ts
   ```

2. Test with feature flag disabled (legacy prompts):
   ```bash
   export FLOYD_USE_HARDENED_PROMPT=false
   npm run build
   npm start
   ```

3. Test with feature flag enabled (hardened prompts):
   ```bash
   export FLOYD_USE_HARDENED_PROMPT=true
   npm run build
   npm start
   ```

**Success Criteria:**
- [ ] All 25+ evaluation tests pass
- [ ] Legacy prompt tests still pass (no regression)
- [ ] Hardened prompt builds without errors
- [ ] CLI starts in both modes

**Rollback Plan:**
If any test fails or unexpected behavior:
1. Revert to `FLOYD_USE_HARDENED_PROMPT=false`
2. Report failure details
3. Investigate and fix

---

### Phase 2: Canary Rollout (Days 4-7)

**Goal:** Test hardened prompts on limited subset of tasks.

**Actions:**
1. Enable hardened prompts for specific sessions only
2. Test on variety of workflows:
   - File operations (read, write, edit)
   - Git workflow (status, diff, commit)
   - Search operations (grep, codebase_search)
   - Cache operations (store, retrieve)
   - Browser automation (navigate, read)
   - Patch operations (apply_diff)

3. Monitor metrics:
   - Turn count per task
   - Tool error rate
   - Token efficiency
   - Success rate

**Success Criteria:**
- [ ] Turn count decreases by 20-30% vs. legacy
- [ ] Tool error rate stays below 5%
- [ ] Success rate improves to 90%+
- [ ] No language switching issues
- [ ] All verification gates respected

**Rollback Plan:**
If metrics degrade or critical issues found:
1. Set `FLOYD_USE_HARDENED_PROMPT=false`
2. Analyze failure patterns
3. Refine hardened prompts
4. Retry canary

---

### Phase 3: Gradual Rollout (Days 8-14)

**Goal:** Expand hardened prompts to 50% of sessions.

**Actions:**
1. Enable hardened prompts for random 50% of sessions
2. Monitor A/B comparison:
   - Legacy vs. Hardened performance
   - User feedback and satisfaction
   - Error types and frequency
   - Task completion time

3. Collect user feedback:
   - "Which prompt system feels more natural?"
   - "Are verification gates helpful or annoying?"
   - "Are you noticing improved efficiency?"
   - "Any unexpected behaviors?"

**Success Criteria:**
- [ ] 50% of sessions successfully use hardened prompts
- [ ] User satisfaction >= 85% for hardened prompts
- [ ] No critical bugs reported
- [ ] Turn count improvement maintained

**Rollback Plan:**
If critical feedback or bugs:
1. Revert to 25% hardened prompt usage
2. Address top 3 issues
3. Resume gradual rollout

---

### Phase 4: Full Rollout (Days 15-21)

**Goal:** 100% of sessions use hardened prompts.

**Actions:**
1. Enable hardened prompts by default in `.env.example`
2. Update documentation:
   - README.md: Feature flags section
   - CHANGELOG.md: New features
   - FLOYDENGINEERING.md: Updated specs

3. Remove legacy prompt system (optional, Phase 5):
   - Archive `src/prompts/system/` to `_archive/`
   - Remove feature flag check from execution engine
   - Simplify codebase

**Success Criteria:**
- [ ] 100% of sessions use hardened prompts
- [ ] All documentation updated
- [ ] No legacy prompt references remain
- [ ] Production stable for 7 days

**Rollback Plan:**
If production issues arise:
1. Emergency revert: Set `FLOYD_USE_HARDENED_PROMPT=false` in production env
2. Investigate immediately
3. Hotfix and redeploy

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Task Success Rate**
   - Goal: 90%+ (vs. 70-75% legacy)
   - Measure: Tasks completed / Total tasks attempted

2. **Turn Count**
   - Goal: 8-12 turns (vs. 15-20 legacy)
   - Measure: Average turns per task

3. **Tool Error Rate**
   - Goal: <5% (vs. 10-15% legacy)
   - Measure: Tool errors / Total tool calls

4. **Token Efficiency**
   - Goal: 30-40% reduction
   - Measure: Tokens per successful outcome

5. **User Satisfaction**
   - Goal: 85%+
   - Measure: Survey scores and feedback

### Dashboard Proposal

```typescript
interface MetricsDashboard {
  // Session metrics
  totalSessions: number;
  hardenedPromptSessions: number;
  legacyPromptSessions: number;
  
  // Performance metrics
  avgTurns: { hardened: number; legacy: number };
  avgTokens: { hardened: number; legacy: number };
  successRate: { hardened: number; legacy: number };
  
  // Tool metrics
  toolErrorRate: { hardened: number; legacy: number };
  topFailedTools: { tool: string; count: number }[];
  
  // User feedback
  satisfactionScore: { hardened: number; legacy: number };
  commonFeedback: string[];
}
```

---

## Kill Switch Conditions

**Immediate Rollback Triggers:**
1. Task success rate drops below 70%
2. Critical data loss or corruption
3. Security vulnerability discovered
4. Language switching issues (GLM-4.7 responding in Chinese)
5. Verification gates cause infinite loops
6. User satisfaction drops below 60%

**Rollback Procedure:**
1. Set `FLOYD_USE_HARDENED_PROMPT=false` in all environments
2. Restart all active sessions
3. Notify stakeholders: "Hardened prompt rollback due to: [reason]"
4. Root cause analysis
5. Fix and retest
6. Resume canary rollout

---

## Migration Steps

### For Users

**Before Rollout:**
1. No action required - feature flag defaults to `false` (legacy prompts)

**During Rollout (Phase 2-3):**
1. No action required - system randomly assigns prompt system

**After Rollout (Phase 4):**
1. Optional: Add to `.env` if want to customize:
   ```bash
   FLOYD_USE_HARDENED_PROMPT=true
   FLOYD_PRESERVED_THINKING=true
   FLOYD_TURN_LEVEL_THINKING=true
   FLOYD_JSON_PLANNING=true
   ```

### For Developers

**Before Rollout:**
1. Review hardened prompt code: `src/prompts/hardened/`
2. Run evaluation tests: `npx ava tests/hardened-prompt-evaluation.ts`
3. Test with both prompt systems

**After Rollout:**
1. Update documentation with feature flag usage
2. Remove legacy prompt code (Phase 5, optional)
3. Simplify execution engine

---

## Known Limitations

1. **No Automatic Fallback**
   - If hardened prompt fails, no automatic fallback to legacy
   - Manual intervention required

2. **Feature Flag Complexity**
   - Requires restart to change prompt system
   - Can't switch mid-session

3. **Testing Coverage Gaps**
   - Evaluation tests don't cover all 50 tools equally
   - Some edge cases may emerge in production

4. **Language Enforcement**
   - GLM-4.7 may still attempt language switching in rare cases
   - Additional monitoring needed

---

## Next Steps

1. **Immediate (Today):**
   - Run evaluation harness
   - Fix any failing tests
   - Document known issues

2. **Short-term (This Week):**
   - Phase 1: Internal testing
   - Phase 2: Canary rollout
   - Collect initial metrics

3. **Mid-term (Next 2 Weeks):**
   - Phase 3: Gradual rollout
   - Monitor A/B comparison
   - Gather user feedback

4. **Long-term (Next Month):**
   - Phase 4: Full rollout
   - Remove legacy prompt code
   - Optimize based on production data

---

## Contact & Support

**Engineering Lead:** Douglas Allen Talley
**Organization:** Legacy AI
**Location:** Nashville, Indiana, Brown County

**Questions?** Open issue or contact directly.

---

**Together, we're building the future.** 🚀