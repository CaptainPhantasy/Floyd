/**
 * Floyd CLI Dashboard Integration - Complete Summary
 *
 * All files created and integration steps to achieve 100% REAL DATA.
 */

// ============================================================================
// 📁 FILES CREATED
// ============================================================================

/**
 * 1. Dashboard Components (src/ui/dashboard/)
 *    - TokenUsageDashboard.tsx ✅
 *    - ToolPerformanceDashboard.tsx ✅
 *    - ProductivityDashboard.tsx ✅
 *    - ErrorAnalysisDashboard.tsx ✅
 *    - MemoryDashboard.tsx ✅
 *    - AdditionalDashboards.tsx ✅ (8 more dashboards)
 *    - index.ts ✅ (exports all dashboards)
 *
 * 2. Overlay Components (src/ui/overlays/)
 *    - FloydSessionSwitcherOverlay.tsx ✅ (Ctrl+K hotkey)
 *
 * 3. Tool Configuration (src/config/)
 *    - available-tools.ts ✅ (12 tools with states)
 *
 * 4. Store Components (src/store/)
 *    - dashboard-metrics.ts ✅ (types and helpers)
 *    - DASHBOARD_INTEGRATION_GUIDE.md ✅ (store patching guide)
 *
 * 5. Integration Guides (src/)
 *    - DATA_CAPTURE_INTEGRATION.md ✅ (where to add hooks)
 *    - dashboard-hooks.ts ✅ (all capture functions)
 */

// ============================================================================
// ✅ INTEGRATION STEPS (in order)
// ============================================================================

/**
 * STEP 1: Update Floyd Store Types
 * ----------------------------------------
 * File: src/store/floyd-store.ts
 *
 * 1. Import dashboard types at top:
 *    import {DashboardMetrics, DashboardSlice} from './dashboard-metrics.js';
 *
 * 2. Add DashboardSlice to FloydStore type:
 *    type FloydStore = ConversationSlice & ... & DashboardSlice & { ... };
 *
 * 3. Add DashboardSlice to interfaces section:
 *    interface DashboardSlice {
 *      dashboardMetrics: DashboardMetrics;
 *      recordTokenUsage: (input: number, output: number) => void;
 *      recordToolCall: (name: string, duration: number, success: boolean) => void;
 *      recordError: (error: {...}) => void;
 *      resolveError: (id: string, time?: number) => void;
 *      recordTaskCompletion: () => void;
 *      updateActivityTime: (active: boolean) => void;
 *      updateStreak: () => void;
 *      recordResponseTime: (duration: number) => void;
 *      calculateCost: (input: number, output: number) => void;
 *      setTokenBudget: (budget: number) => void;
 *      resetDashboardMetrics: () => void;
 *    }
 *
 * 4. Add initial state in store creation:
 *    dashboardMetrics: initialDashboardMetrics,
 *
 * 5. Add all actions in store creation (see DASHBOARD_INTEGRATION_GUIDE.md)
 *
 * 6. Add to partialize: dashboardMetrics: state.dashboardMetrics
 *
 * 7. Add selectors at bottom (see DASHBOARD_INTEGRATION_GUIDE.md)
 */

