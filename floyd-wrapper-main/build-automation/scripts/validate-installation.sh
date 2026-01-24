#!/bin/bash
# scripts/validate-installation.sh
# Validate that all dependencies installed correctly

set -e

echo "🔍 Validating installation..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found"
  echo "   Run: npm run install:deps"
  exit 1
fi

echo "✅ node_modules exists"

# Check critical dependencies
CRITICAL_DEPS=(
  "@anthropic-ai/sdk"
  "chalk"
  "ora"
  "log-update"
  "zod"
  "execa"
  "fs-extra"
  "globby"
)

for dep in "${CRITICAL_DEPS[@]}"; do
  if [ ! -d "node_modules/$dep" ]; then
    echo "❌ Critical dependency missing: $dep"
    exit 1
  fi
done

echo "✅ All critical dependencies present"

# Check package-lock.json exists
if [ ! -f "package-lock.json" ]; then
  echo "⚠️  package-lock.json not found"
  echo "   Run: npm install --package-lock-only"
fi

# Count dependencies
DEP_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
echo "✅ Total dependencies installed: $((DEP_COUNT - 1))"

echo ""
echo "🎉 Installation validation passed!"
