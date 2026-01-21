# Phase Audit Report - Phase [N]: [Phase Name]

**Audit Date:** [YYYY-MM-DD]  
**Auditor:** [Name]  
**Phase Duration:** [Start Date] to [End Date]  
**Planned Tasks:** [X]  
**Completed Tasks:** [Y]  
**Completion Rate:** [Z]%

---

## Executive Summary

**Overall Status:** ✅ PASS / ❌ FAIL / ⚠️ PASS WITH CONDITIONS

### Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Tasks Completed | [X]/[Y] | 100% | ✅/❌ |
| Tests Passed | [X]/[Y] | 100% | ✅/❌ |
| HUMAN LENS Score | [X]% | > 95% | ✅/❌ |
| Performance Benchmarks Met | [X]/[Y] | 100% | ✅/❌ |
| Critical Blockers | [X] | 0 | ✅/❌ |
| Code Coverage | [X]% | > 80% | ✅/❌ |

### Risk Assessment
**Overall Risk:** [Low/Medium/High]  
**Recommended Action:** [Proceed to Next Phase/Fix Issues/Additional Testing/Rework Required]

**Risk Breakdown:**
- **Technical Risk:** [Low/Medium/High]
- **Schedule Risk:** [Low/Medium/High]
- **Quality Risk:** [Low/Medium/High]

---

## Task Completion Summary

### Completed Tasks ✅

| Task ID | Task Name | Priority | Est. Effort | Actual Effort | Completion Date | Receipts | Status |
|---------|-----------|----------|-------------|---------------|-----------------|----------|--------|
| [N].[X] | [Task name] | [P0/P1/P2] | [X] days | [Y] days | [YYYY-MM-DD] | [Link] | ✅ Verified |
| [N].[X] | [Task name] | [P0/P1/P2] | [X] days | [Y] days | [YYYY-MM-DD] | [Link] | ✅ Verified |

**Total Completed:** [X] tasks  
**Total Effort:** [X] days (Planned: [Y] days, Variance: [±Z]%)

### Incomplete Tasks ❌

| Task ID | Task Name | Priority | Reason | Blocker | Owner | Est. Completion |
|---------|-----------|----------|--------|---------|-------|-----------------|
| [N].[X] | [Task name] | [P0/P1/P2] | [Reason] | Yes/No | [Name] | [YYYY-MM-DD] |

**Total Incomplete:** [X] tasks  
**Blockers:** [X] critical, [Y] major

### Deferred Tasks ⏸️

| Task ID | Task Name | Reason | Deferred To Phase |
|---------|-----------|--------|-------------------|
| [N].[X] | [Task name] | [Reason] | [N] |

---

## Verification Checklist

### Code Quality ✅

| Check | Status | Evidence |
|-------|--------|----------|
| All code reviewed | ✅/❌ | [PR links] |
| No linting errors | ✅/❌ | [Lint report] |
| TypeScript strict mode passing | ✅/❌ | [TSC output] |
| Code follows project conventions | ✅/❌ | [Review notes] |
| Documentation updated | ✅/❌ | [Docs links] |
| No TODO/FIXME in production code | ✅/❌ | [Search results] |
| Dead code removed | ✅/❌ | [Cleanup notes] |

**Receipt:** `.floyd-receipts/phase[N]/code-quality.md`

**Code Review Summary:**
- **Total PRs:** [X]
- **Total Files Changed:** [X]
- **Lines Added:** [X]
- **Lines Removed:** [Y]
- **Net Change:** [±Z]
- **Review Cycle Time:** [X] days average

### Testing ✅

| Check | Status | Evidence |
|-------|--------|----------|
| Unit tests written and passing | ✅/❌ | [Test report] |
| Integration tests passing | ✅/❌ | [Test report] |
| E2E tests passing | ✅/❌ | [Test report] |
| Test coverage > 80% | ✅/❌ | [Coverage report] |
| No flaky tests | ✅/❌ | [Test history] |
| Performance tests passing | ✅/❌ | [Perf report] |

**Receipt:** `.floyd-receipts/phase[N]/testing.md`

**Test Summary:**
```
Test Suites: [X] passed, [Y] total
Tests:       [X] passed, [Y] failed, [Z] total
Coverage:    [X]% statements, [Y]% branches, [Z]% functions, [W]% lines
Time:        [X]s
```

### HUMAN LENS Smoke Test ✅

| Level | Status | Score | Pass Rate | Issues Found |
|-------|--------|-------|-----------|--------------|
| Level 1 (Micro) | ✅/❌ | [X]% | [X]/[Y] | [Z] |
| Level 2 (Feature) | ✅/❌ | [X]% | [X]/[Y] | [Z] |
| Level 3 (Phase) | ✅/❌ | [X]% | [X]/[Y] | [Z] |

**Receipt:** `.floyd-receipts/phase[N]/human-lens.md`

**Smoke Test Summary:**
- **Total Tests Run:** [X]
- **Tests Passed:** [Y]
- **Tests Failed:** [Z]
- **Overall Pass Rate:** [W]%
- **Critical Issues:** [X]
- **Major Issues:** [Y]
- **Minor Issues:** [Z]

