#!/bin/bash
# Interactive test script for Floyd Wrapper
cd "/Volumes/Storage/WRAPPERS/FLOYD WRAPPER"

echo "Starting Floyd Wrapper CLI test..."
echo "Type 'exit' to quit"
echo "=========================================="

while true; do
    echo ""
    echo -n "Enter test input: "
    read input

    if [ "$input" = "exit" ]; then
        echo "Exiting..."
        break
    fi

    if [ -z "$input" ]; then
        echo "Using default test: 'testing 123'"
        input="testing 123"
    fi

    echo ""
    echo "--- Response ---"
    echo "$input" | npm start 2>&1 | grep -A 100 "Response:" || echo "$input" | npm start
    echo "--- End ---"

    echo ""
    echo "Press Enter to continue or type 'exit' to quit"
    read cont
    if [ "$cont" = "exit" ]; then
        break
    fi
done
