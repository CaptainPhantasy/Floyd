# FLOYD CLI/TUI VISUAL GUIDELINES & RECOMMENDATIONS

**"The Pink Floyd Experience"**

This document serves as the immutable design spec for the FLOYD CLI. We are not building a boring enterprise tool. We are building a rockstar agent with personality, edge, and "raunchy whimsy."

---

## 1. The Core Directives (Non-Negotiable)

1.  **The ASCII Header MUST Exist:** Every session starts with the iconic FLOYD ASCII header. No exceptions.
2.  **Whimsy is Functional:** "50 raunchy whimsy and animations" are not bloat; they are the soul of the machine.
3.  **The "Crush" Aesthetic:** Persistent right-corner branding, floating frames, and high-contrast neon/pink aesthetics are mandatory.
4.  **Audit Exit:** When we leave, we leave with a summary (The Audit).

---

## 2. The "Crush" UI Spec

Based on the "Crush" reference (Charm v0.32.0 style), the TUI layout is strict.

### A. The Persistent Right Corner Logo
**Location:** Top-Right fixed position.
**Content:**
```text
///////////////////////////
Charm™             v0.32.0
CRUSH
///////////////////////////
```
*(Replace "Charm" and "CRUSH" with "FLOYD" and "AGENT" where appropriate, but keep the slash aesthetic)*

**Style Specs:**
- **Color:** Neon Pink (`#FF00FF` / ANSI 201) or bright Cyan (`#00FFFF`) for the text.
- **Slashes:** Dimmed Purple/Blue (`#5f5faf`).
- **Typography:** Bold, blocky, industrial.

### B. The Floating Frame (Modal/Dialog)
**Usage:** For new documents, diffs, or critical alerts.
**Specs:**
- **Border:** Rounded corners (`Border: Rounded`).
- **Color:** Purple/Blurple (`#5B56E0` or similar hex from screenshot).
- **Position:** Centered or overlaying the main content.
- **Shadow:** Slight drop shadow if terminal supports it (or dim the background).
- **Typography:**
    - **Headers:** Bold, White.
    - **Key/Value pairs:** Dimmed keys, bright values.
    - **Code/Paths:** Monospace, distinct color (e.g., Green `#00FF00` or Pink).

### C. The Sidebar (Metadata)
**Location:** Right side, below the Logo.
**Content:**
- **Model:** "GLM-4.7"
- **Reasoning:** "35% (72.4K) $0.17" (Real-time cost/token tracking).
- **Modified Files:** List of files touched in session (e.g., `docs/compliance-audit.. +684`).
- **LSPs / MCPs:** Status indicators (None / Active).
**Style:**
- **Text:** Dimmed gray (`#626262`) for labels, White for values.
- **Cost/Tokens:** Highlighted in Green or Yellow based on usage.

---

## 3. "Raunchy Whimsy" & Animations

**The Requirement:** "I want my 50 raunchy whimsey and animatiins back."

**Implementation Strategy:**
- **Loading States:** Instead of "Thinking...", cycle through 50 distinct, edgy, or humorous messages.
    - *Examples:* "Rewiring the mainframe...", "Consulting the digital oracles...", "Shredding the guitar solo...", "Floyd is judging your code..."
- **Success/Fail Animations:**
    - **Success:** Matrix rain, Fire effects, or "Guitar Hero" style flare.
    - **Fail:** Glitch text, screen shake effect (if possible), or a "wasted" style overlay.
- **Idle State:** If the user is idle, the TUI should breathe (subtle pulsing colors).

---

## 4. The ASCII Header (Restoration Plan)

**The Header (The "Blocks" Variant):**

```text
  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
 | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. | 
 | |  _________   | || |   _____      | || |     ____     | || |  ____  ____  | || |  ________    | | 
 | | |_   ___  |  | || |  |_   _|     | || |   .'    `.   | || | |_  _||_  _| | || | |_   ___ `.  | | 
 | |   | |_  \_|  | || |    | |       | || |  /  .--.  \  | || |   \ \  / /   | || |   | |   `. \ | | 
 | |   |  _|      | || |    | |   _   | || |  | |    | |  | || |    \ \/ /    | || |   | |    | | | | 
 | |  _| |_       | || |   _| |__/ |  | || |  \  `--'  /  | || |    _|  |_    | || |  _| |___.' / | | 
 | | |_____|      | || |  |________|  | || |   `.____.'   | || |   |______|   | || | |________.'  | | 
 | |              | || |              | || |              | || |              | || |              | | 
 | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' | 
  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'
```

**Shape Requirement:** These are blocks, not cards. Each tile must remain perfectly square in visual proportion (same perceived height and width) at the chosen font/line spacing.

**Color Palette (256-Color Grid):**
*The gradient flows vertically (Rows) and shifts across the blocks (Columns).*

|       | F (Col 1) | L (Col 2) | O (Col 3) | Y (Col 4) | D (Col 5) |
| :---  | :---:     | :---:     | :---:     | :---:     | :---:     |
| **Row 1** | 17 (Blue) | 18 | 19 | 20 | 21 (Sky) |
| **Row 2** | 53 (Purp) | 54 | 55 | 56 | 57 (Blue) |
| **Row 3** | 89 (Mag)  | 90 | 91 | 92 | 93 (Purp) |
| **Row 4** | 125 (Red) | 126 | 127 | 128 | 129 (Purp) |
| **Row 5** | 161 (Red) | 162 | 163 | 164 | 165 (Pink) |
| **Row 6** | 197 (Hot) | 198 | 199 | 200 | 201 (Pink) |

**Behavior:**
- **On Launch:** Clears screen -> Draws Header (with gradient) -> Draws "Crush" Sidebar -> Ready for input.
- **Responsiveness:** If terminal is too small, fallback to a smaller text header, but *never* remove it completely without cause.

---

## 5. The Audit Exit

**Behavior:**
- When the user types `/exit` or `Ctrl+C`:
    - **DO NOT** just close.
    - **Show Summary:**
        - Session ID.
        - Total Tokens / Cost.
        - Files Modified (Diff summary).
        - "Success Rate" (Tools called vs. Tools failed).
    - **Visuals:** A clean, bordered box (The Floating Frame style) summarizing the session before the process terminates.

---

**Signed:** The Floyd Repo Steward
