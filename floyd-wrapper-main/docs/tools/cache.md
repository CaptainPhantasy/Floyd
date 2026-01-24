# Cache System API

Complete API reference for multi-tier cache operations.

## Architecture

The cache system uses a **three-tier architecture**:

1. **L1 (Memory)** - Fastest, volatile, process-scoped
2. **L2 (Project)** - Medium speed, persistent, project-scoped
3. **L3 (Vault)** - Slower, persistent, cross-session

### Cache Tiers

| Tier | Speed | Persistence | Scope | Location |
|------|-------|-------------|-------|----------|
| **memory** | Fastest | Volatile | Process | In-memory |
| **project** | Fast | Persistent | Project | `.floyd/cache/` |
| **vault** | Medium | Persistent | Global | `.floyd/vault/` |
| **reasoning** | Fast | Persistent | Project | `.floyd/reasoning/` |

---

## Tools Overview

- [cache_store](#cache_store) - Store entries
- [cache_retrieve](#cache_retrieve) - Retrieve entries
- [cache_delete](#cache_delete) - Delete entries
- [cache_clear](#cache_clear) - Clear entire tiers
- [cache_list](#cache_list) - List entries
- [cache_search](#cache_search) - Search cache contents
- [cache_stats](#cache_stats) - View statistics
- [cache_prune](#cache_prune) - Remove expired entries
- [cache_store_pattern](#cache_store_pattern) - Pattern-based storage
- [cache_store_reasoning](#cache_store_reasoning) - Store reasoning chains
- [cache_load_reasoning](#cache_load_reasoning) - Load reasoning chains
- [cache_archive_reasoning](#cache_archive_reasoning) - Archive reasoning chains

---

## cache_store

Store entries in cache with optional TTL.

### Input Schema

```typescript
{
  tier: 'memory' | 'project' | 'vault';  // Required: Cache tier
  key: string;                           // Required: Entry key
  value: string | number | object;       // Required: Value to store
  ttl?: number;                          // Optional: Time-to-live in seconds
}
```

### Response

```typescript
{
  success: true,
  data: {
    tier: string;
    key: string;
    stored: boolean;
    expires_at?: string;  // ISO timestamp if TTL provided
  }
}
```

### Example

```typescript
// Store in memory (no persistence)
await cacheStoreTool.execute({
  tier: 'memory',
  key: 'temp-data',
  value: { count: 42 }
});

// Store in project cache with 1 hour TTL
await cacheStoreTool.execute({
  tier: 'project',
  key: 'api-response',
  value: response,
  ttl: 3600
});
```

---

## cache_retrieve

Retrieve entries from cache with automatic tier fallback.

### Input Schema

```typescript
{
  tier: 'memory' | 'project' | 'vault' | 'reasoning';  // Required: Starting tier
  key: string;                                         // Required: Entry key
}
```

### Response

```typescript
{
  success: true,
  data: {
    found: boolean;
    tier: string;        // Actual tier where found
    key: string;
    value: any;
    cached_at?: string;  // ISO timestamp
  }
}
```

### Fallback Behavior

If key not found in specified tier:
- `memory` → Search `project`
- `project` → Search `vault`
- `vault` → Not found
- `reasoning` → No fallback

### Example

```typescript
// Retrieve from project (falls back to vault if not found)
const result = await cacheRetrieveTool.execute({
  tier: 'project',
  key: 'api-config'
});

if (result.success && result.data.found) {
  console.log('Found in:', result.data.tier);
  console.log('Value:', result.data.value);
}
```

---

## cache_delete

Delete entries from cache.

### Input Schema

```typescript
{
  tier: 'memory' | 'project' | 'vault' | 'reasoning';  // Required: Cache tier
  key: string;                                         // Required: Entry key
}
```

### Response

```typescript
{
  success: true,
  data: {
    tier: string;
    key: string;
    deleted: boolean;
  }
}
```

### Example

```typescript
await cacheDeleteTool.execute({
  tier: 'project',
  key: 'old-cache-entry'
});
```

---

## cache_clear

Clear entire cache tiers or specific tiers.

### Input Schema

```typescript
{
  tier?: 'memory' | 'project' | 'vault' | 'all';  // Optional: Tier to clear (default: all)
}
```

### Response

```typescript
{
  success: true,
  data: {
    cleared: string[];
    count: number;
  }
}
```

### Example

```typescript
// Clear all tiers
await cacheClearTool.execute();

// Clear only memory
await cacheClearTool.execute({ tier: 'memory' });

// Clear project cache
await cacheClearTool.execute({ tier: 'project' });
```

---

## cache_list

List entries from cache tiers with filtering.

### Input Schema

```typescript
{
  tier?: 'memory' | 'project' | 'vault' | 'reasoning' | 'all';  // Optional (default: all)
  limit?: number;          // Optional: Maximum entries to return
  pattern?: string;        // Optional: Filter by key pattern (regex)
}
```

### Response

```typescript
{
  success: true,
  data: {
    entries: CacheEntry[];
    total: number;
  }
}

interface CacheEntry {
  key: string;
  tier: string;
  size: number;
  created_at: string;
  expires_at?: string;
}
```

### Example

```typescript
// List all entries
const all = await cacheListTool.execute();

// List only project cache
const project = await cacheListTool.execute({ tier: 'project' });

// List entries matching pattern
const filtered = await cacheListTool.execute({
  pattern: 'api-.*',
  limit: 10
});
```

---

## cache_search

Search cache contents across all tiers.

### Input Schema

```typescript
{
  query: string;           // Required: Search query (regex supported)
  tier?: 'memory' | 'project' | 'vault' | 'reasoning' | 'all';  // Optional (default: all)
  max_results?: number;    // Optional: Maximum results (default: 50)
}
```

### Response

```typescript
{
  success: true,
  data: {
    results: SearchResult[];
    count: number;
  }
}

interface SearchResult {
  key: string;
  tier: string;
  value: any;
  score: number;  // Relevance score
}
```

### Example

```typescript
// Search for API-related entries
const results = await cacheSearchTool.execute({
  query: 'api',
  max_results: 20
});
```

---

## cache_stats

View cache statistics and metrics.

### Input Schema

```typescript
{
  tier?: 'memory' | 'project' | 'vault' | 'all';  // Optional (default: all)
}
```

### Response

```typescript
{
  success: true,
  data: {
    tiers: {
      memory: TierStats;
      project: TierStats;
      vault: TierStats;
    };
    overall: {
      total_entries: number;
      total_size: number;
      hit_rate: number;  // Percentage
    };
  }
}

interface TierStats {
  entries: number;
  size: number;
  hits: number;
  misses: number;
  hit_rate: number;
}
```

### Example

```typescript
const stats = await cacheStatsTool.execute();

console.log('Total entries:', stats.data.overall.total_entries);
console.log('Hit rate:', stats.data.overall.hit_rate + '%');
console.log('Memory tier:', stats.data.tiers.memory);
```

---

## cache_prune

Remove expired entries from cache.

### Input Schema

```typescript
{
  tier?: 'memory' | 'project' | 'vault' | 'all';  // Optional (default: all)
}
```

### Response

```typescript
{
  success: true,
  data: {
    pruned: number;
    space_freed: number;
  }
}
```

### Example

```typescript
const result = await cachePruneTool.execute({
  tier: 'project'
});

console.log(`Pruned ${result.data.pruned} entries`);
console.log(`Freed ${result.data.space_freed} bytes`);
```

---

## cache_store_pattern

Store entries with regex pattern matching for retrieval.

### Input Schema

```typescript
{
  tier: 'project' | 'vault';  // Required: Cache tier
  pattern: string;            // Required: Regex pattern for matching
  value: any;                 // Required: Value to store
  ttl?: number;               // Optional: Time-to-live
}
```

### Example

```typescript
// Store pattern for all API URLs
await cacheStorePatternTool.execute({
  tier: 'project',
  pattern: 'https://api\\.example\\.com/.*',
  value: { rate_limit: 100, timeout: 5000 }
});

// Later retrieve with any matching URL
```

---

## cache_store_reasoning

Store reasoning chains with metadata.

### Input Schema

```typescript
{
  key: string;              // Required: Unique identifier
  chain: string;            // Required: Reasoning chain text
  metadata?: {
    prompt?: string;
    tokens?: number;
    model?: string;
    timestamp?: string;
  };
}
```

### Example

```typescript
await cacheStoreReasoningTool.execute({
  key: 'analysis-123',
  chain: 'Step 1: Analyze...\nStep 2: Evaluate...\nStep 3: Conclude...',
  metadata: {
    prompt: 'Analyze the code',
    tokens: 1500,
    model: 'glm-4.7'
  }
});
```

---

## cache_load_reasoning

Load reasoning chains from cache.

### Input Schema

```typescript
{
  key: string;  // Required: Reasoning chain identifier
}
```

### Response

```typescript
{
  success: true,
  data: {
    found: boolean;
    chain?: string;
    metadata?: object;
  }
}
```

---

## cache_archive_reasoning

Archive old reasoning chains to vault.

### Input Schema

```typescript
{
  older_than?: number;  // Optional: Age in days (default: 30)
}
```

### Response

```typescript
{
  success: true,
  data: {
    archived: number;
    space_freed: number;
  }
}
```

---

## Best Practices

### Use Memory Cache for Temporary Data

```typescript
// Good: Session data, temp calculations
await cacheStoreTool.execute({
  tier: 'memory',
  key: 'session-token',
  value: token
});
```

### Use Project Cache for Reusable Data

```typescript
// Good: API responses, computed results
await cacheStoreTool.execute({
  tier: 'project',
  key: 'api-config',
  value: config,
  ttl: 3600  // 1 hour
});
```

### Use Vault for Long-Term Storage

```typescript
// Good: Credentials, settings
await cacheStoreTool.execute({
  tier: 'vault',
  key: 'encryption-keys',
  value: keys
});
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `CACHE_ERROR` | General cache error |
| `INVALID_TIER` | Invalid cache tier specified |
| `KEY_NOT_FOUND` | Entry not found in cache |
| `SERIALIZATION_ERROR` | Failed to serialize value |
| `DESERIALIZATION_ERROR` | Failed to deserialize value |

---

**Category:** cache
**Tools:** 12
**Permission Level:** none
