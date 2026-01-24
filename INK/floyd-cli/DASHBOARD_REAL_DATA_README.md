# Floyd CLI Dashboard - Real Data Integration

> **Achieve 100% REAL DATA with NO MOCKS** for all 15 dashboards

## 🎯 Goal

Replace all mock/fallback data in Floyd CLI dashboards with **real metrics** captured from actual usage:
- Token usage and costs
- Tool performance metrics
- Productivity and activity tracking
- Error analysis and resolution
- Response time statistics
- And 10 more dashboard metrics

## 📁 Files Created

### Core Infrastructure
| File | Purpose |
|-------|---------|
| `src/store/dashboard-metrics.ts` | Types, helpers, initial state for all dashboard metrics |
| `src/store/DASHBOARD_INTEGRATION_GUIDE.md` | Step-by-step guide to patch floyd-store.ts |
| `src/dashboard-hooks.ts` | All data capture functions (hooks) to call from your code |
| `src/DATA_CAPTURE_INTEGRATION.md` | Where to add hooks in your existing codebase |
| `INTEGRATION_COMPLETE.md` | Complete checklist and troubleshooting guide |

### Dashboard Components
| File | Metrics |
|------|---------|
| `src/ui/dashboard/TokenUsageDashboard.tsx` | Token consumption, costs, trends |
| `src/ui/dashboard/ToolPerformanceDashboard.tsx` | Tool stats, success rates, duration |
| `src/ui/dashboard/ProductivityDashboard.tsx` | Tasks, streaks, time tracking |
| `src/ui/dashboard/ErrorAnalysisDashboard.tsx` | Error patterns, categories, resolution |
| `src/ui/dashboard/MemoryDashboard.tsx` | Cache stats, hit rates, memory usage |
| `src/ui/dashboard/AdditionalDashboards.tsx` | 8 more dashboards (code quality, agent activity, etc.) |

### Other Components
| File | Purpose |
|-------|---------|
| `src/config/available-tools.ts` | 12 tools with default states |
| `src/ui/overlays/FloydSessionSwitcherOverlay.tsx` | Session switching (Ctrl+K) |

## 🚀 Quick Start - 5 Steps to Real Data

### Step 1: Update Floyd Store (5 minutes)

Open `src/store/floyd-store.ts` and follow `DASHBOARD_INTEGRATION_GUIDE.md`:

```bash
# 1. Import dashboard types (at top)
import {DashboardMetrics, DashboardSlice, initialDashboardMetrics} from './dashboard-metrics.js';

# 2. Add DashboardSlice to FloydStore type
type FloydStore = ... & DashboardSlice & { ... };

# 3. Add interface definition
interface DashboardSlice { ... } # See guide for complete interface

# 4. Add to store creation
export const useFloydStore = create<FloydStore>()(
  persist(
    (set, get) => ({
      // ... existing state ...
      dashboardMetrics: initialDashboardMetrics,

      // Add all dashboard actions
      recordTokenUsage: (input, output) => { ... },
      recordToolCall: (name, duration, success) => { ... },
      // ... See guide for all actions
    }),
    { partialize: (state) => ({ ..., dashboardMetrics: state.dashboardMetrics }) }
  )
);
```

### Step 2: Add Data Capture Hooks (10 minutes)

Open `src/dashboard-hooks.ts` and copy the hooks you need:

**For Claude API (`src/claude-api.ts`):**
```typescript
import {captureClaudeResponse, captureClaudeError} from '../dashboard-hooks.js';

// After successful API call
const response = await anthropic.messages.create({...});
captureClaudeResponse(
  response.usage.input_tokens,
  response.usage.output_tokens,
  Date.now() - startTime
);

// On API error
catch (error) {
  captureClaudeError(error, Date.now() - startTime);
}
```

**For Tool Execution (`src/tools/executor.ts`):**
```typescript
import {captureToolExecution} from '../../dashboard-hooks.js';

// After tool execution
const result = await tool.execute(args);
captureToolExecution(toolName, duration, true);

// On tool error
catch (error) {
  captureToolExecution(toolName, duration, false, error);
}
```

**For Agent Workflow (`src/agent/orchestrator.ts`):**
```typescript
import {captureTaskCompletion, captureAgentError, captureSessionStart} from '../../dashboard-hooks.js';

// On session start
captureSessionStart();

// On task completion
captureTaskCompletion();

// On agent error
catch (error) {
  captureAgentError(error);
}
```

### Step 3: Connect Dashboards to Store (5 minutes)

Open `src/ui/layouts/MainLayout.tsx`:

```typescript
// Import selectors
import {
  selectTokenUsage,
  selectToolPerformance,
  selectErrors,
  selectProductivity,
  selectResponseTimes,
  selectCosts,
} from '../../store/floyd-store.js';

export function MainLayout({...}: MainLayoutProps) {
  // Get real data from store
  const tokenData = useFloydStore(selectTokenUsage);
  const toolData = useFloydStore(selectToolPerformance);
  const errorData = useFloydStore(selectErrors);
  const productivityData = useFloydStore(selectProductivity);
  const responseTimeData = useFloydStore(selectResponseTimes);
  const costData = useFloydStore(selectCosts);

  // Add idle tracking
  useEffect(() => {
    const timer = setInterval(() => {
      useFloydStore.getState().updateActivityTime(false);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Pass real data to Monitor dashboard
  return (
    <>
      {showMonitor && (
        <MonitorDashboard>
          <TokenUsageDashboard data={tokenData} />
          <ToolPerformanceDashboard tools={toolData} />
          <ErrorAnalysisDashboard errors={errorData} />
          <ProductivityDashboard data={productivityData} />
          <ResponseTimeDashboard data={responseTimeData} />
          <CostAnalysisDashboard data={costData} />
          {/* Other dashboards with their data */}
        </MonitorDashboard>
      )}
    </>
  );
}
```

