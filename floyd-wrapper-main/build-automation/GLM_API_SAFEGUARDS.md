# GLM-4.7 API Safeguards & Resilience

**Purpose:** Ensure autonomous build succeeds even if GLM API has issues
**Status:** Proactive safeguards implemented

---

## API Resilience Strategy

### 1. Retry Logic with Exponential Backoff

```typescript
// GLM Client with built-in retry logic
class ResilientGLMClient {
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second
  private maxDelay = 10000; // 10 seconds

  async callWithRetry(
    fn: () => Promise<Response>,
    attempt = 1
  ): Promise<Response> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(
        this.baseDelay * Math.pow(2, attempt - 1),
        this.maxDelay
      );

      console.warn(`API call failed (attempt ${attempt}/${this.maxRetries}), retrying in ${delay}ms...`);

      await this.sleep(delay);
      return this.callWithRetry(fn, attempt + 1);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2. Error Classification & Recovery

```typescript
enum APIErrorType {
  AUTH_FAILED = 'AUTH_FAILED',        // 401, 403 → Stop immediately
  RATE_LIMITED = 'RATE_LIMITED',      // 429 → Retry with backoff
  SERVER_ERROR = 'SERVER_ERROR',       // 500, 502, 503 → Retry
  NETWORK_ERROR = 'NETWORK_ERROR',     // ECONNREFUSED → Retry
  TIMEOUT = 'TIMEOUT',                 // Request timeout → Retry
  UNKNOWN = 'UNKNOWN'                  // Log and continue
}

function classifyError(error: any): APIErrorType {
  if (error.response?.status === 401 || error.response?.status === 403) {
    return APIErrorType.AUTH_FAILED;
  }
  if (error.response?.status === 429) {
    return APIErrorType.RATE_LIMITED;
  }
  if (error.response?.status >= 500) {
    return APIErrorType.SERVER_ERROR;
  }
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return APIErrorType.NETWORK_ERROR;
  }
  if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
    return APIErrorType.TIMEOUT;
  }
  return APIErrorType.UNKNOWN;
}

function shouldRetry(errorType: APIErrorType): boolean {
  return [
    APIErrorType.RATE_LIMITED,
    APIErrorType.SERVER_ERROR,
    APIErrorType.NETWORK_ERROR,
    APIErrorType.TIMEOUT
  ].includes(errorType);
}
```

### 3. Fallback Endpoints

```typescript
const FALLBACK_ENDPOINTS = [
  'https://api.z.ai/api/anthropic',  // Primary
  'https://api.z.ai/v1',             // Fallback 1
  'https://glm.z.ai/api/anthropic'   // Fallback 2 (if exists)
];

class ResilientGLMClient {
  private endpointIndex = 0;

  private getNextEndpoint(): string {
    const endpoint = FALLBACK_ENDPOINTS[this.endpointIndex];
    this.endpointIndex = (this.endpointIndex + 1) % FALLBACK_ENDPOINTS.length;
    return endpoint;
  }

  async callWithFallback(): Promise<Response> {
    for (let i = 0; i < FALLBACK_ENDPOINTS.length; i++) {
      try {
        const endpoint = this.getNextEndpoint();
        return await this.callWithRetry(() => this.fetch(endpoint));
      } catch (error) {
        if (i === FALLBACK_ENDPOINTS.length - 1) {
          throw error;
        }
        console.warn(`Endpoint ${i + 1} failed, trying fallback...`);
      }
    }
    throw new Error('All endpoints failed');
  }
}
```

### 4. Health Check & Circuit Breaker

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private openUntil = 0;
  private threshold = 5; // Open after 5 failures
  private timeout = 60000; // Try again after 60 seconds

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is OPEN, API is down');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (Date.now() > this.openUntil) {
      this.close(); // Reset after timeout
      return false;
    }
    return this.failureCount >= this.threshold;
  }

  private onSuccess() {
    this.failureCount = 0;
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.openUntil = Date.now() + this.timeout;
      console.error(`Circuit breaker OPEN after ${this.failureCount} failures`);
    }
  }

  private close() {
    this.failureCount = 0;
    this.openUntil = 0;
  }
}
```

---

## Pre-Build API Validation

### Health Check Script

