# CURSE'M IDE - COMPLETE CUSTOMIZATION KNOWLEDGEBASE
## Transforming Onlook into the Floyd IDE

**Version**: 1.0  
**Date**: January 20, 2026  
**Based On**: Onlook (Open-Source "Cursor for Designers")  
**Target**: Custom Floyd IDE branded as "CURSE'M"

---

## EXECUTIVE SUMMARY

This knowledgebase provides a comprehensive guide for customizing Onlook, an open-source visual React development tool, into "CURSE'M IDE" - a branded development environment for Floyd. 

**Key Findings**:
- **Repository**: https://github.com/onlook-dev/onlook
- **License**: Apache 2.0 (fully open-source, customizable)
- **Language**: TypeScript (monorepo with Bun package manager)
- **Architecture**: Monorepo with apps (web, admin, backend) and packages
- **Community**: 24,473 stars, 1,810 forks (highly active)
- **Last Updated**: December 29, 2025

**Floyd Brand Assets**:
- Official CURSE'M Logo received
- Floyd CLI Color Palette/Theme received
- Brand identity ready for implementation

---

## 1. ONLOOK TECHNICAL ARCHITECTURE

### 1.1 Repository Structure

```
onlook/
├── apps/
│   ├── web/           # Main web application (React UI)
│   ├── admin/         # Admin dashboard
│   └── backend/       # Server-side application
├── packages/
│   ├── ai/            # AI integration capabilities
│   ├── code-provider/ # Code generation/provider
│   ├── constants/     # Shared constants
│   ├── db/            # Database models and utilities
│   ├── email/         # Email functionality
│   ├── file-system/   # File system operations
│   ├── fonts/         # Font resources
│   ├── git/           # Git integration
│   ├── github/        # GitHub API integration
│   ├── growth/        # Growth/analytics features
│   ├── image-server/  # Image processing
│   ├── models/        # Data models
│   ├── parser/        # Code parsing utilities
│   ├── penpal/        # Communication utilities
│   ├── rpc/           # Remote procedure calls
│   ├── scripts/       # Build/deployment scripts
│   ├── stripe/        # Payment processing (can remove for Floyd)
│   ├── types/         # TypeScript type definitions
│   ├── ui/            # Shared UI components (THEME TARGET ⭐)
│   └── utility/       # Utility functions
├── docs/              # Documentation source
├── assets/            # Static assets
└── tooling/           # Development tooling
```

### 1.2 Technology Stack

