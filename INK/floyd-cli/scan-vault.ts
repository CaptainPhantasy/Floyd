#!/usr/bin/env node
/**
 * Full Vault Scan Script
 *
 * Scans all notes in the Prompt Library vault and indexes them to cache.
 */

import {createVaultManager} from './dist/obsidian/vault-manager.js';
import {CacheManager} from './dist/cache/cache-manager.js';
import fs from 'fs-extra';

async function scanVault() {
	console.log('📡 Scanning Prompt Library vault to cache...\n');

	const manager = await createVaultManager();
	const cacheManager = new CacheManager(process.cwd());

	// Get prompts vault
	const vaultPath = manager.getVaultPath('prompts');
	if (!vaultPath) {
		console.error('❌ "prompts" vault not found. Run: vault select prompts');
		process.exit(1);
	}

	console.log(`Vault path: ${vaultPath}\n`);

	// Get all notes
	const notes = await manager.getVaultNotes('prompts');
	console.log(`Found ${notes.length} markdown files\n`);

	// Index all notes
	let successCount = 0;
	let errorCount = 0;

	for (let i = 0; i < notes.length; i++) {
		const notePath = notes[i];
		const fileName = notePath.split('/').pop() ?? 'unknown';

		try {
			const content = await fs.readFile(notePath, 'utf-8');

			// Store in cache
			await cacheManager.storePattern(
				fileName,
				content,
				['prompts', 'vault'],
			);

			successCount++;
			process.stdout.write(`\r  Progress: ${i + 1}/${notes.length} files indexed (${successCount} success, ${errorCount} errors)`);
		} catch (error) {
			errorCount++;
			console.error(`\n  ⚠️  Failed to index ${fileName}: ${error}`);
		}
	}

	console.log('\n'); // New line after progress

	// Verify
	const patterns = await cacheManager.list('vault');

	console.log('═══════════════════════════════════════');
	console.log('✅ Scan Complete!');
	console.log('═══════════════════════════════════════');
	console.log(`📊 Statistics:`);
	console.log(`  • Total files: ${notes.length}`);
	console.log(`  • Successfully indexed: ${successCount}`);
	console.log(`  • Errors: ${errorCount}`);
	console.log(`  • Total cached patterns: ${patterns.length}`);
	console.log(`\n💡 Cache TTL: 7 days`);
	console.log(`🔍 Search with: note search <query>`);
}

scanVault().catch(error => {
	console.error('💥 Scan failed:', error);
	process.exit(1);
});
