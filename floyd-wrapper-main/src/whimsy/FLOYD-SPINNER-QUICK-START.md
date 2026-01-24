# Floyd Spinner Quick Start Guide

A comprehensive guide to integrating and using Floyd Spinners with `ora` in the Floyd CLI.

## Prerequisites

```bash
# Floyd CLI should already have these dependencies
npm list ora cli-spinners

# If not, install them:
npm install ora cli-spinners
```

## Basic Integration

### Step 1: Import the Spinners

```typescript
// In your terminal or spinner utility file
import ora from 'ora';
import type { Ora } from 'ora';
import {
  getRandomFloydMessage,
  getSpinnerForMessage,
  getRandomFloydSpinner,
} from '../whimsy/floyd-spinners.js';
```

### Step 2: Create a Floyd Spinner Function

```typescript
/**
 * Create a Floyd-themed spinner with ora
 */
export function createFloydSpinner(): Ora {
  const message = getRandomFloydMessage();
  const spinnerConfig = getSpinnerForMessage(message);

  return ora({
    text: message,
    spinner: spinnerConfig,
    color: 'cyan',
    hideCursor: true,
  });
}
```

### Step 3: Use in Your Code

```typescript
// In your agent or execution engine
const spinner = createFloydSpinner();

spinner.start();

// Do some work...
await someAsyncOperation();

spinner.succeed('Task completed!');
```

## Advanced Usage Patterns

### Pattern 1: Context-Aware Spinners

Different operations get different Floyd themes:

```typescript
import {
  floydThinkingMessages,
  customFloydSpinners,
  floydSpinnerMapping,
} from '../whimsy/floyd-spinners.js';

interface SpinnerContext {
  operation: 'thinking' | 'building' | 'searching' | 'executing';
  toolName?: string;
}

export function createContextAwareSpinner(context: SpinnerContext): Ora {
  let message: string;
  let spinnerConfig: { interval: number; frames: string[] };

  switch (context.operation) {
    case 'thinking':
      message = '🌙 Thinking on the dark side...';
      spinnerConfig = customFloydSpinners.floydMoon;
      break;

    case 'building':
      message = '🧱 Another brick in the wall: building your solution...';
      spinnerConfig = customFloydSpinners.floydWall;
      break;

    case 'searching':
      message = '🌊 Echoes: searching through the codebase...';
      spinnerConfig = customFloydSpinners.floydWave;
      break;

    case 'executing':
      message = '🔥 Burning through the complexity...';
      spinnerConfig = customFloydSpinners.floydFire;
      break;

    default:
      // Random Floyd experience
      const random = getRandomFloydSpinner();
      message = random.message;
      spinnerConfig = random.spinner;
  }

  return ora({
    text: message,
    spinner: spinnerConfig,
    color: 'cyan',
  });
}
```

### Pattern 2: Streaming Updates

Update spinner message while keeping the animation:

```typescript
import { getSpinnerForMessage } from '../whimsy/floyd-spinners.js';

async function executeWithProgress() {
  const initialMessage = '🚀 Interstellar processing...';
  const spinnerConfig = getSpinnerForMessage(initialMessage);

  const spinner = ora({
    text: initialMessage,
    spinner: spinnerConfig,
    color: 'cyan',
  });

  spinner.start();

  // Update during execution
  spinner.text = '🌙 Painting brilliant colors on the dark side...';
  await stepOne();

  spinner.text = '🧱 Another brick in the wall: building layer by layer...';
  await stepTwo();

  spinner.text = '💎 Shining on you crazy diamond: polishing the result...';
  await finalStep();

  spinner.succeed('Complete!');
}
```

### Pattern 3: Tool-Specific Spinners

Different tools get different Floyd themes:

```typescript
import {
  customFloydSpinners,
  floydThinkingMessages,
} from '../whimsy/floyd-spinners.js';

const TOOL_SPINNER_MAP: Record<string, { message: string; spinner: typeof customFloydSpinners[keyof typeof customFloydSpinners] }> = {
  search_files: {
    message: '🔁 Echoes: bouncing ideas off the digital canyon...',
    spinner: customFloydSpinners.floydBounce,
  },
  read_file: {
    message: '📖 Reading the great gig in the sky...',
    spinner: customFloydSpinners.floydDots,
  },
  write_file: {
    message: '✍️ Careful with that axe, Eugene: writing to file...',
    spinner: customFloydSpinners.floydHamburger,
  },
  run_command: {
    message: '🚀 Interstellar overdrive: engaging faster-than-light processing...',
    spinner: customFloydSpinners.floydRocket,
  },
};

export function createToolSpinner(toolName: string): Ora {
  const config = TOOL_SPINNER_MAP[toolName] || {
    message: getRandomFloydMessage(),
    spinner: customFloydSpinners.floydMoon,
  };

  return ora({
    text: config.message,
    spinner: config.spinner,
    color: 'cyan',
  });
}
```

### Pattern 4: Error States

Use Floyd-themed error messages:

```typescript
import {
  customFloydSpinners,
  floydThinkingMessages,
} from '../whimsy/floyd-spinners.js';

async function executeWithErrorHandling() {
  const spinner = ora({
    text: '🌙 Painting brilliant colors on the dark side...',
    spinner: customFloydSpinners.floydMoon,
    color: 'cyan',
  });

  spinner.start();

  try {
    await riskyOperation();
    spinner.succeed('Shine on!');
  } catch (error) {
    spinner.fail(
      '😮 Comfortably numb: the operation failed'
    );
    throw error;
  }
}
```

### Pattern 5: Multi-Stage Operations

Show progress through multiple stages:

