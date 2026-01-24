/**
 * Floyd CLI Dashboard Data Hooks Reference
 *
 * Complete list of all store actions and when/where to call them.
 * Import these hooks into your application files.
 */

import {useFloydStore, type FloydStore} from './store/floyd-store.js';

// ============================================================================
// 1. TOKEN USAGE & COST HOOKS
// ============================================================================

/**
 * Where: src/claude-api.ts (or your Claude integration)
 * When: After every Claude API response
 */
export function captureClaudeResponse(
	store: FloydStore,
	inputTokens: number,
	outputTokens: number,
	durationMs: number,
) {
	// Record token usage
	store.recordTokenUsage(inputTokens, outputTokens);

	// Calculate and track costs
	store.calculateCost(inputTokens, outputTokens);

	// Track response time
	store.recordResponseTime(durationMs);

	// Update activity (API calls are active work)
	store.updateActivityTime(true);

	console.log(
		`📊 Captured: ${inputTokens + outputTokens} tokens, ` +
		`$${((inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015).toFixed(4)}, ` +
		`${durationMs}ms`,
	);
}

/**
 * Where: src/claude-api.ts
 * When: On Claude API error
 */
export function captureClaudeError(
	store: FloydStore,
	error: Error,
	durationMs: number,
) {
	// Record error
	store.recordError({
		message: error.message,
		type: 'api',
	});

	// Track failed response time
	store.recordResponseTime(durationMs);

	console.error(`❌ Captured API Error: ${error.message}`);
}

// ============================================================================
// 2. TOOL EXECUTION HOOKS
// ============================================================================

/**
 * Where: src/tools/executor.ts (or your tool execution layer)
 * When: After every tool execution (success or failure)
 */
export function captureToolExecution(
	store: FloydStore,
	toolName: string,
	durationMs: number,
	success: boolean,
	error?: Error,
) {
	// Record tool metrics
	store.recordToolCall(toolName, durationMs, success);

	// Update activity (tool calls are active work)
	store.updateActivityTime(true);

	if (!success && error) {
		// Record tool error
		store.recordError({
			message: error.message,
			type: 'tool',
			toolName,
		});
		console.error(`❌ Captured Tool Error: ${toolName} - ${error.message}`);
	} else {
		console.log(
			`🔧 Captured Tool: ${toolName}, ` +
			`${durationMs}ms, ${success ? '✓ Success' : '✗ Failed'}`,
		);
	}
}

// ============================================================================
// 3. PRODUCTIVITY HOOKS
// ============================================================================

/**
 * Where: src/agent/orchestrator.ts (or your agent workflow)
 * When: After completing a task
 */
export function captureTaskCompletion(store: FloydStore) {
	// Record task completion
	store.recordTaskCompletion();

	// Update activity (task completion is active work)
	store.updateActivityTime(true);

	console.log('✅ Captured Task Completion');
}

/**
 * Where: src/agent/orchestrator.ts
 * When: On agent workflow error
 */
export function captureAgentError(store: FloydStore, error: Error) {
	// Record error
	store.recordError({
		message: error.message,
		type: 'system',
	});

	console.error(`❌ Captured Agent Error: ${error.message}`);
}

/**
 * Where: src/agent/orchestrator.ts
 * When: Starting new agent session
 */
export function captureSessionStart(store: FloydStore) {
	// Update streak (checks last activity date)
	store.updateStreak();

	// Update activity
	store.updateActivityTime(true);

	console.log('🚀 Captured Session Start');
}

// ============================================================================
// 4. ACTIVITY TRACKING HOOKS
// ============================================================================

/**
 * Where: src/ui/layouts/MainLayout.tsx
 * When: User is typing/interacting (captured via input events)
 */
export function captureUserActivity(store: FloydStore) {
	store.updateActivityTime(true);
}

/**
 * Where: src/ui/layouts/MainLayout.tsx (via setInterval)
 * When: No user activity detected for X minutes
 */
export function captureIdleTime(store: FloydStore) {
	store.updateActivityTime(false);
}

// ============================================================================
// 5. ERROR TRACKING HOOKS
// ============================================================================

/**
 * Where: Anywhere in codebase
 * When: Permission error occurs
 */
export function capturePermissionError(store: FloydStore, error: Error) {
	store.recordError({
		message: error.message,
		type: 'permission',
	});
	console.error(`❌ Captured Permission Error: ${error.message}`);
}

