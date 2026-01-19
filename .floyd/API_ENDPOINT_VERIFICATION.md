# API Endpoint Verification

**Date:** 2026-01-19
**Status:** COMPLETE

---

## Test Results

### 1. Anthropic-Format Endpoint ✓ WORKS

**Endpoint:** `https://api.z.ai/api/anthropic/v1/messages`

**Test Command:**
```bash
curl -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-opus-4","max_tokens":50,"messages":[{"role":"user","content":"Say hi"}]}'
```

**Result:** `HTTP_CODE: 200` ✓

**Response Format:**
```json
{
  "id": "msg_20260119225647f9856cf38f314dd8",
  "type": "message",
  "role": "assistant",
  "model": "glm-4.7",
  "content": [{"type": "text", "text": "Hi! How can I help you today?"}],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 7,
    "output_tokens": 12
  }
}
```

**Conclusion:** Anthropic SDK format works correctly. Use `@anthropic-ai/sdk` with custom `baseURL`.

---

### 2. OpenAI-Format Endpoint

**Endpoint:** `https://api.z.ai/api/paas/v4/chat/completions`

**Result:** `HTTP_CODE: 429` - "Insufficient balance or no resource package"

**Conclusion:** Endpoint exists but account quota insufficient for testing. The endpoint format is valid.

---

## Decision

**USE Anthropic SDK** for GLM integration:
- Set `baseURL: 'https://api.z.ai/api/anthropic'`
- Use `@anthropic-ai/sdk` package
- Model name: `glm-4.7` (mapped from `claude-opus-4` in requests)

---

## API Key Source

- **File:** `INK/floyd-cli/.env`
- **Variable:** `GLM_API_KEY`