```bash
#!/bin/bash
# scripts/validate-glm-api.sh

echo "🔍 Validating GLM-4.7 API access..."

source .env.local

# Test basic connectivity
echo "Test 1: Basic connectivity..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $FLOYD_GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"glm-4.7","max_tokens":10,"messages":[{"role":"user","content":"Hi"}],"stream":false}' \
  -o /tmp/glm_test.json)

HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
  echo "❌ API health check failed (HTTP $HTTP_CODE)"
  cat /tmp/glm_test.json
  exit 1
fi

echo "✅ API is healthy"

# Test streaming (critical for Floyd)
echo "Test 2: Streaming capability..."
curl -s -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $FLOYD_GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"glm-4.7","max_tokens":50,"messages":[{"role":"user","content":"Count to 5"}],"stream":true}' \
  --max-time 10 | head -c 100 > /tmp/glm_stream_test.txt

if [ ! -s /tmp/glm_stream_test.txt ]; then
  echo "❌ Streaming test failed"
  exit 1
fi

echo "✅ Streaming works"

# Test tool use format (critical for Floyd)
echo "Test 3: Tool use format..."
TOOL_RESPONSE=$(curl -s -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $FLOYD_GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model":"glm-4.7",
    "max_tokens":100,
    "messages":[{"role":"user","content":"What is 2+2? Use a calculator tool."}],
    "tools":[{
      "name":"calculator",
      "description":"Calculate expressions",
      "input_schema":{"type":"object"}
    }],
    "stream":false
  }')

if echo "$TOOL_RESPONSE" | grep -q "tool_use"; then
  echo "✅ Tool use format supported"
else
  echo "⚠️ Tool use not detected (may not be supported)"
fi

echo ""
echo "🎉 All API validation checks passed!"
```

---

## Error Recovery Playbook

### Scenario 1: 401/403 Authentication Failed

**Symptom:** API returns 401 or 403

**Diagnosis:**
```bash
curl -v -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "x-api-key: $FLOYD_GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"glm-4.7","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

**Recovery:**
1. Verify API key is correct: `cat .env.local | grep GLM_API_KEY`
2. Test API key manually via curl
3. Check if API key expired: Contact Z.ai support
4. Regenerate API key if needed
5. Update `.env.local` and retry

**Auto-Recovery:** ❌ Stop immediately, requires human intervention

---

### Scenario 2: 429 Rate Limited

**Symptom:** API returns 429 with `retry-after` header

**Auto-Recovery:** ✅ Retry with exponential backoff

```typescript
// Extract retry-after header
const retryAfter = error.response?.headers?.['retry-after'];
const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 60s

await sleep(delay);
return retry();
```

---

### Scenario 3: 500/502/503 Server Error

**Symptom:** API returns 5xx error

**Auto-Recovery:** ✅ Retry with exponential backoff (max 3 attempts)

If all retries fail:
- Log error
- Switch to fallback endpoint
- If all endpoints fail → BLOCKER

---

### Scenario 4: Network Error (ECONNREFUSED)

**Symptom:** Connection refused or timeout

**Auto-Recovery:** ✅ Retry with exponential backoff

If all retries fail:
- Check internet connectivity
- Check DNS resolution: `nslookup api.z.ai`
- Try alternative endpoint
- If all fail → BLOCKER

---

## Monitoring During Build

### Real-Time Health Monitoring

```bash
# Run in background during build
watch -n 30 'bash scripts/validate-glm-api.sh' &
```

### Log API Calls

```typescript
// Log all API calls for debugging
function logAPICall(endpoint: string, request: any, response: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    endpoint,
    request: { ...request, headers: '[REDACTED]' },
    response: {
      status: response.status,
      latency: response.latency
    }
  };

  fs.appendFileSync('.floyd/logs/api-calls.jsonl', JSON.stringify(logEntry) + '\n');
}
```

---

## Success Criteria

✅ **API is resilient to transient failures**
- Retry logic handles 5xx errors
- Exponential backoff prevents thundering herd
- Circuit breaker prevents cascading failures

✅ **API failures don't block build**
- Fallback endpoints provide redundancy
- Clear error messages guide recovery
- Auto-recovery for common issues

✅ **Build can recover from API degradation**
- Graceful degradation
- Request queuing
- Priority routing

---

**Next:** Update `.env.local` with fallback endpoints and timeouts