/**
 * Where: src/agent/orchestrator.ts
 * When: Error is resolved/fixed
 */
export function captureErrorResolution(
	store: FloydStore,
	errorId: string,
	resolutionTimeMs: number,
) {
	store.resolveError(errorId, resolutionTimeMs);
	console.log(`✅ Captured Error Resolution: ${errorId}`);
}

// ============================================================================
// 6. CONFIGURATION HOOKS
// ============================================================================

/**
 * Where: src/ui/config/SettingsPanel.tsx or command
 * When: User sets token budget
 */
export function setTokenBudget(store: FloydStore, budget: number) {
	store.setTokenBudget(budget);
	console.log(`💰 Token budget set to: ${budget}`);
}

// ============================================================================
// 7. DASHBOARD DATA SELECTORS (for rendering)
// ============================================================================

/**
 * Where: src/ui/layouts/MainLayout.tsx or MonitorDashboard.tsx
 * When: Getting dashboard data for rendering
 */
export function getDashboardData(store: FloydStore) {
	return {
		// Token Usage
		tokenUsage: {
			totalTokens: store.dashboardMetrics.tokenUsage.totalTokens,
			inputTokens: store.dashboardMetrics.tokenUsage.inputTokens,
			outputTokens: store.dashboardMetrics.tokenUsage.outputTokens,
			requestCount: store.dashboardMetrics.tokenUsage.requestCount,
			avgTokensPerRequest: store.dashboardMetrics.tokenUsage.avgTokensPerRequest,
			estimatedCost: store.dashboardMetrics.tokenUsage.estimatedCost,
			tokenBudget: store.dashboardMetrics.tokenUsage.tokenBudget,
			history: store.dashboardMetrics.tokenUsage.history,
		},

		// Tool Performance
		toolPerformance: store.dashboardMetrics.toolPerformance.tools,

		// Errors
		errors: store.dashboardMetrics.errors.errors,

		// Productivity
		productivity: {
			tasksCompleted: store.dashboardMetrics.productivity.tasksCompleted,
			sessionMinutes: store.dashboardMetrics.productivity.sessionMinutes,
			activeMinutes: store.dashboardMetrics.productivity.activeMinutes,
			idleMinutes: store.dashboardMetrics.productivity.idleMinutes,
			tasksPerHour: store.dashboardMetrics.productivity.tasksPerHour,
			activityScore: store.dashboardMetrics.productivity.activityScore,
			streak: store.dashboardMetrics.productivity.streak,
			bestStreak: store.dashboardMetrics.productivity.bestStreak,
			sessionsToday: store.dashboardMetrics.productivity.sessionsToday,
			tasksToday: store.dashboardMetrics.productivity.tasksToday,
			lastActivity: store.dashboardMetrics.productivity.lastActivity,
			history: store.dashboardMetrics.productivity.history,
		},

		// Response Time
		responseTime: {
			averageTime: store.dashboardMetrics.responseTime.averageTime,
			p50: store.dashboardMetrics.responseTime.p50,
			p95: store.dashboardMetrics.responseTime.p95,
			p99: store.dashboardMetrics.responseTime.p99,
		},

		// Costs
		costs: {
			totalCost: store.dashboardMetrics.costs.totalCost,
			inputCost: store.dashboardMetrics.costs.inputCost,
			outputCost: store.dashboardMetrics.costs.outputCost,
			costPerRequest: store.dashboardMetrics.costs.costPerRequest,
		},
	};
}

// ============================================================================
// 8. RESET & CLEAR HOOKS
// ============================================================================

/**
 * Where: src/cli/commands.ts (floyd reset command)
 * When: User resets all metrics
 */
export function resetAllDashboardData(store: FloydStore) {
	store.resetDashboardMetrics();
	console.log('🔄 All dashboard data reset');
}

/**
 * Where: src/agent/orchestrator.ts
 * When: Starting new session without clearing metrics
 */
export function resetSessionMetrics(store: FloydStore) {
	// Only reset current session data, keep history
	store.dashboardMetrics.productivity.tasksToday = 0;
	store.dashboardMetrics.productivity.sessionMinutes = 0;
	store.dashboardMetrics.tokenUsage.requestCount = 0;
	console.log('🔄 Session metrics reset');
}
