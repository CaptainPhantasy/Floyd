# 🚀 How to Use the Autonomous Build Agent

## Quick Start

### Option 1: From Visible Folder (Easiest)

The agent files are now in **`loop_docs/`** folder (visible in Finder):

```bash
# Navigate to project
cd /Volumes/Storage/OVERSEER

# Start the agent
crush run "Read loop_docs/AUTONOMOUS_BUILD_AGENT.md and execute it exactly. Analyze the repository and generate a complete pre-flight checklist before requesting any human input."
```

### Option 2: From Hidden Folder

If you want to use the `.loop/` folder:

**To see hidden files in Terminal:**
```bash
# List all files including hidden
ls -la

# Or just show hidden folders
ls -d .*/

# Navigate to .loop folder
cd .loop
ls -la
```

**To see hidden files in Finder:**
1. Open Finder
2. Press `Cmd + Shift + .` (period)
3. Hidden files/folders will now be visible
4. Navigate to `.loop/` folder
5. Press `Cmd + Shift + .` again to hide

## What Each File Does

### AUTONOMOUS_BUILD_AGENT.md
**This is the MAIN agent prompt.**

Contains complete instructions for an agent to:
- Analyze your repository
- Find all dependencies (APIs, databases, Docker, etc.)
- Generate a pre-flight checklist
- Wait for you to complete it
- Launch autonomous build loop
- Monitor to completion

### USAGE_GUIDE.md
**How to use the agent.**

Contains:
- Quick start instructions
- Example sessions
- Monitoring commands
- Troubleshooting tips

### AUTO_BUILD_SUMMARY.md
**Executive summary.**

Contains:
- What we learned from OVERSEER NODE
- Problems encountered and how they're prevented
- Before/After comparison
- Success metrics

## Step-by-Step Usage

### 1. Start the Agent

```bash
cd /Volumes/Storage/OVERSEER

crush run "Read loop_docs/AUTONOMOUS_BUILD_AGENT.md and execute it exactly."
```

### 2. Agent Analyzes Your Repository

The agent will:
- Scan for build specs
- Detect external APIs
- Find environment variables needed
- Identify Docker requirements

### 3. Agent Generates Checklist

Look for:
```bash
cat loop_docs/PRE_FLIGHT_CHECKLIST.md
# or
cat .loop/PRE_FLIGHT_CHECKLIST.md
```

### 4. Complete Pre-flight Tasks

The checklist will have:
- API key testing commands
- Environment variable setup
- Docker configuration
- Validation steps

Complete ALL tasks before proceeding.

### 5. Confirm Completion

Type to the agent:
```
PRE_FLIGHT_COMPLETE
```

### 6. Agent Verifies & Launches

Agent will:
- Test API keys actually work
- Verify all env vars set
- Validate Docker ready
- Launch autonomous loop

### 7. Wait for SHIP

Monitor progress:
```bash
tail -f AGENT_REPORT.md
```

When done:
```
🎉 SHIP ACHIEVED!
```

## File Locations

### Visible (Finder can see):
```
/Volumes/Storage/OVERSEER/
├── loop_docs/
│   ├── AUTONOMOUS_BUILD_AGENT.md    ← USE THIS
│   ├── USAGE_GUIDE.md                ← Read this
│   └── AUTO_BUILD_SUMMARY.md         ← Overview
└── HOW_TO_USE.md                     ← This file
```

### Hidden (Need to show hidden files):
```
/Volumes/Storage/OVERSEER/.loop/
├── AUTONOMOUS_BUILD_AGENT.md
├── USAGE_GUIDE.md
├── AUTO_BUILD_SUMMARY.md
├── HIL_PROTOCOL.md
├── AUTONOMOUS_ARCHITECTURE.md
├── PROTOCOL_IMPROVEMENTS_SUMMARY.md
└── SHIP_SUMMARY.md
```

## Tips

### Terminal Commands for Hidden Files

```bash
# Show all files including hidden
ls -la

# Show only hidden directories
ls -d .*/

# Show hidden files in tree format
tree -a

# Navigate to hidden folder
cd .loop
pwd  # Shows: /Volumes/Storage/OVERSEER/.loop
```

### Finder Shortcuts

```bash
# Show hidden files
Cmd + Shift + .

# Hide hidden files  
Cmd + Shift + . (toggle again)
```

### Permanently Show Hidden Files in Finder

```bash
# Run this command:
defaults write com.apple.finder AppleShowAllFiles YES
killall Finder
```

To hide again:
```bash
defaults write com.apple.finder AppleShowAllFiles NO
killall Finder
```

## Quick Reference

**To use the agent NOW:**
```bash
cd /Volumes/Storage/OVERSEER
crush run "Read loop_docs/AUTONOMOUS_BUILD_AGENT.md and execute it exactly."
```

**To see the files:**
- Finder: Look in `loop_docs/` folder
- Terminal: `ls -la loop_docs/`

**To learn more:**
```bash
cat loop_docs/USAGE_GUIDE.md
cat loop_docs/AUTO_BUILD_SUMMARY.md
```

---

**That's it!** The agent is ready to use from the visible `loop_docs/` folder.
