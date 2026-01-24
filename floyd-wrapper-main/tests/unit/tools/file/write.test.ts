/**
 * Unit Tests: Write Tool
 *
 * Tests for src/tools/file/write.ts
 */

import test from 'ava';
import { writeTool } from '../../../../src/tools/file/index.ts';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// ============================================================================
// Test Setup
// ============================================================================

const TEST_DIR = join(process.cwd(), '.test-files-write');
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
// Write Tool Tests
// ============================================================================

test.serial('write:tool - returns correct tool definition', (t) => {
	t.is(writeTool.name, 'write');
	t.is(writeTool.category, 'file');
	t.is(writeTool.permission, 'dangerous');
	t.true(typeof writeTool.description === 'string');
	t.true(typeof writeTool.execute === 'function');
});

test.serial('write:execute - writes file successfully', async (t) => {
	const content = 'Hello, World!';
	const result = await writeTool.execute({
		file_path: TEST_FILE,
		content
	}) as { success: boolean; data?: { bytes_written: number } };

	t.true(result.success, 'Write should succeed');
	t.true(result.data !== undefined, 'Should return data');
	t.true(result.data.bytes_written > 0, 'Should report bytes written');

	// Verify file was actually written
	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.is(fileContent, content, 'File content should match');
});

test.serial('write:execute - overwrites existing file', async (t) => {
	// Write initial content
	await writeFile(TEST_FILE, 'Initial content');

	const newContent = 'Updated content';
	const result = await writeTool.execute({
		file_path: TEST_FILE,
		content: newContent
	}) as { success: boolean };

	t.true(result.success, 'Overwrite should succeed');

	// Verify file was overwritten
	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.is(fileContent, newContent, 'File should contain new content');
});

test.serial('write:execute - creates parent directories', async (t) => {
	const nestedPath = join(TEST_DIR, 'nested', 'dir', 'file.txt');
	const content = 'Nested file content';

	const result = await writeTool.execute({
		file_path: nestedPath,
		content
	}) as { success: boolean };

	t.true(result.success, 'Should create nested directories');

	// Verify file exists
	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(nestedPath, 'utf-8');
	t.is(fileContent, content, 'Nested file should have correct content');
});

test.serial('write:execute - handles empty content', async (t) => {
	const result = await writeTool.execute({
		file_path: TEST_FILE,
		content: ''
	}) as { success: boolean; data?: { bytes_written: number } };

	t.true(result.success, 'Empty content write should succeed');
	t.is(result.data?.bytes_written, 0, 'Should report 0 bytes written');
});

test.serial('write:execute - handles special characters', async (t) => {
	const content = 'Line 1\nLine 2\tTabbed\nSpecial: @#$%^&*()';
	const result = await writeTool.execute({
		file_path: TEST_FILE,
		content
	}) as { success: boolean };

	t.true(result.success, 'Special characters should be preserved');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.is(fileContent, content, 'Special characters should match');
});

test.serial('write:execute - handles large content', async (t) => {
	const largeContent = 'x'.repeat(10000);
	const result = await writeTool.execute({
		file_path: TEST_FILE,
		content: largeContent
	}) as { success: boolean; data?: { bytes_written: number } };

	t.true(result.success, 'Large content write should succeed');
	t.is(result.data?.bytes_written, 10000, 'Should report 10000 bytes');
});

test.serial('write:execute - handles Unicode content', async (t) => {
	const content = 'Hello 世界 🌍 Привет мир';
	const result = await writeTool.execute({
		file_path: TEST_FILE,
		content
	}) as { success: boolean };

	t.true(result.success, 'Unicode content should be preserved');

	const { readFile } = await import('node:fs/promises');
	const fileContent = await readFile(TEST_FILE, 'utf-8');
	t.is(fileContent, content, 'Unicode should be preserved correctly');
});

test.serial('write:execute - returns validation error for missing file_path', async (t) => {
	const result = await writeTool.execute({
		content: 'test'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Should fail validation');
	t.is(result.error?.code, 'VALIDATION_ERROR', 'Should return validation error code');
});

test.serial('write:execute - returns validation error for empty file_path', async (t) => {
	const result = await writeTool.execute({
		file_path: '',
		content: 'test'
	}) as { success: boolean; error?: { code: string } };

	t.false(result.success, 'Empty file_path should fail validation');
	t.is(result.error?.code, 'VALIDATION_ERROR', 'Should return validation error code');
});
