/**
 * Vault Commands
 *
 * Commands for managing Obsidian vaults and notes.
 *
 * @module commands/vault
 */

import {createVaultManager} from '../obsidian/vault-manager.js';
import {CacheManager} from '../cache/cache-manager.js';
import {
	createQuickNote,
	createDailyNote,
} from '../obsidian/md-editor.js';
import type {CommandDefinition} from './command-handler.js';

// ============================================================================
// VAULT COMMANDS
// ============================================================================

/**
 * vault list - List all registered vaults
 */
export const vaultListCommand: CommandDefinition = {
	name: 'vault list',
	description: 'List all registered Obsidian vaults',
	category: 'vault',
	usage: 'vault list',
	examples: ['vault list'],
	handler: async (_args, _context) => {
		const manager = await createVaultManager();
		const vaults = await manager.listVaults();

		if (vaults.length === 0) {
			return 'No vaults registered. Use "vault add <name> <path>" to add a vault.';
		}

		const activeVault = manager.getActiveVault();
		const lines = [
			'\n📚 Registered Vaults:',
			'─'.repeat(60),
		];

		for (const vault of vaults) {
			const isActive = activeVault === vault.path;
			const indicator = isActive ? '✓' : ' ';
			const lastModified = vault.lastModified.toLocaleDateString();
			lines.push(
				`${indicator} ${vault.name}`,
				`   Path: ${vault.path}`,
				`   Notes: ${vault.noteCount}`,
				`   Last Modified: ${lastModified}`,
				'',
			);
		}

		lines.push('─'.repeat(60));
		return lines.join('\n');
	},
};

/**
 * vault select - Select active vault
 */
export const vaultSelectCommand: CommandDefinition = {
	name: 'vault select',
	description: 'Select a vault as the active vault',
	category: 'vault',
	usage: 'vault select <name>',
	examples: [
		'vault select main',
		'vault select prompts',
	],
	handler: async (args, _context) => {
		const argArray = args as string[];
		if (argArray.length === 0) {
			return 'Usage: vault select <name>\n\nAvailable vaults: Use "vault list" to see all vaults.';
		}

		const vaultName = argArray[0];
		const manager = await createVaultManager();
		const vaultPath = await manager.selectVault(vaultName);

		if (!vaultPath) {
			return `❌ Vault not found: "${vaultName}"\n\nUse "vault list" to see available vaults.`;
		}

		return `✓ Active vault set to "${vaultName}"\n  Path: ${vaultPath}`;
	},
};

/**
 * vault scan - Scan vault and index to cache
 */
export const vaultScanCommand: CommandDefinition = {
	name: 'vault scan',
	description: 'Scan vault contents and index to cache',
	category: 'vault',
	usage: 'vault scan [name]',
	examples: [
		'vault scan',
		'vault scan prompts',
	],
	handler: async (args, _context) => {
		const manager = await createVaultManager();

		// Get vault to scan
		let vaultPath: string | null;
		let vaultName = 'active';

		const argArray = args as string[];
		if (argArray.length > 0) {
			vaultName = argArray[0];
			vaultPath = manager.getVaultPath(vaultName);
		} else {
			vaultPath = manager.getActiveVault();
		}

		if (!vaultPath) {
			return '❌ No vault selected. Use "vault select <name>" or specify a vault name.';
		}

		// Initialize cache manager
		const cacheManager = new CacheManager(process.cwd());

		// Get all notes
		const notes = await manager.getVaultNotes(vaultName);
		const noteCount = notes.length;

		// Index patterns to cache
		let indexedCount = 0;
		for (const notePath of notes) {
			try {
				// Read note and extract metadata
				const fs = await import('fs-extra');
				const content = await fs.readFile(notePath, 'utf-8');
				const fileName = notePath.split('/').pop() ?? 'unknown';

				// Store pattern in cache with tags
				await cacheManager.storePattern(
					fileName,
					content,
					[vaultName, 'vault'],
				);
				indexedCount++;
			} catch (error) {
				// Skip files that can't be read
			}
		}

		return [
			`📡 Scanning vault: "${vaultName}"`,
			`  Path: ${vaultPath}`,
			`  Total notes: ${noteCount}`,
			`  Indexed to cache: ${indexedCount}`,
			'',
			'✓ Scan complete. Patterns cached for 7 days.',
		].join('\n');
	},
};

/**
 * vault info - Show active vault info
 */
export const vaultInfoCommand: CommandDefinition = {
	name: 'vault info',
	description: 'Show information about the active vault',
	category: 'vault',
	usage: 'vault info',
	examples: ['vault info'],
	handler: async (_args, _context) => {
		const manager = await createVaultManager();
		const activeVault = manager.getActiveVault();

		if (!activeVault) {
			return '❌ No active vault. Use "vault select <name>" to select a vault.';
		}

		// Get vault details
		const vaults = await manager.listVaults();
		const vaultInfo = vaults.find(v => v.path === activeVault);

		if (!vaultInfo) {
			return `❌ Active vault path not found in registry: ${activeVault}`;
		}

		// Get cache stats
		const cacheManager = new CacheManager(process.cwd());
		const patterns = await cacheManager.list('vault');

		return [
			'📚 Active Vault Information',
			'─'.repeat(60),
			`Name: ${vaultInfo.name}`,
			`Path: ${vaultInfo.path}`,
			`Notes: ${vaultInfo.noteCount}`,
			`Last Modified: ${vaultInfo.lastModified.toLocaleString()}`,
			'',
			`Cached Patterns: ${patterns.length}`,
			'─'.repeat(60),
		].join('\n');
	},
};

