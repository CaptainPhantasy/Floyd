/**
 * Unit Tests: File Read Tool
 *
 * Tests for src/tools/file/read.ts (read_file tool)
 */

import test from 'ava';
import fs from 'fs-extra';
import path from 'path';
import { readFileTool } from '../../../../src/tools/file/index.ts';

// ============================================================================
// Test Setup
// ============================================================================

const testDir = path.join(process.cwd(), 'tests', '.tmp');
const testFilePath = path.join(testDir, 'test-read.txt');

/**
 * Setup test environment before each test
 */
test.before(async () => {
  // Create test directory
  await fs.ensureDir(testDir);

  // Create a test file with known content
  const testContent = [
    'Line 1',
    'Line 2',
    'Line 3',
    'Line 4',
    'Line 5',
    'Line 6',
    'Line 7',
    'Line 8',
    'Line 9',
    'Line 10',
  ].join('\n');

  await fs.writeFile(testFilePath, testContent, 'utf-8');
});

/**
 * Cleanup test environment after all tests
 */
test.after.always(async () => {
  // Remove test directory
  if (await fs.pathExists(testDir)) {
    await fs.remove(testDir);
  }
});

// ============================================================================
// Test Cases
// ============================================================================

test('unit: read_file - successfully reads entire file', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
  });

  t.true(result.success, 'Should successfully read file');
  t.falsy(result.error, 'Should not have error');

  if (result.success) {
    t.is(result.data.content.split('\n').length, 10, 'Should read all 10 lines');
    t.is(result.data.lineCount, 10, 'Line count should be 10');
    t.is(result.data.file_path, testFilePath, 'File path should match');
  }
});

test('unit: read_file - reads file with offset', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
    offset: 5,
  });

  t.true(result.success, 'Should successfully read file with offset');

  if (result.success) {
    const lines = result.data.content.split('\n');
    t.true(lines[0].includes('Line 6'), 'First line should be Line 6');
    t.is(lines.length, 5, 'Should read 5 lines from offset 5');
    t.is(result.data.lineCount, 10, 'Total line count should still be 10');
  }
});

test('unit: read_file - reads file with limit', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
    limit: 3,
  });

  t.true(result.success, 'Should successfully read file with limit');

  if (result.success) {
    const lines = result.data.content.split('\n');
    t.is(lines.length, 3, 'Should read only 3 lines');
    t.true(lines[0].includes('Line 1'), 'First line should be Line 1');
    t.true(lines[2].includes('Line 3'), 'Third line should be Line 3');
  }
});

test('unit: read_file - reads file with offset and limit', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
    offset: 3,
    limit: 2,
  });

  t.true(result.success, 'Should successfully read file with offset and limit');

  if (result.success) {
    const lines = result.data.content.split('\n');
    t.is(lines.length, 2, 'Should read 2 lines');
    t.true(lines[0].includes('Line 4'), 'First line should be Line 4');
    t.true(lines[1].includes('Line 5'), 'Second line should be Line 5');
  }
});

test('unit: read_file - handles offset beyond file length', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
    offset: 100,
  });

  t.true(result.success, 'Should handle offset beyond file length');

  if (result.success) {
    t.is(result.data.content, '', 'Content should be empty');
    t.is(result.data.lineCount, 10, 'Line count should still be 10');
  }
});

test('unit: read_file - handles non-existent file', async (t) => {
  const result = await readFileTool.execute({
    file_path: path.join(testDir, 'non-existent.txt'),
  });

  t.false(result.success, 'Should fail for non-existent file');
  t.truthy(result.error, 'Should have error');

  if (result.error) {
    t.is(result.error.code, 'FILE_NOT_FOUND', 'Error code should be FILE_NOT_FOUND');
    t.true(result.error.message.includes('File not found'), 'Error message should mention file not found');
  }
});

test('unit: read_file - handles directory path (not a file)', async (t) => {
  const result = await readFileTool.execute({
    file_path: testDir,
  });

  t.false(result.success, 'Should fail for directory path');
  t.truthy(result.error, 'Should have error');

  if (result.error) {
    t.is(result.error.code, 'NOT_A_FILE', 'Error code should be NOT_A_FILE');
    t.true(result.error.message.includes('not a file'), 'Error message should mention not a file');
  }
});

test('unit: read_file - validates file path is required', async (t) => {
  const result = await readFileTool.execute({
    file_path: '',
  });

  t.false(result.success, 'Should return success: false');
  t.truthy(result.error, 'Should have error');

  if (result.error) {
    t.is(result.error.code, 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
    t.true(result.error.message.includes('required'), 'Error message should mention required');
  }
});

test('unit: read_file - validates limit must be positive', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
    limit: -1,
  });

  t.false(result.success, 'Should return success: false');
  t.truthy(result.error, 'Should have error');

  if (result.error) {
    t.is(result.error.code, 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
  }
});

test('unit: read_file - validates offset must be non-negative', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
    offset: -1,
  });

  t.false(result.success, 'Should return success: false');
  t.truthy(result.error, 'Should have error');

  if (result.error) {
    t.is(result.error.code, 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
  }
});

test('unit: read_file - tool definition has correct properties', async (t) => {
  t.is(readFileTool.name, 'read_file', 'Tool name should be read_file');
  t.is(readFileTool.category, 'file', 'Tool category should be file');
  t.is(readFileTool.permission, 'none', 'Tool permission should be none');
  t.is(typeof readFileTool.execute, 'function', 'Tool should have execute function');
  t.truthy(readFileTool.inputSchema, 'Tool should have input schema');
  t.true(typeof readFileTool.description === 'string', 'Tool should have description');
});

test('unit: read_file - preserves file content exactly', async (t) => {
  const result = await readFileTool.execute({
    file_path: testFilePath,
  });

  t.true(result.success, 'Should successfully read file');

  if (result.success) {
    const lines = result.data.content.split('\n');
    t.is(lines[0], 'Line 1', 'First line should match exactly');
    t.is(lines[9], 'Line 10', 'Last line should match exactly');
  }
});

test('unit: read_file - handles empty file', async (t) => {
  const emptyFilePath = path.join(testDir, 'empty.txt');
  await fs.writeFile(emptyFilePath, '', 'utf-8');

  const result = await readFileTool.execute({
    file_path: emptyFilePath,
  });

  t.true(result.success, 'Should successfully read empty file');

  if (result.success) {
    t.is(result.data.content, '', 'Content should be empty');
    t.is(result.data.lineCount, 1, 'Empty file has 1 line (empty string)');
  }
});

test('unit: read_file - handles file with special characters', async (t) => {
  const specialContent = 'Line 1\n\tTabbed line\nSpecial chars: @#$%^&*()\nUnicode: 你好世界 🚀';
  const specialFilePath = path.join(testDir, 'special.txt');
  await fs.writeFile(specialFilePath, specialContent, 'utf-8');

  const result = await readFileTool.execute({
    file_path: specialFilePath,
  });

  t.true(result.success, 'Should successfully read file with special characters');

  if (result.success) {
    t.true(result.data.content.includes('你好世界'), 'Should preserve Unicode characters');
    t.true(result.data.content.includes('@#$%^&*()'), 'Should preserve special characters');
    t.true(result.data.content.includes('\t'), 'Should preserve tabs');
  }
});
