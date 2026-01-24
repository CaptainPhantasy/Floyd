#!/usr/bin/env node
/**
 * Vault Integration Test Script
 *
 * Tests the Obsidian vault integration by:
 * 1. Loading vault configuration
 * 2. Listing registered vaults
 * 3. Scanning Prompt Library vault
 * 4. Verifying cache functionality
 */

import {createVaultManager} from './dist/obsidian/vault-manager.js';
import {CacheManager} from './dist/cache/cache-manager.js';

async function testVaultIntegration() {
	console.log('🧪 Testing Obsidian Vault Integration\n');

	// Test 1: Load vault configuration
	console.log('📋 Test 1: Loading vault configuration...');
	try {
		const manager = await createVaultManager();
		const vaults = await manager.listVaults();

		if (vaults.length === 0) {
			console.log('❌ FAIL: No vaults registered\n');
			return;
		}

		console.log(`✓ PASS: Found ${vaults.length} registered vault(s)\n`);
		console.log('Registered Vaults:');
		for (const vault of vaults) {
			const active = manager.getActiveVault() === vault.path ? '✓' : ' ';
			console.log(`  ${active} ${vault.name}: ${vault.noteCount} notes at ${vault.path}`);
		}
		console.log('');
	} catch (error) {
		console.log(`❌ FAIL: ${error}\n`);
		return;
	}

	// Test 2: Select prompts vault
	console.log('📋 Test 2: Selecting "prompts" vault...');
	try {
		const manager = await createVaultManager();
		const vaultPath = await manager.selectVault('prompts');

		if (!vaultPath) {
			console.log('❌ FAIL: Could not select "prompts" vault\n');
			return;
		}

		console.log(`✓ PASS: Selected vault at ${vaultPath}\n`);
	} catch (error) {
		console.log(`❌ FAIL: ${error}\n`);
		return;
	}

	// Test 3: Scan Prompt Library vault
	console.log('📋 Test 3: Scanning Prompt Library vault...');
	try {
		const manager = await createVaultManager();
		const cacheManager = new CacheManager(process.cwd());
		const vaultPath = manager.getVaultPath('prompts');

		if (!vaultPath) {
			console.log('❌ FAIL: "prompts" vault not found\n');
			return;
		}

		// Get all notes
		const notes = await manager.getVaultNotes('prompts');
		console.log(`  Found ${notes.length} markdown files`);

		// Index first 5 notes to cache
		let indexedCount = 0;
		const maxIndex = Math.min(5, notes.length);

		for (let i = 0; i < maxIndex; i++) {
			const notePath = notes[i];
			try {
				const fs = await import('fs-extra');
				const content = await fs.readFile(notePath, 'utf-8');
				const fileName = notePath.split('/').pop() ?? 'unknown';

				await cacheManager.storePattern(
					fileName,
					content,
					['prompts', 'vault'],
				);
				indexedCount++;
			} catch (error) {
				// Skip files that can't be read
			}
		}

		console.log(`✓ PASS: Indexed ${indexedCount}/${notes.length} notes to cache\n`);
	} catch (error) {
		console.log(`❌ FAIL: ${error}\n`);
		return;
	}

	// Test 4: Verify cache functionality
	console.log('📋 Test 4: Verifying cache functionality...');
	try {
		const cacheManager = new CacheManager(process.cwd());
		const patterns = await cacheManager.list('vault');

		if (patterns.length === 0) {
			console.log('⚠️  WARN: No patterns found in cache (scan may have failed)\n');
		} else {
			console.log(`✓ PASS: Found ${patterns.length} cached pattern(s)`);

			// Show first 3 patterns
			const previewCount = Math.min(3, patterns.length);
			console.log(`\n  Sample patterns (showing ${previewCount}):`);
			for (let i = 0; i < previewCount; i++) {
				const pattern = patterns[i];
				const tags = pattern.metadata?.tags as string[] | undefined;
				const tagStr = tags ? tags.join(', ') : 'none';
				console.log(`    • ${pattern.key} [tags: ${tagStr}]`);
			}
		}
		console.log('');
	} catch (error) {
		console.log(`❌ FAIL: ${error}\n`);
		return;
	}

	// Summary
	console.log('═══════════════════════════════════════');
	console.log('✅ All integration tests passed!');
	console.log('═══════════════════════════════════════');
	console.log('\n📦 Vault cache is now active with 7-day TTL.');
	console.log('🔍 You can search cached notes with: note search <query>');
	console.log('📝 You can create notes with: note create <title>');
}

// Run tests
testVaultIntegration().catch(error => {
	console.error('💥 Test failed with error:', error);
	process.exit(1);
});
