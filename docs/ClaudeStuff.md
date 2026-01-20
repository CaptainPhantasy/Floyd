# Claude Code Reference

*A comprehensive reference for Claude Code features, skills, commands, and shortcuts.*

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `!` | Enter bash mode |
| `/` | Enter command mode |
| `@` | Enter file path mode |
| `&` | Enter background mode |
| `Esc` (double tap) | Clear input |
| `Shift + Tab` | Auto-accept edits |
| `Ctrl + _` | Undo |
| `Ctrl + z` | Suspend |
| `Ctrl + o` | Toggle verbose output |
| `Ctrl + r` | Search command history (reverse search) |
| `Ctrl + t` | Show todos |
| `Ctrl + v` | Paste images |
| `Ctrl + s` | Stash prompt |
| `Opt + p` | Switch model |
| `Shift + ⏎` | Insert newline |

---

## Built-in Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands and help |
| `/clear` | Clear the conversation history |
| `/exit` | Exit Claude Code |
| `/tasks` | List running background tasks |
| `/rewind` | Revert to previous code state (checkpoint system) |
| `/sandbox` | Enter sandboxed bash mode (isolated filesystem) |
| `/status` | Show status dashboard (session, config, metrics) |

---

## Slash Commands (Skills)

### Git / Development

| Command | Trigger | Description |
|---------|---------|-------------|
| **Commit** | `/commit` | Create a git commit with staged changes. Stages files, creates commit message, runs git commit. |
| **Using Git Worktrees** | - | Create isolated git worktrees for feature work with smart directory selection. |

### Planning / Debugging

| Command | Trigger | Description |
|---------|---------|-------------|
| **Systematic Debugging** | - | Four-phase bug fixing framework: root cause investigation, pattern analysis, hypothesis testing, implementation. Use when encountering bugs, test failures, or unexpected behavior. |
| **Test Fixing** | - | Run tests and systematically fix all failing tests using smart error grouping. Use when user asks to fix failing tests or tests fail after a build. |
| **Finishing a Development Branch** | - | Guidance for completing development work: merge, PR, or cleanup options. Use when implementation is complete and all tests pass. |

### GLM / Bug Reporting

| Command | Trigger | Description |
|---------|---------|-------------|
| **GLM Plan Usage Query** | `/glm-plan-usage:usage-query` | Query usage statistics for the current GLM Coding Plan account. |
| **GLM Plan Bug Feedback** | `/glm-plan-bug:case-feedback` | Submit case feedback to report issues or suggestions for the current conversation. |

### Hookify (Behavior Prevention)

| Command | Trigger | Description |
|---------|---------|-------------|
| **Hookify Help** | `/hookify:help` | Get help with the hookify plugin. |
| **Hookify List** | `/hookify:list` | List all configured hookify rules. |
| **Hookify Configure** | `/hookify:configure` | Enable or disable hookify rules interactively. |
| **Hookify Create** | `/hookify:hookify` | Create hooks to prevent unwanted behaviors from conversation analysis or explicit instructions. |
| **Hookify Writing Rules** | - | Guide for creating hookify rules with correct syntax and patterns. |

### Ralph Wiggum (Loop)

| Command | Trigger | Description |
|---------|---------|-------------|
| **Ralph Wiggum Help** | `/ralph-wiggum:help` | Explain Ralph Wiggum technique and available commands. |
| **Cancel Ralph Loop** | `/ralph-wiggum:cancel-ralph` | Cancel active Ralph Wiggum loop. |
| **Start Ralph Loop** | `/ralph-wiggum:ralph-loop` | Start Ralph Wiggum loop in current session. |

### Notion Integration

| Command | Trigger | Description |
|---------|---------|-------------|
| **Create Database Row** | `/Notion:notion-create-database-row` | Insert a new row into a specified Notion database using natural-language property values. |
| **Notion Search** | `/Notion:notion-search` | Search the user's Notion workspace using the Notion MCP server and Notion Workspace Skill. |
| **Create Notion Task** | `/Notion:notion-create-task` | Create a new task in the user's Notion tasks database with sensible defaults. |
| **Create Notion Page** | `/Notion:notion-create-page` | Create a new Notion page, optionally under a specific parent. |
| **Query Notion Database** | `/Notion:notion-database-query` | Query a Notion database by name or ID and return structured, readable results. |
| **Find Notion Items** | `/Notion:notion-find` | Quickly find pages or databases in Notion by title keywords. |

### Documentation / Writing

