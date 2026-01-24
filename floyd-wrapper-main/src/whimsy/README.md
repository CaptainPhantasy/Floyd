# Floyd Spinners - Pink Floyd Themed CLI Spinners

A whimsical collection of Pink Floyd-themed thinking messages paired with appropriate CLI spinners for the Floyd AI development companion.

## Overview

Floyd Spinners brings the legendary psychedelic rock aesthetic of Pink Floyd to your terminal. Each thinking message from the AI is paired with a custom spinner that matches the mood and album reference.

## Features

- **80+ Thinking Messages** - Pink Floyd-themed messages drawn from all major albums
- **20+ Custom Spinners** - ASCII animations inspired by album art and themes
- **Smart Message→Spinner Mapping** - Automatic pairing based on lyrical context
- **ora Integration** - Works seamlessly with the popular `ora` spinner library
- **TypeScript Support** - Fully typed for maximum safety

## Quick Start

```bash
npm install ora
```

```typescript
import ora from 'ora';
import { getRandomFloydMessage, getSpinnerForMessage } from './floyd-spinners.ts';

// Get a random Floyd thinking message
const message = getRandomFloydMessage();
// Example: "🌙 Painting brilliant colors on the dark side of the moon..."

// Get the appropriate spinner for that message
const spinnerConfig = getSpinnerForMessage(message);

// Create spinner with Floyd theming
const spinner = ora({
  text: message,
  spinner: spinnerConfig,
  color: 'cyan',
});

spinner.start();
// Do some work...
spinner.succeed('Task complete!');
```

## Album Coverage

The messages and spinners draw inspiration from across Pink Floyd's discography:

### The Dark Side of the Moon (1973)
- Moon phase spinners
- Time, Money, Us and Them messages
- Rainbow prism animations

### Wish You Were Here (1975)
- "Shine On You Crazy Diamond" references
- Welcome to the Machine themes
- Desert/warmth imagery

### The Wall (1979)
- "Another Brick in the Wall" building spinners
- Comfortably Numb themes
- Is there anybody out there? messages

### Animals (1977)
- Flying pigs, sheep, and dogs
- Pigs three different suns imagery

### More Classic Albums
- Atom Heart Mother symbols
- Piper at the Gates of Dawn psychedelia
- Saucerful of Secrets space themes
- Meddle's echoes and waves

## API Reference

### `getRandomFloydMessage(): string`

Returns a random Pink Floyd-themed thinking message.

```typescript
const message = getRandomFloydMessage();
// "🧱 Another brick in the wall: building your solution layer by layer..."
```

### `getSpinnerForMessage(message: string): { interval: number; frames: string[] }`

Given a thinking message, returns the appropriate spinner configuration.

```typescript
const spinnerConfig = getSpinnerForMessage(message);
// { interval: 150, frames: ['▓   ', '▓▓  ', '▓▓▓ ', '▓▓▓▓', '▓▓▓▓▓'] }
```

### `getRandomFloydSpinner(): { message: string; spinner: { interval: number; frames: string[] } }`

Get a random message + spinner combo.

```typescript
const { message, spinner } = getRandomFloydSpinner();
ora({ text: message, spinner }).start();
```

### `getAllSpinners(): Record<string, { interval: number; frames: string[] }>`

Get all available spinners (built-in cli-spinners + custom Floyd spinners).

```typescript
const allSpinners = getAllSpinners();
Object.keys(allSpinners); // ['moon', 'dots', 'floydMoon', 'floydPrism', ...]
```

## Examples

### Basic Usage

```typescript
import ora from 'ora';
import { getRandomFloydMessage, getSpinnerForMessage } from './floyd-spinners.ts';

async function longRunningTask() {
  const message = getRandomFloydMessage();
  const spinner = ora({
    text: message,
    spinner: getSpinnerForMessage(message),
    color: 'cyan',
  });

  spinner.start();

  await someAsyncWork();

  spinner.succeed('Task completed!');
}
```

### With Progress Updates

```typescript
import ora from 'ora';
import { getSpinnerForMessage } from './floyd-spinners.ts';

const message = "💎 Shine on you crazy diamond: polishing the response...";
const spinner = ora({
  text: message,
  spinner: getSpinnerForMessage(message),
});

spinner.start();

// Update message while keeping spinner
spinner.text = "🎸 Wish you were here... but the model's still thinking...";

spinner.succeed('Done!');
```

### Custom Floyd Experience

```typescript
import { floydThinkingMessages, customFloydSpinners } from './floyd-spinners.ts';

// Pick a specific message
const message = floydThinkingMessages[0];

// Use a specific Floyd spinner
const spinnerConfig = customFloydSpinners.floydMoon;

ora({ text: message, spinner: spinnerConfig }).start();
```

## Message Categories

### Short & Punchy
Quick messages for fast operations:
- "🌙 Thinking on the dark side..."
- "🧱 Building another brick..."
- "💎 Shining on..."

### Deep & Psychedelic
Longer messages for complex tasks:
- "🌙 Painting brilliant colors on the dark side of the moon..."
- "🌊 One of these days: getting to the answer..."
- "🛸 Set the controls for the heart of the sun: navigating deep space..."

### Band References
Messages mentioning the band members:
- "🎧 Roger Waters is reviewing your request..."
- "🎹 David Gilmour is carefully crafting the solo..."
- "🎵 Rick Wright is adding the atmospheric layers..."

## License

MIT

## Credits

Inspired by the legendary music of Pink Floyd:
- Roger Waters
- David Gilmour
- Rick Wright
- Nick Mason
- Syd Barrett

And the iconic album art by Storm Thorgerson.

---

*"The lunatic is on the grass..."*