**Frontend**:
- **Framework**: React (with TypeScript)
- **Styling**: TailwindCSS (primary theming system)
- **Package Manager**: Bun
- **Build Tool**: Bun-native (likely Bun's bundler)
- **Monorepo**: Workspaces architecture

**Backend**:
- **Runtime**: Node.js/TypeScript
- **Database**: Supabase (inferred from packages/db)
- **Authentication**: OAuth providers (GitHub, Google)
- **Email**: Email service integration
- **File Storage**: File-system abstractions

**AI/Code Generation**:
- AI provider integrations (OpenAI, Anthropic, etc.)
- Code parsing and generation
- AST (Abstract Syntax Tree) manipulation

### 1.3 Deployment Architecture

**Self-Hosting Options**:
1. **Single Machine** - Standalone deployment
2. **Docker Compose** - Containerized small team deployment
3. **Cloud Deployment** - Auto-scaling, high availability
4. **External Services** - Separate auth, database, storage

**Recommended for Floyd**: Docker Compose or Cloud Deployment depending on team size and requirements.

---

## 2. BRANDING & THEMING CUSTOMIZATION

### 2.1 Core Branding Locations

**Primary Files to Modify**:

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, HTML metadata
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── navigation/         # Navigation bars
│   │   ├── sidebar/            # Sidebar components
│   │   ├── header/             # Header components
│   │   └── branding/           # Logo, wordmarks
│   └── lib/
│       └── constants.ts        # App name, metadata

packages/ui/
├── src/
│   ├── components/             # Shared UI components
│   ├── styles/
│   │   └── theme.ts            # ⭐ THEME CONFIGURATION
│   └── fonts/                  # Typography
```

### 2.2 TailwindCSS Theme Customization

**Primary Theme File**: `packages/ui/src/styles/theme.ts` (or `tailwind.config.ts`)

**Floyd Theme Integration**:

```typescript
// Example theme structure
const floydTheme = {
  colors: {
    // Floyd CLI Color Palette (from your asset)
    primary: '#YOUR_PRIMARY_COLOR',
    secondary: '#YOUR_SECONDARY_COLOR',
    accent: '#YOUR_ACCENT_COLOR',
    background: '#YOUR_BG_COLOR',
    foreground: '#YOUR_FG_COLOR',
    // ... all color tokens
  },
  fontFamily: {
    sans: ['YourFont', 'sans-serif'],
    mono: ['YourMonoFont', 'monospace'],
  },
  // Spacing, radius, shadows, etc.
}
```

**Action Items**:
1. Extract color values from Floyd CLI palette image
2. Map to Tailwind color tokens (50-950 scale)
3. Update theme configuration
4. Test across light/dark modes

### 2.3 Logo & Visual Assets

**Locations to Update**:

```
apps/web/public/
├── logo.svg
├── favicon.ico
├── og-image.png          # Open Graph preview
└── icons/                # App icons

packages/ui/src/components/
├── Logo.tsx              # Logo component
├── Icon.tsx              # Icon set
└── branding/
    ├── Wordmark.tsx      # Text-based logo
    └── Watermark.tsx     # Watermark overlay
```

**Action Items**:
1. Convert CURSE'M logo to SVG format
2. Create responsive logo variants (small, medium, large)
3. Generate favicon set (16x16, 32x32, 192x192, 512x512)
4. Create Open Graph preview image (1200x630)
5. Replace all Onlook branding with CURSE'M

### 2.4 Typography Customization

**Font Files**: `packages/fonts/` or `apps/web/src/fonts/`

**Action Items**:
1. Add Floyd brand fonts to repository
2. Update Tailwind theme with font families
3. Configure font weights and styles
4. Test across all UI components

---

## 3. FEATURE MODIFICATION & CUSTOMIZATION

### 3.1 Core Features to Adapt

**Onlook Features** → **CURSE'M IDE Features**

| Onlook Feature | CURSE'M IDE Adaptation | Priority |
|----------------|------------------------|----------|
| Visual React Editor | Floyd Project Visual Editor | HIGH |
| AI Code Generation | Floyd AI Assistant | HIGH |
| Component Library | Floyd Component Registry | HIGH |
| Deployment Integration | Floyd Deployment Pipeline | MEDIUM |
| Template System | Floyd Project Templates | MEDIUM |
| User Auth | Floyd SSO Integration | HIGH |
| Team Collaboration | Floyd Team Workspaces | MEDIUM |
| Stripe Payments | REMOVE (Internal tool) | REMOVE |
| Figma Import | REMOVE (if not needed) | OPTIONAL |

### 3.2 Feature Removal List

**For Floyd Internal Use**:
- ❌ Stripe payment processing (`packages/stripe/`)
- ❌ Public signup/user acquisition
- ❌ External integrations (if not Floyd-specific)
- ❌ Growth/analytics tracking (`packages/growth/`)
- ❌ Email notifications (unless needed for Floyd)

**Keep**:
- ✅ Core editor functionality
- ✅ Project management
- ✅ Git integration
- ✅ File system operations
- ✅ AI/code generation
- ✅ Authentication (adapt for Floyd SSO)

### 3.3 Floyd-Specific Features to Add

**Recommended Additions**:
1. **Floyd Project Templates** - Pre-configured Floyd project scaffolds
2. **Floyd CLI Integration** - Direct CLI command execution
3. **Floyd Database Browser** - Visual database inspection
4. **Floyd API Test Runner** - API endpoint testing
5. **Floyd Deployment Preview** - Staging environment preview
6. **Floyd Component Library** - Floyd-specific component registry
7. **Floyd Authentication** - Integrate with Floyd SSO

---

## 4. WORKFLOW MODIFICATION

### 4.1 Authentication Flow

**Current (Onlook)**:
```
User → GitHub/Google OAuth → Onlook App → Dashboard
```

**CURSE'M IDE**:
```
Floyd Employee → Floyd SSO → CURSE'M IDE → Floyd Projects
```

**Implementation**:
1. Remove OAuth providers (GitHub, Google)
2. Implement Floyd SSO integration
3. Update authentication middleware
4. Modify user onboarding flow
5. Update session management

### 4.2 Project Management

**Onlook Flow**: Create new project → Import/Start from template → Edit → Deploy

**CURSE'M IDE Flow**: Select Floyd Project → Visual Editor → Run/Build → Deploy to Floyd Infrastructure

**Modifications Needed**:
- Remove project creation (use existing Floyd projects)
- Add Floyd project browsing/selection
- Integrate with Floyd CLI tools
- Add Floyd environment configuration
- Implement Floyd deployment pipeline

---

## 5. DEVELOPMENT SETUP

### 5.1 Local Development

**Prerequisites**:
- Node.js 18+ or Bun
- Git
- Docker (for containerized development)

**Setup Commands**:

```bash
# Clone repository
git clone https://github.com/onlook-dev/onlook.git cursem-ide
cd cursem-ide

# Install dependencies (using Bun)
bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local with Floyd-specific values

# Start development servers
bun run dev
```

**Environment Variables**:

```env
# Floyd SSO (replace OAuth)
FLOYD_SSO_CLIENT_ID=your_client_id
FLOYD_SSO_CLIENT_SECRET=your_client_secret
FLOYD_SSO_REDIRECT_URI=http://localhost:3000/auth/callback

# Database
DATABASE_URL=your_floyd_database_url

# AI Services (if keeping AI features)
OPENAI_API_KEY=your_key
# or remove AI features entirely

# File Storage
FLOYD_STORAGE_BUCKET=your_bucket_name

# Remove/Disable
# STRIPE_SECRET_KEY=remove_this
# GITHUB_CLIENT_ID=remove_this
```

### 5.2 Build & Deployment

**Development Build**:
```bash
bun run dev          # Start all dev servers
bun run dev:web      # Web app only
bun run dev:backend  # Backend only
```

**Production Build**:
```bash
bun run build        # Build all apps
bun run build:web    # Web app only
```

**Deployment Targets**:
- Vercel (web app)
- Docker containers (backend)
- Floyd infrastructure (custom)

---

## 6. CUSTOMIZATION CHECKLIST

### Phase 1: Branding (Week 1-2)

**Visual Identity**:
- [ ] Replace logo in all locations
- [ ] Update favicon and app icons
- [ ] Replace Open Graph preview image
- [ ] Update all wordmarks and text logos
- [ ] Update loading screens and splash screens

**Color Theme**:
- [ ] Extract Floyd CLI palette colors
- [ ] Map colors to Tailwind tokens
- [ ] Update theme configuration
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Verify accessibility (WCAG AA)

**Typography**:
- [ ] Add Floyd brand fonts
- [ ] Update font families in theme
- [ ] Test font rendering
- [ ] Update font weights and styles

**Content & Copy**:
- [ ] Replace "Onlook" with "CURSE'M" in UI
- [ ] Update page titles and meta tags
- [ ] Update documentation text
- [ ] Update error messages
- [ ] Update help text and tooltips

### Phase 2: Feature Adaptation (Week 3-6)

**Remove Unwanted Features**:
- [ ] Remove Stripe integration
- [ ] Remove public signup
- [ ] Remove payment-related UI
- [ ] Remove growth analytics
- [ ] Remove external OAuth (if not needed)

**Adapt Core Features**:
- [ ] Modify authentication for Floyd SSO
- [ ] Update project selection flow
- [ ] Integrate Floyd CLI tools
- [ ] Add Floyd project templates
- [ ] Update deployment pipeline
- [ ] Modify workspace management

**Add Floyd Features**:
- [ ] Floyd project browser
- [ ] Floyd CLI integration
- [ ] Floyd database browser
- [ ] Floyd API test runner
- [ ] Floyd deployment preview
- [ ] Floyd component library

### Phase 3: Testing & Refinement (Week 7-8)

**Quality Assurance**:
- [ ] User acceptance testing
- [ ] Cross-browser testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Accessibility testing

**Documentation**:
- [ ] User guide for CURSE'M IDE
- [ ] Developer documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide

### Phase 4: Deployment (Week 9)

**Production Setup**:
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline
- [ ] Configure domains and SSL
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Deploy to Floyd infrastructure

---

## 7. TECHNICAL DEPENDENCIES

### 7.1 External Services (to Replace)

| Service | Current Use | Floyd Replacement |
|---------|-------------|-------------------|
| Authentication | GitHub/Google OAuth | Floyd SSO |
| Database | Supabase | Floyd Database |
| File Storage | AWS S3 (likely) | Floyd Storage |
| Email | SendGrid/Mailgun | Remove or Floyd Email |
| Payments | Stripe | REMOVE |
| Analytics | Custom/Mixpanel | REMOVE or Floyd Analytics |
| AI Services | OpenAI/Anthropic | Optional: Floyd AI |

### 7.2 Package Dependencies (Key)

**Keep**:
- React, React DOM
- TypeScript
- TailwindCSS
- Bun
- Monorepo tooling
- UI component libraries

**Remove/Replace**:
- Stripe SDK
- External OAuth providers
- Payment processing
- Public-facing features

---

## 8. FILES TO MODIFY (Quick Reference)

### 8.1 Branding Files

```
apps/web/src/app/layout.tsx          # HTML title, metadata
apps/web/src/app/page.tsx            # Homepage content
apps/web/src/app/globals.css         # Global CSS
apps/web/public/logo.svg             # Logo file
apps/web/public/favicon.ico          # Favicon
apps/web/public/og-image.png         # Open Graph image

packages/ui/src/styles/theme.ts      # ⭐ THEME CONFIG
packages/ui/src/components/Logo.tsx  # Logo component
packages/ui/src/components/Wordmark.tsx

apps/web/src/lib/constants.ts        # App name, URLs
apps/backend/src/config/auth.ts      # Auth configuration
```

### 8.2 Feature Files

```
apps/web/src/app/auth/               # Authentication flow
apps/web/src/app/projects/           # Project management
apps/web/src/app/editor/             # Editor interface

packages/stripe/                     # ❌ DELETE
packages/growth/                     # ❌ DELETE (or adapt)

apps/backend/src/auth/               # Auth providers
apps/backend/src/projects/           # Project logic
```

---

## 9. DEPLOYMENT STRATEGIES

### 9.1 Recommended: Docker Compose (Self-Hosted)

**For Floyd Internal Use**:

```yaml
# docker-compose.yml (simplified example)
services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - FLOYD_SSO_CLIENT_ID=${FLOYD_SSO_CLIENT_ID}
  
  backend:
    build: ./apps/backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
  
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=cursem_ide
```

**Advantages**:
- Full control
- No external dependencies
- Floyd infrastructure integration
- Cost-effective for internal use

### 9.2 Alternative: Cloud Deployment

**Platforms**:
- Vercel (web app)
- Railway/Render (backend)
- Floyd Cloud Infrastructure

**Considerations**:
- Cost
- Data residency
- Compliance
- Integration with Floyd systems

---

## 10. IMPLEMENTATION TIMELINE

### Week 1-2: Branding & Theming
- Logo and visual assets
- Color theme implementation
- Typography setup
- Content updates

### Week 3-4: Feature Removal & Auth
- Remove payment features
- Implement Floyd SSO
- Update authentication flow
- Remove external dependencies

### Week 5-6: Floyd Feature Integration
- Floyd CLI integration
- Project browsing
- Floyd-specific features
- Deployment pipeline

### Week 7-8: Testing & Documentation
- User acceptance testing
- Bug fixes and refinement
- Documentation creation
- Training materials

### Week 9: Production Deployment
- Production configuration
- CI/CD setup
- Monitoring and alerts
- Go-live

---

## 11. SUCCESS CRITERIA

### Must-Have (P0):
- ✅ Full CURSE'M branding (logo, colors, name)
- ✅ Floyd SSO authentication
- ✅ Floyd project integration
- ✅ Core editor functionality
- ✅ Stable deployment

### Should-Have (P1):
- Floyd CLI integration
- Floyd project templates
- Floyd deployment pipeline
- Floyd component library

### Nice-to-Have (P2):
- AI assistant features
- Advanced analytics
- Custom Floyd components
- Performance optimizations

---

## 12. RISKS & MITIGATION

### Risk: Loss of Updates from Upstream
**Mitigation**: Maintain fork, selectively merge upstream changes

### Risk: Complex Authentication Integration
**Mitigation**: Work with Floyd auth team early, allocate extra time

### Risk: Performance Issues
**Mitigation**: Performance testing, optimize build, consider caching

### Risk: Breaking Changes
**Mitigation**: Comprehensive testing, gradual rollout, rollback plan

---

## 13. NEXT STEPS

1. **Immediate Actions**:
   - Review this knowledgebase with stakeholders
   - Confirm Floyd SSO integration approach
   - Set up development environment
   - Begin branding implementation

2. **Short-Term (This Week)**:
   - Set up Git repository (fork onlook-dev/onlook)
   - Extract colors from Floyd CLI palette
   - Begin logo conversion to SVG
   - Start environment variable configuration

3. **Medium-Term (This Month)**:
   - Complete Phase 1 (Branding)
   - Begin Phase 2 (Feature Adaptation)
   - Set up testing infrastructure
   - Create Floyd-specific features

---

## APPENDIX A: RESOURCES

**Official Resources**:
- Onlook GitHub: https://github.com/onlook-dev/onlook
- Onlook Docs: https://docs.onlook.com
- Onlook Website: https://onlook.com
- License: Apache 2.0

**Floyd Resources**:
- Floyd CLI Palette: `/Users/douglastalley/Downloads/Floyd_CLI_Screen_palette.png`
- CURSE'M Logo: `/Users/douglastalley/Downloads/0C37A19F-A869-40EF-830C-42A97FF5A5FE.PNG`

**Community**:
- Onlook Discord: https://discord.gg/hERDfFZCsH
- GitHub Discussions: https://github.com/onlook-dev/onlook/discussions

---

## APPENDIX B: CONTACT & SUPPORT

**Questions About This Knowledgebase**:
- Review the customization checklist
- Consult official Onlook documentation
- Check GitHub issues for similar customizations
- Join Onlook Discord for community support

---

**Document Status**: ✅ COMPLETE  
**Last Updated**: January 20, 2026  
**Version**: 1.0  
**Maintained By**: Floyd Development Team

---

*This knowledgebase is a living document. Update as you discover new customization approaches or encounter challenges.*