### Performance ✅

| Metric | Before | After | Target | Status | Delta |
|--------|--------|-------|--------|--------|-------|
| Page Load Time | [X]s | [Y]s | < 2s | ✅/❌ | [±Z]% |
| Time to Interactive | [X]s | [Y]s | < 3s | ✅/❌ | [±Z]% |
| First Contentful Paint | [X]s | [Y]s | < 1s | ✅/❌ | [±Z]% |
| API Response Time (p95) | [X]ms | [Y]ms | < 500ms | ✅/❌ | [±Z]% |
| Render Time | [X]ms | [Y]ms | < 100ms | ✅/❌ | [±Z]% |
| Memory Usage | [X]MB | [Y]MB | < 500MB | ✅/❌ | [±Z]% |
| Bundle Size | [X]KB | [Y]KB | < +10% | ✅/❌ | [±Z]% |

**Receipt:** `.floyd-receipts/phase[N]/performance.md`

**Lighthouse Scores:**

| Category | Score | Target | Status | Change |
|----------|-------|--------|--------|--------|
| Performance | [X] | > 90 | ✅/❌ | [±Y] |
| Accessibility | [X] | > 90 | ✅/❌ | [±Y] |
| Best Practices | [X] | > 90 | ✅/❌ | [±Y] |
| SEO | [X] | > 90 | ✅/❌ | [±Y] |

### Security ✅

| Check | Status | Notes |
|-------|--------|-------|
| No new vulnerabilities | ✅/❌ | [Scan report] |
| Input validation implemented | ✅/❌ | [Details] |
| Output sanitization verified | ✅/❌ | [Details] |
| Authentication intact | ✅/❌ | [Test results] |
| Authorization tested | ✅/❌ | [Test results] |
| XSS prevention verified | ✅/❌ | [Details] |
| CSRF protection verified | ✅/❌ | [Details] |
| Secrets not exposed | ✅/❌ | [Details] |

**Receipt:** `.floyd-receipts/phase[N]/security.md`

### Data Migration ✅ (if applicable)

| Check | Status | Notes |
|-------|--------|-------|
| Migration script tested | ✅/❌ | [Script location] |
| Rollback procedure tested | ✅/❌ | [Procedure docs] |
| No data loss scenarios | ✅/❌ | [Test results] |
| Backup created | ✅/❌ | [Backup location] |
| Migration time acceptable | ✅/❌ | [X]s |
| Data integrity verified | ✅/❌ | [Verification results] |
| Performance impact minimal | ✅/❌ | [Perf data] |

**Receipt:** `.floyd-receipts/phase[N]/migration.md`

**Migration Details:**
- **Records Migrated:** [X]
- **Migration Time:** [X]s
- **Rollback Time:** [Y]s
- **Data Validated:** [Z]% verified

---

## Issues & Blockers

### Critical Issues (Must Fix - Block Release)

| # | Issue | Impact | Affected Users | Fix Estimate | Owner | Status |
|---|-------|--------|----------------|--------------|-------|--------|
| 1 | [Description] | [High/Med/Low] | [All/Some] | [X] days | [Name] | [Open/In Progress/Fixed] |

**Total Critical:** [X] issues

### Major Issues (Should Fix)

| # | Issue | Impact | Affected Users | Fix Estimate | Owner | Status |
|---|-------|--------|----------------|--------------|-------|--------|
| 1 | [Description] | [High/Med/Low] | [All/Some] | [X] days | [Name] | [Open/In Progress/Fixed] |

**Total Major:** [X] issues

### Minor Issues (Nice to Fix)

| # | Issue | Impact | Affected Users | Fix Estimate | Owner | Status |
|---|-------|--------|----------------|--------------|-------|--------|
| 1 | [Description] | [High/Med/Low] | [All/Some] | [X] days | [Name] | [Open/In Progress/Fixed] |

**Total Minor:** [X] issues

### Technical Debt Created

| # | Debt Item | Impact | Paydown Plan | Owner |
|---|-----------|--------|--------------|-------|
| 1 | [Description] | [High/Med/Low] | [Plan] | [Name] |

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation Strategy | Status |
|------|-------------|--------|---------------------|--------|
| [Risk description] | [High/Med/Low] | [High/Med/Low] | [Strategy] | [Active/Mitigated/Accepted] |

### Schedule Risks

| Risk | Probability | Impact | Mitigation Strategy | Status |
|------|-------------|--------|---------------------|--------|
| [Risk description] | [High/Med/Low] | [High/Med/Low] | [Strategy] | [Active/Mitigated/Accepted] |

### Quality Risks

| Risk | Probability | Impact | Mitigation Strategy | Status |
|------|-------------|--------|---------------------|--------|
| [Risk description] | [High/Med/Low] | [High/Med/Low] | [Strategy] | [Active/Mitigated/Accepted] |

---

## Recommendations

### Proceed to Next Phase
**Decision:** ✅ YES / ❌ NO / ⚠️ CONDITIONAL

**Rationale:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Conditions (if any):**
- [ ] [Condition 1]
- [ ] [Condition 2]
- [ ] [Condition 3]

