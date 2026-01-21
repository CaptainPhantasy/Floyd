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
 * Memory Benchmarks for SUPERCACHING
 * 
 * These tests measure the memory usage of cache operations.
 * Targets are based on efficient file-based storage expectations.
 */

function createTempCacheDir(): string {
  return join('/tmp', `floyd-bench-memory-${Date.now()}`);
}

async function cleanupCacheDir(cacheDir: string): Promise<void> {
  try {
    await rm(cacheDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

test('Memory: average entry size <1KB', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // Store 100 entries with typical data
  const entryCount = 100;
  for (let i = 0; i < entryCount; i++) {
    await cacheManager.store('reasoning', `key-${i}`, `value-${i}-with-some-data`);
  }
  
  // Get file sizes for all entries
  const fs = await import('fs/promises');
  const tierPath = join(cacheDir, '.floyd', '.cache', 'reasoning');
  const files = await fs.readdir(tierPath);
  
  let totalSize = 0;
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = join(tierPath, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
    }
  }
  
  const avgSizeBytes = totalSize / entryCount;
  const avgSizeKB = avgSizeBytes / 1024;
  
  t.true(avgSizeKB < 1, `Average entry size ${avgSizeKB.toFixed(2)}KB should be <1KB`);
  
  await cleanupCacheDir(cacheDir);
});

test('Memory: total usage <10MB for 1000 entries', async t => {
  const cacheDir = createTempCacheDir();
  const CacheManager = await getCacheManager();
  const cacheManager = new CacheManager(cacheDir);

  // Store 1000 entries across tiers
  const entryCount = 1000;
  const perTier = entryCount / 3;
  
  for (let i = 0; i < perTier; i++) {
    await cacheManager.store('reasoning', `r-${i}`, `value-data-${i}`);
    await cacheManager.store('project', `p-${i}`, `value-data-${i}`);
    await cacheManager.store('vault', `v-${i}`, `value-data-${i}`);
  }
  
  // Calculate total directory size
  const getDirectorySize = async (dirPath: string): Promise<number> => {
    const fs = await import('fs/promises');
    let size = 0;
    
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        const filePath = join(dirPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          size += await getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
    } catch {
      // Directory doesn't exist yet
    }
    
    return size;
  };
  
  const cachePath = join(cacheDir, '.floyd', '.cache');
  const totalSize = await getDirectorySize(cachePath);
  const totalSizeMB = totalSize / (1024 * 1024);
  
  t.true(totalSizeMB < 10, `Total memory usage ${totalSizeMB.toFixed(2)}MB should be <10MB for 1000 entries`);
  
  await cleanupCacheDir(cacheDir);
});