/**
 * STEP 2: Add Data Capture Hooks
 * ----------------------------------------
 * Files to update:
 *
 * 1. src/claude-api.ts (or your API integration file)
 *    - Import: import {captureClaudeResponse, captureClaudeError} from '../dashboard-hooks.js';
 *    - After successful API call: captureClaudeResponse(inputTokens, outputTokens, duration);
 *    - On API error: captureClaudeError(error, duration);
 *
 * 2. src/tools/executor.ts (or your tool execution file)
 *    - Import: import {captureToolExecution} from '../../dashboard-hooks.js';
 *    - After tool execution: captureToolExecution(toolName, duration, success, error);
 *
 * 3. src/agent/orchestrator.ts (or your agent workflow file)
 *    - Import: import {captureTaskCompletion, captureAgentError, captureSessionStart} from '../../dashboard-hooks.js';
 *    - On session start: captureSessionStart();
 *    - On task completion: captureTaskCompletion();
 *    - On agent error: captureAgentError(error);
 *
 * 4. src/ui/layouts/MainLayout.tsx
 *    - Import selectors:
 *      import {selectTokenUsage, selectToolPerformance, selectErrors,
 *              selectProductivity, selectResponseTimes, selectCosts}
 *            from '../../store/floyd-store.js';
 *
 *    - Get data:
 *      const tokenData = useFloydStore(selectTokenUsage);
 *      const toolData = useFloydStore(selectToolPerformance);
 *      const errorData = useFloydStore(selectErrors);
 *      const productivityData = useFloydStore(selectProductivity);
 *      const responseTimeData = useFloydStore(selectResponseTimes);
 *      const costData = useFloydStore(selectCosts);
 *
 *    - Add idle timer in useEffect:
 *      useEffect(() => {
 *        const timer = setInterval(() => {
 *          useFloydStore.getState().updateActivityTime(false);
 *        }, 60000);
 *        return () => clearInterval(timer);
 *      }, []);
 *
 *    - Pass data to dashboards in Monitor overlay
 */

/**
 * STEP 3: Remove Mock Data from Dashboards
 * ----------------------------------------
 * Update each dashboard component:
 *
 * 1. TokenUsageDashboard.tsx
 *    - Change: data?: TokenUsageData → data: TokenUsageData (required)
 *    - Remove: const usageData: TokenUsageData = data || {...mock...}
 *    - Replace with: if (!data) return <NoDataMessage />
 *    - Use: const {...} = data;
 *
 * 2. ToolPerformanceDashboard.tsx
 *    - Change: tools?: Record<string, ToolStats> → tools: Record<string, ToolStats>
 *    - Remove mock fallback
 *
 * 3. ProductivityDashboard.tsx
 *    - Change: data?: ProductivityData → data: ProductivityData
 *    - Remove mock fallback
 *
 * 4. ErrorAnalysisDashboard.tsx
 *    - Change: errors?: ErrorData[] → errors: ErrorData[]
 *    - Remove mock fallback
 *
 * 5. MemoryDashboard.tsx
 *    - Change props to require data
 *    - Remove mock fallback
 *
 * 6. All AdditionalDashboards.tsx components
 *    - Change all data props to required
 *    - Remove mock fallbacks
 */

/**
 * STEP 4: Create Monitor Dashboard Component
 * ----------------------------------------
 * File: src/ui/monitor/MonitorDashboard.tsx
 *
 * Create a new component that:
 * 1. Imports all dashboard components
 * 2. Uses store selectors to get real data
 * 3. Renders dashboards in a grid layout
 * 4. Supports compact/full modes
 *
 * See DATA_CAPTURE_INTEGRATION.md for example implementation.
 */

/**
 * STEP 5: Add Monitor Command/Hotkey
 * ----------------------------------------
 * File: src/ui/layouts/MainLayout.tsx
 *
 * 1. Monitor already uses Ctrl+M hotkey (check useInput handler)
 * 2. Ensure showMonitor state is in store
 * 3. Render MonitorDashboard when showMonitor is true
 *
 * Already implemented! ✅
 */

/**
 * STEP 6: Update Session Panel
 * ----------------------------------------
 * File: src/ui/panels/SessionPanel.tsx
 *
 * 1. Import tool defaults:
 *    import {getDefaultToolStates} from '../../config/available-tools.js';
 *
 * 2. Use defaults if no tools provided:
 *    const displayTools = tools?.length > 0 ? tools : getDefaultToolStates();
 *
 * Already implemented! ✅
 */

/**
 * STEP 7: Update Help Overlay
 * ----------------------------------------
 * File: src/ui/overlays/HelpOverlay.tsx
 *
 * 1. Ensure it shows all 12 tools with their states
 * 2. Display comprehensive hotkey list
 *
 * Already implemented! ✅
 */

/**
 * STEP 8: Test Data Capture
 * ----------------------------------------
 *
 * 1. Run Floyd CLI
 * 2. Execute some commands:
 *    - Send a message (should capture tokens, cost, response time)
 *    - Ask agent to use a tool (should capture tool metrics)
 *    - Cause an error (should capture error)
 *    - Complete a task (should capture productivity)
 *    - Wait idle for 1 minute (should capture idle time)
 * 3. Open Monitor dashboard (Ctrl+M)
 * 4. Verify all metrics are non-zero and accurate
 * 5. Check console for data capture logs
 */