### Step 4: Remove Mock Data (5 minutes)

Update each dashboard component to require real data:

**Before:**
```typescript
export interface TokenUsageDashboardProps {
  data?: TokenUsageData; // ← Optional (bad!)
}

export function TokenUsageDashboard({data}: TokenUsageDashboardProps) {
  const usageData = data || { // ← Mock fallback (bad!)
    totalTokens: 0,
    inputTokens: 0,
    // ...
  };
}
```

**After:**
```typescript
export interface TokenUsageDashboardProps {
  data: TokenUsageData; // ← Required (good!)
}

export function TokenUsageDashboard({data}: TokenUsageDashboardProps) {
  if (!data) {
    return <Text>No data available</Text>;
  }

  const {totalTokens, inputTokens, ...} = data;
  // Use real data only!
}
```

Do this for all 15 dashboards!

### Step 5: Test & Verify (5 minutes)

```bash
# 1. Run Floyd CLI
npm run dev

# 2. Send a message
# Expected: Token usage, cost, response time captured

# 3. Ask agent to use a tool
# Expected: Tool metrics captured

# 4. Open Monitor (Ctrl+M)
# Expected: All dashboards show real data

# 5. Check console for capture logs
# Expected: "📊 Captured: 1234 tokens...", "🔧 Captured Tool: file-editor..."
```

## ✅ Verification Checklist

Use `INTEGRATION_COMPLETE.md` to verify:

- [ ] Store types include DashboardMetrics
- [ ] Store actions implemented
- [ ] Store selectors added
- [ ] Data capture hooks in API integration
- [ ] Data capture hooks in tool executor
- [ ] Data capture hooks in agent workflow
- [ ] Idle time tracking in MainLayout
- [ ] All dashboards require real data (no optionals)
- [ ] All mock fallbacks removed
- [ ] Monitor dashboard renders all dashboards
- [ ] Metrics persist across sessions
- [ ] Console logs show data capture
- [ ] All dashboards show non-zero data after usage

## 🔧 Configuration

### API Pricing (update in `dashboard-metrics.ts`)

```typescript
const COST_CONFIG = {
  // Claude API
  INPUT_COST_PER_1K: 0.003,
  OUTPUT_COST_PER_1K: 0.015,

  // Or GPT-4
  // INPUT_COST_PER_1K: 0.03,
  // OUTPUT_COST_PER_1K: 0.06,
};
```

### Token Budget (optional)

```typescript
useFloydStore.getState().setTokenBudget(100000); // 100K tokens
```

## 📊 Dashboard Metrics Reference

| Dashboard | Data Source | Metrics |
|-----------|--------------|----------|
| Token Usage | Claude API calls | Total tokens, input/output, cost, history |
| Tool Performance | Tool executions | Calls, successes, failures, duration, success rate |
| Productivity | Agent workflow | Tasks completed, session time, streaks |
| Errors | All errors | Message, type, resolution, count |
| Memory | Cache implementation | Entries, size, hits/misses, hit rate |
| Code Quality | Test/lint output | Coverage, errors, score |
| Agent Activity | Agent orchestrator | Active agents, tasks, completion rate |
| Response Time | API/tool calls | Average, P50, P95, P99 |
| Cost Analysis | Token usage * pricing | Total, input, output, per request |
| Workflow | Task patterns | Common workflows, counts |
| File Activity | File operations | Read/write/modify counts |
| Git Activity | Git operations | Commits, branches, merges, last commit |
| Browser Session | Browser tool | Pages, screenshots, interactions |
| Resources | System monitor | Disk, network, temp files, open files |
| Session History | Store persistence | Recent sessions, duration, tasks |

## 🐛 Troubleshooting

**Problem: Dashboards show "No data available"**
- Solution: Check that data capture hooks are called, verify selectors return data

**Problem: Token counts are zero**
- Solution: Add `captureClaudeResponse()` after API call, check console logs

**Problem: Tool metrics not recording**
- Solution: Add `captureToolExecution()` to tool executor, verify toolName matches

**Problem: Costs are wrong**
- Solution: Update `COST_CONFIG` in dashboard-metrics.ts, check pricing

**Problem: Activity time not updating**
- Solution: Verify idle timer in MainLayout, call `updateActivityTime()` on interactions

See `INTEGRATION_COMPLETE.md` for complete troubleshooting guide.

## 📚 Documentation Files

- `src/store/dashboard-metrics.ts` - Types, helpers, configuration
- `src/store/DASHBOARD_INTEGRATION_GUIDE.md` - Store patching instructions
- `src/DATA_CAPTURE_INTEGRATION.md` - Where to add hooks
- `src/dashboard-hooks.ts` - All capture functions
- `INTEGRATION_COMPLETE.md` - Checklist, expected metrics, troubleshooting

## 🎉 Result

After completing all 5 steps, Floyd CLI dashboards will display **100% REAL DATA** captured from actual usage:

✅ Real token usage and costs
✅ Real tool performance metrics
✅ Real productivity tracking
✅ Real error analysis
✅ Real response time statistics
✅ All other dashboards with real data

**NO MOCKS!** 🚀

---

**Total Time:** ~30 minutes
**Files to Edit:** 4 (floyd-store.ts, MainLayout.tsx, API integration, Tool executor)
**Files Created:** 10 (dashboard components, guides, hooks)
**Lines of Code:** ~2000 (dashboards) + ~500 (store) + ~300 (hooks)

**Questions?** Check the guide files or refer to `INTEGRATION_COMPLETE.md`.