| Command | Trigger | Description |
|---------|---------|-------------|
| **Context7** | - | Retrieve up-to-date documentation and code examples for any programming library. |
| **DocX** | - | Comprehensive Word document creation, editing, and analysis with tracked changes, comments, and formatting preservation. |
| **PDF** | - | PDF manipulation toolkit for extracting text/tables, creating new PDFs, merging/splitting, and form handling. |
| **Internal Comms** | - | Templates for writing internal communications: status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports. |

### Design / Media

| Command | Trigger | Description |
|---------|---------|-------------|
| **Theme Factory** | - | Apply 10 pre-set themes (colors/fonts) to artifacts: slides, docs, reports, HTML landing pages. |
| **Canvas Design** | - | Create original visual art/designs in .png and .pdf formats using design philosophy. |
| **Algorithmic Art** | - | Create generative art using p5.js with seeded randomness and interactive parameter exploration. |
| **Video Downloader** | - | Download videos from YouTube and other platforms for offline viewing using yt-dlp. |

### Web / Testing

| Command | Trigger | Description |
|---------|---------|-------------|
| **Webapp Testing** | - | Toolkit for interacting with and testing local web applications using Playwright. Supports UI verification, debugging, screenshots, and logs. |
| **Figma: Implement Design** | - | Translate Figma designs into production-ready code with 1:1 visual fidelity. Requires Figma MCP server. |
| **Figma: Code Connect Components** | - | Connect Figma design components to code components using Code Connect. Requires Figma MCP server. |
| **Figma: Create Design System Rules** | - | Generate custom design system rules for the codebase. Requires Figma MCP server. |

### Data / Analysis

| Command | Trigger | Description |
|---------|---------|-------------|
| **XLSX** | - | Comprehensive spreadsheet creation, editing, and analysis with formulas, formatting, and data visualization. |
| **CSV Data Summarizer** | - | Analyze CSV files, generate summary stats, and plot quick visualizations using Python and pandas. Auto-triggers on CSV uploads. |

### AWS

| Command | Trigger | Description |
|---------|---------|-------------|
| **AWS Skills** | - | AWS development with CDK best practices, cost optimization MCP servers, and serverless/event-driven architecture patterns. |

### Code Analysis

| Command | Trigger | Description |
|---------|---------|-------------|
| **Analyze** | - | Analyze entire codebase or project providing architecture, implementation, security posture, and alignment with documented intent. |

### CLI Development

| Command | Trigger | Description |
|---------|---------|-------------|
| **CLI Build (Ink)** | - | Build production-grade Ink (React for CLI) implementations. Use for Ink UI components, streaming updates, command palettes, file pickers, etc. |

### Plugin Development

| Command | Trigger | Description |
|---------|---------|-------------|
| **Plugin: Create Plugin** | - | Guided end-to-end plugin creation workflow with component design, implementation, and validation. |
| **Plugin: Skill Development** | - | Guidance on skill structure, progressive disclosure, and best practices for Claude Code plugins. |
| **Plugin: Command Development** | - | Guide for creating slash commands with YAML frontmatter, dynamic arguments, bash execution, and user interaction patterns. |
| **Plugin: Hook Development** | - | Comprehensive guidance for creating PreToolUse/PostToolUse/Stop hooks with event-driven automation. |
| **Plugin: MCP Integration** | - | Guidance for integrating Model Context Protocol servers into Claude Code plugins. |
| **Plugin: Plugin Settings** | - | Documentation for plugin state files (.local.md pattern) with YAML frontmatter for user-configurable plugin settings. |
| **Plugin: Plugin Structure** | - | Guidance on plugin directory layout, manifest configuration, file naming, and Claude Code plugin architecture. |
| **Plugin: Agent Development** | - | Guidance on agent structure, system prompts, triggering conditions, and best practices for Claude Code plugins. |

### Multi-Agent

| Command | Trigger | Description |
|---------|---------|-------------|
| **Swarm** | - | Deploy a swarm of specialized subagents to tackle tasks in parallel. |

### Misc

| Command | Trigger | Description |
|---------|---------|-------------|
| **Slack GIF Creator** | - | Create animated GIFs optimized for Slack with size constraints and composable animation primitives. |
| **Artifacts Builder** | - | Suite for creating elaborate multi-component HTML artifacts using React, Tailwind CSS, and shadcn/ui. |

---

## MCP Servers

The following MCP (Model Context Protocol) servers are configured:

| Server | Purpose |
|--------|---------|
| **Notion** (plugin:Notion:notion) | Notion workspace integration - pages, databases, search |
| **Context7** (plugin:context7:context7) | Up-to-date library documentation and code examples |
| **Figma** (plugin:figma:figma) | Figma design integration, code generation, Code Connect |
| **Playwright** (plugin:playwright:playwright) | Browser automation and testing |
| **Serena** (plugin:serena:serena) | Semantic code operations and project analysis |
| **Web Reader** (mcp__web-reader__webReader) | Fetch and convert URLs to LLM-friendly input |
| **Web Search Prime** (mcp__web-search-prime__webSearchPrime) | Web search with results including page summaries |
| **4.5v MCP** (mcp__4_5v_mcp__analyze_image) | Image analysis using AI vision models |
| **Zai MCP Server** (mcp__zai-mcp-server__*) | Multi-purpose: data viz analysis, UI diff, error diagnosis, text extraction, video analysis, technical diagrams |
| **Zread** (mcp__zread__*) | GitHub repository structure, file reading, doc search |

---

## Agent Types (Built-in)

| Agent | Description |
|-------|-------------|
| **Explore** | Fast agent for exploring codebases - file patterns, search, architecture questions |
| **Plan** | Software architect agent for designing implementation plans |
| **general-purpose** | General-purpose agent for complex multi-step tasks |
| **bash** | Command execution specialist (git, npm, docker, etc.) |
| **statusline-setup** | Configure CLI status line setting |
| **claude-code-guide** | Help with Claude Code features, hooks, slash commands, IDE integrations |
| **glm-plan-usage:usage-query-agent** | Query GLM Coding Plan usage (triggered by skill) |
| **glm-plan-bug:case-feedback-agent** | Submit GLM case feedback (triggered by skill) |
| **agent-sdk-dev:new-sdk-app** | Create new Claude Agent SDK application |
| **agent-sdk-dev:agent-sdk-verifier-ts** | Verify TypeScript Agent SDK apps |
| **agent-sdk-dev:agent-sdk-verifier-py** | Verify Python Agent SDK apps |
| **plugin-dev:agent-creator** | Create agents from plugin-dev plugin |
| **plugin-dev:skill-reviewer** | Review skills from plugin-dev plugin |
| **plugin-dev:plugin-validator** | Validate plugins from plugin-dev plugin |
| **hookify:conversation-analyzer** | Analyze conversations to find behaviors worth preventing with hooks |
| **codebase-system-analyzer** | Comprehensive evidence-backed codebase analysis (security, architecture, compliance) |
| **CRITIC** | Take a project to LLM point of no more significant improvements |
| **executive-orchestrator** | Orchestrate multi-agent development workflows |
| **DocPairity-Critic** | Evidence-based verification of repo docs |
| **UNAU-NextUP** | HIL Agent only |
| **repo-critic-enforcer** | Validate repo is production-ready with Golden Path verification |
| **usage-query-agent** | Query GLM usage (same as glm-plan-usage) |

---

## Modes

Claude Code operates in different modes that affect behavior:

| Mode | Description |
|------|-------------|
| **editing** | Can edit files with provided tools. Adheres to project code style. |
| **interactive** | Engage with user throughout task, asking for clarification. Present options and explanations. |
| **planning** | Explore codebase and design implementation approach for user approval. |
| **one-shot** | Execute tasks without intermediate user confirmation |

---

## Conventions

### File Path References
- Format: `file_path:line_number` (e.g., `src/components/SettingsModal.tsx:42`)
- Allows user to navigate directly to source code locations

### Commit Message Format
- Uses HEREDOC for multi-line commit messages
- Always includes `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`
- Runs `git status` after commit to verify success

