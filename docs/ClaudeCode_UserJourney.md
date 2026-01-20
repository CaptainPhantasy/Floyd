# Claude Code: User Journey & UX Walkthrough

*A complete walkthrough for a solo developer using Claude Code CLI, from first launch to building a micro app.*

---

## Part 1: First Launch

### Starting Claude Code

```bash
cd /path/to/your/project
claude
```

**What you see:**

The terminal is taken over by the Claude Code TUI (Text User Interface). The screen has three main sections:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSATION HISTORY                        │
│                    (scrolls up as you chat)                    │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                         TOOL USE PANEL                          │
│                    (shows active tools/calls)                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Your turn. Type a message or command.                          │
│ │                                                                │
└─────────────────────────────────────────────────────────────────┘
```

**On first launch, you'll see:**

1. **Connection messages:**
   ```
   Connecting to Anthropic...
   Connected as user@example.com
   Loading project context...
   ```

2. **Context loading:**
   ```
   Found .claude/settings.json
   Found .claude/CLAUDE.md (project instructions)
   Git repository detected: your-project
   Branch: main (3 commits ahead of origin)
   ```

3. **The input prompt appears at bottom**

**NO VOICE** - This is the CLI version. You type, Claude responds in text.

---

## Part 2: The Interface Layout

### Three-Panel TUI

```
┌─────────────────────────────────────────────────────────────────┐
│ CONVERSATION AREA                                               │
│ ────────────────────────────────────────────────────────────── │
│                                                                 │
│ You: Create a simple todo app                                  │
│                                                                 │
│ Claude: I'll help you create a todo app. Let me first check...  │
│                                                                 │
│ 🔍 Using: Read                                                 │
│    → package.json                                               │
│                                                                 │
│ I can see you have React already set up.                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ACTIVE TOOLS                                                    │
│ ✅ Read (3 files)                                               │
│ ⏳ Bash (npm install)...                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Your turn. Type a message or command.                          │
│ │                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Input Modes

Type at the prompt, or use prefixes:

| Prefix | Mode | Example |
|--------|------|---------|
| (nothing) | Chat | `add a button to the header` |
| `!` | Bash command | `!npm install` |
| `/` | Slash command | `/commit` |
| `@` | File reference | `@src/App.tsx` |
| `&` | Background task | `&npm run dev` |
| `?` | Help | `?` |

### The Tool Use Panel (Middle)

Shows real-time what Claude is doing:

```
🔍 Read
   package.json (checking dependencies)

📝 Edit
   src/App.tsx
   - +3 lines, -1 line

⚙️ Bash
   npm install --silent
```

---

## Part 3: First Interaction - Understanding the Flow

### You Type a Request

**At the prompt:**
```
│
```

**You type:**
```
Create a simple todo app with React
```

**Then press Enter**

### What Happens Next

1. **Your message appears in conversation area:**
   ```
   You: Create a simple todo app with React
   ```

2. **Claude's response streams in character-by-character:**
   ```
   Claude: I'll help you create a todo app. Let me first check what's
   in your current directory to understand the project structure.
   ```

3. **Tool Use Panel shows activity:**
   ```
   🔍 Read
      → package.json

   🔍 Glob
      → src/**/*.tsx
   ```

4. **Then Claude responds based on what it found**

---

## Part 4: Permission Prompts

### Before Claude Can Run Certain Tools

Some operations require your permission:

**Example - Running a bash command:**

```
🔔 Permission Request

Claude wants to run:
  !npm install react-router-dom

Allow? [Y/n]
```

**You type:** `Y` and press Enter

**Then the command executes.**

### Permission Settings Control This

In your `.claude/settings.json`:

```json
{
  "permissions": {
    "Bash": "ask",
    "Write": "allow",
    "Read": "allow"
  }
}
```

- `allow` - Never prompts
- `ask` - Always prompts
- `deny` - Never allows

---

## Part 5: Complete Micro App Walkthrough

Let's build a **Todo App** step by step, with nothing skipped.

### Step 0: Starting Fresh

