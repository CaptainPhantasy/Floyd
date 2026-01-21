# HUMAN LENS Smoke Test - [Feature/Phase Name]

**Tester:** [Your Name]  
**Date:** [YYYY-MM-DD]  
**Environment:** [Development/Staging/Production]  
**Browser:** [Name + Version]  
**Test Level:** [1/2/3/4]  
**Device:** [Desktop/Mobile/Tablet]

---

## Pre-Test Checklist

### Build & Deploy
- [ ] Application builds successfully
- [ ] No TypeScript errors
- [ ] All dependencies installed
- [ ] Database migrations run (if applicable)
- [ ] Test data prepared
- [ ] Server running on correct port
- [ ] Environment variables configured

### Tools Ready
- [ ] Browser DevTools open
- [ ] Console visible
- [ ] Network tab monitoring
- [ ] Screen capture tool ready
- [ ] Performance profiler ready

---

## Test Steps

### 1. Basic Functionality

| Step | Description | Expected Result | Actual Result | Pass/Fail | Notes |
|------|-------------|-----------------|---------------|-----------|-------|
| 1.1 | [Action description] | [Expected outcome] | [Actual outcome] | ✅/❌ | [Notes] |
| 1.2 | [Action description] | [Expected outcome] | [Actual outcome] | ✅/❌ | [Notes] |
| 1.3 | [Action description] | [Expected outcome] | [Actual outcome] | ✅/❌ | [Notes] |

### 2. Edge Cases

| Scenario | Description | Expected Result | Actual Result | Pass/Fail | Notes |
|----------|-------------|-----------------|---------------|-----------|-------|
| 2.1 | Empty state | [Behavior] | [Actual] | ✅/❌ | [Notes] |
| 2.2 | Error state | [Behavior] | [Actual] | ✅/❌ | [Notes] |
| 2.3 | Maximum input | [Behavior] | [Actual] | ✅/❌ | [Notes] |
| 2.4 | Special characters | [Behavior] | [Actual] | ✅/❌ | [Notes] |
| 2.5 | Rapid actions | [Behavior] | [Actual] | ✅/❌ | [Notes] |

### 3. Integration Tests

| Test | Description | Expected Result | Actual Result | Pass/Fail | Notes |
|------|-------------|-----------------|---------------|-----------|-------|
| 3.1 | Data persists | [Data saved correctly] | [Actual] | ✅/❌ | [Notes] |
| 3.2 | API calls succeed | [200 OK responses] | [Actual] | ✅/❌ | [Notes] |
| 3.3 | UI updates correctly | [Changes visible] | [Actual] | ✅/❌ | [Notes] |
| 3.4 | Cross-component sync | [All components update] | [Actual] | ✅/❌ | [Notes] |
| 3.5 | Reload persistence | [Data survives reload] | [Actual] | ✅/❌ | [Notes] |

### 4. Performance Metrics

| Metric | Measurement | Threshold | Actual | Pass/Fail | Notes |
|--------|-------------|-----------|--------|-----------|-------|
| 4.1 | Page Load Time | < 2s | [X]s | ✅/❌ | [Notes] |
| 4.2 | Time to Interactive | < 3s | [X]s | ✅/❌ | [Notes] |
| 4.3 | First Contentful Paint | < 1s | [X]s | ✅/❌ | [Notes] |
| 4.4 | API Response Time | < 500ms | [X]ms | ✅/❌ | [Notes] |
| 4.5 | Render Time | < 100ms | [X]ms | ✅/❌ | [Notes] |
| 4.6 | Memory Usage | < 500MB | [X]MB | ✅/❌ | [Notes] |
| 4.7 | Bundle Size | < +10% change | [X]% | ✅/❌ | [Notes] |

### 5. Visual Regression

| Check | Description | Expected | Actual | Pass/Fail | Notes |
|-------|-------------|----------|--------|-----------|-------|
| 5.1 | No layout shifts | Stable layout | [Actual] | ✅/❌ | [Notes] |
| 5.2 | Colors match design | Design tokens | [Actual] | ✅/❌ | [Notes] |
| 5.3 | Fonts render correctly | SF Pro stack | [Actual] | ✅/❌ | [Notes] |
| 5.4 | Responsive mobile | Works on mobile | [Actual] | ✅/❌ | [Notes] |
| 5.5 | Responsive tablet | Works on tablet | [Actual] | ✅/❌ | [Notes] |
| 5.6 | Dark mode consistency | Theme applies | [Actual] | ✅/❌ | [Notes] |
| 5.7 | Light mode consistency | Theme applies | [Actual] | ✅/❌ | [Notes] |

### 6. Accessibility (WCAG 2.1 AA)

