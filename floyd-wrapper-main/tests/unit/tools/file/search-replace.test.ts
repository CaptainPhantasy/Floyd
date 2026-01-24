/**
 * Unit Tests: Search Replace Tool
 *
 * Tests for src/tools/file/search_replace.ts
 */

import test from 'ava';
import { searchReplaceTool } from '../../../../src/tools/file/index.ts';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// ============================================================================
// Test Setup
// ============================================================================

const TEST_DIR = join(process.cwd(), '.test-files-search-replace');
const TEST_FILE = join(TEST_DIR, `test-${randomUUID()}.txt`);

test.before(async () => {
	// Create test directory
	await mkdir(TEST_DIR, { recursive: true });
});

test.after.always(async () => {
	// Clean up test directory
	try {
		await unlink(TEST_FILE);
	} catch (_error) {
		// File might not exist
	}
	try {
		const { rm } = await import('node:fs/promises');
		await rm(TEST_DIR, { recursive: true, force: true });
	} catch (_error) {
		// Directory might not exist
	}
});

// ============================================================================
// Search Replace Tool Tests
// ============================================================================

test.serial('search_replace:tool - returns correct tool definition', (t) => {
	t.is(searchReplaceTool.name, 'search_replace');
	t.is(searchReplaceTool.category, 'file');
	t.is(searchReplaceTool.permission, 'dangerous');
	t.true(typeof searchReplaceTool.description === 'string');
	t.true(typeof searchReplaceTool.execute === 'function');
});

test.serial('search_replace:execute - replaces first occurrence by default', async (t) => {
	const initialContent = 'test test test';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: 'test',
		replace_string: 'demo'
	}) as { success: boolean; data?: { replacements: number } };

	t.true(result.success, 'Replace should succeed');
	t.is(result.data?.replacements, 1, 'Should report 1 replacement');

	// Verify only first occurrence was replaced
	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.is(fileContent, 'demo test test', 'Only first occurrence should be replaced');
});

test.serial('search_replace:execute - replaces all occurrences when replace_all is true', async (t) => {
	const initialContent = 'test test test';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: 'test',
		replace_string: 'demo',
		replace_all: true
	}) as { success: boolean; data?: { replacements: number } };

	t.true(result.success, 'Replace all should succeed');
	t.is(result.data?.replacements, 3, 'Should report 3 replacements');

	// Verify all occurrences were replaced
	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.is(fileContent, 'demo demo demo', 'All occurrences should be replaced');
});

test.serial('search_replace:execute - returns error when file not found', async (t) => {
	const result = await searchReplaceTool.execute({
		file_path: '/nonexistent/file.txt',
		search_string: 'old',
		replace_string: 'new'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Should fail when file not found');
	t.is(result.error?.code, 'FILE_REPLACE_ERROR', 'Should return file replace error');
});

test.serial('search_replace:execute - returns error when search string not found', async (t) => {
	await writeFile(TEST_FILE, 'Some content');

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: 'notfound',
		replace_string: 'new'
	}) as { success: boolean; error?: { code: string; message?: string } };

	t.false(result.success, 'Should fail when search string not found');
	t.true(result.error?.message?.includes('String not found') || result.error?.message?.includes('not found'), 'Should indicate string not found');
});

test.serial('search_replace:execute - handles special regex characters', async (t) => {
	const initialContent = 'Price: $100\nPrice: $200';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: '$100',
		replace_string: '$80'
	}) as { success: boolean };

	t.true(result.success, 'Special characters should be handled');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.true(fileContent.includes('$80'), 'Should contain replacement');
	t.true(fileContent.includes('$200'), 'Second occurrence should remain (replace_all=false)');
});

test.serial('search_replace:execute - replace_all handles special regex characters globally', async (t) => {
	const initialContent = 'Price: $100\nPrice: $200\nPrice: $300';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: '$100',
		replace_string: '$80',
		replace_all: true
	}) as { success: boolean; data?: { replacements: number } };

	t.true(result.success, 'Global replace should succeed');
	t.is(result.data?.replacements, 1, 'Should report 1 replacement (only $100)');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.true(fileContent.includes('$80'), 'First occurrence should be replaced');
	t.true(fileContent.includes('$200'), 'Other prices should remain');
});

test.serial('search_replace:execute - handles Unicode strings', async (t) => {
	const initialContent = 'Hello 世界\nHello 世界';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: '世界',
		replace_string: 'World',
		replace_all: true
	}) as { success: boolean; data?: { replacements: number } };

	t.true(result.success, 'Unicode replacement should succeed');
	t.is(result.data?.replacements, 2, 'Should report 2 replacements');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.false(fileContent.includes('世界'), 'Old Unicode should be removed');
	t.true(fileContent.includes('Hello World'), 'New Unicode should be present');
});

test.serial('search_replace:execute - handles empty strings', async (t) => {
	const initialContent = 'test';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: 'test',
		replace_string: ''
	}) as { success: boolean };

	t.true(result.success, 'Replacement with empty string (deletion) should succeed');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.is(fileContent, '', 'Content should be deleted');
});

test.serial('search_replace:execute - handles multiline strings', async (t) => {
	const initialContent = 'Line 1\nLine 2\nLine 3';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: 'Line 2',
		replace_string: 'Modified Line 2'
	}) as { success: boolean };

	t.true(result.success, 'Multiline replacement should succeed');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.true(fileContent.includes('Modified Line 2'), 'Should contain modified line');
});

test.serial('search_replace:execute - handles very long strings', async (t) => {
	const longString = 'a'.repeat(1000);
	const initialContent = `${longString}\n${longString}`;
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: longString,
		replace_string: 'b'.repeat(1000),
		replace_all: true
	}) as { success: boolean; data?: { replacements: number } };

	t.true(result.success, 'Long string replacement should succeed');
	t.is(result.data?.replacements, 2, 'Should report 2 replacements');
});

test.serial('search_replace:execute - defaults replace_all to false', async (t) => {
	const initialContent = 'test test';
	await writeFile(TEST_FILE, initialContent);

	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: 'test',
		replace_string: 'demo'
		// No replace_all specified, should default to false
	}) as { success: boolean; data?: { replacements: number } };

	t.true(result.success, 'Should succeed with default replace_all=false');
	t.is(result.data?.replacements, 1, 'Should replace only first occurrence');
});

test.serial('search_replace:execute - returns validation error for missing file_path', async (t) => {
	const result = await searchReplaceTool.execute({
		search_string: 'old',
		replace_string: 'new'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Should fail validation');
	t.is(result.error?.code, 'VALIDATION_ERROR', 'Should return validation error code');
});

test.serial('search_replace:execute - returns validation error for empty search_string', async (t) => {
	const result = await searchReplaceTool.execute({
		file_path: TEST_FILE,
		search_string: '',
		replace_string: 'new'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Empty search_string should fail validation');
	t.is(result.error?.code, 'VALIDATION_ERROR', 'Should return validation error code');
});