```bash
mkdir my-todo-app
cd my-todo-app
claude
```

**You see:**
```
No package.json found. This appears to be a new project.
```

---

### Step 1: Initial Request

**You type:**
```
Create a React + TypeScript todo app with Vite
```

**Claude responds:**
```
I'll create a new React + TypeScript project using Vite.

First, let me create the project structure.
```

**Tool Panel shows:**
```
⚙️ Bash
   npm create vite@latest . -- --template react-ts
```

**A permission prompt may appear:**
```
🔔 Permission Request
Allow Bash command: npm create vite@latest . -- --template react-ts
[Y/n]
```

**You type:** `Y`

**Output appears:**
```
✔ Select a framework: › React
✔ Select a variant: › TypeScript

Scaffolding project in ./...
```

---

### Step 2: Installing Dependencies

**Claude continues:**
```
Now I'll install the dependencies.
```

**Tool Panel:**
```
⚙️ Bash
   npm install --silent
```

**Permission prompt appears:**
```
🔔 Permission Request
Allow Bash command: npm install --silent
[Y/n]
```

**You type:** `Y`

**You see progress:**
```
Installing dependencies...
added 142 packages in 18s
```

---

### Step 3: Claude Creates the Todo Components

**Claude says:**
```
I'll create the todo app components. Starting with TodoItem.tsx
```

**Tool Panel shows:**
```
📝 Write
   → src/components/TodoItem.tsx
```

**The conversation shows:**
```
Claude: I've created the TodoItem component with:
- TypeScript props interface
- Checkbox for completion
- Delete button
```

**Then immediately:**
```
📝 Write
   → src/components/TodoList.tsx
```

**And:**
```
📝 Edit
   → src/App.tsx
```

---

### Step 4: Seeing What Changed

**You type:**
```
Show me what you changed in App.tsx
```

**Claude responds with a diff view:**
```
Here's what I changed in src/App.tsx:

--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,6 +1,20 @@
 import { useState } from 'react'
+import { TodoList } from './components/TodoList'
+import type { Todo } from './types'

 function App() {
+  const [todos, setTodos] = useState<Todo[]>([])
+  const [input, setInput] = useState('')
+
   return (
     <div className="app">
-      <h1>Vite + React</h1>
+      <h1>Todo App</h1>
+      <TodoList todos={todos} setTodos={setTodos} />
     </div>
   )
```

---

### Step 5: Running the Dev Server

**Claude asks:**
```
Would you like me to start the dev server?
```

**You type:** `yes`

**Tool Panel:**
```
& Background Task
   npm run dev
```

**Permission prompt:**
```
🔔 Permission Request
Allow background task: npm run dev
[Y/n]
```

**You type:** `Y`

**You see:**
```
➜ Background task started: npm run dev

   VITE v5.0.0  ready in 234 ms

   ➜  Local:   http://localhost:5173/
```

**Important:** The dev server is now running in the background. You can continue chatting with Claude while it runs.

---

### Step 6: Iterating - Adding a Feature

**You type:**
```
Add a filter to show all/active/completed todos
```

**Claude:**
```
I'll add filter functionality. Let me update the components.
```

**Tool Panel shows multiple edits:**
```
📝 Edit
   → src/App.tsx
   (adding filter state)

📝 Write
   → src/components/TodoFilter.tsx
   (new filter button component)
```

**After edits complete:**
```
✓ Filter added. You can now click "All", "Active", or "Completed" to filter todos.
```

---

### Step 7: When Something Breaks

**You type:**
```
The filter isn't working - clicking buttons doesn't change anything
```

**Claude responds:**
```
Let me check the code. I'll read the filter component first.
```

**Tool Panel:**
```
🔍 Read
   → src/components/TodoFilter.tsx
```

**Then:**
```
🔍 Read
   → src/App.tsx
```

**Claude finds the issue:**
```
I found the problem. The TodoFilter component isn't receiving the onFilterChange callback.

Let me fix it:
```

**Tool Panel:**
```
📝 Edit
   → src/App.tsx
   (adding onFilterChange prop)

📝 Edit
   → src/components/TodoFilter.tsx
   (accepting and calling the callback)
```

