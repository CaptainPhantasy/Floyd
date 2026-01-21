# Floyd IDE Setup Guide

## Overview
This document outlines the setup process for refactoring Onlook into Floyd IDE.

## Current Status
✅ **Completed:**
- Dependencies installed (2,326 packages via bun)
- Database environment file created
- Project structure analyzed

⚠️ **Requires Manual Setup:**
- Supabase local instance startup
- API keys configuration
- Environment variables setup

## Project Structure

### Monorepo Architecture
```
onlook-main/
├── apps/
│   ├── web/          # Main web application
│   │   ├── client/   # Next.js frontend
│   │   ├── server/   # Electron main process
│   │   └── preload/  # Electron preload scripts
│   ├── backend/      # Backend API
│   └── admin/        # Admin interface
├── packages/         # Shared packages
│   ├── ai/          # AI integration
│   ├── db/          # Database schema & migrations
│   ├── ui/          # Shared UI components
│   ├── parser/      # Code parsing utilities
│   └── ...          # Other packages
└── tooling/         # Development tooling
```

### Technology Stack
- **Runtime:** Bun (v1.2.21 installed, requires v1.3.1)
- **Frontend:** Next.js + TailwindCSS
- **Backend:** tRPC + Drizzle ORM
- **Database:** Supabase (PostgreSQL)
- **AI:** AI SDK + OpenRouter
- **Sandbox:** CodeSandbox SDK
- **Hosting:** Freestyle

## Setup Instructions

### 1. Prerequisites
```bash
# Install Bun (requires v1.3.1)
curl -fsSL https://bun.sh/install | bash

# Install Supabase CLI
brew install supabase/tap/supabase
```

### 2. Install Dependencies ✅
```bash
cd onlook-main
bun install
```

### 3. Start Supabase
```bash
# Start local Supabase instance
supabase start

# This will provide you with:
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

**Note:** Supabase startup timed out during initial setup. You may need to:
- Check if Docker is running
- Try stopping any existing Supabase instances: `supabase stop`
- Restart with: `supabase start`

### 4. Configure Environment Variables

#### Database (packages/db/.env)
```bash
cp packages/db/.env.example packages/db/.env
```

Required values (after `supabase start`):
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<from supabase start>
SUPABASE_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

#### Client (apps/web/client/.env.local)
```bash
cp apps/web/client/.env.example apps/web/client/.env.local
```

**Minimum required for development:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>
SUPABASE_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_SERVICE_ROLE_KEY=<from supabase start>

# OpenRouter (for AI chat)
OPENROUTER_API_KEY=sk-or-v1-...
# Get from: https://openrouter.ai/settings/keys

# CodeSandbox (for app hosting - optional for dev)
CSB_API_KEY=
```

### 5. Run Database Migrations
```bash
# Generate and push database schema
bun run db:gen
bun run db:push
```

### 6. Start Development Server
```bash
# Start the web application
bun run dev

# Or start individually:
bun run dev:client   # Next.js client only
bun run dev:server   # Electron server only
```

## Refactoring to Floyd IDE

### Phase 1: Branding Changes
1. **Update package.json files:**
   - Change name from `@onlook/*` to `@floyd-ide/*`
   - Update author and description
   - Modify repository URLs

2. **Update UI text:**
   - Replace "Onlook" with "Floyd IDE"
   - Update logos and assets
   - Modify meta tags and titles

3. **Update environment variables:**
   - Rename variables with ONLOOK prefix to FLOYD_IDE

### Phase 2: Configuration Changes
1. **Update imports:** Change all `@onlook/` imports to `@floyd-ide/`
2. **Update URLs:** Replace onlook.com references
3. **Update documentation:** Rewrite docs for Floyd IDE

### Phase 3: Testing
1. Verify all packages build correctly
2. Test AI functionality with new branding
3. Ensure database migrations work
4. Test deployment process

## Next Steps

1. **Manual Actions Required:**
   - Start Supabase and capture keys
   - Obtain OpenRouter API key
   - (Optional) Get CodeSandbox API key

2. **Continue Setup:**
   - Run database migrations
   - Start dev server
   - Test core functionality

3. **Begin Refactor:**
   - Update branding systematically
   - Test after each phase
   - Update documentation

## Troubleshooting

### Supabase Issues
- **Timeout:** Ensure Docker is running and has sufficient resources
- **Port conflicts:** Check if ports 54321-54323 are available
- **Permission issues:** Try `supabase stop` then `supabase start`

### Build Issues
- **Bun version:** Ensure you're using Bun v1.3.1+
- **Dependency conflicts:** Run `bun install` again
- **Type errors:** Run `bun run typecheck` to identify issues

### Environment Issues
- **Missing keys:** Ensure all required .env values are set
- **Invalid keys:** Verify API keys are correct and active
- **Database connection:** Ensure Supabase is running

## Resources
- Original docs: https://docs.onlook.com
- Supabase CLI: https://supabase.com/docs/guides/cli
- Bun runtime: https://bun.sh/docs
- Next.js: https://nextjs.org/docs
