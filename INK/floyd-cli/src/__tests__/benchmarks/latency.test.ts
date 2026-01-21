import test from 'ava';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { rm } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic import for CacheManager
async function getCacheManager() {
  const { CacheManager } = await import('../../../dist/cache/cache-manager.js');
  return CacheManager;
}

/**
 * Latency Benchmarks for SUPERCACHING
 * 
 * These tests measure the time taken for individual cache operations.
 * Targets are based on typical performance expectations for file-based caching.
 */

function createTempCacheDir(): string {
  return join('/tmp', `floyd-bench-latency-${Date.now()}`);
}

async function cleanupCacheDir(cacheDir: string): Promise<void> {
  try {
    await rm(cacheDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

test('Latency: store operation completes in <10ms', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  const start = performance.now();
  await cacheManager.store('reasoning', 'test-key', 'test-value');
  const end = performance.now();
  
  const latency = end - start;
  t.true(latency < 10, `Store latency ${latency.toFixed(2)}ms should be <10ms`);
  
  await cleanupCacheDir(cacheDir);
});

test('Latency: retrieve operation completes in <5ms', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // First store a value
  await cacheManager.store('reasoning', 'test-key', 'test-value');
  
  const start = performance.now();
  await cacheManager.retrieve('reasoning', 'test-key');
  const end = performance.now();
  
  const latency = end - start;
  t.true(latency < 5, `Retrieve latency ${latency.toFixed(2)}ms should be <5ms`);
  
  await cleanupCacheDir(cacheDir);
});

test('Latency: list operation completes in <50ms for 100 entries', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // Store 100 entries
  for (let i = 0; i < 100; i++) {
    await cacheManager.store('project', `key-${i}`, `value-${i}`);
  }
  
  const start = performance.now();
  await cacheManager.list('project');
  const end = performance.now();
  
  const latency = end - start;
  t.true(latency < 50, `List latency ${latency.toFixed(2)}ms should be <50ms for 100 entries`);
  
  await cleanupCacheDir(cacheDir);
});

test('Latency: delete operation completes in <10ms', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // First store a value
  await cacheManager.store('reasoning', 'test-key', 'test-value');
  
  const start = performance.now();
  await cacheManager.delete('reasoning', 'test-key');
  const end = performance.now();
  
  const latency = end - start;
  t.true(latency < 10, `Delete latency ${latency.toFixed(2)}ms should be <10ms`);
  
  await cleanupCacheDir(cacheDir);
});

test('Latency: clear operation completes in <100ms', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // Store 50 entries
  for (let i = 0; i < 50; i++) {
    await cacheManager.store('vault', `key-${i}`, `value-${i}`);
  }
  
  const start = performance.now();
  await cacheManager.clear('vault');
  const end = performance.now();
  
  const latency = end - start;
  t.true(latency < 100, `Clear latency ${latency.toFixed(2)}ms should be <100ms for 50 entries`);
  
  await cleanupCacheDir(cacheDir);
});

test('Latency: search operation completes in <100ms', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // Store 50 entries with some searchable content
  for (let i = 0; i < 50; i++) {
    await cacheManager.store('project', `search-key-${i}`, `searchable-value-${i}`);
  }
  
  const start = performance.now();
  await cacheManager.search('project', 'searchable');
  const end = performance.now();
  
  const latency = end - start;
  t.true(latency < 100, `Search latency ${latency.toFixed(2)}ms should be <100ms`);
  
  await cleanupCacheDir(cacheDir);
});
