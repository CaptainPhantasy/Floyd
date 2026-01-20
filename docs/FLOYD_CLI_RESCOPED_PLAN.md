# Floyd CLI UX Overhaul - Rescoped Plan

**Vision**: Floyd CLI should act exactly like the Claude chat interface, but in a terminal environment.

**Reference**: Claude Code CLI behavior (conversation-first, simple, powerful)

---

## Your Setup

### Three-Screen Configuration

**Left Monitor (Custom Control Panel)**
- TMUX-based monitoring dashboard (you design the layout)
- Sections for:
  - System monitors (btop, htop)
  - Process control (lazydocker, lazygit)
  - Floyd CLI status
  - Other tools you want

**Right Monitor (Main Work Area)**
- **Option A**: Floyd CLI terminal (full screen)
- **Option B**: Custom IDE with Floyd CLI integrated + file explorer

### How It Works

1. You run: `floyd-cli --tmux` (or use `/tmux` command)
2. Left monitor launches with your custom monitoring layout
3. Right monitor shows Floyd CLI (coding assistant)
4. You work naturally - Floyd handles the AI coding tasks

---

## What Floyd CLI Should Be

### Core Behavior (Like Claude Chat)

✅ **Natural Language Interaction**
```
You: Add authentication to the API
Floyd: [reads files, writes code, runs tests, explains changes]
```

✅ **Tool Use Transparency**
```
🔍 Reading src/api/auth.ts
📝 Writing src/middleware/auth.ts
⚙️ Running npm test
✓ Authentication added successfully
```

✅ **Subagent Spawning**
```
🤖 Spawning Code Reviewer subagent...
🤖 Spawning Test Generator subagent...
```

✅ **Permission Control**
```
🔔 Floyd wants to run: npm install
Allow? [Y/n]
```

### Simple UI Layout (Claude Code Style)

```
┌─────────────────────────────────────────────────┐
│              CONVERSATION AREA                   │
│  (scrolling chat history, streaming responses)   │
│                                                  │
│  You: Add error handling                         │
│  Floyd: I'll add try-catch blocks...             │
│                                                  │
├─────────────────────────────────────────────────┤
│              TOOL USE PANEL                      │
│  (shows what Floyd is doing right now)           │
│                                                  │
│  🔍 Reading src/app.ts                           │
│  📝 Editing src/utils.ts                         │
├─────────────────────────────────────────────────┤
│ Your turn. Type a message or command. │         │
└─────────────────────────────────────────────────┘
```

---

## The Real Implementation Plan

### Phase 1: Fix Auto-Activation (Critical)

#### 1.1 Dock Commands ✅ DONE
- Already fixed to require `:` prefix
- No longer activates on normal input

#### 1.2 Remove Auto-Show Logic
**File**: `src/app.tsx`

**Current Issue**:
```typescript
showAgentViz={showAgentViz || (hasActivity && tasks.length > 0)}
```

**Fix**: Remove the `|| (hasActivity && ...)` part
- Agent visualization should only show when explicitly toggled
- Tool activity should appear in conversation, not auto-open panels

#### 1.3 Review Keyboard Shortcuts
**File**: `src/app.tsx` (useInput handler)

**Verify**:
- `?` for help (already guarded: `!showHelp && !showMonitor`)
- `Ctrl+M` for monitor toggle
- `Ctrl+T` for agent viz toggle
- Ensure none interfere with typing

---

### Phase 2: Connect Existing Infrastructure

The infrastructure is already built - we just need to wire it up so it works automatically.

#### 2.1 Skills System
**Files**: `src/skills/*` (1,818 lines, already built)

**What It Does**: Domain-specific capabilities (code review, testing, docs, etc.)

**How to Connect**:
- Initialize `SkillRegistry` on startup
- Discover skills from: built-in → global ~/.floyd/skills → project .floyd/skills
- Register skill tools with AgentEngine
- AI can invoke skills automatically

**Slash Commands**:
- `/skill list` - Show available skills
- `/skill info <name>` - Show skill details

**Changes**:
```typescript
// In app.tsx initialization
import { SkillRegistry } from './skills/index.js';

const skillRegistry = new SkillRegistry();
await skillRegistry.discoverAll();

// Register skills as tools with AgentEngine
const skillTools = skillRegistry.getAllTools();
engineRef.current.registerTools(skillTools);
```

#### 2.2 Plan Mode
**Files**: `src/modes/plan-mode.ts` (468 lines, already built)

**What It Does**: Read-only exploration before making changes

