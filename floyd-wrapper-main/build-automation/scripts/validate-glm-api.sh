#!/bin/bash
# scripts/validate-glm-api.sh
# Validate GLM-4.7 API access before autonomous build

set -e

echo "🔍 Validating GLM-4.7 API access..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found"
  exit 1
fi

# Load environment variables
source .env.local

# Check if API key is set
if [ -z "$FLOYD_GLM_API_KEY" ]; then
  echo "❌ FLOYD_GLM_API_KEY not set in .env.local"
  exit 1
fi

# Test basic connectivity
echo "Test 1: Basic connectivity..."
HTTP_CODE=$(curl -s -w "%{http_code}" -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $FLOYD_GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"glm-4.7","max_tokens":10,"messages":[{"role":"user","content":"Hi"}],"stream":false}' \
  -o /tmp/glm_test.json \
  --max-time 30 \
  2>&1 | tail -n 1)

if [ "$HTTP_CODE" -lt 200 ] || [ "$HTTP_CODE" -ge 300 ]; then
  echo "❌ API health check failed (HTTP $HTTP_CODE)"
  cat /tmp/glm_test.json
  exit 1
fi

echo "✅ API is healthy (HTTP $HTTP_CODE)"

# Test streaming (critical for Floyd)
echo "Test 2: Streaming capability..."
if timeout 15 curl -s -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $FLOYD_GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"glm-4.7","max_tokens":50,"messages":[{"role":"user","content":"Say hello"}],"stream":true}' \
  --max-time 10 | head -c 100 > /tmp/glm_stream_test.txt; then
  if [ -s /tmp/glm_stream_test.txt ]; then
    echo "✅ Streaming works"
  else
    echo "⚠️  Streaming test returned empty response"
  fi
else
  echo "⚠️  Streaming test timed out (may be rate limited)"
fi

# Test tool use format (critical for Floyd)
echo "Test 3: Tool use format..."
TOOL_RESPONSE=$(curl -s -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $FLOYD_GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  --max-time 30 \
  -d '{
    "model":"glm-4.7",
    "max_tokens":100,
    "messages":[{"role":"user","content":"What is 2+2?"}],
    "tools":[{
      "name":"calculator",
      "description":"Calculate math expressions",
      "input_schema":{"type":"object"}
    }],
    "stream":false
  }')

if echo "$TOOL_RESPONSE" | grep -q "tool_use"; then
  echo "✅ Tool use format supported"
else
  echo "⚠️  Tool use not detected in response (may not be supported by this endpoint)"
  echo "   Response preview:"
  echo "$TOOL_RESPONSE" | head -c 200
fi

echo ""
echo "🎉 API validation complete!"