### Task Management
- Uses `TodoWrite` tool to track tasks
- Tasks have: `content`, `status` (pending/in_progress/completed), `activeForm`
- Only ONE task should be `in_progress` at a time
- Mark tasks `completed` immediately after finishing (don't batch)

---

## Core Architecture

### CLAUDE.md Files
Special Markdown files automatically pulled into Claude's context. Used for:
- Project guidelines and conventions
- Common commands and workflows
- Setup instructions

**Scopes:**
| Level | Location |
|-------|----------|
| Global | `~/.claude/` |
| Parent | Parent directory of project |
| Project | Project root |

### Plan Mode
A distinct, read-only mode where Claude:
- Analyzes the codebase before making changes
- Asks clarifying questions
- Ensures better understanding of the task
- Presents implementation plan for user approval

### REPL Loop with History
- `Ctrl+R` - Reverse-search through command history to find and reuse previous prompts

---

## Native Tools

### Bash Tool
Executes shell commands with stdout/stderr capture.
- **Important:** Hard-coded to BLOCK file-search commands like `find` and `grep`
- Forces use of dedicated search tools instead
- Use for: git, npm, docker, file operations

### Grep & Glob Tools
Dedicated, optimized tools for searching:
| Tool | Purpose | Usage |
|------|---------|-------|
| **Grep** | Search file contents | `pattern` search across files |
| **Glob** | Find files by pattern | `*.ts`, `**/*.tsx`, etc. |

### Edit Tool
Modifies files using search-and-replace patterns:
- Precise changes without rewriting entire files
- Supports regex patterns
- Can do multiple replacements at once

### Write Tool
Creates new files or completely replaces existing ones.

### Text Editor Tool
Built-in interface for creating and editing text files directly.

---

## Advanced Features

### Computer Use (Beta)
Allows Claude to:
- Take screenshots
- Issue mouse/keyboard commands
- Control computer interfaces directly

### Rewind (`/rewind`)
Checkpoint system that:
- Automatically saves code state before edits
- Allows instant reversion to previous versions
- One-click undo for entire code changes

### Sandboxed Bash (`/sandbox`)
Filesystem and network isolation:
- Reduces permission prompts
- Defined safe area for operations
- Restricted to specific directories

### Custom Subagents
Specialized agents with:
- Own prompts and system instructions
- Model choice (Sonnet, Opus, Haiku)
- Tool permissions
- Used for: exploration, planning, specific tasks

**Purpose:** Preserve main context by delegating specialized work to subagents.

### Custom Slash Commands
User-defined command templates:
- Stored in `.claude/commands/`
- Shareable with team
- Create repeated workflows
- YAML frontmatter for metadata

### Status Dashboard (`/status`)
Interactive dashboard showing:
- Session information
- Configuration sources
- Usage metrics
- Active connections

---

## MCP Integration Details

### Universal MCP Client
Connects to external MCP servers via:
- HTTP
- SSE (Server-Sent Events)
- stdio

Accesses external resources:
- GitHub (repos, files, docs)
- PostgreSQL (database queries)
- Sentry (error tracking)
- And any MCP-compatible server

### Programmatic Tool Calling
Claude can:
- Write and execute Python scripts in a sandbox
- Call multiple MCP tools in a loop
- Return only final result to save context tokens

### Dynamic Tool Updates
- Supports `list_changed` notifications
- MCP servers can update available tools dynamically
- No reconnection required

### Configuration Scopes
| Scope | Location | Purpose |
|-------|----------|---------|
| Local | `.claude/` | Project-specific, private (not shared) |
| Project | `.mcp.json` | Shared via git |
| User | `~/.claude/` | Global user configuration |

---

## Security & Permissions

### Hierarchical Permissions System
Tools controlled via rules in `settings.json`:

| Rule | Meaning |
|------|---------|
| `allow` | Tool can be used without prompting |
| `ask` | Prompt user before each use |
| `deny` | Tool cannot be used |

**Wildcards supported:**
```
Bash(git commit:*)  # Allow all git commit commands
Bash(rm:*)          # Ask before all rm commands
```

### Filesystem Write Restriction
- Claude Code can **only** write to:
  - Directory it was started in
  - Subfolders of that directory
- **Cannot** modify:
  - Parent directories
  - System directories
  - Other projects

### Managed Settings (Enterprise)
- IT-enforced organization-wide policies
- System-level `managed-settings.json`
- Overrides user settings
- For corporate deployments

---

## What Makes Claude Code Different

### Local-First Memory
All context stored locally:
- CLAUDE.md files
- Custom commands
- Subagent configurations
- Portable and private

### Integrated Development Workflow
Full "explore, plan, code, test, commit" loop:
1. **Explore** - Use Glob/Grep to understand codebase
2. **Plan** - Enter Plan Mode for analysis
3. **Code** - Use Edit/Write tools
4. **Test** - Run tests via Bash
5. **Commit** - Use `/commit` slash command

### Safe Autonomy
- Strict permission system
- Scoped write access
- Grant autonomy safely within project bounds
- No manual file uploads needed

---

## Notes

- This document is a living reference - add to it as new features/skills are discovered
- Some skills require specific MCP server connections to function
- Agent SDK development has specialized verifier agents for TypeScript and Python
- Custom slash commands go in `.claude/commands/` directory
- MCP configs can be at project, local, or user level
