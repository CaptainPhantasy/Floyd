# Floyd Wrapper - Error Recovery Playbook

**Purpose:** Comprehensive guide for diagnosing and recovering from build failures
**Status:** Autonomous Build Safeguards

---

## Quick Reference

| Error Type | Symptom | Recovery | Auto-Recover |
|------------|---------|----------|--------------|
| API Auth Failed | 401/403 | Regenerate API key | ❌ Manual |
| API Rate Limited | 429 | Wait + retry | ✅ Yes |
| API Server Error | 5xx | Retry with backoff | ✅ Yes |
| Network Error | ECONNREFUSED | Check connectivity | ✅ Yes |
| Dependency Conflict | ERESOLVE | Use --legacy-peer-deps | ✅ Yes |
| Install Timeout | network timeout | Retry + increase timeout | ✅ Yes |
| Build Failed | compilation error | Fix code | ⚠️ Agent recovery |

---

## GLM-4.7 API Failures

### Scenario 1: Authentication Failed (401/403)

**Symptom:**
```json
{
  "error": {
    "type": "authentication_error",
    "message": "Invalid API key"
  }
}
```

**Diagnosis:**
```bash
# Check API key is set
cat .env.local | grep GLM_API_KEY

# Test API key manually
curl -v -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"glm-4.7","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

**Recovery Steps:**
1. Verify API key in `.env.local` is correct
2. Check if API key expired (contact Z.ai support)
3. Regenerate API key from Z.ai dashboard
4. Update `.env.local` with new key
5. Re-run validation: `npm run validate:api`

**Prevention:**
- Store API key securely
- Monitor API usage for rate limits
- Set up API key rotation schedule

---

### Scenario 2: Rate Limited (429)

**Symptom:**
```json
{
  "error": {
    "type": "rate_limit_error",
    "message": "Rate limit exceeded"
  }
}
```

**HTTP Header:** `Retry-After: 60`

**Auto-Recovery:** ✅ Built-in retry with exponential backoff

**Manual Recovery (if needed):**
```bash
# Wait for Retry-After duration (in seconds)
sleep 60

# Retry the request
```

**Prevention:**
- Implement request queuing
- Use caching to reduce API calls
- Monitor rate limit headers
- Implement circuit breaker

---

### Scenario 3: Server Error (5xx)

**Symptom:** API returns 500, 502, or 503

**Auto-Recovery:** ✅ Retry up to 3 times with exponential backoff

**Manual Recovery (if auto-retry fails):**
1. Check Z.ai status page: https://status.z.ai
2. Check if API endpoint changed
3. Try alternative endpoint (if configured)
4. Contact Z.ai support if ongoing

---

### Scenario 4: Network Error

**Symptom:** `ECONNREFUSED`, `ENOTFOUND`, `ETIMEDOUT`

**Diagnosis:**
```bash
# Check internet connectivity
ping -c 3 registry.npmjs.org

# Check DNS resolution
nslookup api.z.ai

# Check firewall rules
sudo iptables -L | grep -i z.ai  # Linux
sudo pfctl -s rules | grep -i z.ai  # macOS
```

**Auto-Recovery:** ✅ Retry with exponential backoff

**Manual Recovery:**
1. Check internet connection
2. Verify DNS is working
3. Check firewall/VPN settings
4. Try alternative network

---

## Dependency Installation Failures

### Scenario 1: ERESOLVE Dependency Conflicts

**Symptom:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Found: @anthropic-ai/sdk@0.71.2
npm ERR! Could not resolve dependency: peerdep@"typescript@>=5.0.0"
```

**Recovery:**
```bash
# Try legacy peer deps
npm install --legacy-peer-deps

# If that fails, use force
npm install --force
```

**Prevention:**
- Use exact versions in package.json (already done)
- Lock transitive dependencies with package-lock.json
- Test installs in clean environment

---

### Scenario 2: Network Timeout

**Symptom:**
```
npm ERR! network timeout at: https://registry.npmjs.org/...
```

**Recovery:**
```bash
# Increase timeout
npm install --fetch-timeout=180000

# Clear cache and retry
npm cache clean --force
npm install

# Use alternative registry
npm install --registry=https://registry.npmjs.org
```

**Prevention:**
- Use reliable internet connection
- Configure npm timeout settings
- Use mirror registry if needed

---

### Scenario 3: Native Module Compilation Failed

**Symptom:**
```
gyp ERR! stack Error: `make` failed
gyp ERR! not ok
```

**Diagnosis:**
```bash
# Check if build tools are installed
xcode-select -p  # macOS
gcc --version  # Linux
```

**Recovery:**

**macOS:**
```bash
xcode-select --install
npm install
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install build-essential
npm install
```

**Prevention:**
- Install build tools before first install
- Use precompiled binaries when available
- Document build tool requirements

---

### Scenario 4: Version Out of Range

