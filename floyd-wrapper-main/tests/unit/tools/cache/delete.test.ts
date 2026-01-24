/**
 * Unit Tests: Cache Delete Tool
 *
 * Tests for src/tools/cache/index.ts (cache_delete tool)
 */

import test from 'ava';
import fs from 'fs-extra';
import path from 'path';
import { cacheDeleteTool, cacheStoreTool, cacheRetrieveTool, setProjectRoot } from '../../../../src/tools/cache/index.ts';

// ============================================================================
// Test Setup
// ============================================================================

const testCacheDir = path.join(process.cwd(), 'tests', '.tmp-cache-delete');
let testCounter = 0;

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
  testCounter++;
});

// Helper to generate unique keys
function getUniqueKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// ============================================================================
// Test Cases
// ============================================================================

test.serial('unit: cache_delete - successfully deletes existing entry', async (t) => {
  const uniqueKey = getUniqueKey('delete-test-key');

  // First store an entry
  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: uniqueKey,
    value: 'delete-test-value',
  });

  // Verify it exists
  const retrieveBefore = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: uniqueKey,
  });
  t.true(retrieveBefore.success);
  t.true(retrieveBefore.data?.found, 'Entry should exist before deletion');

  // Delete it
  const result = await cacheDeleteTool.execute({
    tier: 'reasoning',
    key: uniqueKey,
  });

  t.true(result.success, 'Should successfully delete entry');
  t.falsy(result.error, 'Should not have error');

  if (result.success && result.data) {
    t.true(result.data.success, 'Should indicate deletion was successful');
    t.is(result.data.key, uniqueKey, 'Key should match');
    t.is(result.data.tier, 'reasoning', 'Tier should be reasoning');
    t.true(result.data.message.includes('Deleted'), 'Message should confirm deletion');
  }

  // Verify it's gone
  const retrieveAfter = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: uniqueKey,
  });
  t.false(retrieveAfter.success, 'Should not find deleted entry');
});

test.serial('unit: cache_delete - returns success false for non-existent entry', async (t) => {
  const uniqueKey = getUniqueKey('non-existent-delete-key');

  const result = await cacheDeleteTool.execute({
    tier: 'project',
    key: uniqueKey,
  });

  t.false(result.success, 'Should return false for non-existent entry');
  t.falsy(result.error, 'Should not have error');

  if (result.data) {
    t.false(result.data.success, 'Should indicate entry was not found');
    t.is(result.data.key, uniqueKey, 'Key should match');
    t.true(result.data.message.includes('Not found'), 'Message should indicate not found');
  }
});

test.serial('unit: cache_delete - deletes from different tiers', async (t) => {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Store in different tiers with unique keys
  await cacheStoreTool.execute({
    tier: 'reasoning',
    key: `delete-reasoning-${uniqueSuffix}`,
    value: 'reasoning-value',
  });

  await cacheStoreTool.execute({
    tier: 'project',
    key: `delete-project-${uniqueSuffix}`,
    value: 'project-value',
  });

  await cacheStoreTool.execute({
    tier: 'vault',
    key: `delete-vault-${uniqueSuffix}`,
    value: 'vault-value',
  });

  // Delete from reasoning tier
  const reasoningResult = await cacheDeleteTool.execute({
    tier: 'reasoning',
    key: `delete-reasoning-${uniqueSuffix}`,
  });
  t.true(reasoningResult.success, 'Delete from reasoning should succeed');
  t.true(reasoningResult.data?.success, 'Should delete from reasoning');

  // Delete from project tier
  const projectResult = await cacheDeleteTool.execute({
    tier: 'project',
    key: `delete-project-${uniqueSuffix}`,
  });
  t.true(projectResult.success, 'Delete from project should succeed');
  t.true(projectResult.data?.success, 'Should delete from project');

  // Delete from vault tier
  const vaultResult = await cacheDeleteTool.execute({
    tier: 'vault',
    key: `delete-vault-${uniqueSuffix}`,
  });
  t.true(vaultResult.success, 'Delete from vault should succeed');
  t.true(vaultResult.data?.success, 'Should delete from vault');

  // Verify all are deleted
  const retrieveReasoning = await cacheRetrieveTool.execute({
    tier: 'reasoning',
    key: `delete-reasoning-${uniqueSuffix}`,
  });
  t.false(retrieveReasoning.success, 'Reasoning entry should be deleted');

  const retrieveProject = await cacheRetrieveTool.execute({
    tier: 'project',
    key: `delete-project-${uniqueSuffix}`,
  });
  t.false(retrieveProject.success, 'Project entry should be deleted');

  const retrieveVault = await cacheRetrieveTool.execute({
    tier: 'vault',
    key: `delete-vault-${uniqueSuffix}`,
  });
  t.false(retrieveVault.success, 'Vault entry should be deleted');
});

test.serial('unit: cache_delete - can delete same key twice without error', async (t) => {
  const uniqueKey = getUniqueKey('double-delete-key');

  // Store and delete once
  await cacheStoreTool.execute({
    tier: 'project',
    key: uniqueKey,
    value: 'double-delete-value',
  });

  const firstDelete = await cacheDeleteTool.execute({
    tier: 'project',
    key: uniqueKey,
  });
  t.true(firstDelete.success, 'First delete should return success');
  t.true(firstDelete.data?.success, 'First delete should succeed');

  // Delete again - should return false success since key doesn't exist
  const secondDelete = await cacheDeleteTool.execute({
    tier: 'project',
    key: uniqueKey,
  });
  t.false(secondDelete.success, 'Second delete should return false success');
  t.false(secondDelete.data?.success, 'Second delete should return not found');
});

test.serial('unit: cache_delete - tool definition has correct properties', async (t) => {
  t.is(cacheDeleteTool.name, 'cache_delete', 'Tool name should be cache_delete');
  t.is(cacheDeleteTool.category, 'cache', 'Tool category should be cache');
  t.is(cacheDeleteTool.permission, 'moderate', 'Tool permission should be moderate');
  t.is(typeof cacheDeleteTool.execute, 'function', 'Tool should have execute function');
  t.truthy(cacheDeleteTool.inputSchema, 'Tool should have input schema');
  t.true(typeof cacheDeleteTool.description === 'string', 'Tool should have description');
});
