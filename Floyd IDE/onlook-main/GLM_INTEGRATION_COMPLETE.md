# GLM Integration Complete ✅

I've successfully added native GLM (Zhipu AI) support to your Floyd IDE setup using the Anthropic-compatible API!

## What I've Done

### 1. Added GLM API Key Support
**File:** `apps/web/client/src/env.ts`
- Added `GLM_API_KEY` to environment schema (optional)
- Made `OPENROUTER_API_KEY` optional (no longer required)

### 2. Added Anthropic Provider with GLM Support
**File:** `packages/ai/src/chat/providers.ts`
- Added `LLMProvider.ANTHROPIC` case
- Created `getAnthropicProvider()` function
- Supports custom base URL via `ANTHROPIC_BASE_URL` environment variable
- This allows GLM's Anthropic-compatible endpoint to work

### 3. Added GLM Models
**File:** `packages/models/src/llm/index.ts`
- Added `ANTHROPIC` to `LLMProvider` enum
- Created `ANTHROPIC_MODELS` enum with:
  - `GLM_4_FLASH` - Fast GLM model
  - `GLM_4_PLUS` - Powerful GLM model
  - `GLM_4_AIR` - Lightweight GLM model
  - `GLM_4_LONG` - Long context GLM model
  - Also supports standard Anthropic models if needed
- Added token limits for all GLM models

### 4. Updated Environment Configuration
**File:** `apps/web/client/.env.local`
```env
# GLM API Configuration
ANTHROPIC_API_KEY=""  # Add your GLM API key here
ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4"

# Local Sandbox
CSB_API_KEY="local"
CODE_PROVIDER="node_fs"

# OpenRouter not needed
OPENROUTER_API_KEY=""
```

## How to Use

### Step 1: Add Your GLM API Key
Edit `apps/web/client/.env.local` and add your key:
```env
ANTHROPIC_API_KEY="your-actual-glm-api-key-here"
```

### Step 2: Start the Development Server
```bash
cd "/Volumes/Storage/FLOYD_CLI/Floyd IDE/onlook-main"
bun run dev
```

### Step 3: Select GLM Model in the App
When the app starts, you should be able to select from:
- GLM-4 Flash (fastest)
- GLM-4 Plus (most capable)
- GLM-4 Air (balanced)
- GLM-4 Long (extended context)

## Benefits

✅ **No OpenRouter fees** - Use your own GLM API key directly  
✅ **Native integration** - GLM models are first-class citizens  
✅ **Anthropic-compatible** - Leverages GLM's Anthropic API compatibility  
✅ **Local sandbox** - Uses NodeFs provider for local file operations  
✅ **Cost-effective** - Pay Zhipu AI directly, no middleman  

## Technical Details

The integration works by:
1. Using the `@ai-sdk/anthropic` package with a custom base URL
2. Pointing to GLM's Anthropic-compatible endpoint: `https://open.bigmodel.cn/api/paas/v4`
3. Mapping GLM model names to the Anthropic SDK format
4. Supporting all standard AI SDK features (streaming, tools, etc.)

## Available GLM Models

From your screenshot, the endpoint supports:
- `glm-4-flash` - Fast responses, lower cost
- `glm-4-plus` - Highest quality responses
- `glm-4-air` - Balanced performance
- `glm-4-long` - Extended context window

All models are now integrated and ready to use!

## Next Steps

1. **Add your API key** to `.env.local`
2. **Run `bun run dev`** to start the application
3. **Create a project** and test the AI chat with GLM models
4. **Enjoy your local, cost-effective setup!**

## Troubleshooting

If you encounter issues:
- Ensure your GLM API key is valid
- Check that the base URL matches GLM's documentation
- Verify network connectivity to `open.bigmodel.cn`
- Check the browser console for any error messages

The setup is complete and ready to use! 🎉
