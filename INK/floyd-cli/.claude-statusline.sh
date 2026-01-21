#!/bin/bash

# Statusline script for Claude Code
# Shows: Git branch, Token use, Context left, Time, Lines of code

# Read JSON input from stdin
input=$(cat)

# Get current working directory
cwd=$(echo "$input" | jq -r '.workspace.current_dir')

# Get token usage data
usage=$(echo "$input" | jq '.context_window.current_usage')
context_size=$(echo "$input" | jq -r '.context_window.context_window_size')

# Calculate context usage percentage if usage data is available
if [ "$usage" != "null" ]; then
    input_tokens=$(echo "$usage" | jq -r '.input_tokens // 0')
    cache_created=$(echo "$usage" | jq -r '.cache_creation_input_tokens // 0')
    cache_read=$(echo "$usage" | jq -r '.cache_read_input_tokens // 0')
    
    # Current context usage
    current=$((input_tokens + cache_created + cache_read))
    remaining=$((context_size - current))
    
    # Format with commas for readability
    context_pct=$((current * 100 / context_size))
    token_info="📊 ${current}/${context_size} (${context_pct}%) | ⬇️ ${remaining}"
else
    token_info="📊 --/${context_size}"
fi

# Get current time
current_time=$(date +%H:%M)

# Get git branch (skip optional locks to avoid hanging)
git_branch=""
if [ -n "$cwd" ] && [ -d "$cwd/.git" ]; then
    git_branch=$(git -C "$cwd" --no-optional-locks branch --show-current 2>/dev/null)
    if [ -n "$git_branch" ]; then
        git_branch="🌿 $git_branch"
    fi
fi

# Count lines of code in the repository
lines_of_code=""
if [ -n "$cwd" ] && command -v cloc >/dev/null 2>&1; then
    # Use cloc if available (faster and more accurate)
    loc=$(cloc "$cwd" --quiet 2>/dev/null | tail -1 | awk '{print $1}')
    if [ -n "$loc" ] && [ "$loc" != "0" ]; then
        lines_of_code="📝 ${loc} LOC"
    fi
elif [ -n "$cwd" ]; then
    # Fallback: count lines in common code files
    loc=$(find "$cwd" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.h" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    if [ -n "$loc" ] && [ "$loc" != "0" ] && [ "$loc" != "total" ]; then
        # Format with commas
        lines_of_code="📝 ${loc} LOC"
    fi
fi

# Build statusline components
components=()

if [ -n "$git_branch" ]; then
    components+=("$git_branch")
fi

components+=("$token_info")

if [ -n "$lines_of_code" ]; then
    components+=("$lines_of_code")
fi

components+=("🕐 $current_time")

# Join components with separator
statusline=$(IFS=" | " ; echo "${components[*]}")

# Output the statusline
printf "%s" "$statusline"
