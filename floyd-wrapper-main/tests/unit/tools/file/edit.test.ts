/**
 * Unit Tests: Edit File Tool
 *
 * Tests for src/tools/file/edit_file.ts
 */

import test from 'ava';
import { editFileTool } from '../../../../src/tools/file/index.ts';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// ============================================================================
// Test Setup
// ============================================================================

const TEST_DIR = join(process.cwd(), '.test-files-edit');
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
// Edit File Tool Tests
// ============================================================================

test.serial('edit_file:tool - returns correct tool definition', (t) => {
	t.is(editFileTool.name, 'edit_file');
	t.is(editFileTool.category, 'file');
	t.is(editFileTool.permission, 'dangerous');
	t.true(typeof editFileTool.description === 'string');
	t.true(typeof editFileTool.execute === 'function');
});

test.serial('edit_file:execute - edits file successfully', async (t) => {
	// Create initial file
	const initialContent = 'Hello World\nGoodbye World';
	await writeFile(TEST_FILE, initialContent);

	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: 'Hello',
		new_string: 'Hi'
	}) as { success: boolean; data?: { replacements: number } };

	t.true(result.success, 'Edit should succeed');
	t.is(result.data?.replacements, 1, 'Should report 1 replacement');

	// Verify file was edited
	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.true(fileContent.includes('Hi World'), 'Should contain new string');
	t.false(fileContent.includes('Hello World'), 'Should not contain old string');
});

test.serial('edit_file:execute - returns error when file not found', async (t) => {
	const result = await editFileTool.execute({
		file_path: '/nonexistent/file.txt',
		old_string: 'old',
		new_string: 'new'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Should fail when file not found');
	t.is(result.error?.code, 'FILE_EDIT_ERROR', 'Should return file edit error');
});

test.serial('edit_file:execute - returns error when old string not found', async (t) => {
	// Create file without the target string
	await writeFile(TEST_FILE, 'Some content');

	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: 'notfound',
		new_string: 'new'
	}) as { success: boolean; error?: { code: string; message?: string } };

	t.false(result.success, 'Should fail when old string not found');
	t.true(result.error?.message?.includes('String not found') || result.error?.message?.includes('not found'), 'Should indicate string not found');
});

test.serial('edit_file:execute - returns error for multiple matches', async (t) => {
	// Create file with multiple occurrences
	await writeFile(TEST_FILE, 'test test test');

	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: 'test',
		new_string: 'demo'
	}) as { success: boolean; error?: { code: string; message?: string } };

	t.false(result.success, 'Should fail with multiple matches');
	t.true(result.error?.message?.includes('Multiple matches'), 'Should indicate multiple matches found');
});

test.serial('edit_file:execute - handles special characters', async (t) => {
	const initialContent = 'Price: $100\nDiscount: 20%';
	await writeFile(TEST_FILE, initialContent);

	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: '$100',
		new_string: '$80'
	}) as { success: boolean };

	t.true(result.success, 'Special characters should be handled');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.true(fileContent.includes('$80'), 'Should contain new price');
	t.false(fileContent.includes('$100'), 'Should not contain old price');
});

test.serial('edit_file:execute - handles multiline strings', async (t) => {
	const initialContent = 'Line 1\nLine 2\nLine 3';
	await writeFile(TEST_FILE, initialContent);

	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: 'Line 2',
		new_string: 'Modified Line 2'
	}) as { success: boolean };

	t.true(result.success, 'Multiline edit should succeed');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.true(fileContent.includes('Modified Line 2'), 'Should contain modified line');
});

test.serial('edit_file:execute - handles empty new string (deletion)', async (t) => {
	const initialContent = 'Remove this line\nKeep this line';
	await writeFile(TEST_FILE, initialContent);

	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: 'Remove this line',
		new_string: ''
	}) as { success: boolean };

	t.true(result.success, 'Deletion should succeed');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.false(fileContent.includes('Remove this line'), 'Old line should be removed');
	t.true(fileContent.includes('Keep this line'), 'Other line should remain');
});

test.serial('edit_file:execute - handles Unicode in strings', async (t) => {
	const initialContent = 'Hello 世界\nПривет мир';
	await writeFile(TEST_FILE, initialContent);

	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: '世界',
		new_string: 'World'
	}) as { success: boolean };

	t.true(result.success, 'Unicode replacement should succeed');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.true(fileContent.includes('Hello World'), 'Should contain replaced Unicode');
	t.false(fileContent.includes('Hello 世界'), 'Should not contain old Unicode');
});

test.serial('edit_file:execute - returns validation error for missing file_path', async (t) => {
	const result = await editFileTool.execute({
		old_string: 'old',
		new_string: 'new'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Should fail validation');
	t.is(result.error?.code, 'VALIDATION_ERROR', 'Should return validation error code');
});

test.serial('edit_file:execute - returns validation error for empty old_string', async (t) => {
	const result = await editFileTool.execute({
		file_path: TEST_FILE,
		old_string: '',
		new_string: 'new'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Empty old_string should fail validation');
	t.is(result.error?.code, 'VALIDATION_ERROR', 'Should return validation error code');
});
