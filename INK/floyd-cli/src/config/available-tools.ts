/**
 * Available Tools Registry
 *
 * Central source of truth for all available tools in Floyd CLI.
 * Used by HelpOverlay and SessionPanel to display tool states.
 *
 * @module config/available-tools
 */

export interface ToolDefinition {
	/** Tool name/identifier */
	name: string;

	/** Display name for UI */
	displayName: string;

	/** Description of what the tool does */
	description: string;

	/** Icon for UI display */
	icon?: string;

	/** Default enabled state */
	defaultEnabled: boolean;

	/** Tool category for organization */
	category: 'file' | 'code' | 'search' | 'build' | 'git' | 'cache' | 'browser' | 'terminal';
}

/**
 * Complete list of all available tools
 */
export const AVAILABLE_TOOLS: ToolDefinition[] = [
	// File operations
	{
		name: 'read_file',
		displayName: 'Read File',
		description: 'Read file contents from disk',
		icon: '📄',
		defaultEnabled: true,
		category: 'file',
	},
	{
		name: 'write',
		displayName: 'Write File',
		description: 'Write or create files',
		icon: '✍️',
		defaultEnabled: true,
		category: 'file',
	},
	{
		name: 'edit_file',
		displayName: 'Edit File',
		description: 'Edit specific file sections',
		icon: '✏️',
		defaultEnabled: true,
		category: 'file',
	},
	{
		name: 'search_replace',
		displayName: 'Search & Replace',
		description: 'Search and replace text in files',
		icon: '🔄',
		defaultEnabled: true,
		category: 'file',
	},

	// Code search and exploration
	{
		name: 'grep',
		displayName: 'Grep',
		description: 'Search file contents with patterns',
		icon: '🔍',
		defaultEnabled: true,
		category: 'search',
	},
	{
		name: 'codebase_search',
		displayName: 'Codebase Search',
		description: 'Search entire codebase',
		icon: '🌐',
		defaultEnabled: true,
		category: 'search',
	},

	// Build and test
	{
		name: 'run',
		displayName: 'Run Command',
		description: 'Execute terminal commands',
		icon: '▶️',
		defaultEnabled: true,
		category: 'build',
	},

	// Git operations
	{
		name: 'git',
		displayName: 'Git',
		description: 'Git operations: status, diff, log, commit, branches',
		icon: '📦',
		defaultEnabled: true,
		category: 'git',
	},

	// Browser operations
	{
		name: 'browser_navigate',
		displayName: 'Browser Navigate',
		description: 'Navigate and interact with web pages',
		icon: '🌍',
		defaultEnabled: false,
		category: 'browser',
	},

	// Cache (via MCP server)
	{
		name: 'cache',
		displayName: 'Cache',
		description: 'SUPERCACHE - 3-tier caching system',
		icon: '💾',
		defaultEnabled: true,
		category: 'cache',
	},

	// Patch server (via MCP)
	{
		name: 'patch',
		displayName: 'Patch',
		description: 'Apply unified diffs, edit ranges, insert/delete content',
		icon: '🩹',
		defaultEnabled: true,
		category: 'code',
	},

	// Runner server (via MCP)
	{
		name: 'runner',
		displayName: 'Runner',
		description: 'Detect projects, run tests, format, lint, build',
		icon: '🏃',
		defaultEnabled: true,
		category: 'build',
	},

	// Explorer server (via MCP)
	{
		name: 'explorer',
		displayName: 'Explorer',
		description: 'Codebase exploration: project map, symbol listing',
		icon: '🗺️',
		defaultEnabled: true,
		category: 'search',
	},
];

/**
 * Get tool definition by name
 */
export function getTool(name: string): ToolDefinition | undefined {
	return AVAILABLE_TOOLS.find(t => t.name === name);
}

/**
 * Get all enabled tools
 */
export function getEnabledTools(): ToolDefinition[] {
	return AVAILABLE_TOOLS.filter(t => t.defaultEnabled);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: ToolDefinition['category']): ToolDefinition[] {
	return AVAILABLE_TOOLS.filter(t => t.category === category);
}

/**
 * Get tool categories
 */
export function getToolCategories(): ToolDefinition['category'][] {
	return [...new Set(AVAILABLE_TOOLS.map(t => t.category))];
}

/**
 * Get default tool toggle states
 */
export function getDefaultToolStates(): Array<{name: string; enabled: boolean; icon?: string}> {
	return AVAILABLE_TOOLS.map(t => ({
		name: t.displayName,
		enabled: t.defaultEnabled,
		icon: t.icon,
	}));
}

/**
 * Get tool display name
 */
export function getToolDisplayName(name: string): string {
	const tool = getTool(name);
	return tool?.displayName || name;
}