**How to Connect**:
- Add `/plan` slash command to toggle plan mode
- When active, restrict AgentEngine to read-only tools
- Store proposed changes in virtual filesystem
- `/plan apply` to apply, `/plan discard` to cancel

**Slash Commands**:
- `/plan` - Toggle plan mode
- `/plan apply` - Apply proposed changes
- `/plan discard` - Discard proposed changes
- `/plan export` - Export plan as JSON

**Changes**:
```typescript
// Add plan mode state
const [planMode, setPlanMode] = useState(false);

// In handleSlashCommand
case 'plan':
  setPlanMode(!planMode);
  engineRef.current.setPlanMode(!planMode);
  addMessage({
    role: 'system',
    content: planMode ? '✅ Plan Mode enabled (read-only)' : '🔄 Normal mode'
  });
  break;
```

#### 2.3 Rewind System
**Files**: `src/rewind/*` (1,235 lines, already built)

**What It Does**: Checkpoint-based undo system

**How to Connect**:
- Initialize `RewindEngine` on startup
- Create automatic checkpoints before tool operations
- Manual checkpoints via `/checkpoint create <name>`
- Restore via `/rewind <id>`

**Slash Commands**:
- `/checkpoint create <name>` - Create manual checkpoint
- `/checkpoint list` - List all checkpoints
- `/rewind <id>` - Restore to checkpoint
- `/undo` - Undo last operation
- `/redo` - Redo undone operation

**Changes**:
```typescript
// In app.tsx initialization
import { RewindEngine, CheckpointManager } from './rewind/index.js';

const checkpointManager = new CheckpointManager();
const rewindEngine = new RewindEngine(checkpointManager);

// Create checkpoint before each tool operation
const originalSendMessage = engineRef.current.sendMessage.bind(engineRef.current);
engineRef.current.sendMessage = async (prompt) => {
  await checkpointManager.createCheckpoint('auto-before-operation');
  return originalSendMessage(prompt);
};
```

#### 2.4 Explore Agent
**Files**: `src/agent/explore-agent.ts` (627 lines, already built)

**What It Does**: Fast codebase search and navigation

**How to Connect**:
- Initialize `ExploreAgent` on startup (lazy indexing)
- `/explore <query>` for semantic search
- `/explore file <path>` for file overview

**Slash Commands**:
- `/explore <query>` - Search codebase
- `/explore file <path>` - Show file overview
- `/explore stats` - Show index statistics

**Changes**:
```typescript
// In app.tsx initialization
import { ExploreAgent } from './agent/explore-agent.js';

const exploreAgent = new ExploreAgent(process.cwd());
await exploreAgent.indexCodebase();

// In handleSlashCommand
case 'explore':
  const query = args.join(' ');
  const results = await exploreAgent.explore({ query });
  addMessage({
    role: 'system',
    content: formatExploreResults(results)
  });
  break;
```

#### 2.5 Custom Subagents
**Files**: `src/agent/custom-agent.ts` (629 lines, already built)

**What It Does**: User-defined agents with specific roles and tools

**How to Connect**:
- Initialize `CustomAgentManager` on startup
- Load manifests from `.floyd/agents/` and `~/.floyd/agents/`
- `/agent <name>` to switch active agent
- Predefined templates: Code Reviewer, Test Generator, Docs Writer

**Slash Commands**:
- `/agent list` - List available agents
- `/agent use <name>` - Switch to agent
- `/agent create` - Create new agent

**Changes**:
```typescript
// In app.tsx initialization
import { CustomAgentManager } from './agent/custom-agent.js';

const agentManager = new CustomAgentManager();
await agentManager.loadAllAgents();

// In handleSlashCommand
case 'agent':
  const agentName = args[0];
  const agent = agentManager.getAgent(agentName);
  if (agent) {
    engineRef.current.setSystemPrompt(agent.systemPrompt);
    engineRef.current.setAllowedTools(agent.allowedTools);
    addMessage({
      role: 'system',
      content: `✅ Switched to ${agentName} agent`
    });
  }
  break;
```

#### 2.6 Hierarchical Permissions
**Files**: `src/permissions/tool-policy.ts` (424 lines, already built)

**What It Does**: Fine-grained tool control (allow/ask/deny)

**How to Connect**:
- Load policies from `.floyd/permissions.json`
- Apply to AgentEngine's permission system
- Show prompts for "ask" level tools
- Plan mode automatically uses read-only policies

**Slash Commands**:
- `/permission list` - Show all policies
- `/permission set <tool> <level>` - Set tool permission
- `/permission reset` - Reset to defaults

