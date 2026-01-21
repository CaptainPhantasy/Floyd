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
 * Throughput Benchmarks for SUPERCACHING
 * 
 * These tests measure the number of operations per second the cache can handle.
 * Targets are based on typical performance expectations for file-based caching.
 */

function createTempCacheDir(): string {
  return join('/tmp', `floyd-bench-throughput-${Date.now()}`);
}

async function cleanupCacheDir(cacheDir: string): Promise<void> {
  try {
    await rm(cacheDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

test('Throughput: store achieves >100 ops/sec', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  const opsCount = 100;
  const start = performance.now();
  
  for (let i = 0; i < opsCount; i++) {
    await cacheManager.store('reasoning', `key-${i}`, `value-${i}`);
  }
  
  const end = performance.now();
  const duration = (end - start) / 1000; // Convert to seconds
  const throughput = opsCount / duration;
  
  t.true(throughput > 100, `Store throughput ${throughput.toFixed(2)} ops/sec should be >100`);
  
  await cleanupCacheDir(cacheDir);
});

test('Throughput: retrieve achieves >200 ops/sec', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // Pre-populate cache
  const opsCount = 200;
  for (let i = 0; i < opsCount; i++) {
    await cacheManager.store('reasoning', `key-${i}`, `value-${i}`);
  }
  
  const start = performance.now();
  
  for (let i = 0; i < opsCount; i++) {
    await cacheManager.retrieve('reasoning', `key-${i}`);
  }
  
  const end = performance.now();
  const duration = (end - start) / 1000; // Convert to seconds
  const throughput = opsCount / duration;
  
  t.true(throughput > 200, `Retrieve throughput ${throughput.toFixed(2)} ops/sec should be >200`);
  
  await cleanupCacheDir(cacheDir);
});

test('Throughput: mixed operations achieve >150 ops/sec', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // Pre-populate with some data
  for (let i = 0; i < 50; i++) {
    await cacheManager.store('project', `key-${i}`, `value-${i}`);
  }
  
  const opsCount = 150;
  const start = performance.now();
  
  // Mix of store, retrieve, and delete operations
  for (let i = 0; i < opsCount; i++) {
    const op = i % 3;
    if (op === 0) {
      await cacheManager.store('project', `mixed-key-${i}`, `mixed-value-${i}`);
    } else if (op === 1) {
      await cacheManager.retrieve('project', `key-${i % 50}`);
    } else {
      await cacheManager.delete('project', `key-${i % 50}`);
    }
  }
  
  const end = performance.now();
  const duration = (end - start) / 1000; // Convert to seconds
  const throughput = opsCount / duration;
  
  t.true(throughput > 150, `Mixed operations throughput ${throughput.toFixed(2)} ops/sec should be >150`);
  
  await cleanupCacheDir(cacheDir);
});

test('Throughput: concurrent operations handle >50 ops/sec', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  const opsCount = 50;
  const start = performance.now();
  
  // Simulate concurrent operations with Promise.all
  const operations = [];
  for (let i = 0; i < opsCount; i++) {
    operations.push(cacheManager.store('vault', `concurrent-${i}`, `value-${i}`));
  }
  
  await Promise.all(operations);
  
  const end = performance.now();
  const duration = (end - start) / 1000; // Convert to seconds
  const throughput = opsCount / duration;
  
  t.true(throughput > 50, `Concurrent operations throughput ${throughput.toFixed(2)} ops/sec should be >50`);
  
  await cleanupCacheDir(cacheDir);
});