**Symptom:**
```
npm ERR! notsup Not compatible with your version of node
npm ERR! notsup Required: {"node":">=20.0.0 <21.0.0"}
npm ERR! notsup Actual: {"node":"v18.17.0"}
```

**Recovery:**
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Using n
sudo n 20

# Verify
node -v  # Should show v20.x.x

# Retry install
npm install
```

**Prevention:**
- Lock Node.js version in `.nvmrc`
- Document Node.js requirement in README
- Use `engines` field in package.json (already done)

---

## Build Failures

### Scenario 1: TypeScript Compilation Error

**Symptom:**
```
src/cli.ts(10,5): error TS2322: Type 'string' is not assignable to type 'number'
```

**Auto-Recovery:** ⚠️ Agent will detect and attempt fix

**Manual Recovery:**
```bash
# Check TypeScript version
tsc --version

# Clean build
npm run clean
npm run build

# Check for type errors
npm run typecheck
```

**Prevention:**
- Run `npm run typecheck` before commits
- Use strict TypeScript settings (already enabled)
- Fix type errors immediately when introduced

---

### Scenario 2: Test Failures

**Symptom:**
```
Tests failing: 5/25 passed
Error: Expected "hello" but got "world"
```

**Auto-Recovery:** ⚠️ Agent will detect and attempt fix

**Manual Recovery:**
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/unit/specific.test.ts

# Check coverage
npm run test:coverage
```

**Prevention:**
- Write tests alongside code
- Run tests before commits
- Maintain >80% coverage

---

## Autonomous Build Loop Failures

### Scenario 1: Agent Confusion (Stuck in Loop)

**Symptom:**
- Same task repeating
- Identical agent reports
- No progress after 5 iterations

**Detection:**
```bash
# Check for repeating patterns
diff .loop/AGENT_REPORT.md .loop/AGENT_REPORT.md.prev

# Check iteration count
cat .loop/state.json | grep iteration
```

**Recovery:**
```bash
# Kill stuck process
ps aux | grep crush
kill [CRUSH_PID]

# Provide clearer task instructions
# Edit .loop/ORCHESTRATOR_PROMPT.md

# Resume loop
crush run "$(cat .loop/ORCHESTRATOR_PROMPT.md)"
```

**Prevention:**
- Clear task instructions
- Atomic tasks (one thing at a time)
- Regular progress verification

---

### Scenario 2: True Blocker Detected

**Symptom:** `.loop/BLOCKER.md` created

**Recovery:**
1. Read blocker details: `cat .loop/BLOCKER.md`
2. Fix the underlying issue
3. Remove blocker file: `rm .loop/BLOCKER.md`
4. Resume loop: `crush run "$(cat .loop/ORCHESTRATOR_PROMPT.md)"`

---

### Scenario 3: Build Hangs (>10 minutes)

**Symptom:** No progress for 10+ minutes

**Diagnosis:**
```bash
# Check if process is running
ps aux | grep crush

# Check CPU usage
top | grep crush

# Check logs
tail -f .loop/AGENT_REPORT.md
```

**Recovery:**
```bash
# Kill hung process
kill [CRUSH_PID]

# Save state
cat .loop/AGENT_REPORT.md

# Resume from last state
crush run "$(cat .loop/ORCHESTRATOR_PROMPT.md)"
```

---

## Pre-Build Checklist

Before starting autonomous build, verify:

```bash
# 1. Environment validation
npm run validate:env

# 2. API validation
npm run validate:api

# 3. Clean install
rm -rf node_modules package-lock.json
npm install

# 4. Installation validation
npm run validate:install

# 5. Git status (clean)
git status
```

**Expected output:** All checks pass ✅

**If any fail:** Resolve issues before starting build

---

## Monitoring During Build

### Real-Time Monitoring

```bash
# Terminal 1: Watch build progress
tail -f .loop/AGENT_REPORT.md

# Terminal 2: Monitor API health
watch -n 30 'npm run validate:api'

# Terminal 3: Monitor system resources
htop
```

### Alert Triggers

Set up alerts for:
- API failure rate > 10%
- Build time > 1 hour
- Memory usage > 2GB
- Disk usage > 90%

---

## Post-Build Validation

After autonomous build completes:

```bash
# 1. Verify build output
ls -la dist/

# 2. Run all tests
npm test

# 3. Check type safety
npm run typecheck

# 4. Test CLI
npm start -- --help

# 5. Verify SHIP criteria
cat .loop/SHIP_REPORT.md
```

---

## Success Criteria

✅ **All safeguards validated**
- Environment: OK
- API: OK
- Dependencies: Installed
- Tests: Passing

✅ **Build completes without blockers**
- No .loop/BLOCKER.md created
- SHIP_ACHIEVED status reached
- All SHIP criteria met

✅ **Recovery procedures documented**
- This playbook complete
- All scripts tested
- Monitoring configured

---

**Last Updated:** 2026-01-22
**Status:** Ready for autonomous build
