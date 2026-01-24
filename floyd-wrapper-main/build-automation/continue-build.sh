#!/bin/bash
# Floyd Wrapper Build - Single Restart
# Restarts the autonomous build from current state (one iteration)

set -e

PROJECT_DIR="/Volumes/Storage/WRAPPERS/FLOYD WRAPPER"
ORCHESTRATOR_PROMPT="$PROJECT_DIR/.loop/ORCHESTRATOR_PROMPT.md"

echo "🔄 Restarting Floyd Wrapper Build"
echo "=================================="
echo ""

cd "$PROJECT_DIR"

# Check current state
if [ -f ".loop/AGENT_REPORT.md" ]; then
  echo "📄 Current State (from AGENT_REPORT.md):"
  grep -A 5 "Phase 1 Foundation" .loop/AGENT_REPORT.md | head -10
  echo ""
fi

# Check for SHIP or BLOCKER
if [ -f ".loop/SHIP_REPORT.md" ]; then
  echo "🎉 Build is already complete! See .loop/SHIP_REPORT.md"
  exit 0
fi

if [ -f ".loop/BLOCKER.md" ]; then
  echo "🛑 BLOCKER detected! See .loop/BLOCKER.md"
  cat .loop/BLOCKER.md
  exit 1
fi

# Run orchestrator
echo "📢 Starting orchestrator..."
echo "Time: $(date '+%H:%M:%S')"
echo ""

crush run "$(cat $ORCHESTRATOR_PROMPT)"

EXIT_CODE=$?

echo ""
echo "Build process exited with code: $EXIT_CODE"
echo ""

# Show final state
if [ -f ".loop/AGENT_REPORT.md" ]; then
  echo "📄 Final State:"
  tail -30 .loop/AGENT_REPORT.md
fi

# Check if build completed
if [ -f ".loop/SHIP_REPORT.md" ]; then
  echo ""
  echo "🎉 SHIP_ACHIEVED! Build complete!"
  exit 0
fi

if [ -f ".loop/BLOCKER.md" ]; then
  echo ""
  echo "🛑 BLOCKER detected. Build stopped."
  exit 1
fi

# If no SHIP or BLOCKER, build may have stopped unexpectedly
if [ $EXIT_CODE -ne 0 ]; then
  echo "⚠️  Build stopped unexpectedly. Run this script again to continue."
else
  echo "✅ Build iteration completed. Run this script again to continue."
fi
