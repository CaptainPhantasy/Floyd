/**
 * Unit Tests: Cache Store Tool
 *
 * Tests for src/tools/cache/index.ts (cache_store tool)
 */

import test from 'ava';
import fs from 'fs-extra';
import path from 'path';
import { cacheStoreTool, setProjectRoot } from '../../../../src/tools/cache/index.ts';

// ============================================================================
// Test Setup
// ============================================================================

const testCacheDir = path.join(process.cwd(), 'tests', '.tmp-cache-store');

/**
 * Setup test environment before each test
 */
test.before(async () => {
  // Create test cache directory
  await fs.ensureDir(testCacheDir);
  // Set cache to use test directory
  setProjectRoot(testCacheDir);
});

/**
 * Cleanup test environment after each test
 */
test.afterEach.always(async () => {
  // Clean up cache directory after each test - remove .floyd subdirectory too
  const floydDir = path.join(testCacheDir, '.floyd');
  if (await fs.pathExists(floydDir)) {
    await fs.remove(floydDir);
  }
});

// ============================================================================
// Test Cases
// ============================================================================

test.serial('unit: cache_store - successfully stores data to reasoning tier', async (t) => {
  const result = await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'test-key-1',
    value: 'test-value-1',
  });

  t.true(result.success, 'Should successfully store data');
  t.falsy(result.error, 'Should not have error');

  if (result.success) {
    t.is(result.data.tier, 'reasoning', 'Tier should be reasoning');
    t.is(result.data.key, 'test-key-1', 'Key should match');
    t.true(result.data.message.includes('Stored to reasoning tier'), 'Message should confirm storage');
  }
});

test.serial('unit: cache_store - successfully stores data to project tier', async (t) => {
  const result = await cacheStoreTool.execute({
    tier: 'project',
    key: 'project-key',
    value: 'project-value',
  });

  t.true(result.success, 'Should successfully store data');

  if (result.success) {
    t.is(result.data.tier, 'project', 'Tier should be project');
    t.is(result.data.key, 'project-key', 'Key should match');
  }
});

test.serial('unit: cache_store - successfully stores data to vault tier', async (t) => {
  const result = await cacheStoreTool.execute({
    tier: 'vault',
    key: 'vault-key',
    value: 'vault-value',
  });

  t.true(result.success, 'Should successfully store data');

  if (result.success) {
    t.is(result.data.tier, 'vault', 'Tier should be vault');
    t.is(result.data.key, 'vault-key', 'Key should match');
  }
});

test.serial('unit: cache_store - stores data with metadata', async (t) => {
  const metadata = { tags: ['test', 'example'], priority: 1 };
  const result = await cacheStoreTool.execute({
    tier: 'project',
    key: 'metadata-key',
    value: 'metadata-value',
    metadata,
  });

  t.true(result.success, 'Should successfully store data with metadata');
  t.is(result.data.key, 'metadata-key', 'Key should match');
});

test.serial('unit: cache_store - stores data with special characters in value', async (t) => {
  const specialValue = 'Value with special chars: @#$%^&*()\nNewlines\tTabs\nUnicode: 你好世界 🚀';
  const result = await cacheStoreTool.execute({
    tier: 'vault',
    key: 'special-chars-key',
    value: specialValue,
  });

  t.true(result.success, 'Should successfully store data with special characters');
  t.is(result.data.key, 'special-chars-key', 'Key should match');
});

test.serial('unit: cache_store - stores large data', async (t) => {
  const largeValue = 'x'.repeat(10000); // 10KB of data
  const result = await cacheStoreTool.execute({
    tier: 'project',
    key: 'large-data-key',
    value: largeValue,
  });

  t.true(result.success, 'Should successfully store large data');
  t.is(result.data.key, 'large-data-key', 'Key should match');
});

test.serial('unit: cache_store - stores empty string value', async (t) => {
  const result = await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'empty-value-key',
    value: '',
  });

  t.true(result.success, 'Should successfully store empty string');
  t.is(result.data.key, 'empty-value-key', 'Key should match');
});

test.serial('unit: cache_store - tool definition has correct properties', async (t) => {
  t.is(cacheStoreTool.name, 'cache_store', 'Tool name should be cache_store');
  t.is(cacheStoreTool.category, 'cache', 'Tool category should be cache');
  t.is(cacheStoreTool.permission, 'none', 'Tool permission should be none');
  t.is(typeof cacheStoreTool.execute, 'function', 'Tool should have execute function');
  t.truthy(cacheStoreTool.inputSchema, 'Tool should have input schema');
  t.true(typeof cacheStoreTool.description === 'string', 'Tool should have description');
});