**Then:**
```
✓ Fixed. The filter buttons should now work.
```

---

### Step 8: Running Tests

**You type:**
```
Run the tests
```

**Tool Panel:**
```
⚙️ Bash
   npm test
```

**Permission prompt, you allow it.**

**Output:**
```
✓ src/App.test.tsx (3)
  ✓ TodoApp renders
  ✓ TodoList renders empty state
  ✓ TodoList renders with todos

 Test Files  1 passed (1)
```

---

### Step 9: Git Commit

**You type:**
```
Commit these changes
```

**Claude initiates the commit workflow:**

**Step 9a - Check status:**
```
⚙️ Bash
   git status
```

**You see in conversation:**
```
Changed files:
  M  src/App.tsx
  M  src/components/TodoList.tsx
  A  src/components/TodoItem.tsx
  A  src/components/TodoFilter.tsx
  A  src/types.ts
```

**Step 9b - Stage files:**
```
⚙️ Bash
   git add .
```

**Step 9c - Claude asks:**
```
Briefly describe these changes:
```

**You type:** `Add todo app with filter functionality`

**Step 9d - Show commit message:**
```
Commit message will be:

Add todo app with filter functionality

- Create TodoItem, TodoList, and TodoFilter components
- Implement filter state (all/active/completed)
- Add TypeScript types
- Include tests

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

Proceed with commit? [Y/n]
```

**You type:** `Y`

**Step 9e - Commit:**
```
⚙️ Bash
   git commit -m "..."
```

**Result:**
```
✓ Committed: 7a8b9c1d - Add todo app with filter functionality
```

---

## Part 6: Other Common Interactions

### Reading a File

**You type:**
```
@src/App.tsx
```

**What happens:**
1. Claude reads the file (shown in Tool Panel)
2. File contents are displayed in conversation
3. Claude asks: `What would you like me to do with this file?`

### Searching Code

**You type:**
```
Find where todos state is defined
```

**Claude uses Grep tool:**
```
🔍 Grep
   Pattern: "useState.*todos"
   In: src/
```

**Results in conversation:**
```
Found in src/App.tsx:8
  const [todos, setTodos] = useState<Todo[]>([])
```

### Multi-File Refactor

**You type:**
```
Extract the Todo interface to a types file
```

**Claude:**
```
I'll create a types file and update all imports.

📝 Write → src/types.ts
📝 Edit → src/App.tsx (update import)
📝 Edit → src/components/TodoList.tsx (update import)
📝 Edit → src/components/TodoItem.tsx (update import)

Done. Created src/types.ts and updated 3 files with the new import.
```

---

## Part 7: Plan Mode

For larger changes, Claude might suggest Plan Mode:

**Claude asks:**
```
This is a significant refactor. Would you like me to enter Plan Mode first?

In Plan Mode, I'll:
- Explore the codebase
- Create a detailed plan
- Get your approval before making changes

Enter Plan Mode? [Y/n]
```

**If you type `Y`:**

Claude enters Plan Mode - **cannot make any changes**, only:
- Read files
- Search code
- Ask questions
- Present a plan

**The plan is presented:**
```
## Plan: Add Redux to Todo App

1. Install dependencies:
   - @reduxjs/toolkit
   - react-redux

2. Create store/ directory:
   - store.ts
   - slices/todosSlice.ts

3. Update App.tsx:
   - Wrap with Provider
   - Replace useState with useDispatch/useSelector

4. Update components:
   - TodoList: Use selector instead of props
   - TodoItem: Dispatch actions instead of callbacks

Estimated changes: 5 files modified, 2 files created.

Proceed with this plan? [Y/n/modify]
```

---

## Part 8: Rewind (Undo System)

If you don't like Claude's changes:

**You type:**
```
/rewind
```

**You see:**
```
Available checkpoints:

  [1] 10:23 - Initial todo components
  [2] 10:31 - Added filter functionality
  [3] 10:38 - Fixed filter bug

Restore to checkpoint: [1-3] or cancel
```

