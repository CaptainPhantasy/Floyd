/**
 * Unit Tests: Permission Manager
 *
 * Tests for src/permissions/permission-manager.ts
 */

import test from 'ava';
import { PermissionManager } from '../../../dist/permissions/permission-manager.js';
import { toolRegistry } from '../../../dist/tools/tool-registry.js';
import { registerCoreTools } from '../../../dist/tools/index.js';

// ============================================================================
// Test Setup
// ============================================================================

/**
 * Setup test environment before all tests
 */
test.before(async () => {
  // Register core tools for testing
  registerCoreTools();
});

/**
 * Reset permission manager state before each test
 */
test.beforeEach(() => {
  // Note: beforeEach can't modify test scope
  // Each test creates its own PermissionManager instance
});

// ============================================================================
// Test Cases
// ============================================================================

test('unit: permission_manager - auto-approves tools with none permission level', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(false); // Disable auto-confirm to test actual logic

  // read_file has 'none' permission level
  const result = await pm.requestPermission('read_file', {
    file_path: '/tmp/test.txt',
  });

  t.true(result, 'Should auto-approve tools with none permission level');
});

test('unit: permission_manager - auto-approves non-dangerous tools in auto-confirm mode', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  // git_status has 'moderate' permission level
  const result = await pm.requestPermission('git_status', {});

  t.true(result, 'Should auto-approve moderate tools in auto-confirm mode');
});

test('unit: permission_manager - denies dangerous tools even in auto-confirm mode', async (t) => {
  // FIXED: Uses mock prompt function instead of interactive stdin
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  // Set mock prompt to deny dangerous operations
  pm.setPromptFunction(async () => false);

  // git_commit has 'dangerous' permission level
  const result = await pm.requestPermission('git_commit', {
    message: 'Test commit',
  });

  // In auto-confirm mode, dangerous tools still prompt (now using our mock)
  // Our mock returns false, so permission is denied
  t.false(result, 'Should deny dangerous tools when prompt returns false');
});

test('unit: permission_manager - returns false for non-existent tool', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  const result = await pm.requestPermission('non_existent_tool', {});

  t.false(result, 'Should return false for non-existent tool');
});

test('unit: permission_manager - setAutoConfirm updates state', (t) => {
  const pm = new PermissionManager();

  pm.setAutoConfirm(true);
  t.true(pm.isAutoConfirm(), 'Auto-confirm should be enabled');

  pm.setAutoConfirm(false);
  t.false(pm.isAutoConfirm(), 'Auto-confirm should be disabled');
});

test('unit: permission_manager - isAutoConfirm returns initial state', (t) => {
  const pm = new PermissionManager();

  t.false(pm.isAutoConfirm(), 'Initial auto-confirm state should be false');
});

test('unit: permission_manager - handles complex input parameters', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  const complexInput = {
    file_path: '/tmp/test.txt',
    offset: 10,
    limit: 5,
    special: 'chars',
    number: 42,
    boolean: true,
  };

  // read_file has 'none' permission level
  const result = await pm.requestPermission('read_file', complexInput);

  t.true(result, 'Should handle complex input parameters');
});

test('unit: permission_manager - handles tools with moderate permission', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  // git_diff has 'moderate' permission level
  const result = await pm.requestPermission('git_diff', {
    filePath: '/tmp/test.txt',
  });

  t.true(result, 'Should approve moderate tools in auto-confirm mode');
});

test('unit: permission_manager - handles tools with dangerous permission', async (t) => {
  // FIXED: Uses mock prompt function instead of interactive stdin
  const pm = new PermissionManager();
  pm.setAutoConfirm(false);

  // Set mock prompt to deny dangerous operations
  pm.setPromptFunction(async () => false);

  // apply_unified_diff has 'dangerous' permission level
  const result = await pm.requestPermission('apply_unified_diff', {
    diff: 'test diff',
    filePath: '/tmp/test.txt',
  });

  t.false(result, 'Should deny dangerous tools when prompt returns false');
});

