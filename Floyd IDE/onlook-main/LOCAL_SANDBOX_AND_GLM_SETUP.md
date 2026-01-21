# Local Sandbox and GLM Configuration for Floyd IDE

## Current Status

I've updated the `.env.local` file, but there are some important considerations:

## Local Sandbox Configuration

### ✅ Available Code Providers
The codebase already supports multiple code providers:
- **CodeSandbox** (default - requires API key)
- **NodeFs** - Local file system provider ✅
- **E2B** - E2B sandbox provider
- **Daytona** - Daytona provider
- **VercelSandbox** - Vercel provider
- **Modal** - Modal provider

### What I Changed
```env
CSB_API_KEY="local"
CODE_PROVIDER="node_fs"
```

**Note:** The environment variables `CSB_API_KEY` and `CODE_PROVIDER` are added, but the application may not currently use them to switch providers automatically. The provider selection might be hardcoded or controlled through the UI.

## GLM (Zhipu AI) Configuration

### ⚠️ Not Currently Supported
The application does **not** have built-in GLM/Zhipu AI support. The current AI providers are:
- OpenRouter (required - can't be empty)
- Anthropic (optional)
- Google AI Studio (optional)
- OpenAI (optional)

### Options for Using GLM

#### Option 1: Use OpenRouter (Recommended)
OpenRouter supports GLM models! You can:
1. Get an OpenRouter API key from https://openrouter.ai/settings/keys
2. Select GLM models through OpenRouter's interface
3. Configure in the UI or use their default routing

Models available through OpenRouter:
- `glm/glm-4-flash`
- `glm/glm-4-plus`
- `glm/glm-4-0520`
- `glm/glm-4-air`
- `glm/glm-4-long`
- And more...

#### Option 2: Add GLM Support (Requires Code Changes)
To add native GLM support, you would need to:

1. **Add GLM to environment schema** (`apps/web/client/src/env.ts`):
```typescript
GLM_API_KEY: z.string().optional(),
```

2. **Add to runtimeEnv**:
```typescript
GLM_API_KEY: process.env.GLM_API_KEY,
```

3. **Integrate with AI SDK** - The app uses the Vercel AI SDK, so you'd need to add GLM as a provider following their provider pattern.

#### Option 3: Use OpenAI-Compatible Endpoint
Zhipu AI provides an OpenAI-compatible API. You could:
- Set `OPENAI_API_KEY` to your GLM API key
- Configure the base URL to point to Zhipu's endpoint
- This requires additional configuration in the AI client setup

## Next Steps

### For Local Sandbox:
1. Try running `bun run dev` to see if it starts
2. Check the UI for provider selection options
3. The NodeFs provider should work for local file operations

### For GLM Integration:
**Recommended:** Use OpenRouter
```bash
# Get an API key from https://openrouter.ai/settings/keys
# Then update .env.local:
OPENROUTER_API_KEY="sk-or-v1-your-actual-key-here"
```

**Or** let me know if you want me to add native GLM support to the codebase (this would require code changes).

## Testing

After you add your OpenRouter API key (with GLM models selected), test with:
```bash
cd "/Volumes/Storage/FLOYD_CLI/Floyd IDE/onlook-main"
bun run dev
```

The app should start successfully, and you can:
1. Create a new project
2. Use the AI chat feature
3. Select GLM models through OpenRouter's routing

## Summary

✅ **Ready to use:** Local file system (NodeFs provider)  
⚠️ **Needs setup:** GLM through OpenRouter (get API key)  
❌ **Not supported:** Native GLM API integration (requires code changes)