**You type:** `1`

**Files are reverted** to checkpoint 1 state.

---

## Part 9: Status Dashboard

**You type:**
```
/status
```

**A dashboard overlay appears:**

```
┌─────────────────────────────────────────────────────────────┐
│                     CLAUDE CODE STATUS                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Session                                                     │
│   Active: 00:42:12                                          │
│   Model: Claude Opus 4.5 (Sonnet available)               │
│                                                             │
│ Project                                                     │
│   Path: ~/projects/my-todo-app                              │
│   Git: main (1 commit ahead of origin)                      │
│                                                             │
│ Configuration                                               │
│   ✓ .claude/settings.json                                   │
│   ✓ .claude/CLAUDE.md                                       │
│   ✓ ~/.claude/settings.json                                 │
│                                                             │
│ MCP Servers (2 connected)                                   │
│   ✓ Context7 - Library documentation                        │
│   ✓ Figma - Design integration                               │
│                                                             │
│ Background Tasks                                            │
│   • npm run dev (running since 10:15)                       │
│                                                             │
│ This Session                                                │
│   Files read: 12                                            │
│   Files written: 7                                          │
│   Bash commands: 5                                           │
│                                                             │
│ Token Usage (this session)                                  │
│   Input: 124,567                                             │
│   Output: 89,234                                             │
│   Total: 213,801                                             │
│                                                             │
│ Press any key to close                                       │
└─────────────────────────────────────────────────────────────┘
```

**Press any key** to return to normal view.

---

## Part 10: Helpful Shortcuts During Use

### While Typing Your Message

| Key | Action |
|-----|--------|
| `Ctrl+r` | Search through your previous prompts |
| `Ctrl+u` | Clear current input |
| `Ctrl+w` | Delete last word |
| `Shift+Enter` | Insert newline (don't send yet) |

### While Claude is Responding

| Key | Action |
|-----|--------|
| `Ctrl+c` | Stop current response |
| `Esc` (tap once) | Nothing (need double tap) |
| `Esc` (double tap) | Clear input, focus back to prompt |

---

## Part 11: Exiting

**You type:**
```
/exit
```

**Or press:** `Ctrl+D`

**Claude says goodbye:**
```
Thanks for using Claude Code!

Session summary:
  • 7 files created
  • 3 files modified
  • 1 git commit made
  • Dev server still running (background task)

Type `claude` to continue working.
```

**Then you're back at your normal terminal.**

---

## Key UX Characteristics

### 1. It's a Conversation, Not a Command Line

You don't issue commands. You chat. Claude interprets what you mean and figures out what tools to use.

**Bad:** "Use the Edit tool to modify line 5 of App.tsx"
**Good:** "Fix the bug in the todo app"

### 2. You See Everything Claude Does

The Tool Panel shows:
- Every file read
- Every edit made
- Every command run
- Every tool called

No hidden operations.

### 3. Permission Gates Keep You Safe

Claude can't:
- Run commands without asking (if set to "ask")
- Write outside your project directory
- Delete files without confirmation

### 4. Streaming Response

You see Claude "thinking" and responding in real-time. No waiting for a complete response.

### 5. Background Tasks Keep Working

The dev server, tests, or build can run in the background while you continue chatting.

---

## Quick Command Reference

| You type | Claude does |
|----------|------------|
| `add a dark mode toggle` | Reads relevant files, implements feature |
| `@src/App.tsx` | Reads file, asks what you want |
| `!npm test` | Runs tests (after permission) |
| `&npm run dev` | Starts dev server in background |
| `/commit` | Guided git commit workflow |
| `/status` | Shows status dashboard |
| `/rewind` | Undo to previous checkpoint |
| `/help` | Shows help |
| `?` | Shows help |
| `/exit` or `Ctrl+D` | Exit Claude Code |

---

## The Actual Experience

> Claude Code CLI is like having a pair programmer who reads your entire codebase instantly, shows you exactly what they're changing, and asks before running potentially destructive commands. You type natural language, they respond in natural language, and all the file operations happen transparently in the background.
