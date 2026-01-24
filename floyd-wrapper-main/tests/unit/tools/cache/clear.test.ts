/**
 * Unit Tests: Cache Clear Tool
 *
 * Tests for src/tools/cache/index.ts (cache_clear tool)
 */

import test from 'ava';
import fs from 'fs-extra';
import path from 'path';
import { cacheClearTool, cacheStoreTool, cacheRetrieveTool, setProjectRoot } from '../../../../src/tools/cache/index.ts';

// ============================================================================
// Test Setup
// ============================================================================

const testCacheDir = path.join(process.cwd(), 'tests', '.tmp-cache-clear');

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

test.serial('unit: cache_clear - clears specific tier', async (t) => {
  // Store multiple entries in reasoning tier
  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'clear-reasoning-1',
    value: 'value-1',
  });

  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'clear-reasoning-2',
    value: 'value-2',
  });

  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'clear-reasoning-3',
    value: 'value-3',
  });

  // Store entries in other tiers to ensure they're not affected
  await cacheStoreTool.execute({
    tier: 'project',
    key: 'clear-project-1',
    value: 'project-value',
  });

  // Clear reasoning tier
  const result = await cacheClearTool.execute({
    tier: 'reasoning',
  });

  t.true(result.success, 'Should successfully clear tier');
  t.falsy(result.error, 'Should not have error');

  if (result.success) {
    t.true(result.data.success, 'Should indicate clear was successful');
    t.is(result.data.tier, 'reasoning', 'Tier should be reasoning');
    t.true(result.data.deleted >= 3, 'Should have deleted at least 3 entries');
    t.true(result.data.message.includes('Cleared'), 'Message should confirm clearing');
  }

  // Verify reasoning entries are deleted
  const retrieveReasoning1 = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: 'clear-reasoning-1',
  });
  t.false(retrieveReasoning1.data?.found, 'Reasoning entry 1 should be deleted');

  const retrieveReasoning2 = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: 'clear-reasoning-2',
  });
  t.false(retrieveReasoning2.data?.found, 'Reasoning entry 2 should be deleted');

  const retrieveReasoning3 = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: 'clear-reasoning-3',
  });
  t.false(retrieveReasoning3.data?.found, 'Reasoning entry 3 should be deleted');

  // Verify project entry still exists
  const retrieveProject = await cacheRetrieveTool.execute({
    tier: 'project',
    key: 'clear-project-1',
  });
  t.true(retrieveProject.data?.found, 'Project entry should still exist');
});

test.serial('unit: cache_clear - clears all tiers when no tier specified', async (t) => {
  // Store entries in all tiers
  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: 'clear-all-reasoning',
    value: 'reasoning-value',
  });

  await cacheStoreTool.execute({
    tier: 'project',
    key: 'clear-all-project',
    value: 'project-value',
  });

  await cacheStoreTool.execute({
    tier: 'vault',
    key: 'clear-all-vault',
    value: 'vault-value',
  });

  // Clear all tiers
  const result = await cacheClearTool.execute({});

  t.true(result.success, 'Should successfully clear all tiers');
  t.falsy(result.error, 'Should not have error');

  if (result.success) {
    t.true(result.data.success, 'Should indicate clear was successful');
    t.is(result.data.tier, 'all', 'Tier should be "all"');
    t.true(result.data.deleted >= 3, 'Should have deleted at least 3 entries');
  }

  // Verify all entries are deleted
  const retrieveReasoning = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: 'clear-all-reasoning',
  });
  t.false(retrieveReasoning.data?.found, 'Reasoning entry should be deleted');

  const retrieveProject = await cacheRetrieveTool.execute({
    tier: 'project',
    key: 'clear-all-project',
  });
  t.false(retrieveProject.data?.found, 'Project entry should be deleted');

  const retrieveVault = await cacheRetrieveTool.execute({
    tier: 'vault',
    key: 'clear-all-vault',
  });
  t.false(retrieveVault.data?.found, 'Vault entry should be deleted');
});

test.serial('unit: cache_clear - clears empty tier without error', async (t) => {
  // Clear an empty tier
  const result = await cacheClearTool.execute({
    tier: 'vault',
  });

  t.true(result.success, 'Should successfully clear empty tier');
  t.falsy(result.error, 'Should not have error');

  if (result.success) {
    t.true(result.data.success, 'Should indicate clear was successful');
    t.is(result.data.deleted, 0, 'Should have deleted 0 entries');
  }
});

test.serial('unit: cache_clear - clears each tier independently', async (t) => {
  // Store entries in each tier
  await cacheStoreTool.execute({ tier: 'reasoning', key: 'test-1', value: 'v1' });
  await cacheStoreTool.execute({ tier: 'project', key: 'test-2', value: 'v2' });
  await cacheStoreTool.execute({ tier: 'vault', key: 'test-3', value: 'v3' });

  // Clear reasoning
  const clearReasoning = await cacheClearTool.execute({ tier: 'reasoning' });
  t.true(clearReasoning.success);
  t.true(clearReasoning.data?.deleted >= 1, 'Should clear reasoning');

  // Clear project
  const clearProject = await cacheClearTool.execute({ tier: 'project' });
  t.true(clearProject.success);
  t.true(clearProject.data?.deleted >= 1, 'Should clear project');

  // Clear vault
  const clearVault = await cacheClearTool.execute({ tier: 'vault' });
  t.true(clearVault.success);
  t.true(clearVault.data?.deleted >= 1, 'Should clear vault');

  // Verify all are cleared
  const retrieve1 = await cacheRetrieveTool.execute({ tier: 'reasoning', key: 'test-1' });
  const retrieve2 = await cacheRetrieveTool.execute({ tier: 'project', key: 'test-2' });
  const retrieve3 = await cacheRetrieveTool.execute({ tier: 'vault', key: 'test-3' });

  t.false(retrieve1.data?.found, 'Reasoning should be cleared');
  t.false(retrieve2.data?.found, 'Project should be cleared');
  t.false(retrieve3.data?.found, 'Vault should be cleared');
});

test.serial('unit: cache_clear - tool definition has correct properties', async (t) => {
  t.is(cacheClearTool.name, 'cache_clear', 'Tool name should be cache_clear');
  t.is(cacheClearTool.category, 'cache', 'Tool category should be cache');
  t.is(cacheClearTool.permission, 'dangerous', 'Tool permission should be dangerous');
  t.is(typeof cacheClearTool.execute, 'function', 'Tool should have execute function');
  t.truthy(cacheClearTool.inputSchema, 'Tool should have input schema');
  t.true(typeof cacheClearTool.description === 'string', 'Tool should have description');
});
