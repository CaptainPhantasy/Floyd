#!/bin/bash
# CI check script to verify no .ts imports remain in dist/ after build
# This prevents the "ERR_MODULE_NOT_FOUND" error from occurring at runtime

set -e

echo "Checking dist/ for .ts imports..."

# Check for any .ts extensions in import statements in actual .js files (excluding .js.map source maps)
# We look for patterns like: from '...' where ... ends with .ts
# And: import('...') where ... ends with .ts
# Only check in .js files, excluding .map files
if find dist -name "*.js" ! -name "*.map" -exec grep -l "from\s*['\"].*\.ts['\"]" {} \; 2>/dev/null | head -n 5 | grep -q .; then
  echo ""
  echo "❌ ERROR: Found .ts extensions in compiled JavaScript files!"
  echo "This will cause ERR_MODULE_NOT_FOUND at runtime."
  echo "Please check the source files and ensure .js extensions are used instead."
  echo ""
  echo "Found files with .ts imports:"
  find dist -name "*.js" ! -name "*.map" -exec grep -H "from\s*['\"].*\.ts['\"]" {} \; 2>/dev/null || true
  find dist -name "*.js" ! -name "*.map" -exec grep -H "import(['\"].*\.ts['\"]" {} \; 2>/dev/null || true
  exit 1
else
  echo "✅ No .ts imports found in dist/ - build is clean!"
  exit 0
fi