test('unit: permission_manager - tool registry integration', async (t) => {
  const pm = new PermissionManager();

  // Verify tool is registered
  const tool = toolRegistry.get('read_file');
  t.truthy(tool, 'Tool should be registered in registry');
  t.is(tool?.name, 'read_file', 'Tool name should match');
  t.is(tool?.permission, 'none', 'Tool should have none permission level');

  // Test permission request
  pm.setAutoConfirm(false);
  const result = await pm.requestPermission('read_file', {
    file_path: '/tmp/test.txt',
  });

  t.true(result, 'Should auto-approve based on tool permission level');
});

test('unit: permission_manager - handles cache tools', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  // cache_store has 'moderate' permission level
  const result = await pm.requestPermission('cache_store', {
    key: 'test-key',
    value: 'test-value',
  });

  t.true(result, 'Should approve cache tools in auto-confirm mode');
});

test('unit: permission_manager - handles search tools', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  // grep has 'moderate' permission level
  const result = await pm.requestPermission('grep', {
    pattern: 'test',
    path: '/tmp',
  });

  t.true(result, 'Should approve search tools in auto-confirm mode');
});

test('unit: permission_manager - handles system tools', async (t) => {
  // FIXED: Uses mock prompt function instead of interactive stdin
  const pm = new PermissionManager();
  pm.setAutoConfirm(false);

  // Set mock prompt to approve the request
  pm.setPromptFunction(async () => true);

  // run has 'dangerous' permission level
  const result = await pm.requestPermission('run', {
    command: 'echo test',
  });

  t.true(result, 'Should approve dangerous system tools when prompt returns true');
});

test('unit: permission_manager - handles browser tools', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  // browser_navigate has 'moderate' permission level
  const result = await pm.requestPermission('browser_navigate', {
    url: 'https://example.com',
  });

  t.true(result, 'Should approve browser tools in auto-confirm mode');
});

test('unit: permission_manager - handles dangerous tools (delete_file)', async (t) => {
  // FIXED: Uses mock prompt function instead of interactive stdin
  const pm = new PermissionManager();
  pm.setAutoConfirm(false);

  // Set mock prompt to approve the request
  pm.setPromptFunction(async () => true);

  // delete_file has 'dangerous' permission level
  const result = await pm.requestPermission('delete_file', {
    filePath: '/tmp/test.txt',
  });

  t.true(result, 'Should approve dangerous tools when prompt returns true');
});

test('unit: permission_manager - multiple permission requests maintain state', async (t) => {
  // FIXED: Uses mock prompt function instead of interactive stdin
  const pm = new PermissionManager();
  pm.setAutoConfirm(false);

  // Set mock prompt that denies requests
  pm.setPromptFunction(async () => false);

  // First request - none permission (auto-approve without prompt)
  const result1 = await pm.requestPermission('read_file', {
    file_path: '/tmp/test.txt',
  });
  t.true(result1, 'First request (none permission) should be auto-approved');

  // Second request - moderate permission (git_stage has 'moderate' permission)
  const result2 = await pm.requestPermission('git_stage', {
    paths: ['/tmp/test.txt'],
  });
  t.false(result2, 'Second request should be denied when prompt returns false');

  // Third request - another moderate permission (git_unstage)
  const result3 = await pm.requestPermission('git_unstage', {
    paths: ['/tmp/test.txt'],
  });
  t.false(result3, 'Third request should also be denied');

  // Verify auto-confirm state is unchanged
  t.false(pm.isAutoConfirm(), 'Auto-confirm state should remain false');
});

test('unit: permission_manager - handles empty input object', async (t) => {
  const pm = new PermissionManager();
  pm.setAutoConfirm(true);

  // git_status has no required parameters
  const result = await pm.requestPermission('git_status', {});

  t.true(result, 'Should handle empty input object');
});
