#!/bin/bash

# Floyd Wrapper CLI Test Suite
# Tests all success criteria systematically

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
TOTAL=0

# Test results tracking
declare -a TEST_RESULTS

# Helper function to run a test
run_test() {
    local test_name="$1"
    local test_input="$2"
    local max_response_time="${3:-5}"
    local check_tool_usage="${4:-false}"
    local check_cot_exposure="${5:-true}"
    local check_brevity="${6:-true}"

    TOTAL=$((TOTAL + 1))
    echo ""
    echo -e "${YELLOW}Test $TOTAL: $test_name${NC}"
    echo "Input: \"$test_input\""
    echo "Max Response Time: ${max_response_time}s"

    # Create temp file for output
    local output_file="/tmp/floyd_test_${TOTAL}.txt"

    # Run the CLI and measure time
    local start_time=$(gdate +%s.%N 2>/dev/null || python3 -c "import time; print(time.time())")
    echo "$test_input" | npm start 2>&1 | tee "$output_file" || true
    local end_time=$(gdate +%s.%N 2>/dev/null || python3 -c "import time; print(time.time())")
    local elapsed=$(python3 -c "print($end_time - $start_time)")

    echo "Response Time: ${elapsed}s"

    # Read output
    local output=$(cat "$output_file")

    # Check response time
    local response_time_pass=$(python3 -c "print(1 if $elapsed < $max_response_time else 0)")
    if [ "$response_time_pass" -eq 1 ]; then
        echo -e "${GREEN}✓ Response time < ${max_response_time}s${NC}"
    else
        echo -e "${RED}✗ Response time >= ${max_response_time}s${NC}"
    fi

    # Check for CoT exposure (numbered steps, bold headers)
    local cot_pass=true
    if [ "$check_cot_exposure" = "true" ]; then
        if echo "$output" | grep -E "(^\*\*Analysis\*\*|^\*\*Plan\*\*|^\*\*Steps\*\*|^[0-9]+\.\s+)" > /dev/null; then
            echo -e "${RED}✗ Chain of Thought detected${NC}"
            cot_pass=false
        else
            echo -e "${GREEN}✓ No Chain of Thought exposure${NC}"
        fi
    fi

    # Check for brevity (should be concise)
    local brevity_pass=true
    if [ "$check_brevity" = "true" ]; then
        local line_count=$(echo "$output" | wc -l | awk '{print $1}')
        if [ "$line_count" -lt 10 ]; then
            echo -e "${GREEN}✓ Response is concise (${line_count} lines)${NC}"
        else
            echo -e "${YELLOW}⚠ Response might be too long (${line_count} lines)${NC}"
            brevity_pass=false
        fi
    fi

    # Check for tool usage if required
    local tool_pass=true
    if [ "$check_tool_usage" = "true" ]; then
        if echo "$output" | grep -iE "(tool|called|executed|used .+ tool|Running|Executing)" > /dev/null; then
            echo -e "${GREEN}✓ Tools were used${NC}"
        else
            echo -e "${RED}✗ No tool usage detected${NC}"
            tool_pass=false
        fi
    fi

    # Check for stuttering/duplication
    local stutter_pass=true
    if echo "$output" | grep -E "(.{20,}).*\1" > /dev/null; then
        echo -e "${RED}✗ Potential stuttering/duplication detected${NC}"
        stutter_pass=false
    else
        echo -e "${GREEN}✓ No stuttering detected${NC}"
    fi

    # Overall pass/fail
    if [ "$response_time_pass" -eq 1 ] && [ "$cot_pass" = "true" ] && [ "$stutter_pass" = "true" ]; then
        echo -e "${GREEN}PASS: $test_name${NC}"
        TEST_RESULTS+=("PASS: $test_name")
        PASS=$((PASS + 1))
    else
        echo -e "${RED}FAIL: $test_name${NC}"
        TEST_RESULTS+=("FAIL: $test_name")
        FAIL=$((FAIL + 1))
    fi

    # Cleanup
    rm -f "$output_file"
}

# Main testing sequence
main() {
    cd "/Volumes/Storage/WRAPPERS/FLOYD WRAPPER"

    echo -e "${YELLOW}======================================"
    echo "Floyd Wrapper CLI Test Suite"
    echo "======================================${NC}"

    # Test 1: Simple math
    run_test \
        "Simple Math Query" \
        "what is 2+2" \
        5 \
        false \
        true \
        true

    # Test 2: File counting (should use tools)
    run_test \
        "File Counting" \
        "count all .md files in this repository" \
        10 \
        true \
        true \
        true

    # Test 3: File reading (should use tools)
    run_test \
        "File Reading" \
        "read package.json and tell me the version" \
        10 \
        true \
        true \
        true

    # Test 4: Git status (should use tools)
    run_test \
        "Git Status" \
        "show git status" \
        10 \
        true \
        true \
        true

    # Test 5: Multi-line input
    run_test \
        "Multi-line Input" \
        "what is the capital of France
and what is 2+3
and list all .ts files" \
        15 \
        false \
        true \
        true

    # Summary
    echo ""
    echo -e "${YELLOW}======================================"
    echo "Test Summary"
    echo "======================================${NC}"
    echo "Total Tests: $TOTAL"
    echo -e "${GREEN}Passed: $PASS${NC}"
    echo -e "${RED}Failed: $FAIL${NC}"
    echo ""
    echo "Detailed Results:"
    for result in "${TEST_RESULTS[@]}"; do
        if [[ $result == PASS* ]]; then
            echo -e "${GREEN}$result${NC}"
        else
            echo -e "${RED}$result${NC}"
        fi
    done

    # Exit with appropriate code
    if [ $FAIL -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed!${NC}"
        exit 1
    fi
}

# Run main
main