/**
 * STEP 9: Verify Dashboard Data
 * ----------------------------------------
 *
 * 1. Check TokenUsageDashboard:
 *    - Total tokens > 0
 *    - Input/output tokens match API usage
 *    - Cost is calculated correctly
 *    - History has entries
 *
 * 2. Check ToolPerformanceDashboard:
 *    - Tools have call counts
 *    - Success/failure counts are accurate
 *    - Average duration is calculated
 *    - Last used timestamp is set
 *
 * 3. Check ProductivityDashboard:
 *    - Tasks completed > 0
 *    - Session time is tracking
 *    - Active/idle minutes sum to session
 *    - Streak is updating
 *
 * 4. Check ErrorAnalysisDashboard:
 *    - Errors are logged
 *    - Error types are correct
 *    - Resolution tracking works
 *
 * 5. Check ResponseTimeDashboard:
 *    - Response times are recorded
 *    - P50/P95/P99 are calculated
 *    - Average is accurate
 *
 * 6. Check CostAnalysisDashboard:
 *    - Total cost matches token usage
 *    - Input/output costs split correctly
 *    - Cost per request is accurate
 */

// ============================================================================
// 🎯 DATA CAPTURE CHECKLIST
// ============================================================================

export const INTEGRATION_CHECKLIST = {
	// Store Integration
	storeTypesAdded: false,
	dashboardSliceAdded: false,
	initialStateAdded: false,
	actionsAdded: false,
	selectorsAdded: false,
	partializeUpdated: false,

	// Data Capture Hooks
	claudeResponseCapture: false,
	claudeErrorCapture: false,
	toolExecutionCapture: false,
	taskCompletionCapture: false,
	agentErrorCapture: false,
	sessionStartCapture: false,
	idleTimeTracking: false,
	userActivityTracking: false,

	// Dashboard Updates
	tokenUsageDashboardUpdated: false,
	toolPerformanceDashboardUpdated: false,
	productivityDashboardUpdated: false,
	errorAnalysisDashboardUpdated: false,
	memoryDashboardUpdated: false,
	additionalDashboardsUpdated: false,

	// UI Integration
	monitorDashboardCreated: false,
	mainLayoutConnected: false,
	selectorUsage: false,

	// Testing
	dataCaptureTested: false,
	dashboardsVerified: false,
	metricsAccuracyVerified: false,
};

// ============================================================================
// 📊 EXPECTED METRICS (after 1 session)
// ============================================================================

export const EXPECTED_METRICS_AFTER_SESSION = {
	// After sending 1 message to Claude
	tokenUsage: {
		totalTokens: 1000, // approx (input + output)
		inputTokens: 500, // approx
		outputTokens: 500, // approx
		requestCount: 1,
		estimatedCost: 0.009, // $0.003 * 0.5 + $0.015 * 0.5
		historyLength: 1,
	},

	// After executing 1 tool
	toolPerformance: {
		calls: 1,
		successes: 1,
		failures: 0,
		totalDuration: 1000, // 1 second
		avgDuration: 1000,
		successRate: 1.0,
		lastUsed: 'recent timestamp',
	},

	// After 1 minute of use
	productivity: {
		tasksCompleted: 0, // unless agent completed a task
		sessionMinutes: 1,
		activeMinutes: 0.9, // 90% active time
		idleMinutes: 0.1, // 10% idle time
		tasksPerHour: 0,
		activityScore: 0,
		streak: 1,
		bestStreak: 1,
	},

	// After 1 API call
	responseTime: {
		averageTime: 2000, // 2 seconds
		p50: 2000,
		p95: 2000,
		p99: 2000,
	},

	// After 1 API call
	costs: {
		totalCost: 0.009,
		inputCost: 0.0015, // 500/1000 * $0.003
		outputCost: 0.0075, // 500/1000 * $0.015
		costPerRequest: 0.009,
	},
};

