#!/bin/bash

# Floyd Project Build Script
# Builds packages in correct dependency order

set -e  # Exit on error

PROJECT_ROOT="/Volumes/Storage/FLOYD_CLI"
AGENT_CORE="$PROJECT_ROOT/packages/floyd-agent-core"
CLI="$PROJECT_ROOT/INK/floyd-cli"

echo "🔨 Floyd Build Script"
echo "======================"
echo ""

# Step 1: Build agent-core
echo "📦 Step 1: Building floyd-agent-core..."
cd "$AGENT_CORE"
if [ -d "dist" ]; then
    echo "   Cleaning existing dist..."
    rm -rf dist
fi
npm run build

if [ ! -d "dist" ]; then
    echo "   ❌ Failed: dist directory not created"
    exit 1
fi

echo "   ✅ Agent core built successfully"
echo ""

# Step 2: Build CLI
echo "📦 Step 2: Building floyd-cli..."
cd "$CLI"
if [ -d "dist" ]; then
    echo "   Cleaning existing dist..."
    rm -rf dist
fi
npm run build

if [ ! -d "dist" ]; then
    echo "   ❌ Failed: dist directory not created"
    exit 1
fi

echo "   ✅ CLI built successfully"
echo ""

# Summary
echo "✅ Build Complete!"
echo ""
echo "📋 Verification:"
echo "   Agent core: $AGENT_CORE/dist"
echo "   CLI:         $CLI/dist"
echo ""
echo "🚀 To run Floyd CLI:"
echo "   cd $CLI"
echo "   npm start"
