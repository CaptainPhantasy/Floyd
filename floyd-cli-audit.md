# Floyd CLI Audit & Roadmap

**Date:** January 22, 2026
**Auditor:** Gemini 4 (Agentic Coding LLM)
**Project:** Floyd CLI (Ink/React/Node.js)

## 1. Executive Summary

The `floyd-cli` project is a sophisticated terminal interface built with React Ink, featuring a robust agent architecture powered by `floyd-agent-core` and the Model Context Protocol (MCP). It aims to be an "agentic coding LLM" similar to ClaudeCode or Gemini.

**Current Status:**
The CLI functions but suffers from significant UI/UX regressions, most notably "double text" rendering and TUI artifacts caused by improper state management and console pollution. The underlying agent logic is sound but its integration into the UI is brittle.

**Verdict:**
The project is ~70% complete towards a stable "v1". The core "brain" (AgentEngine) is capable, but the "body" (CLI/UI) trips over itself.

---

## 2. Critical Findings

### 🔴 High Severity: Double Text Rendering
**The Issue:** Users see the assistant's response twice—once in the chat history bubble and again in a "streaming" block at the bottom.
**Root Cause:**
In `src/app.tsx`, the `streamProcessor` updates two separate state stores with the *same* content simultaneously:
1. `updateMessage(...)`: Updates the persistent message history with the growing text.
2. `appendStreamingContent(...)`: Updates a transient `streamingContent` variable.

In `src/ui/panels/TranscriptPanel.tsx`, the render function displays *both*:
```tsx
// Renders the message list (which acts as the "persistent" display)
{displayMessages.map(msg => ( ... ))}

// AND renders the streaming buffer separately
{streamingContent && ( ... )}
```
Since `updateMessage` commits the text to `displayMessages` in real-time, the `streamingContent` block is entirely redundant and causes the duplication.

### 🔴 High Severity: TUI Artifacts (Console Pollution)
**The Issue:** The interface layout "breaks" or shifts unexpectedly, often printing raw text that overwrites the UI.
**Root Cause:**
React Ink takes control of `stdout`. Any direct call to `console.log` or `console.error` bypasses Ink's render cycle, corrupting the terminal buffer.
**Violations Found:**
- `src/app.tsx`: `console.log("Loaded environment from: ...")` runs during startup.
- `src/ui/layouts/MainLayout.tsx`: `console.log('Agent created:', config)` in the AgentBuilder callback.
- `src/cli.tsx`: `console.error` usage for terminal size checks (acceptable before render, but risky).

### 🟡 Medium Severity: Brittle Thinking Block Parsing
**The Issue:** `<thinking>` tag parsing is hardcoded in `app.tsx` inside the render loop logic.
**Risk:** This logic is tightly coupled to the specific chunking behavior of the LLM. If a tag is split across chunks (e.g., `<thin` + `king>`), the simple string inclusion check might fail or behave erratically.

---

## 3. Component Analysis

### Agent Logic (`floyd-agent-core`)
- **Strengths:**
  - **MCP Integration:** Native support for the Model Context Protocol allows for extensible tooling.
  - **Provider Agnostic:** `AgentEngine` supports multiple providers (Anthropic, OpenAI, GLM).
  - **Session Management:** Robust saving/loading of sessions.
- **Weaknesses:**
  - **Tool Feedback:** Tool outputs are piped directly into the history. There is limited "middleware" to sanitize or summarize massive tool outputs (e.g., `cat` of a 1MB file) before hitting the context window.

### UI/UX (React Ink)
- **Strengths:**
  - **Component Library:** Good use of `ink-*` components (Spinner, TextInput).
  - **Layouts:** `MainLayout` attempts a responsive design (monitor mode vs chat mode).
- **Weaknesses:**
  - **State Duplication:** As noted in "Double Text".
  - **Performance:** `MainLayout` has complex responsive logic (`terminalWidth` listeners) that might cause flicker on resize.

### Tooling & CLI Practices
- **Shortcomings vs. Gemini/Claude:**
  - **Safety:** The "YOLO" vs "Ask" mode is implemented, but specific high-risk commands (like `rm -rf`) rely heavily on the LLM *choosing* not to run them, rather than a hard sandbox or confirmation layer for specific system calls.
  - **Speed:** The `StreamProcessor` throttles tokens (to 75/sec). While this makes reading easier, it artificially slows down the agent compared to native speed.

---

## 4. Roadmap to "Happy Path"

### Phase 1: TUI Stabilization (Immediate Fixes)
1.  **Fix Double Rendering:**
    -   Modify `app.tsx` to *only* update `streamingContent` during generation.
    -   Only commit to `messages` (via `updateMessage`) when the stream ends.
    -   *Alternative:* Keep real-time updates to `messages` and remove the `{streamingContent && ...}` block from `TranscriptPanel` entirely.
2.  **Ban Console Logs:**
    -   Create a `Logger` service that writes to a file (`.floyd/logs/debug.log`) or a dedicated `Ink` component (hidden by default).
    -   Replace all `console.log` calls with `Logger.info`.
3.  **Error Boundary:**
    -   Update `ErrorBoundary` to log to file, not `console.error`, and display a clean "Something went wrong" TUI message.

### Phase 2: Agent Refinement
1.  **Robust Parser:** Implement a stream parser (like `eventsource-parser` logic) to handle split tokens for `<thinking>` tags reliably.
2.  **Tool Output Truncation:** Add logic in `AgentEngine` to truncate huge tool outputs (e.g., "Output too large: 5000 lines. First 100 lines shown...") to protect context window and UI performance.

### Phase 3: Feature Parity
1.  **Native Shell Integration:**
    -   Ensure `Ctrl+C` propagates correctly to running child processes (tools) without killing the CLI itself.
    -   Current `execa` usage needs verified signal handling.
2.  **Input History:**
    -   Add up/down arrow support in the input box to cycle through previous user messages (standard CLI feature).

## 5. Implementation Plan (Next Steps)

I recommend starting with **Phase 1** immediately to restore usability.

**Action Items:**
1.  Edit `src/ui/panels/TranscriptPanel.tsx` to conditionally render streaming content.
2.  Edit `src/app.tsx` to remove `console.log`.
3.  Edit `src/ui/layouts/MainLayout.tsx` to remove `console.log`.

**Command to Fix Double Rendering (Proposal):**
Modify `TranscriptPanel.tsx` to ignore `streamingContent` if the last message in `displayMessages` is from the assistant and is "streaming".