| Check | Description | Pass/Fail | Notes |
|-------|-------------|-----------|-------|
| 6.1 | Keyboard navigation works | ✅/❌ | [Notes] |
| 6.2 | Screen reader announces changes | ✅/❌ | [Notes] |
| 6.3 | Color contrast ratio ≥ 4.5:1 | ✅/❌ | [Notes] |
| 6.4 | Focus indicators visible | ✅/❌ | [Notes] |
| 6.5 | ARIA labels present | ✅/❌ | [Notes] |
| 6.6 | Form error messages clear | ✅/❌ | [Notes] |

---

## Issues Found

### Critical Issues (Block Release)
| # | Issue | Severity | Screenshot | Steps to Reproduce |
|---|-------|----------|------------|-------------------|
| 1 | [Description] | Critical | [Link] | [Steps] |

### Major Issues (Should Fix)
| # | Issue | Severity | Screenshot | Steps to Reproduce |
|---|-------|----------|------------|-------------------|
| 1 | [Description] | Major | [Link] | [Steps] |

### Minor Issues (Nice to Fix)
| # | Issue | Severity | Screenshot | Steps to Reproduce |
|---|-------|----------|------------|-------------------|
| 1 | [Description] | Minor | [Link] | [Steps] |

---

## Console Output

### Errors
```
[Paste any console errors here]
[If no errors, state: "No errors found"]
```

### Warnings
```
[Paste any console warnings here]
[If no warnings, state: "No warnings found"]
```

### Info Logs
```
[Paste relevant info logs here]
```

---

## Network Analysis

### API Calls

| Endpoint | Method | Status | Time | Size | Pass/Fail |
|----------|--------|--------|------|------|-----------|
| [URL] | [GET/POST/etc] | [200/etc] | [X]ms | [X]KB | ✅/❌ |

### Failed Requests
```
[List any failed network requests]
[If none, state: "No failed requests"]
```

### Slow Requests (> 1s)
```
[List any requests taking longer than 1 second]
[If none, state: "All requests under 1s"]
```

---

## Screenshots

| Screenshot | Description | Path |
|------------|-------------|------|
| 1 | [Description] | `[path].png` |
| 2 | [Description] | `[path].png` |
| 3 | [Description] | `[path].png` |

### Before/After Comparisons
| Before | After | Comparison |
|--------|-------|------------|
| ![Before](path/to/before.png) | ![After](path/to/after.png) | ![Diff](path/to/diff.png) |

---

## Test Result

### Overall Status
**Status:** ✅ PASS / ❌ FAIL / ⚠️ PASS WITH CONDITIONS

### Pass Rate by Category

| Category | Pass | Fail | Pass Rate |
|----------|------|------|-----------|
| Basic Functionality | [X] | [Y] | [Z]% |
| Edge Cases | [X] | [Y] | [Z]% |
| Integration | [X] | [Y] | [Z]% |
| Performance | [X] | [Y] | [Z]% |
| Visual Regression | [X] | [Y] | [Z]% |
| Accessibility | [X] | [Y] | [Z]% |
| **Overall** | **[X]** | **[Y]** | **[Z]%** |

### Confidence Score
**Score:** [X]%

**Rationale:**
- [Strength 1]
- [Strength 2]
- [Concern 1] (if any)
- [Concern 2] (if any)

### Block Release?
**Decision:** YES / NO

**Reasoning:** [Explanation]

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---

## Tester Sign-Off

**Tester Name:** [Signature]  
**Date:** [YYYY-MM-DD]  
**Time:** [HH:MM]  
**Approved:** ✅ YES / ❌ NO  

**Additional Notes:**
[Any additional observations, UX feedback, suggestions for improvement]

---

## Appendix

### Test Environment Details
- **OS:** [Name + Version]
- **Browser:** [Name + Version]
- **Screen Resolution:** [Width x Height]
- **CPU:** [Processor]
- **RAM:** [Amount]
- **Network:** [WiFi/Ethernet/3G/4G/5G]
- **Device:** [Make + Model]

### Tools Used
- [ ] Chrome DevTools
- [ ] Firefox Developer Tools
- [ ] Safari Web Inspector
- [ ] axe DevTools
- [ ] Lighthouse
- [ ] [Other tool]

### Test Data
- **Sessions Created:** [X]
- **Files Uploaded:** [X]
- **API Calls Made:** [X]
- **Errors Encountered:** [X]

### References
- Implementation Plan: [Link]
- Task Requirements: [Link]
- Design Mockups: [Link]
- API Documentation: [Link]

---

*Smoke Test Template Version: 1.0*  
*Last Updated: 2026-01-20*
