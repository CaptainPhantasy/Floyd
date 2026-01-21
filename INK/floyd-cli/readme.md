# FLOYD

**The AI Ecosystem Born From a Moment of "Wait, We Can Just Build This Ourselves"**

> *Because paying rent for an AI assistant feels wrong when you could just buy your own.*

[https://github.com/CaptainPhantasy/Floyd-Code-CLI](https://github.com/CaptainPhantasy/Floyd-Code-CLI)

---

## The "Legacy AI" Story

You know the drill. There's *That Company* with the subscription that auto-renews faster than you can say "cancel." There's the premium coding buddy that costs more than your actual grocery budget. And there are the rate limits — those gentle reminders that you've asked too many questions today.

Here at **Legacy AI** — a tiny microsaas shop tucked away in Brown County, Indiana (population: lovely, but please don't visit, our downtown is one building and it's usually closed) — we had a moment.

We looked at our credit card bill. We looked at each other. We said:

*"Hang on. This is just API calls in a trench coat. We could build this."*

So we did.

Floyd is what happens when you stop paying monthly for AI tools and start having fun.

---

## Meet The Family

We didn't stop at one tool. We built a whole little ecosystem — a collection of TypeScript scripts fueled by coffee, curiosity, and the occasional "bet we can't pull this off."

### 1. Floyd CLI

It lives in your terminal. It helps you code. It costs pennies. It has **Zen Mode** (Ctrl+Z) for when you just want code on your screen and nothing else.

### 2. Floyd Chrome Extension

Lets Floyd see what you see in your browser. Great for documentation you're definitely going to read someday.

### 3. Floyd Desktop (Web)

Same agent goodness, but with buttons. For when you're feeling GUI-curious.

### 4. Browork

A sub-agent system that spawns little worker Floyds to do parallel tasks. Like having a team of tiny helpers, each one slightly more confused than the last, but they get there eventually.

### 5. **NEW THIS WEEK: The Floyd IDE**

We looked at a certain *other* AI IDE with its certain *other* price tag and thought... you know what? Let's make our own.

The Floyd IDE entered development **this week**. It'll help you code. It won't cost a car payment. It's coming soon. We're excited. You should be too. Or at least politely interested.

---

## Why Floyd?

- **He knows your project**: Floyd has `project_map` — he knows where your files live without asking like a lost tourist.

- **Surgical edits**: He fixes bugs without rewriting your whole file and deleting your comments. He's respectful like that.

- **SuperCaching™**: Three tiers of memory so he doesn't make you repeat yourself:
  - **Reasoning** (5 min) — Active conversations
  - **Project** (24 hrs) — Session work
  - **Vault** (7 days) — Reusable patterns

- **Ctrl+Z Zen Mode**: The UI goes away. Just code. You, the screen, and pure focus.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/CaptainPhantasy/Floyd-Code-CLI.git
cd FLOYD_CLI/INK/floyd-cli

# Install and build
npm install
npm run build
npm link

# Start Floyd
floyd-cli
```

---

## What Can Floyd Do?

- **Code**: Write, edit, and refactor TypeScript/JavaScript
- **Chat**: Interactive terminal UI with syntax highlighting
- **Remember**: SUPERCACHING keeps context across sessions
- **Browse**: Prompt Library (integrates with Obsidian vaults if you're fancy)
- **Monitor**: Watch Floyd think in real-time (TMUX dual-screen mode)

---

## Keyboard Shortcuts

| Shortcut | What It Does |
|----------|--------------|
| `Ctrl+Shift+P` | Prompt Library |
| `Ctrl+P` | Command Palette |
| `Ctrl+M` | Monitor Dashboard |
| `Ctrl+Z` | **Zen Mode** — UI goes bye bye |
| `?` | Help overlay |

---

## Configuration

Bring your own API key, point Floyd at your code, and you're off.

```env
OPENAI_API_KEY=your_key_here
FLOYD_CACHE_DIR=~/.floyd/cache
FLOYD_VAULT_PATH=/path/to/vault  # optional, but nice
```

---

## Troubleshooting

```bash
# The usual fix
npm run build

# The fresh start
rm -rf node_modules package-lock.json
npm install

# The cache clear
rm -rf ~/.floyd/cache/
```

Still stuck? Open an issue. We'll get to it. We promise. Eventually.

---

## The Fine Print

Floyd is an experimental agent from **Legacy AI**. He might write perfect code. He might hallucinate. He might make you laugh.

Use with caution. `git commit` often. Keep backups. And maybe buy us a coffee sometime.

---

## Version History

- **v0.1.0** (2026-01-20) — Born. SUPERCACHING, MCP, interactive UI.
- **v0.2.0** (2026-01-21) — Desktop Web arrives.
- **In Development** — The IDE. It's happening.

---

*Made with ❤️ and too much caffeine by Legacy AI in Brown County, Indiana.*

*© 2026 Legacy AI – Small, scrappy, and done with overpriced AI tools.*