// ============================================================================
// 🔧 TROUBLESHOOTING
// ============================================================================

export const TROUBLESHOOTING_GUIDE = {
	// Problem: Dashboards show "No data available"
	problem1: {
		issue: 'Dashboards show "No data available"',
		causes: [
			'Store actions not called',
			'Selectors not connected',
			'Mock data not removed from dashboards',
		],
		solutions: [
			'Check that capture hooks are called',
			'Verify selectors return data',
			'Remove all || mock fallbacks',
			'Check console for data capture logs',
		],
	},

	// Problem: Token counts are zero
	problem2: {
		issue: 'Token counts remain at 0',
		causes: [
			'captureClaudeResponse() not called',
			'API response not captured',
			'Store not updated',
		],
		solutions: [
			'Add captureClaudeResponse() after API call',
			'Check API integration file',
			'Verify store action is working',
			'Check console for capture logs',
		],
	},

	// Problem: Tool metrics not recording
	problem3: {
		issue: 'Tool metrics show no data',
		causes: [
			'captureToolExecution() not called',
			'Tool executor not hooked',
			'Store not updated',
		],
		solutions: [
			'Add captureToolExecution() to tool executor',
			'Check tool execution file',
			'Verify toolName matches tool list',
			'Check console for tool logs',
		],
	},

	// Problem: Costs are zero or wrong
	problem4: {
		issue: 'Cost calculations are incorrect',
		causes: [
			'calculateCost() not called',
			'Cost constants wrong',
			'Token counts wrong',
		],
		solutions: [
			'Add calculateCost() after token capture',
			'Update COST_CONFIG in dashboard-metrics.ts',
			'Verify API pricing',
			'Check input/output token split',
		],
	},

	// Problem: Activity time not updating
	problem5: {
		issue: 'Session time not increasing',
		causes: [
			'updateActivityTime() not called',
			'Idle timer not set',
			'Store not persisting',
		],
		solutions: [
			'Add idle timer to MainLayout',
			'Call updateActivityTime() on API/tool calls',
			'Check store persistence',
			'Verify console logs',
		],
	},
};

// ============================================================================
// 📚 REFERENCE DOCUMENTS
// ============================================================================

export const DOCUMENTATION = {
	dashboardMetricsTypes: '/src/store/dashboard-metrics.ts',
	storeIntegrationGuide: '/src/store/DASHBOARD_INTEGRATION_GUIDE.md',
	dataCaptureGuide: '/src/DATA_CAPTURE_INTEGRATION.md',
	dashboardHooks: '/src/dashboard-hooks.ts',
	availableTools: '/src/config/available-tools.ts',
	dashboardsIndex: '/src/ui/dashboard/index.ts',
};

// ============================================================================
// ✅ COMPLETION CRITERIA
// ============================================================================

/**
 * Floyd CLI dashboards are fully integrated with REAL DATA when:
 *
 * ✅ All 15 dashboard components require real data props (no optionals)
 * ✅ All mock data fallbacks removed (|| data || mock)
 * ✅ Floyd store includes DashboardMetrics slice
 * ✅ All store actions implemented and working
 * ✅ All selectors return real data from store
 * ✅ Data capture hooks added to API integration
 * ✅ Data capture hooks added to tool executor
 * ✅ Data capture hooks added to agent workflow
 * ✅ Idle time tracking in MainLayout
 * ✅ Monitor dashboard displays all 15 dashboards
 * ✅ All dashboards show non-zero metrics after usage
 * ✅ Console logs confirm data capture on every action
 * ✅ Metrics persist across sessions (store persistence)
 * ✅ Token costs match API pricing exactly
 * ✅ Tool metrics accurately reflect executions
 * ✅ Error tracking captures and resolves issues
 * ✅ Productivity metrics track real activity
 * ✅ Response times match actual API durations
 * ✅ All dashboards update in real-time
 *
 * When ALL above criteria are met: 100% REAL DATA, NO MOCKS! 🎉
 */

export default {
	INTEGRATION_CHECKLIST,
	EXPECTED_METRICS_AFTER_SESSION,
	TROUBLESHOOTING_GUIDE,
	DOCUMENTATION,
};
