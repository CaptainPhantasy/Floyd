#!/bin/bash
# scripts/validate-environment.sh
# Validate build environment before running npm install

set -e

echo "🔍 Validating build environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js version too old: $(node -v)"
  echo "   Required: >= 20.0.0"
  exit 1
fi

if [ "$NODE_VERSION" -gt 20 ]; then
  echo "⚠️  Node.js version: $(node -v) (tested with 20.x)"
  echo "   Proceeding with caution..."
fi

echo "✅ Node.js: $(node -v)"

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
  echo "❌ npm version too old: $(npm -v)"
  echo "   Required: >= 10.0.0"
  exit 1
fi

echo "✅ npm: $(npm -v)"

# Check TypeScript
if ! command -v tsc &> /dev/null; then
  echo "❌ TypeScript not installed globally"
  echo "   Run: npm install -g typescript@5.3.3"
  exit 1
fi

TSC_VERSION=$(tsc --version | awk '{print $2}')
echo "✅ TypeScript: $TSC_VERSION"

# Check disk space (need at least 1GB free)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  FREE_SPACE=$(df -H . | tail -1 | awk '{print $4}' | sed 's/G//' | sed 's/[A-Za-z]//g')
else
  # Linux
  FREE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | tr -d 'G')
fi

# Extract numeric part
FREE_SPACE_NUM=$(echo "$FREE_SPACE" | grep -o '[0-9]*' | head -1)

if [ "$FREE_SPACE_NUM" -lt 1 ]; then
  echo "❌ Insufficient disk space: ${FREE_SPACE} free"
  echo "   Required: 1GB+ free"
  exit 1
fi

echo "✅ Disk space: ${FREE_SPACE} free"

# Check network connectivity
if ! ping -c 1 -W 5000 registry.npmjs.org &> /dev/null; then
  echo "❌ Cannot reach npm registry"
  echo "   Check internet connection"
  exit 1
fi

echo "✅ Network: npm registry reachable"

echo ""
echo "🎉 Environment validation passed!"