```typescript
import {
  customFloydSpinners,
} from '../whimsy/floyd-spinners.js';

async function multiStageOperation() {
  const stages = [
    {
      name: 'Analyzing',
      message: '🔍 Astronomy domine: calculating celestial solutions...',
      spinner: customFloydSpinners.floydStar,
    },
    {
      name: 'Building',
      message: '🧱 Another brick in the wall: building your solution...',
      spinner: customFloydSpinners.floydWall,
    },
    {
      name: 'Testing',
      message: '🐕 Dogs: guarding against errors in the response...',
      spinner: customFloydSpinners.floydToggle3,
    },
    {
      name: 'Complete',
      message: '💎 Shine on you crazy diamond!',
      spinner: customFloydSpinners.floydDiamond,
    },
  ];

  for (const stage of stages) {
    const spinner = ora({
      text: stage.message,
      spinner: stage.spinner,
      color: 'cyan',
    });

    spinner.start();

    await executeStage(stage.name);

    spinner.succeed(`${stage.name} complete!`);
  }
}
```

## Integration with FloydAgentEngine

### Replace Existing Spinner

```typescript
// In execution-engine.ts or similar
import {
  getRandomFloydSpinner,
} from '../whimsy/floyd-spinners.js';

export class FloydAgentEngine {
  async execute(userMessage: string): Promise<string> {
    // Start Floyd spinner
    const { message, spinner } = getRandomFloydSpinner();
    const oraSpinner = ora({
      text: message,
      spinner: spinner,
      color: 'cyan',
    });

    oraSpinner.start();

    try {
      // ... existing execution logic ...

      oraSpinner.succeed('Task completed!');
      return finalResponse;
    } catch (error) {
      oraSpinner.fail('Comfortably numb: something went wrong');
      throw error;
    }
  }
}
```

### Tool Execution Feedback

```typescript
// In tool execution handler
import { createToolSpinner } from './utils/spinners.js';

async function executeTool(toolName: string, input: unknown) {
  const spinner = createToolSpinner(toolName);
  spinner.start();

  try {
    const result = await toolRegistry.execute(toolName, input);
    spinner.succeed(`${toolName} completed!`);
    return result;
  } catch (error) {
    spinner.fail(`${toolName} failed: ${error.message}`);
    throw error;
  }
}
```

## TypeScript Configuration

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "module": "Node16",
    "moduleResolution": "node16",
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Troubleshooting

### Issue: "Cannot find module '../whimsy/floyd-spinners.js'"

**Solutions:**

1. Use `.js` extension in ESM imports:
```typescript
import { getRandomFloydMessage } from '../whimsy/floyd-spinners.js';
```

2. Or configure `baseUrl` and `paths` in tsconfig.json:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Then import as:
```typescript
import { getRandomFloydMessage } from '@/whimsy/floyd-spinners.js';
```

### Issue: Emojis Display as Boxes or Question Marks

**Solution:** This is a terminal limitation. The spinner will still work, but emoji won't render properly. Consider using a terminal with better Unicode support.

### Issue: Spinner Frame Rate Too Fast/Slow

**Solution:** Override the interval:
```typescript
const spinner = ora({
  text: message,
  spinner: {
    ...getSpinnerForMessage(message),
    interval: 150, // Override interval
  },
});
```

## Complete Example

Here's a complete example showing all the pieces together:

```typescript
// src/ui/floyd-spinner.ts
import ora from 'ora';
import type { Ora } from 'ora';
import {
  getRandomFloydMessage,
  getSpinnerForMessage,
  getRandomFloydSpinner,
  customFloydSpinners,
} from '../whimsy/floyd-spinners.js';

/**
 * Create a Floyd-themed spinner
 */
export function createFloydSpinner(customMessage?: string): Ora {
  const { message, spinner } = getRandomFloydSpinner();

  return ora({
    text: customMessage || message,
    spinner: spinner,
    color: 'cyan',
    hideCursor: true,
  });
}

/**
 * Create a spinner for a specific operation
 */
export function createOperationSpinner(
  operation: 'thinking' | 'building' | 'searching' | 'executing'
): Ora {
  const config = {
    thinking: {
      message: '🌙 Thinking on the dark side...',
      spinner: customFloydSpinners.floydMoon,
    },
    building: {
      message: '🧱 Another brick in the wall...',
      spinner: customFloydSpinners.floydWall,
    },
    searching: {
      message: '🌊 Echoes: searching...',
      spinner: customFloydSpinners.floydWave,
    },
    executing: {
      message: '🔥 Burning bright...',
      spinner: customFloydSpinners.floydFire,
    },
  };

  const { message, spinner } = config[operation];

  return ora({
    text: message,
    spinner: spinner,
    color: 'cyan',
  });
}

// Usage example
export async function exampleUsage() {
  // Random Floyd spinner
  const spinner1 = createFloydSpinner();
  spinner1.start();
  await delay(1000);
  spinner1.succeed('Done!');

  // Operation-specific spinner
  const spinner2 = createOperationSpinner('thinking');
  spinner2.start();
  await delay(1000);
  spinner2.succeed('Thinking complete!');
}
```

## Testing

```typescript
// Test your spinner integration
import { createFloydSpinner } from './floyd-spinner.js';

async function testSpinner() {
  const spinner = createFloydSpinner();
  spinner.start();

  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 3000));

  spinner.succeed('Test complete!');
}

testSpinner();
```

---

**Next Steps:**
1. Copy the example code into your project
2. Test with `npm run dev` or equivalent
3. Customize messages/spinners for your use case
4. Enjoy the Floyd psychedelic experience! 🌙
