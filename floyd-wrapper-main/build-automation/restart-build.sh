#!/bin/bash
# Floyd Wrapper Autonomous Build Launcher
# Keeps the build loop running until SHIP or BLOCKER

set -e

PROJECT_DIR="/Volumes/Storage/WRAPPERS/FLOYD WRAPPER"
ORCHESTRATOR_PROMPT="$PROJECT_DIR/.loop/ORCHESTRATOR_PROMPT.md"

echo "🚀 Floyd Wrapper Autonomous Build Launcher"
echo "=========================================="
echo ""
echo "This script will keep the build running until:"
echo "  - SHIP_ACHIEVED status reached"
echo "  - BLOCKER detected"
echo "  - You manually stop it (Ctrl+C)"
echo ""
echo "Monitoring: $PROJECT_DIR"
echo ""

# Check if orchestrator prompt exists
if [ ! -f "$ORCHESTRATOR_PROMPT" ]; then
  echo "❌ ORCHESTRATOR_PROMPT.md not found at $ORCHESTRATOR_PROMPT"
  echo "   Cannot start build."
  exit 1
fi

cd "$PROJECT_DIR"

# Main build loop
ITERATION=0
MAX_ITERATIONS=50  # Safety limit

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo ""
  echo "=========================================="
  echo "🔄 Build Loop Iteration #$ITERATION"
  echo "=========================================="
  date "+%H:%M:%S"
  echo ""

  # Check for SHIP_ACHIEVED
  if [ -f ".loop/SHIP_REPORT.md" ]; then
    echo "🎉 SHIP_ACHIEVED detected!"
    echo "Build is complete. See .loop/SHIP_REPORT.md"
    cat .loop/SHIP_REPORT.md
    exit 0
  fi

  # Check for BLOCKER
  if [ -f ".loop/BLOCKER.md" ]; then
    echo "🛑 BLOCKER detected!"
    echo "Build cannot continue. See .loop/BLOCKER.md"
    cat .loop/BLOCKER.md
    exit 1
  fi

  # Run the orchestrator
  echo "📢 Running orchestrator..."
  crush run "$(cat $ORCHESTRATOR_PROMPT)"

  # Check exit code
  EXIT_CODE=$?
  if [ $EXIT_CODE -ne 0 ]; then
    echo "⚠️  Crush exited with code: $EXIT_CODE"
    echo "Waiting 5 seconds before restart..."
    sleep 5
  fi

  # Small delay between iterations
  sleep 2
done

echo ""
echo "⚠️  Reached maximum iterations ($MAX_ITERATIONS)"
echo "Build may need manual intervention."
echo "Check .loop/AGENT_REPORT.md for status."