// ============================================================================
// NOTE COMMANDS
// ============================================================================

/**
 * note create - Create a new note
 */
export const noteCreateCommand: CommandDefinition = {
	name: 'note create',
	description: 'Create a new note in the active vault',
	category: 'vault',
	usage: 'note create <title> [content]',
	examples: [
		'note create "Meeting Notes"',
		'note create "Idea" "This is a great idea..."',
	],
	handler: async (args, _context) => {
		const argArray = args as string[];
		if (argArray.length === 0) {
			return 'Usage: note create <title> [content]\n\nExample: note create "Meeting Notes" "Discussed project roadmap"';
		}

		const manager = await createVaultManager();
		const vaultPath = manager.getActiveVault();

		if (!vaultPath) {
			return '❌ No active vault. Use "vault select <name>" first.';
		}

		const title = argArray[0];
		const content = argArray.slice(1).join(' ') || '';

		try {
			const filePath = await createQuickNote(vaultPath, title, content);
			return [
				'✓ Note created successfully',
				`  Title: ${title}`,
				`  Path: ${filePath}`,
			].join('\n');
		} catch (error) {
			return `❌ Failed to create note: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
};

/**
 * note daily - Create a daily note
 */
export const noteDailyCommand: CommandDefinition = {
	name: 'note daily',
	description: 'Create a daily note in the active vault',
	category: 'vault',
	usage: 'note daily [content]',
	examples: [
		'note daily',
		'note daily "Today I worked on..."',
	],
	handler: async (args, _context) => {
		const manager = await createVaultManager();
		const vaultPath = manager.getActiveVault();

		if (!vaultPath) {
			return '❌ No active vault. Use "vault select <name>" first.';
		}

		const argArray = args as string[];
		const content = argArray.join(' ') || '';
		const date = new Date();

		try {
			const filePath = await createDailyNote(vaultPath, date, content);
			const dateStr = date.toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});

			return [
				'✓ Daily note created successfully',
				`  Date: ${dateStr}`,
				`  Path: ${filePath}`,
			].join('\n');
		} catch (error) {
			return `❌ Failed to create daily note: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
};

/**
 * note search - Search cached patterns
 */
export const noteSearchCommand: CommandDefinition = {
	name: 'note search',
	description: 'Search for patterns in the vault cache',
	category: 'vault',
	usage: 'note search <query>',
	examples: [
		'note search react',
		'note search middleware',
	],
	handler: async (args, _context) => {
		const argArray = args as string[];
		if (argArray.length === 0) {
			return 'Usage: note search <query>\n\nExample: note search "react hooks"';
		}

		const query = argArray.join(' ').toLowerCase();

		// Initialize cache manager
		const cacheManager = new CacheManager(process.cwd());

		// Load patterns
		const patterns = await cacheManager.list('vault');

		// Filter by query
		const matches = patterns.filter(p => {
			const key = p.key.toLowerCase();
			const value = String(p.value).toLowerCase();
			const tags = p.metadata?.tags
				? (p.metadata.tags as string[]).join(' ').toLowerCase()
				: '';
			return key.includes(query) || value.includes(query) || tags.includes(query);
		});

		if (matches.length === 0) {
			return [
				`🔍 No matches found for: "${argArray.join(' ')}"`,
				'',
				'Tip: Use "vault scan" to index your vault notes first.',
			].join('\n');
		}

		const lines = [
			`🔍 Found ${matches.length} match(es) for: "${argArray.join(' ')}"`,
			'─'.repeat(60),
		];

		for (const match of matches) {
			const tags = match.metadata?.tags as string[] | undefined;
			const tagStr = tags ? tags.join(', ') : 'none';
			const valuePreview = String(match.value).substring(0, 100);

			lines.push(
				`📄 ${match.key}`,
				`   Tags: ${tagStr}`,
				`   Preview: ${valuePreview}${valuePreview.length >= 100 ? '...' : ''}`,
				`   Cached: ${new Date(match.timestamp).toLocaleString()}`,
				'',
			);
		}

		lines.push('─'.repeat(60));
		return lines.join('\n');
	},
};

/**
 * note cache - Show cache statistics
 */
export const noteCacheCommand: CommandDefinition = {
	name: 'note cache',
	description: 'Show vault cache statistics',
	category: 'vault',
	usage: 'note cache',
	examples: ['note cache'],
	handler: async (_args, _context) => {
		const cacheManager = new CacheManager(process.cwd());
		const patterns = await cacheManager.list('vault');

		// Group by tags
		const byTags = new Map<string, number>();
		for (const pattern of patterns) {
			const tags = pattern.metadata?.tags as string[] | undefined;
			if (tags) {
				for (const tag of tags) {
					byTags.set(tag, (byTags.get(tag) ?? 0) + 1);
				}
			}
		}

		const lines = [
			'📦 Vault Cache Statistics',
			'─'.repeat(60),
			`Total Patterns: ${patterns.length}`,
			`TTL: 7 days`,
			'',
			'By Tags:',
		];

		for (const [tag, count] of byTags.entries()) {
			lines.push(`  ${tag}: ${count}`);
		}

		lines.push('─'.repeat(60));

		return lines.join('\n');
	},
};

// ============================================================================
// COMMAND EXPORTS
// ============================================================================

export const vaultCommands: CommandDefinition[] = [
	vaultListCommand,
	vaultSelectCommand,
	vaultScanCommand,
	vaultInfoCommand,
	noteCreateCommand,
	noteDailyCommand,
	noteSearchCommand,
	noteCacheCommand,
];

export default vaultCommands;
