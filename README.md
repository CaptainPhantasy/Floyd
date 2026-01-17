<p align="center">
  <img src="https://maas-log-prod.cn-wlcb.ufileos.com/anthropic/6500cb76-82ce-49aa-b942-d515a541f5ca/FLOYD_CLI.png?UCloudPublicKey=TOKEN_e15ba47a-d098-4fbd-9afc-a0dcf0e4e621&Expires=1768647857&Signature=CGy21zYEZ7px0+zaEyZ54iiJRyU=" alt="FLOYD CLI" width="600"/>
</p>

# FLOYD CLI

**File-Logged Orchestrator Yielding Deliverables**

> *Because paying $20/month for an AI coding assistant is for people who hate money.*

FLOYD is a GLM-4.7 powered coding agent that does everything that *other* AI coding assistants do — except it runs in your terminal and costs approximately 1/100th the price. We would name the competition, but our lawyers advised against it.

## What is FLOYD?

FLOYD is your personal coding accomplice that:
- Reads and writes code (sometimes even correct code!)
- Runs commands and tools (destructively, if you're not careful)
- Remembers context across sessions via FLOYD-S SUPERCACHE™
- Uses your existing GLM API key instead of demanding a kidney
- Looks absolutely stunning in your terminal

## Installation

```bash
# Clone the repo
git clone https://github.com/CaptainPhantasy/Floyd-CLI.git
cd Floyd-CLI/INK/floyd-cli

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Configuration

FLOYD needs an API key to function. It checks:
1. `GLM_API_KEY` environment variable
2. `ZHIPU_API_KEY` environment variable
3. Its own internal sense of entitlement (not recommended)

No API key? FLOYD will sit there and judge you silently.

## Usage

```bash
# Start FLOYD
cd INK/floyd-cli
npm start

# FLOYD will greet you with a stunning ASCII banner
# Then you type things and FLOYD types back
# It's conversational! Revolutionary!
```

## Commands

| Command | Description |
|---------|-------------|
| Type anything | FLOYD will attempt to help |
| Esc | Escape the existential dread |
| ? | Toggle help (when you're hopelessly lost) |

## FLOYD-S SUPERCACHE™

FLOYD remembers stuff. Three tiers of memory:

| Tier | Purpose | TTL |
|------|---------|-----|
| `reasoning` | Current conversation | 5 min |
| `project` | Project context | 24 hours |
| `vault` | Reusable wisdom | 7 days |

*Patent pending. Probably.*

## Available Tools

FLOYD can do things to your files:
- `bash` - Execute arbitrary commands (what could go wrong?)
- `read` - Read files (spying on your code)
- `write` - Write files (creating new problems)
- `edit` - Edit files (surgical strikes on bugs)
- `multiedit` - Multiple edits (chaos at scale)
- `grep` - Search (find what you're looking for)
- `ls` - List directories (see what's there)

## Project Structure

```
INK/floyd-cli/
├── src/agent/       # The brain
├── src/mcp/         # Tool integration
├── src/store/       # Session persistence
├── src/theme/       # Make it pretty
├── src/ui/          # Ink components
└── source/app.tsx   # Main entry point
```

## Status

- ✅ Agent core implemented
- ✅ MCP client working
- ✅ Session persistence
- ✅ Chrome extension bridge
- ✅ ASCII banner looks fly
- ⏳ World domination (in progress)

## Quick Test

```bash
cd INK/floyd-cli
npm install
npm run build
npm start

# Expected: A stunning terminal interface appears
# Unexpected: Nothing, because you forgot to set GLM_API_KEY
```

## Troubleshooting

**Q: FLOYD isn't responding**
A: Did you set `GLM_API_KEY`? FLOYD can't read minds.

**Q: The build failed**
A: Did you run `npm install`? Did you update Node.js since 2019?

**Q: Why isn't this as good as [REDACTED]?**
A: It costs 1/100th the price. You get what you pay for. But hey, it's open source!

## License

MIT - do whatever you want. Fork it, improve it, sell it, set it on fire.

## Acknowledgments

- Built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs, mind = blown)
- Powered by [GLM-4.7](https://open.bigmodel.cn/) (the unsung hero)
- Inspired by *certain* AI coding tools that shall remain nameless
- ASCII art generated with questionable taste