**Changes**:
```typescript
// In app.tsx initialization
import { ToolPolicyManager } from './permissions/tool-policy.js';

const policyManager = new ToolPolicyManager();
await policyManager.loadFromFile('.floyd/permissions.json');

// Apply to permission system
permissionManager.setPolicyManager(policyManager);
```

---

### Phase 3: Slash Command Handler

**File**: `src/app.tsx`

Currently, slash commands are parsed but not executed. We need to wire them up.

```typescript
// Add after handleSubmit
const handleSlashCommand = useCallback(async (command: string, args: string[]) => {
  switch (command) {
    case 'plan':
      return handlePlanCommand(args);
    case 'rewind':
    case 'checkpoint':
      return handleCheckpointCommand(command, args);
    case 'explore':
      return handleExploreCommand(args);
    case 'agent':
      return handleAgentCommand(args);
    case 'skill':
      return handleSkillCommand(args);
    case 'permission':
      return handlePermissionCommand(args);
    case 'tmux':
      return handleTmuxCommand(args);
    case 'status':
      return setShowMonitor(true);
    case 'help':
      return setShowHelp(true);
    case 'exit':
      return exit();
    default:
      // Check for user-defined slash commands
      const userCommand = await slashCommandParser.executeCommand(command, args);
      if (userCommand) {
        addMessage({
          role: 'system',
          content: userCommand.output
        });
      } else {
        addMessage({
          role: 'system',
          content: `❓ Unknown command: /${command}. Type /help for available commands.`
        });
      }
  }
}, [exit]);
```

**Integrate with handleSubmit**:
```typescript
const handleSubmit = useCallback(async (value: string) => {
  if (!value.trim() || isThinking) return;

  // Check for dock commands (already fixed - only with : prefix)
  const dockArgs = parseDockArgs(value.trim().split(/\s+/));
  if (dockArgs) {
    // Handle dock commands...
    return;
  }

  // Check for slash commands
  if (value.startsWith('/')) {
    const [command, ...args] = value.slice(1).split(/\s+/);
    await handleSlashCommand(command, args);
    return;
  }

  // Normal chat
  // ... existing code
}, [handleSlashCommand, isThinking]);
```

---

### Phase 4: TMUX Integration (Opt-In)

**File**: `src/commands/tmux.ts`, `src/app.tsx`

**How It Should Work**:

1. **Startup Option**: `floyd-cli --tmux` launches dual-screen mode
2. **Slash Command**: `/tmux` toggles dual-screen mode
3. **Custom Layout**: You design the left monitor layout in a config file

**Example Config** (`~/.floyd/tmux-layout.json`):
```json
{
  "leftMonitor": {
    "layout": "tiled",
    "panes": [
      {
        "name": "System Monitor",
        "command": "btop",
        "size": "50%"
      },
      {
        "name": "Process Control",
        "command": "lazygit",
        "size": "25%"
      },
      {
        "name": "Docker",
        "command": "lazydocker",
        "size": "25%"
      }
    ]
  }
}
```

**Slash Commands**:
- `/tmux` - Toggle dual-screen mode
- `/tmux layout <name>` - Switch layout
- `/tmux reload` - Reload layout config

**Changes**:
```typescript
// In handleSlashCommand
case 'tmux':
  const { launchDualScreen } = await import('./commands/tmux.js');
  const result = await launchDualScreen({
    layoutPath: '~/.floyd/tmux-layout.json'
  });
  addMessage({
    role: 'system',
    content: result.success 
      ? '✅ Dual-screen mode launched' 
      : `❌ Failed to launch: ${result.error}`
  });
  break;
```

---

### Phase 5: UI Cleanup

#### 5.1 Remove Auto-Show Logic
**File**: `src/app.tsx`

**Before**:
```typescript
showAgentViz={showAgentViz || (hasActivity && tasks.length > 0)}
showToolTimeline={showAgentViz || (hasActivity && toolExecutions.length > 0)}
showEventStream={showAgentViz || (hasActivity && events.length > 0)}
```

**After**:
```typescript
showAgentViz={showAgentViz}
showToolTimeline={showAgentViz && toolExecutions.length > 0}
showEventStream={showAgentViz && events.length > 0}
```

#### 5.2 Add Tool Use Panel to MainLayout
**File**: `src/ui/layouts/MainLayout.tsx`

Add a section between conversation and input that shows active tools:

```typescript
<Box flexDirection="column" paddingX={1}>
  <Text bold dimColor>Active Tools</Text>
  {activeTools.map(tool => (
    <Text key={tool.name}>
      {tool.icon} {tool.name} - {tool.status}
    </Text>
  ))}
</Box>
```

