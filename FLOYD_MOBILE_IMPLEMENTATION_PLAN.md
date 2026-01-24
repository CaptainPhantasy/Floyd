# Floyd Mobile "Bridge" Implementation Plan
## NGROK-Tunneled Remote Control for floyd-wrapper-main

**Status:** Planning Phase
**Last Updated:** 2026-01-24
**Philosophy:** Documentation-first implementation with validation receipts at every step

---

## Executive Summary

Build a Progressive Web App (PWA) that provides mobile remote control of the **floyd-wrapper-main** CLI through secure NGROK tunnels. The mobile app acts as a thin client MCP consumer, maintaining "One-Shot Accuracy" via QR code handshake while keeping all compute and API keys local to the user's machine.

**Core Design Principles:**
1. **Zero Configuration** - QR code handshake eliminates manual setup
2. **Data Sovereignty** - API keys never leave the local machine
3. **SuperCaching Bridge** - Stream cached state, don't re-fetch over mobile
4. **Documentation-First** - Every implementation step verified against official docs

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MOBILE DEVICE (PWA)                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  FloydMobile PWA (React + Vite + PWA)                     │   │
│  │  • QR Scanner (react-qr-reader)                           │   │
│  │  • WebSocket Client (native browser API)                  │   │
│  │  • MCP Client Protocol                                   │   │
│  │  • Project Map Viewer (cached JSON)                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────────┘
             │ QR Handshake: NGROK URL + Session ID + Token
             │ (encrypted JWT)
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NGROK SECURE TUNNEL                             │
│  https://{random}.ngrok-free.app → localhost:4000                  │
│  • HTTPS encryption                                               │
│  • Temporary public URL (expires with session)                    │
│  • No firewall configuration required                             │
└────────────┬────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              FLOYD WRAPPER (floyd-wrapper-main)                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Mobile Bridge Server (NEW: src/bridge/)                   │   │
│  │  • Express HTTP API (port 4000)                            │   │
│  │  • WebSocket Server (port 4000/ws)                         │   │
│  │  • QR Code Generator (qrcode package)                      │   │
│  │  • JWT Token Manager (jsonwebtoken)                        │   │
│  │  • NGROK Tunnel Manager (@ngrok/ngrok)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  EXISTING COMPONENTS (integrate, don't modify)            │   │
│  │  • FloydAgentEngine (src/agent/execution-engine.ts)       │   │
│  │  • SessionManager (src/persistence/session-manager.ts)     │   │
│  │  • ToolRegistry (src/tools/)                              │   │
│  │  • SuperCache (3-tier cache system)                       │   │
│  │  • MCPManager (src/mcp/mcp-manager.ts)                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack with Official Documentation

### Backend (floyd-wrapper-main Bridge Server)

| Technology | Purpose | Official Documentation | Version |
|------------|---------|------------------------|---------|
| **Express** | HTTP API server | [expressjs.com](https://expressjs.com/) | ^4.21.0 |
| **ws** | WebSocket server | [github.com/websockets/ws](https://github.com/websockets/ws) | ^8.19.0 |
| **@ngrok/ngrok** | NGROK tunnel SDK | [ngrok.com/docs/js](https://ngrok.com/docs/getting-started/javascript) | Latest |
| **qrcode** | QR code generation | [github.com/soldair/node-qrcode](https://github.com/soldair/node-qrcode) | ^1.5.3 |
| **jsonwebtoken** | JWT auth tokens | [github.com/auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | ^9.0.2 |
| **uuid** | Unique identifiers | [github.com/uuidjs/uuid](https://github.com/uuidjs/uuid) | ^13.0.0 |

### Frontend (FloydMobile PWA)

| Technology | Purpose | Official Documentation | Version |
|------------|---------|------------------------|---------|
| **React** | UI framework | [react.dev](https://react.dev/) | ^18.3.1 |
| **TypeScript** | Type safety | [typescriptlang.org](https://www.typescriptlang.org/) | ^5.8.3 |
| **Vite** | Build tool + PWA plugin | [vitejs.dev](https://vitejs.dev/) | ^6.3.5 |
| **vite-plugin-pwa** | PWA service worker | [github.com/vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | Latest |
| **react-qr-reader** | QR code scanner | [npmjs.com/package/react-qr-reader](https://www.npmjs.com/package/react-qr-reader) | ^3.x |
| **Zustand** | State management | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) | ^5.0.2 |
| **Tailwind CSS** | Mobile-first styling | [tailwindcss.com](https://tailwindcss.com/) | ^3.4.17 |

---

## Implementation Phases with Validation Receipts

### Phase 0: Documentation Verification & Setup

**Goal:** Verify all official documentation and establish validation receipt format.

#### Step 0.1: Create Validation Receipt Template

**Action:** Create standardized receipt format for documenting verified steps.

**Validation Receipt Format:**
```markdown
## RECEIPT: [Step Name]

**Date:** YYYY-MM-DD
**Verified By:** [Agent Name]
**Status:** ✅ VERIFIED | ❌ FAILED

**Documentation Source:**
- URL: [Official Documentation Link]
- Retrieved: YYYY-MM-DD
- Section: [Specific section referenced]

**Implementation:**
- Code: [File path]
- Lines: [Line numbers]
- Command: [Exact command used]

**Verification:**
```bash
[Paste exact terminal output - minimum 5 lines]
```

**Result:** PASS/FAIL
**Notes:** [Any discrepancies or caveats]
```

#### Step 0.2: Verify NGROK JavaScript SDK Documentation

**Action:** Fetch and verify official NGROK JavaScript SDK documentation.

**Sources:**
- [NGROK JavaScript SDK](https://ngrok.com/docs/getting-started/javascript)
- [NGROK API Overview](https://ngrok.com/docs/api)
- [ngrok-javascript GitHub](https://github.com/ngrok/ngrok-javascript)

#### Step 0.3: Verify QR Code Libraries

**Sources:**
- [react-qr-code (NPM)](https://www.npmjs.com/package/react-qr-code)
- [react-qr-code GitHub](https://github.com/rosskhanas/react-qr-code)
- [qrcode (node-qrcode)](https://github.com/soldair/node-qrcode)

#### Step 0.4: Verify PWA Best Practices

**Sources:**
- [MDN PWA Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Microsoft Edge PWA](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/landing/)
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)

---

### Phase 1: Bridge Server Infrastructure (Week 1)

**Goal:** Create the bridge server in floyd-wrapper-main with NGROK integration.

#### Step 1.1: Create Bridge Server Directory Structure

**Files to Create:**
```
floyd-wrapper-main/
└── src/
    └── bridge/
        ├── server.ts              # Express + WebSocket server
        ├── ngrok-manager.ts       # NGROK tunnel management
        ├── qr-generator.ts        # QR code generation
        ├── token-manager.ts       # JWT token management
        ├── session-router.ts      # Route mobile commands to FloydAgentEngine
        ├── types.ts               # TypeScript definitions
        └── package.json           # Bridge-specific dependencies
```

#### Step 1.2: Implement NGROK Manager

Following official [NGROK JavaScript SDK documentation](https://ngrok.com/docs/getting-started/javascript).

#### Step 1.3: Implement QR Code Generator

Following official [node-qrcode documentation](https://github.com/soldair/node-qrcode).

#### Step 1.4: Implement JWT Token Manager

Following official [jsonwebtoken documentation](https://github.com/auth0/node-jsonwebtoken).

#### Step 1.5: Implement Express + WebSocket Server

Following [Express routing guide](https://expressjs.com/en/stable/routing.html) and [ws WebSocket documentation](https://github.com/websockets/ws/blob/master/doc/ws.md).

#### Step 1.6: Implement Session Router

Integrate with existing:
- `src/agent/execution-engine.ts` (FloydAgentEngine)
- `src/persistence/session-manager.ts` (SessionManager)

---

### Phase 2: FloydMobile PWA (Week 2)

**Goal:** Create the mobile Progressive Web App with QR scanning and WebSocket client.

#### Step 2.1: Create FloydMobile Project Structure

Using official [Vite guide](https://vitejs.dev/guide/).

#### Step 2.2: Configure PWA Plugin

Following [vite-plugin-pwa quick setup](https://github.com/vite-pwa/vite-plugin-pwa#quick-setup).

#### Step 2.3: Implement QR Scanner Component

Using [react-qr-reader documentation](https://www.npmjs.com/package/react-qr-reader).

#### Step 2.4: Implement WebSocket Tunnel Client

Following [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

---

### Phase 3: Integration & Testing (Week 3)

**Goal:** End-to-end integration testing with real mobile devices.

#### Step 3.1: Mobile Bridge CLI Integration

Add commands to floyd-wrapper-main:
```bash
floyd --bridge          # Start mobile bridge server
floyd --pair-mobile     # Generate QR code for mobile pairing
```

#### Step 3.2: End-to-End QR Handshake Test

Test complete pairing flow:
1. Start bridge server on MacMini
2. Open FloydMobile PWA on mobile
3. Scan QR code
4. Verify WebSocket connection

#### Step 3.3: Message Streaming Test

Test real-time agent message streaming from mobile device.

---

### Phase 4: SuperCaching & Project Map (Week 4)

**Goal:** Implement state streaming via SuperCaching for mobile efficiency.

#### Step 4.1: Stream Project Map to Mobile

Generate and stream project structure as JSON.

#### Step 4.2: Implement Cache Streaming

Stream SuperCache entries for context restoration.

---

## Security Model

### Authentication & Authorization

**Layer 1: QR Code Handshake (One-Time)**
- Cryptographically signed JWT token
- Single-use pairing token (5-minute expiry)
- Device fingerprinting (userAgent + platform)

**Layer 2: Session Tokens (Persistent)**
- JWT with 30-day expiry
- Server-side secret (FLOYD_JWT_SECRET)
- Device-bound tokens

**Layer 3: WebSocket Authorization**
- Token verified on every connection
- Automatic disconnect on token expiry
- Rate limiting (10 pairing attempts/hour)

### Data Sovereignty Guarantees

✅ **API keys never leave local machine**
✅ **All compute happens on MacMini**
✅ **Mobile app is a thin interface only**
✅ **No cloud intermediaries**
✅ **NGROK tunnel is temporary (session-scoped)**

---

## Verification Checklist

### Before Production Use

- [ ] NGROK SDK integration tested with official documentation
- [ ] QR generation and scanning verified on iOS Safari
- [ ] QR generation and scanning verified on Android Chrome
- [ ] WebSocket connection stable over mobile networks (4G/5G/WiFi)
- [ ] JWT token generation and verification working
- [ ] FloydAgentEngine integration verified
- [ ] SessionManager persistence confirmed
- [ ] SuperCache streaming functional
- [ ] Project map generation and display working
- [ ] Tool execution from mobile verified
- [ ] Message streaming latency < 500ms on 4G
- [ ] PWA installs correctly on both platforms
- [ ] Service worker caching operational
- [ ] Reconnection logic handles network drops
- [ ] Error handling covers all failure modes

---

## Rollout Plan

### Week 1: Infrastructure
- Day 1-2: Bridge server implementation (Steps 1.1-1.3)
- Day 3-4: Token manager and session router (Steps 1.4-1.6)
- Day 5: Integration testing with floyd-wrapper-main

### Week 2: Mobile PWA
- Day 1-2: Project setup and PWA config (Steps 2.1-2.2)
- Day 3-4: QR scanner and WebSocket client (Steps 2.3-2.4)
- Day 5: Component testing and polish

### Week 3: Integration
- Day 1-2: CLI integration and end-to-end testing (Steps 3.1-3.2)
- Day 3-4: Message streaming and tool execution (Step 3.3)
- Day 5: Cross-platform testing (iOS + Android)

### Week 4: Polish & Cache
- Day 1-2: Project map streaming (Step 4.1)
- Day 3-4: SuperCache integration (Step 4.2)
- Day 5: Documentation and release preparation

---

## Known Limitations & Future Enhancements

### Current Limitations
- No push notifications (mobile must poll for updates)
- No offline mode (requires active NGROK tunnel)
- Single session limitation (one mobile device per session)
- No file upload/download from mobile

### Future Enhancements
- **Push Notifications**: Web Push API for mobile alerts
- **Offline Mode**: Cache responses locally for offline viewing
- **Multi-Device Support**: Pair multiple mobile devices simultaneously
- **File Operations**: Upload files from mobile to workspace
- **TUI Puppeteer**: Remote terminal orchestration for stuck prompts
- **Visual Verify**: Screenshot streaming for agent monitoring
- **Browork Control**: Orchestrate sub-agents from mobile

---

## Success Criteria

✅ **Phase 1 Success:** Bridge server starts, NGROK tunnel established, QR code generated
✅ **Phase 2 Success:** PWA installs on mobile, QR scanner works, WebSocket connects
✅ **Phase 3 Success:** End-to-end message flow works, tools execute from mobile
✅ **Phase 4 Success:** SuperCache streams, context restored, project map displays

**Final Success Metric:** Can successfully trigger and monitor a Floyd agent session from a mobile device while away from the desk.

---

**Status:** Ready for Implementation
**Next Step:** Phase 0 - Documentation Verification & Setup
**Estimated Timeline:** 4 weeks
**Risk Level:** Medium (NGROK dependency, mobile network reliability)

---

## Documentation Sources

### NGROK
- [JavaScript SDK Quickstart](https://ngrok.com/docs/getting-started/javascript)
- [ngrok-javascript GitHub](https://github.com/ngrok/ngrok-javascript)
- [API Overview](https://ngrok.com/docs/api)

### QR Code Libraries
- [react-qr-code NPM](https://www.npmjs.com/package/react-qr-code)
- [react-qr-code GitHub](https://github.com/rosskhanas/react-qr-code)
- [node-qrcode GitHub](https://github.com/soldair/node-qrcode)

### PWA
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Microsoft Edge PWA Docs](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/landing/)
- [vite-plugin-pwa GitHub](https://github.com/vite-pwa/vite-plugin-pwa)

### WebSocket & Real-Time
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [ws (WebSocket) GitHub](https://github.com/websockets/ws)
- [WebSocket Architecture Best Practices](https://ably.com/topic/websocket-architecture-best-practices)

---

*Built with documentation-first principles 📚*
*Every step verified against official sources ✅*
*Validation receipts for all implementation 🧾*