### Additional Work Required
| Task | Priority | Effort | Due Date | Owner |
|------|----------|--------|----------|-------|
| [Task description] | [P0/P1/P2] | [X] days | [YYYY-MM-DD] | [Name] |

### Technical Debt to Address
| Debt Item | Priority | Effort | Target Phase | Owner |
|-----------|----------|--------|--------------|-------|
| [Description] | [P0/P1/P2] | [X] days | [Phase N] | [Name] |

---

## Lessons Learned

### What Went Well 🎉
1. **[Positive outcome 1]**
   - Why it went well: [Explanation]
   - How to replicate: [Explanation]

2. **[Positive outcome 2]**
   - Why it went well: [Explanation]
   - How to replicate: [Explanation]

### What Could Be Improved 💡
1. **[Improvement area 1]**
   - Current state: [Description]
   - Suggested improvement: [Description]
   - Expected benefit: [Description]

2. **[Improvement area 2]**
   - Current state: [Description]
   - Suggested improvement: [Description]
   - Expected benefit: [Description]

### Process Changes for Next Phase 📋
1. **[Change 1]**
   - Reason: [Why]
   - Implementation: [How]

2. **[Change 2]**
   - Reason: [Why]
   - Implementation: [How]

---

## Sign-Off

### Development Team
**Developer:** [Name]  
**Date:** [YYYY-MM-DD]  
**Status:** ✅ Approved / ⚠️ Approved with Conditions / ❌ Rejected  
**Comments:** [Any comments]

**Lead Developer:** [Name]  
**Date:** [YYYY-MM-DD]  
**Status:** ✅ Approved / ⚠️ Approved with Conditions / ❌ Rejected  
**Comments:** [Any comments]

### Quality Assurance
**QA Lead:** [Name]  
**Date:** [YYYY-MM-DD]  
**Status:** ✅ Approved / ⚠️ Approved with Conditions / ❌ Rejected  
**Comments:** [Any comments]

**Test Engineer:** [Name]  
**Date:** [YYYY-MM-DD]  
**Status:** ✅ Approved / ⚠️ Approved with Conditions / ❌ Rejected  
**Comments:** [Any comments]

### Project Management
**Project Manager:** [Name]  
**Date:** [YYYY-MM-DD]  
**Status:** ✅ Approved / ⚠️ Approved with Conditions / ❌ Rejected  
**Comments:** [Any comments]

**Product Owner:** [Name]  
**Date:** [YYYY-MM-DD]  
**Status:** ✅ Approved / ⚠️ Approved with Conditions / ❌ Rejected  
**Comments:** [Any comments]

---

## Final Phase Status

**Phase Status:** 🟢 APPROVED / 🟡 CONDITIONAL APPROVAL / 🔴 REJECTED

### Next Steps
- **Next Phase:** [Phase N+1 Name]
- **Start Date:** [YYYY-MM-DD]
- **Sprint Duration:** [X] weeks
- **Key Objectives:** [Objectives]

### Release Decision
**Deploy to Production:** ✅ YES / ❌ NO / ⚠️ PENDING

**Deployment Date:** [YYYY-MM-DD] (if approved)

**Rollback Plan:** [Brief description of rollback procedure]

---

## Appendix

### Receipt Directory Structure
```
.floyd-receipts/phase[N]/
├── task[N]-[X]/
│   ├── 2026-01-21-143000-code-update.md
│   ├── 2026-01-21-150000-api-test.md
│   ├── 2026-01-21-154500-build.md
│   └── screenshots/
│       ├── before.png
│       ├── after.png
│       └── edit-mode.png
├── human-lens/
│   ├── level1-micro-tests.md
│   ├── level2-feature-tests.md
│   └── level3-phase-tests.md
├── performance/
│   ├── lighthouse.json
│   ├── bundle-size.json
│   └── api-timing.json
├── testing/
│   ├── unit-tests.log
│   ├── integration-tests.log
│   ├── e2e-tests.log
│   └── coverage-report.html
├── code-quality.md
├── testing.md
├── human-lens.md
├── performance.md
├── security.md
└── phase-audit.md (this file)
```

### Test Reports
- **Unit Tests:** [Link to report]
- **Integration Tests:** [Link to report]
- **E2E Tests:** [Link to report]
- **Coverage Report:** [Link to report]
- **Performance Tests:** [Link to report]
- **Security Scan:** [Link to report]

### Screenshots & Visual Evidence
- **Before:** [Link to directory]
- **After:** [Link to directory]
- **Comparisons:** [Link to directory]

### Performance Data
- **Lighthouse Report:** [Link to JSON]
- **Bundle Analysis:** [Link to report]
- **API Timing Data:** [Link to data]
- **Memory Profiling:** [Link to data]

### References
- **Implementation Plan:** [Link to plan]
- **Task Breakdown:** [Link to tasks]
- **Design Documents:** [Link to docs]
- **API Documentation:** [Link to docs]
- **User Stories:** [Link to stories]

---

*Phase Audit Report Version: 1.0*  
*Template Version: 1.0*  
*Last Updated: 2026-01-20*  
*Audited by: [Name]*  
*Approved by: [Name]*
