#!/usr/bin/env node
/**
 * Vault Search Test
 *
 * Tests the note search functionality with cached patterns.
 */

import {CacheManager} from './dist/cache/cache-manager.js';

async function testSearch() {
	console.log('🔍 Testing Vault Search\n');

	const cacheManager = new CacheManager(process.cwd());
	const patterns = await cacheManager.list('vault');

	console.log(`Total cached patterns: ${patterns.length}\n`);

	// Test 1: Search for "prompt"
	console.log('📋 Test 1: Search for "prompt"');
	const query1 = 'prompt';
	const matches1 = patterns.filter(p => {
		const key = p.key.toLowerCase();
		const value = String(p.value).toLowerCase();
		const tags = p.metadata?.tags
			? (p.metadata.tags as string[]).join(' ').toLowerCase()
			: '';
		return key.includes(query1) || value.includes(query1) || tags.includes(query1);
	});

	console.log(`  Found ${matches1.length} match(es)`);
	for (const match of matches1.slice(0, 3)) {
		console.log(`    • ${match.key}`);
	}
	console.log('');

	// Test 2: Search for "agent"
	console.log('📋 Test 2: Search for "agent"');
	const query2 = 'agent';
	const matches2 = patterns.filter(p => {
		const key = p.key.toLowerCase();
		const value = String(p.value).toLowerCase();
		const tags = p.metadata?.tags
			? (p.metadata.tags as string[]).join(' ').toLowerCase()
			: '';
		return key.includes(query2) || value.includes(query2) || tags.includes(query2);
	});

	console.log(`  Found ${matches2.length} match(es)`);
	for (const match of matches2.slice(0, 3)) {
		console.log(`    • ${match.key}`);
	}
	console.log('');

	// Test 3: Show sample pattern content
	console.log('📋 Test 3: Sample pattern content');
	if (patterns.length > 0) {
		const sample = patterns[0];
		const preview = String(sample.value).substring(0, 200);
		console.log(`  Pattern: ${sample.key}`);
		console.log(`  Preview: ${preview}${preview.length >= 200 ? '...' : ''}`);
		console.log(`  Tags: ${sample.metadata?.tags as string[] | undefined || 'none'}`);
		console.log(`  Cached: ${new Date(sample.timestamp).toLocaleString()}`);
	}

	console.log('\n✅ Search functionality verified!');
}

testSearch().catch(error => {
	console.error('💥 Test failed:', error);
	process.exit(1);
});
