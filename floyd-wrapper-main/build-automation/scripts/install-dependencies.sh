#!/bin/bash
# scripts/install-dependencies.sh
# Robust dependency installation with fallback methods

set -e

echo "📦 Installing Floyd Wrapper dependencies..."

# Validate environment first
if [ -f "build-automation/scripts/validate-environment.sh" ]; then
  bash build-automation/scripts/validate-environment.sh
else
  echo "⚠️  Environment validation script not found, skipping..."
fi

# Clean existing modules (force fresh install)
echo "🧹 Cleaning existing node_modules..."
rm -rf node_modules package-lock.json

# Try standard install first
echo "📥 Installing dependencies (standard)..."
if npm install --no-save 2>&1 | tee /tmp/npm-install.log; then
  echo "✅ Standard install succeeded"
  exit 0
fi

echo "⚠️  Standard install failed, trying legacy peer deps..."

# Fallback 1: Legacy peer deps
if npm install --legacy-peer-deps --no-save 2>&1 | tee /tmp/npm-install-legacy.log; then
  echo "✅ Legacy install succeeded"
  exit 0
fi

echo "⚠️  Legacy install failed, trying with force..."

# Fallback 2: Force install (last resort)
if npm install --force --no-save 2>&1 | tee /tmp/npm-install-force.log; then
  echo "✅ Force install succeeded (may have warnings)"
  exit 0
fi

echo "❌ All installation methods failed"
echo ""
echo "Diagnostic information:"
echo "1. npm version: $(npm -v)"
echo "2. Node version: $(node -v)"
echo "3. Error log:"
tail -20 /tmp/npm-install.log

exit 1
