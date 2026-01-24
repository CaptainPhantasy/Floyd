/**
 * Tool Registry - Floyd Wrapper
 *
 * Central registration point for all Floyd tools.
 * All tool implementations are copied from FLOYD_CLI and wrapped without logic changes.
 */

import { toolRegistry } from './tool-registry.js';

// ============================================================================
// Import all tools
// ============================================================================

// Git tools
import { gitStatusTool } from './git/status.js';
import { gitDiffTool } from './git/diff.js';
import { gitLogTool } from './git/log.js';
import { gitCommitTool } from './git/commit.js';
import { gitStageTool } from './git/stage.js';
import { gitUnstageTool } from './git/unstage.js';
import { gitBranchTool } from './git/branch.js';
import { isProtectedBranchTool } from './git/is-protected.js';

// Cache tools
import { cacheStoreTool, cacheRetrieveTool, cacheDeleteTool, cacheClearTool, cacheListTool, cacheSearchTool, cacheStatsTool, cachePruneTool, cacheStorePatternTool, cacheStoreReasoningTool, cacheLoadReasoningTool, cacheArchiveReasoningTool } from './cache/index.js';

// File tools
import { readFileTool, writeTool, editFileTool, searchReplaceTool } from './file/index.js';

// Search tools
import { grepTool, codebaseSearchTool } from './search/index.js';

// System tools
import { runTool, askUserTool } from './system/index.js';

// Browser tools
import { browserStatusTool, browserNavigateTool, browserReadPageTool, browserScreenshotTool, browserClickTool, browserTypeTool, browserFindTool, browserGetTabsTool, browserCreateTabTool } from './browser/index.js';

// Patch tools
import { applyUnifiedDiffTool, editRangeTool, insertAtTool, deleteRangeTool, assessPatchRiskTool } from './patch/index.js';

// ============================================================================
// Re-export all tools
// ============================================================================

export * from './git/git-core.js';
export { gitStatusTool } from './git/status.js';
export { gitDiffTool } from './git/diff.js';
export { gitLogTool } from './git/log.js';
export { gitCommitTool } from './git/commit.js';
export { gitStageTool } from './git/stage.js';
export { gitUnstageTool } from './git/unstage.js';
export { gitBranchTool } from './git/branch.js';
export { isProtectedBranchTool } from './git/is-protected.js';
export * from './cache/cache-core.js';
export { cacheStoreTool, cacheRetrieveTool, cacheDeleteTool, cacheClearTool, cacheListTool, cacheSearchTool, cacheStatsTool, cachePruneTool, cacheStorePatternTool, cacheStoreReasoningTool, cacheLoadReasoningTool, cacheArchiveReasoningTool } from './cache/index.js';
export * from './file/file-core.js';
export { readFileTool } from './file/index.js';
export * from './search/search-core.js';
export { grepTool, codebaseSearchTool } from './search/index.js';
export { runTool, askUserTool } from './system/index.js';
export { browserStatusTool, browserNavigateTool, browserReadPageTool, browserScreenshotTool, browserClickTool, browserTypeTool, browserFindTool, browserGetTabsTool, browserCreateTabTool } from './browser/index.js';
export * from './patch/patch-core.js';
export { applyUnifiedDiffTool, editRangeTool, insertAtTool, deleteRangeTool, assessPatchRiskTool } from './patch/index.js';

// ============================================================================
// Tool Registration
// ============================================================================

/**
 * Flag to track if core tools have been registered
 */
let coreToolsRegistered = false;

/**
 * Register all core tools with the tool registry
 */
export function registerCoreTools(): void {
  // Prevent duplicate registration
  if (coreToolsRegistered) {
    return;
  }

  coreToolsRegistered = true;
	// Git tools (8 tools)
	toolRegistry.register(gitStatusTool);
	toolRegistry.register(gitDiffTool);
	toolRegistry.register(gitLogTool);
	toolRegistry.register(gitCommitTool);
	toolRegistry.register(gitStageTool);
	toolRegistry.register(gitUnstageTool);
	toolRegistry.register(gitBranchTool);
	toolRegistry.register(isProtectedBranchTool);

	// Cache tools (11 tools)
	toolRegistry.register(cacheStoreTool);
	toolRegistry.register(cacheRetrieveTool);
	toolRegistry.register(cacheDeleteTool);
	toolRegistry.register(cacheClearTool);
	toolRegistry.register(cacheListTool);
	toolRegistry.register(cacheSearchTool);
	toolRegistry.register(cacheStatsTool);
	toolRegistry.register(cachePruneTool);
	toolRegistry.register(cacheStorePatternTool);
	toolRegistry.register(cacheStoreReasoningTool);
	toolRegistry.register(cacheLoadReasoningTool);
	toolRegistry.register(cacheArchiveReasoningTool);

	// File tools (4 tools)
	toolRegistry.register(readFileTool);
	toolRegistry.register(writeTool);
	toolRegistry.register(editFileTool);
	toolRegistry.register(searchReplaceTool);

	// Search tools (2 tools)
	toolRegistry.register(grepTool);
	toolRegistry.register(codebaseSearchTool);

	// System tools (2 tools)
	toolRegistry.register(runTool);
	toolRegistry.register(askUserTool);

	// Browser tools (9 tools)
	toolRegistry.register(browserStatusTool);
	toolRegistry.register(browserNavigateTool);
	toolRegistry.register(browserReadPageTool);
	toolRegistry.register(browserScreenshotTool);
	toolRegistry.register(browserClickTool);
	toolRegistry.register(browserTypeTool);
	toolRegistry.register(browserFindTool);
	toolRegistry.register(browserGetTabsTool);
	toolRegistry.register(browserCreateTabTool);

	// Patch tools (5 tools)
	toolRegistry.register(applyUnifiedDiffTool);
	toolRegistry.register(editRangeTool);
	toolRegistry.register(insertAtTool);
	toolRegistry.register(deleteRangeTool);
	toolRegistry.register(assessPatchRiskTool);
}

// ============================================================================
// Exports
// ============================================================================

export { toolRegistry };
export * from './tool-registry.js';
