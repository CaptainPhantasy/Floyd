# FLOYD Configuration Interface User Manual

Complete guide to using FLOYD's configuration interface for monitoring, agent management, and prompt library.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Accessing the Interface](#accessing-the-interface)
3. [Navigation](#navigation)
4. [Monitor Config](#monitor-config)
5. [Agent Manager](#agent-manager)
6. [Prompt Library](#prompt-library)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Configuration Files](#configuration-files)
9. [Examples](#examples)

---

## Quick Start

Launch the configuration interface:

```bash
floyd-cli --config
```

You'll see a tabbed interface with three main sections:
- **Monitor** - Configure what FLOYD watches
- **Agents** - Manage agent profiles and capabilities
- **Prompts** - Browse and manage prompt templates

---

## Accessing the Interface

### Command Line

```bash
# Launch config interface
floyd-cli --config

# Or from project root
cd INK/floyd-cli
npm start -- --config
```

### Exit

Press `Esc` at any time to exit the configuration interface.

---

## Navigation

### Tab Navigation

- **Tab/Arrow Keys** - Switch between tabs (Monitor → Agents → Prompts)
- **Number Keys 1-3** - Direct tab selection:
  - `1` - Monitor Config
  - `2` - Agent Manager
  - `3` - Prompt Library

### General Controls

- **Esc** - Exit configuration interface
- **Enter** - Submit forms / confirm actions
- **Tab** - Navigate between form fields

---

## Monitor Config

Configure what FLOYD monitors in your workspace.

### Features

- **File Watch Patterns** - Glob patterns to monitor for file changes
- **MCP Servers** - Model Context Protocol server connections
- **Process Monitoring** - Toggle process monitoring
- **Git Monitoring** - Toggle git activity tracking
- **Browser Monitoring** - Toggle browser state monitoring
- **Refresh Interval** - Update frequency (milliseconds)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add new watch pattern |
| `p` | Toggle process monitoring |
| `g` | Toggle git monitoring |
| `b` | Toggle browser monitoring |
| `Esc` | Cancel current operation |

### Adding Watch Patterns

1. Press `a` to show the add pattern form
2. Enter a glob pattern (e.g., `**/*.ts`, `src/**/*.tsx`)
3. Optionally add a description
4. Press `Enter` to save
5. Press `Esc` to cancel

**Example Patterns:**
```
**/*.ts          # All TypeScript files
**/*.{ts,tsx}    # TypeScript and TSX files
src/**/*.ts      # TypeScript files in src directory
!**/*.test.ts    # Exclude test files
```

### Viewing MCP Servers

MCP servers are configured in `.floyd/mcp.json`. The config interface displays:
- Connection status (✓ enabled, ○ disabled)
- Server name
- Transport type (stdio, sse, http, websocket)
- Current connection state

**Note:** To add/edit MCP servers, edit `.floyd/mcp.json` directly. See `.floyd/mcp.config.example.json` for examples.

### Settings

- **Process Monitoring** - Monitor running processes (default: enabled)
- **Git Monitoring** - Track git activity (default: enabled)
- **Browser Monitoring** - Monitor browser state (default: disabled)
- **Refresh Interval** - How often to update (default: 1000ms)

---

## Agent Manager

Create and configure agent profiles with different capabilities and swarm assignments.

### Features

- **Create Agent Profiles** - Define custom agent personas
- **Swarm Assignment** - Assign agents to specific worker swarms
- **Tool Permissions** - Configure which tools each agent can use
- **System Prompts** - Customize agent behavior with system prompts
- **Token Budgets** - Set token limits per agent
- **Usage Statistics** - View agent performance metrics

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add new agent profile |
| `n` | Cycle through profiles to set active |
| `Esc` | Cancel current operation |

### Creating an Agent Profile

1. Press `a` to show the add form
2. Fill in the required fields:
   - **Name** - Display name for the agent
   - **Role** - Agent role/persona (e.g., "Code Reviewer", "Bug Fixer")
   - **Swarm Type** - Select from dropdown:
     - Code Search - Symbol search and code discovery
     - Patch Maker - Code generation and file edits
     - Tester - Test execution and validation
     - Browser - Web interaction and automation
     - GitOps - Git operations and version control
   - **Token Budget** - Maximum tokens per request (default: 2000)
   - **System Prompt** - Optional custom system prompt
3. Press `Enter` to save
4. Press `Esc` to cancel

### Swarm Types Explained

| Swarm | Purpose | Best For |
|-------|---------|----------|
| **Code Search** | Find symbols, references, patterns | Code discovery, finding usages |
| **Patch Maker** | Generate and modify code | Code generation, refactoring |
| **Tester** | Execute tests, validate | Testing, validation |
| **Browser** | Web interaction, scraping | Web automation, testing |
| **GitOps** | Git operations | Version control, commits |

### Viewing Statistics

The active profile displays:
- **Total Calls** - Number of times agent was used
- **Total Tokens** - Cumulative token usage
- **Success Rate** - Percentage of successful operations
- **Progress Bar** - Visual token budget usage

### Setting Active Profile

- Press `n` to cycle through profiles
- The active profile (marked with ●) is used by default
- Only one profile can be active at a time

---

## Prompt Library

Manage prompt templates for common tasks like coding, debugging, refactoring, and more.

### Features

- **Browse by Category** - Organize prompts by type
- **Search** - Find prompts by name, description, or tags
- **Create Templates** - Build custom prompt templates
- **Preview** - See rendered prompts with syntax highlighting
- **Favorites** - Mark frequently used prompts
- **Examples** - Attach few-shot examples to templates

### Categories

- **Coding** - Code generation templates
- **Debug** - Error debugging prompts
- **Refactor** - Code refactoring templates
- **Explain** - Explanation prompts
- **Review** - Code review templates
- **Custom** - Your custom templates

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add new prompt template |
| `f` | View favorites |
| `c` | Clear search query |
| `Esc` | Cancel current operation |

### Creating a Prompt Template

1. Press `a` to show the add form
2. Fill in:
   - **Name** - Template name
   - **Category** - Select from dropdown
   - **Description** - Optional description
   - **Template** - Template content (use `{{variableName}}` for variables)
3. Press `Enter` to save
4. Press `Esc` to cancel

### Template Variables

Use `{{variableName}}` syntax in templates:

```
Generate code for: {{task}}

Requirements:
{{requirements}}

Language: {{language}}
```

When rendering, variables are replaced with actual values.

### Searching Prompts

- Type in the search box to filter prompts
- Search matches:
  - Template name
  - Description
  - Tags
- Press `c` to clear search

### Previewing Templates

- Click on a template to preview
- Preview shows:
  - Template name and description
  - Rendered template with syntax highlighting
  - Variable placeholders

### Favorites

- Mark frequently used prompts as favorites (★)
- Press `f` to view all favorites
- Favorites appear at the top of lists

---

## Keyboard Shortcuts

### Global Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Exit configuration interface |
| `Tab` / `Arrow Keys` | Switch between tabs |
| `1` | Jump to Monitor tab |
| `2` | Jump to Agents tab |
| `3` | Jump to Prompts tab |

### Monitor Config Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add watch pattern |
| `p` | Toggle process monitoring |
| `g` | Toggle git monitoring |
| `b` | Toggle browser monitoring |

### Agent Manager Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add agent profile |
| `n` | Cycle active profile |

### Prompt Library Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add prompt template |
| `f` | View favorites |
| `c` | Clear search |

---

## Configuration Files

All configuration is automatically saved to `.floyd/` directory in your project root.

### File Locations

```
.floyd/
├── monitor-config.json      # Monitoring settings
├── agent-profiles.json      # Agent profiles
└── prompt-templates.json   # Prompt templates
```

### File Formats

All files use JSON format with automatic formatting (2-space indentation).

#### monitor-config.json

```json
{
  "watchPatterns": [
    {
      "id": "default-ts",
      "pattern": "**/*.{ts,tsx}",
      "enabled": true,
      "description": "TypeScript files",
      "created": 1705507200000
    }
  ],
  "processMonitoring": true,
  "eventFilters": [],
  "mcpServers": [],
  "refreshInterval": 1000,
  "maxEvents": 1000,
  "gitMonitoring": true,
  "browserMonitoring": false
}
```

#### agent-profiles.json

```json
{
  "profiles": [
    {
      "id": "default-codesearch",
      "name": "Code Search Agent",
      "role": "Code Discovery Specialist",
      "swarmType": "codesearch",
      "allowedTools": ["grep", "read_file", "codebase_search"],
      "systemPrompt": "You are a code search specialist...",
      "tokenBudget": 2000,
      "maxConcurrentTasks": 3,
      "created": 1705507200000,
      "modified": 1705507200000,
      "active": true,
      "stats": {
        "totalCalls": 0,
        "totalTokens": 0,
        "successRate": 1,
        "avgDuration": 0,
        "lastUsed": null
      }
    }
  ],
  "activeProfileId": "default-codesearch"
}
```

#### prompt-templates.json

```json
{
  "templates": [
    {
      "id": "default-coding",
      "name": "Code Generation",
      "category": "coding",
      "template": "Generate code for: {{task}}\n\nRequirements:\n{{requirements}}",
      "variables": [
        {
          "name": "task",
          "description": "What to build",
          "required": true
        }
      ],
      "examples": [],
      "description": "Generate clean, well-documented code",
      "tags": ["code", "generation"],
      "created": 1705507200000,
      "modified": 1705507200000,
      "usageCount": 0,
      "favorite": true
    }
  ]
}
```

### Manual Editing

You can edit these files directly if needed. Changes will be loaded the next time you open the config interface.

**Note:** Invalid JSON will cause errors. Always validate JSON before saving.

---

## Examples

### Example 1: Setting Up File Monitoring

**Goal:** Monitor all TypeScript files except tests

1. Launch config: `floyd-cli --config`
2. Go to Monitor tab (press `1`)
3. Press `a` to add pattern
4. Enter pattern: `**/*.ts`
5. Enter description: "TypeScript files"
6. Press `Enter`
7. Press `a` again
8. Enter pattern: `!**/*.test.ts`
9. Enter description: "Exclude test files"
10. Press `Enter`

### Example 2: Creating a Code Review Agent

**Goal:** Create an agent specialized for code reviews

1. Launch config: `floyd-cli --config`
2. Go to Agents tab (press `2`)
3. Press `a` to add profile
4. Fill in:
   - Name: `Code Reviewer`
   - Role: `Code Review Specialist`
   - Swarm Type: `Patch Maker` (select from dropdown)
   - Token Budget: `3000`
   - System Prompt: `You are a code review specialist. Focus on bugs, readability, and best practices.`
5. Press `Enter`
6. Press `n` to make it active

### Example 3: Creating a Debug Prompt Template

**Goal:** Create a reusable debug prompt template

1. Launch config: `floyd-cli --config`
2. Go to Prompts tab (press `3`)
3. Press `a` to add template
4. Fill in:
   - Name: `Debug Error`
   - Category: `Debug` (select from dropdown)
   - Description: `Debug and fix errors`
   - Template:
     ```
     Debug this error:
     
     ```
     {{error}}
     ```
     
     Context: {{context}}
     ```
5. Press `Enter`
6. Mark as favorite (★) for quick access

### Example 4: Configuring MCP Servers

**Goal:** Enable GitHub MCP server

1. Edit `.floyd/mcp.json`:
   ```json
   {
     "version": "1.0",
     "servers": [
       {
         "name": "github",
         "enabled": true,
         "transport": {
           "type": "stdio",
           "command": "npx",
           "args": ["-y", "@modelcontextprotocol/server-github"],
           "env": {
             "GITHUB_TOKEN": "your-token-here"
           }
         }
       }
     ]
   }
   ```
2. Launch config: `floyd-cli --config`
3. Go to Monitor tab
4. View MCP Servers section - GitHub should show as enabled (✓)

---

## Troubleshooting

### Config Interface Won't Launch

**Problem:** `floyd-cli --config` doesn't work

**Solutions:**
1. Make sure you're in the project directory: `cd INK/floyd-cli`
2. Build the project: `npm run build`
3. Check Node.js version: `node --version` (should be >= 16)

### Changes Not Saving

**Problem:** Configuration changes aren't persisting

**Solutions:**
1. Check `.floyd/` directory exists and is writable
2. Verify JSON files aren't corrupted (check syntax)
3. Check disk space
4. Look for error messages in terminal

### Can't See MCP Servers

**Problem:** MCP servers section is empty

**Solutions:**
1. Create `.floyd/mcp.json` if it doesn't exist
2. Copy from `.floyd/mcp.config.example.json`
3. Ensure JSON syntax is valid
4. Restart config interface

### Agent Profile Not Working

**Problem:** Created agent profile doesn't appear active

**Solutions:**
1. Press `n` to cycle through profiles
2. Check that profile has `"active": true` in JSON
3. Verify swarm type is valid
4. Check token budget is a positive number

### Prompt Template Not Rendering

**Problem:** Template preview shows errors

**Solutions:**
1. Check template syntax - variables use `{{variableName}}`
2. Ensure all required variables are defined
3. Verify template content is valid
4. Check for special characters that need escaping

---

## Tips & Best Practices

### Monitor Config

- **Start Simple:** Begin with default patterns, add more as needed
- **Use Exclusions:** Use `!` prefix to exclude patterns (e.g., `!**/*.test.ts`)
- **Refresh Interval:** Lower values (500ms) for active development, higher (5000ms) for less frequent updates
- **MCP Servers:** Keep disabled servers in config but set `enabled: false` for easy toggling

### Agent Manager

- **One Active Profile:** Only one profile should be active at a time
- **Token Budgets:** Start conservative (2000), increase if agent needs more context
- **System Prompts:** Keep prompts concise but specific
- **Swarm Types:** Match swarm type to agent's primary function

### Prompt Library

- **Use Variables:** Make templates reusable with `{{variable}}` syntax
- **Add Examples:** Include few-shot examples for better results
- **Tag Everything:** Add tags for easier searching
- **Favorites:** Mark frequently used templates for quick access
- **Categories:** Use appropriate categories for organization

---

## Advanced Usage

### Programmatic Access

You can access stores programmatically:

```typescript
import {useConfigStore, useAgentStore, usePromptStore} from './store/index.js';

// Get monitor config
const config = useConfigStore.getState().config;

// Get active agent profile
const activeProfile = useAgentStore.getState().getActiveProfile();

// Search prompts
const results = usePromptStore.getState().searchTemplates('debug');
```

### Custom Storage Location

By default, configs save to `.floyd/` in the current working directory. To change:

1. Modify store files (`config-store.ts`, `agent-store.ts`, `prompt-store.ts`)
2. Update `getConfigPath()`, `getProfilesPath()`, `getTemplatesPath()` functions
3. Rebuild: `npm run build`

---

## Support

For issues or questions:

1. Check this manual first
2. Review `.floyd/` config files for errors
3. Check terminal for error messages
4. Verify all dependencies are installed: `npm install`

---

**Last Updated:** 2026-01-17  
**Version:** 1.0.0