#### 5.3 Add Mode Indicator to Input
**File**: `src/ui/layouts/MainLayout.tsx`

Show current mode:
```typescript
<Text>
  {planMode ? '(plan) ' : '(chat) '}
  Your turn. Type a message or command. │
</Text>
```

---

### Phase 6: Documentation

#### 6.1 README (`INK/floyd-cli/readme.md`)

```markdown
# Floyd CLI

Terminal-based AI coding assistant (like Claude Code, but open source).

## Quick Start

\`\`\`bash
cd your-project
floyd-cli
\`\`\`

## Features

- 🤖 Natural language coding assistant
- 🛠️ Tool use transparency
- 📚 Skills system (domain-specific capabilities)
- 🔄 Rewind/checkpoint system (undo changes)
- 🔍 Explore agent (fast codebase search)
- 🤝 Custom subagents (specialized roles)
- 🔐 Hierarchical permissions (tool control)

## Slash Commands

- `/plan` - Toggle read-only exploration mode
- `/rewind <id>` - Restore to checkpoint
- `/checkpoint create <name>` - Create checkpoint
- `/explore <query>` - Search codebase
- `/agent <name>` - Switch to custom agent
- `/skill list` - Show available skills
- `/status` - Show status dashboard
- `/tmux` - Toggle dual-screen mode
- `/help` - Show help
- `/exit` - Exit

## Dual-Screen Mode

\`\`\`bash
floyd-cli --tmux
\`\`\`

Launches Floyd CLI with a monitoring dashboard on the left monitor.

Configure layout in `~/.floyd/tmux-layout.json`.

## Configuration

Create `.floyd/` in your project:

- `.floyd/permissions.json` - Tool permissions
- `.floyd/agents/` - Custom agent definitions
- `.floyd/skills/` - Project-specific skills
- `.floyd/commands/` - Custom slash commands
```

#### 6.2 TMUX Layout Guide (`docs/TMUX_SETUP.md`)

```markdown
# TMUX Dual-Screen Setup

Configure your custom monitoring dashboard.

## Layout File

Location: `~/.floyd/tmux-layout.json`

\`\`\`json
{
  "leftMonitor": {
    "layout": "tiled",
    "panes": [
      {
        "name": "System Monitor",
        "command": "btop",
        "size": "50%"
      },
      {
        "name": "Git",
        "command": "lazygit",
        "size": "25%"
      },
      {
        "name": "Docker",
        "command": "lazydocker",
        "size": "25%"
      }
    ]
  }
}
\`\`\`

## Usage

\`\`\`bash
# Launch with dual-screen
floyd-cli --tmux

# Or toggle from within CLI
/tmux
\`\`\`
```

---

## Implementation Order (Waves)

### Wave 1: Critical Fixes (2 hours)
1. ✅ Fix dock command auto-activation (DONE)
2. Remove auto-show logic from agent viz
3. Review keyboard shortcuts
4. Verify TMUX doesn't auto-launch

### Wave 2: Connect Infrastructure (8 hours)
5. Initialize and connect Skills System
6. Initialize and connect Plan Mode
7. Initialize and connect Rewind System
8. Initialize and connect Explore Agent
9. Initialize and connect Custom Agents
10. Initialize and connect Permissions

### Wave 3: Slash Commands (4 hours)
11. Implement handleSlashCommand() in app.tsx
12. Wire up all built-in commands
13. Test user-defined command discovery

### Wave 4: TMUX Integration (2 hours)
14. Add /tmux slash command
15. Load custom layout config
16. Test dual-screen launch

### Wave 5: UI Cleanup (2 hours)
17. Remove auto-show logic
18. Add tool use panel
19. Add mode indicators

### Wave 6: Documentation (2 hours)
20. Update README
21. Create TMUX setup guide
22. Test all features

**Total: 20-22 hours**

---

## Success Criteria

✅ **Acts like Claude chat**: Natural language interaction, tool use, subagents
✅ **No auto-activation**: Features only trigger on explicit request
✅ **Infrastructure connected**: All 6 systems (skills, plan, rewind, explore, agents, permissions) work
✅ **Slash commands**: All built-in commands functional
✅ **TMUX opt-in**: Dual-screen mode works when requested
✅ **Simple UI**: Conversation + tool use panel + input
✅ **Documentation**: User can self-onboard

---

## Ready to Begin?

This is a much simpler, focused plan. When you're ready, say **"Go"** and I'll start with Wave 1.
