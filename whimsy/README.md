# 🎸 Floyd CLI Whimsy Collection

**Pink Floyd-themed spinner animations and thinking messages**

---

## 📁 Contents

| File | Description |
|------|-------------|
| `pink-floyd-thinking-messages.md` | 80+ whimsical "still working" messages organized by album |
| `pink-floyd-spinner-mapping.md` | Complete guide pairing messages with appropriate CLI spinners |
| `FLOYD-SPINNER-QUICK-START.md` | Quick start guide for using spinners in Floyd CLI |
| `README.md` | This file |

---

## 🎨 What's This?

A collection of Pink Floyd-inspired loading indicators and thinking messages for the Floyd CLI project. When the AI model is generating responses, instead of boring loading dots, users see:

- **Moon phases** spinning while "painting brilliant colors on the dark side"
- **Clock faces** ticking while "Time is ticking away, waiting for the answer"
- **Diamond sparkle** while "Shine on you crazy diamond: polishing the response"
- **80+ combinations** spanning Floyd's entire discography (1967-2014)

---

## 🚀 Quick Start

### Installation

```bash
cd INK/floyd-cli
npm install ora
```

**Note:** `cli-spinners` is already installed (comes with `ink-spinner`).

### Basic Usage with Ora

```typescript
import ora from 'ora';
import {getRandomFloydSpinner} from '../utils/floyd-spinners.js';

// Get random message + spinner combo
const {message, spinner} = getRandomFloydSpinner();

const loader = ora({
  text: message,
  spinner: spinner,
  color: 'cyan'
}).start();

// When complete
loader.succeed('Response ready!');
```

### In Ink Component (React for CLI)

```typescript
import {Text} from 'ink';
import {getRandomFloydSpinner} from '../utils/floyd-spinners.js';

export const ThinkingIndicator = () => {
  const {message, spinner} = getRandomFloydSpinner();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % spinner.frames.length);
    }, spinner.interval);
    return () => clearInterval(interval);
  }, [spinner]);

  return (
    <Text dimColor>
      {spinner.frames[frame]} {message}
    </Text>
  );
};
```

---

## 📊 The Collection

### Messages by Album

| Album | Message Count |
|-------|---------------|
| The Dark Side of the Moon | 8 |
| Wish You Were Here | 6 |
| The Wall | 8 |
| Animals | 3 |
| Atom Heart Mother | 4 |
| Meddle & Obscured by Clouds | 6 |
| Piper at the Gates of Dawn | 7 |
| Saucerful of Secrets | 7 |
| General Vibes (Meta) | 12 |
| Short & Punchy | 12 |
| **Total** | **80+** |

### Custom Spinners

| Name | Theme | Source |
|------|-------|--------|
| `floydMoon` | Moon phases | 🌑🌒🌓🌔🌕🌖🌗🌘 |
| `floydPrism` | DSOTM prism | △◹◺◸◿🌈 |
| `floydWall` | Wall building | ▓▓▓▓ |
| `floydPig` | Flying pig | 🐷🐷🐷 |
| `floydDiamond` | Diamond sparkle | 💎✨ |
| `floydRocket` | Rocket launch | 🚀💫 |
| `floydWave` | Ocean waves | 〜〜〜 |
| `floydFire` | Flames | 🔥 |
| ...and 10 more | | |

Plus **70+ built-in spinners** from `cli-spinners` package.

---

## 🔗 Links

- **Implementation**: `INK/floyd-cli/src/utils/floyd-spinners.ts`
- **cli-spinners package**: https://github.com/sindresorhus/cli-spinners
- **ora package**: https://github.com/sindresorhus/ora

---

## 🎵 Theme

**Pink Floyd discography (1967-2014)**

All major albums represented:
- The Piper at the Gates of Dawn (1967)
- A Saucerful of Secrets (1968)
- Meddle (1971)
- Obscured by Clouds (1972)
- The Dark Side of the Moon (1973)
- Wish You Were Here (1975)
- Animals (1977)
- The Wall (1979)
- Atom Heart Mother (1970)
- And more!

---

## 💡 Examples

### Message + Spinner Combinations

```
🌙 Painting brilliant colors on the dark side of the moon...
[🌑🌒🌓🌔🌕🌖🌗🌘]

⏰ Time is ticking away, waiting for the answer to emerge...
[🕛🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚]

💎 Shine on you crazy diamond: polishing the response...
[✶✸✹✺✹✷]

🧱 Another brick in the wall: building your solution layer by layer...
[-=≡]
```

---

## 🎨 Customization

Want to add your own messages or spinners? Edit:
- `INK/floyd-cli/src/utils/floyd-spinners.ts`

Add to `floydThinkingMessages` array and update `floydSpinnerMapping`.

---

## 📝 License

Part of Floyd CLI - File-Logged Orchestrator Yielding Deliverables

**Vibe**: Psychedelic, thoughtful, slightly British, occasionally breaking the fourth wall
