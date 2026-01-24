/**
 * Unit Tests: Cache Retrieve Tool
 *
 * Tests for src/tools/cache/index.ts (cache_retrieve tool)
 */

import test from 'ava';
import fs from 'fs-extra';
import path from 'path';
import { cacheRetrieveTool, cacheStoreTool, setProjectRoot } from '../../../../src/tools/cache/index.ts';

// ============================================================================
// Test Setup
// ============================================================================

const testCacheDir = path.join(process.cwd(), 'tests', '.tmp-cache-retrieve');

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

test.serial('unit: cache_retrieve - successfully retrieves existing entry', async (t) => {
  // First store an entry
  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'retrieve-test-key',
    value: 'retrieve-test-value',
  });

  // Then retrieve it
  const result = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: 'retrieve-test-key',
  });

  t.true(result.success, 'Should successfully retrieve entry');
  t.falsy(result.error, 'Should not have error');

  if (result.success) {
    t.true(result.data.found, 'Should indicate entry was found');
    t.is(result.data.value, 'retrieve-test-value', 'Value should match');
    t.is(result.data.key, 'retrieve-test-key', 'Key should match');
    t.is(result.data.tier, 'reasoning', 'Tier should be reasoning');
  }
});

test.serial('unit: cache_retrieve - returns null for non-existent entry', async (t) => {
  const result = await cacheRetrieveTool.execute({
    tier: 'project',
    key: 'non-existent-key',
  });

  t.false(result.success, 'Should return false for cache miss');
  t.falsy(result.error, 'Should not have error');

  if (result.data) {
    t.false(result.data.found, 'Should indicate entry was not found');
    t.is(result.data.value, null, 'Value should be null');
    t.is(result.data.key, 'non-existent-key', 'Key should match');
  }
});

test.serial('unit: cache_retrieve - retrieves from different tiers', async (t) => {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Store in different tiers
  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: `tier-reasoning-${uniqueSuffix}`,
    value: 'reasoning-value',
  });

  await cacheStoreTool.execute({
    tier: 'project',
    key: `tier-project-${uniqueSuffix}`,
    value: 'project-value',
  });

  await cacheStoreTool.execute({
    tier: 'vault',
    key: `tier-vault-${uniqueSuffix}`,
    value: 'vault-value',
  });

  // Retrieve from reasoning tier
  const reasoningResult = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: `tier-reasoning-${uniqueSuffix}`,
  });
  t.true(reasoningResult.success);
  if (reasoningResult.success) {
    t.is(reasoningResult.data.value, 'reasoning-value', 'Should retrieve from reasoning');
  }

  // Retrieve from project tier
  const projectResult = await cacheRetrieveTool.execute({
    tier: 'project',
    key: `tier-project-${uniqueSuffix}`,
  });
  t.true(projectResult.success);
  if (projectResult.success) {
    t.is(projectResult.data.value, 'project-value', 'Should retrieve from project');
  }

  // Retrieve from vault tier
  const vaultResult = await cacheRetrieveTool.execute({
    tier: 'vault',
    key: `tier-vault-${uniqueSuffix}`,
  });
  t.true(vaultResult.success);
  if (vaultResult.success) {
    t.is(vaultResult.data.value, 'vault-value', 'Should retrieve from vault');
  }
});

test.serial('unit: cache_retrieve - retrieves entry with special characters', async (t) => {
  const specialValue = 'Special: @#$%^&*()\nNewlines\nTabs:\tUnicode: 你好世界 🚀';

  await cacheStoreTool.execute({
    tier: 'vault',
    key: 'special-retrieve-key',
    value: specialValue,
  });

  const result = await cacheRetrieveTool.execute({
    tier: 'vault',
    key: 'special-retrieve-key',
  });

  t.true(result.success, 'Should successfully retrieve entry with special characters');

  if (result.success) {
    t.true(result.data.found, 'Should indicate entry was found');
    t.is(result.data.value, specialValue, 'Value should match exactly');
  }
});

test.serial('unit: cache_retrieve - retrieves large data', async (t) => {
  const largeValue = 'x'.repeat(10000); // 10KB of data

  await cacheStoreTool.execute({
    tier: 'project',
    key: 'large-retrieve-key',
    value: largeValue,
  });

  const result = await cacheRetrieveTool.execute({
    tier: 'project',
    key: 'large-retrieve-key',
  });

  t.true(result.success, 'Should successfully retrieve large data');

  if (result.success) {
    t.true(result.data.found, 'Should indicate entry was found');
    t.is(result.data.value, largeValue, 'Value should match exactly');
    t.is(result.data.value.length, 10000, 'Value length should be 10000');
  }
});

test.serial('unit: cache_retrieve - retrieves entry with numeric-like value', async (t) => {
  const numericValue = '12345';

  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'numeric-retrieve-key',
    value: numericValue,
  });

  const result = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: 'numeric-retrieve-key',
  });

  t.true(result.success, 'Should successfully retrieve numeric-like value');

  if (result.success) {
    t.true(result.data.found, 'Should indicate entry was found');
    t.is(result.data.value, numericValue, 'Value should match exactly');
  }
});

test.serial('unit: cache_retrieve - tool definition has correct properties', async (t) => {
  t.is(cacheRetrieveTool.name, 'cache_retrieve', 'Tool name should be cache_retrieve');
  t.is(cacheRetrieveTool.category, 'cache', 'Tool category should be cache');
  t.is(cacheRetrieveTool.permission, 'none', 'Tool permission should be none');
  t.is(typeof cacheRetrieveTool.execute, 'function', 'Tool should have execute function');
  t.truthy(cacheRetrieveTool.inputSchema, 'Tool should have input schema');
  t.true(typeof cacheRetrieveTool.description === 'string', 'Tool should have description');
});
