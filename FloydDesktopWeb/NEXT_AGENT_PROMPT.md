# PROMPT FOR NEXT AGENT - Floyd DesktopWeb Integration Work

**Date:** 2026-01-20 22:27:00Z
**Status:** Previous agent was killed for declaring work "complete" when it wasn't
**Build Status:** ✅ PASSING (all components compile)

---

## ⚠️ CRITICAL CONTEXT - READ THIS FIRST

The previous agent created 27 component files and 9 API endpoints, then declared the project "100% complete." 

**IT IS NOT COMPLETE.**

Components exist but many are NOT integrated into the UI. Backend APIs are incomplete. Tests are failing.

**DO NOT** declare features complete until:
1. Component is imported into App.tsx or parent component
2. Component renders in the UI
3. Backend API works end-to-end
4. Feature is manually tested and working

---

## WHAT ACTUALLY EXISTS (Working)

### ✅ Fully Integrated & Working:
- `EditableTitle.tsx` - Chat renaming works
- `CopyButton.tsx` - Copy button exists (tests fail but feature works)
- `RegenerateButton.tsx` - Regenerate works
- `PinButton.tsx` - Pin/unpin works
- `ContinueButton.tsx` - Continue response works
- `ExportButton.tsx` - Export chat works
- `KeyboardShortcuts.tsx` + `ShortcutsModal.tsx` - Keyboard shortcuts work
- `SearchBar.tsx` - Search UI integrated (⌘K works)

### ✅ Backend APIs Implemented (9 endpoints):
- `PATCH /api/sessions/:id/rename` ✅
- `PATCH /api/sessions/:id/pin` ✅
- `POST /api/sessions/:id/regenerate` ✅
- `PATCH /api/sessions/:id/messages/:messageIndex` ✅
- `POST /api/sessions/:id/continue` ✅
- `PATCH /api/sessions/:id/archive` ✅
- `PATCH /api/sessions/:id/folder` ✅
- `GET /api/folders` ✅
- `GET /api/sessions` (with filters) ✅

### ✅ Build Status:
```
✓ 2719 modules transformed
✓ built in 1.97s
TypeScript strict mode: PASSING
```

---

## WHAT NEEDS TO BE DONE (The Actual Work)

### Priority 1: Fix Failing Tests

**File:** `src/components/CopyButton.test.tsx`
**Issue:** 7 tests failing
**Root Cause:** Tests looking for button by name `/copy to clipboard/i` but component has `aria-label="Copy message"`

**Fix:**
```typescript
// In CopyButton.test.tsx, change:
const button = screen.getByRole('button', { name: /copy to clipboard/i });

// To:
const button = screen.getByRole('button', { name: /copy message/i });
```

**Verify:** Run `npm run test` - all 31 tests should pass (currently 24/31 pass)

---

### Priority 2: Integrate Phase 3 Components (Search & Organization)

#### 2.1 Integrate FolderButton into Sidebar

**Component:** `src/components/FolderButton.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/components/Sidebar.tsx`, add FolderButton to each conversation item

**Implementation:**
```tsx
// In Sidebar.tsx, in the conversation list rendering:
<div className="flex items-center gap-2">
  <EditableTitle ... />
  {/* ADD THIS */}
  <FolderButton 
    sessionId={session.id}
    currentFolder={session.folder}
    onFolderChange={(folder) => handleFolderChange(session.id, folder)}
  />
  <PinButton ... />
</div>
```

**Backend:** ✅ ALREADY EXISTS - `PATCH /api/sessions/:id/folder`

**Test manually:**
1. Open app
2. See folder button in sidebar
3. Click folder button
4. See folder dropdown
5. Create new folder
6. Assign chat to folder
7. Verify chat shows in folder

---

#### 2.2 Integrate ArchiveButton into Sidebar

**Component:** `src/components/ArchiveButton.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/components/Sidebar.tsx`, add ArchiveButton to each conversation item

**Implementation:**
```tsx
// In Sidebar.tsx:
<div className="flex items-center gap-2">
  <EditableTitle ... />
  <FolderButton ... />
  <PinButton ... />
  {/* ADD THIS */}
  <ArchiveButton 
    sessionId={session.id}
    archived={session.archived}
    onArchiveChange={(archived) => handleArchiveChange(session.id, archived)}
  />
</div>
```

**Backend:** ✅ ALREADY EXISTS - `PATCH /api/sessions/:id/archive`

**Test manually:**
1. Click archive button on chat
2. Chat disappears from main list
3. Check that archived sessions are filtered
4. Verify unarchive works

---

### Priority 3: Integrate Phase 4 Components (File Management)

#### 3.1 Integrate FileUploadButton

**Component:** `src/components/FileUploadButton.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/App.tsx` or input area component

**Implementation:**
```tsx
// In App.tsx, near the chat input:
<div className="flex items-center gap-2">
  {/* ADD THIS */}
  <FileUploadButton 
    onFileSelect={handleFileUpload}
    accept={[".pdf", ".docx", ".txt", ".png", ".jpg"]}
    maxSize={10 * 1024 * 1024} // 10MB
  />
  <textarea ... />
  <button>Send</button>
</div>
```

**Backend:** ❌ DOES NOT EXIST - Must implement:

```typescript
// In server/index.ts, ADD:
app.post('/api/sessions/:id/files', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  
  // Save file to .floyd-data/files/
  // Update session with file reference
  // Return file metadata
});

// Multer config needed for multipart uploads
```

**Test manually:**
1. Click file upload button
2. Select file
3. See upload progress
4. File appears in chat
5. File persists after refresh

---

### Priority 4: Integrate Phase 5 Components (Artifacts)

#### 4.1 Integrate ArtifactViewer into ChatMessage

**Component:** `src/components/ArtifactViewer.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/components/ChatMessage.tsx`, render artifacts

**Implementation:**
```tsx
// In ChatMessage.tsx:
import { ArtifactViewer } from './ArtifactViewer';

// In message rendering:
<div className="message-content">
  <Markdown>{message.content}</Markdown>
  
  {/* ADD THIS */}
  {message.artifacts && message.artifacts.length > 0 && (
    <ArtifactViewer 
      artifacts={message.artifacts}
      onCopy={handleCopyArtifact}
      onDownload={handleDownloadArtifact}
    />
  )}
</div>
```

**Backend:** ❌ DOES NOT EXIST - Must implement:

```typescript
// In server/index.ts, ADD:
app.get('/api/sessions/:id/artifacts', async (req, res) => {
  // Return all artifacts for session
});

app.post('/api/sessions/:id/artifacts', async (req, res) => {
  // Create new artifact
  // Save to .floyd-data/artifacts/
  // Return artifact metadata
});
```

**Test manually:**
1. Send message that generates code artifact
2. Artifact renders with syntax highlighting
3. Copy button works
4. Download button works

---

### Priority 5: Integrate Phase 6 Components (Polish & Advanced)

#### 5.1 Integrate MessageTimestamp into ChatMessage

**Component:** `src/components/MessageTimestamp.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/components/ChatMessage.tsx`

**Implementation:**
```tsx
// In ChatMessage.tsx:
import { MessageTimestamp } from './MessageTimestamp';

// In message header:
<div className="message-header">
  <span>{role}</span>
  {/* ADD THIS */}
  <MessageTimestamp 
    timestamp={message.created}
    variant="compact" // or "full"
  />
</div>
```

**Backend:** ✅ ALREADY EXISTS - `message.created` field

**Test manually:**
1. Hover over message
2. See timestamp tooltip
3. See relative time "2h ago"

---

#### 5.2 Integrate TokenUsageBar into App

**Component:** `src/components/TokenUsageBar.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/App.tsx`, below chat input

**Implementation:**
```tsx
// In App.tsx:
import { TokenUsageBar } from './components/TokenUsageBar';

// After message input area:
{/* ADD THIS */}
<TokenUsageBar 
  inputTokens={currentSession.inputTokens || 0}
  outputTokens={currentSession.outputTokens || 0}
  totalTokens={currentSession.totalTokens || 0}
  cost={currentSession.estimatedCost || 0}
/>
```

**Backend:** ❌ DOES NOT EXIST - Must add token tracking to session model:

```typescript
// In src/types/index.ts, ADD to Session interface:
inputTokens?: number;
outputTokens?: number;
totalTokens?: number;
estimatedCost?: number;

// In server/index.ts, update session creation/update to track tokens
```

**Test manually:**
1. Send message
2. See token count update
3. See cost estimate
4. Verify accuracy

---

#### 5.3 Integrate ConversationBranch into Message Area

**Component:** `src/components/ConversationBranch.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/components/ChatMessage.tsx` or `App.tsx`

**Implementation:**
```tsx
// In ChatMessage.tsx or App.tsx:
import { ConversationBranch } from './ConversationBranch';

// After each assistant message:
<div className="message-actions">
  {/* ADD THIS */}
  <ConversationBranch 
    sessionId={currentSession.id}
    messageIndex={index}
    currentBranch={currentSession.branch}
    onBranchChange={handleBranchChange}
  />
  <CopyButton />
  <RegenerateButton />
</div>
```

**Backend:** ❌ DOES NOT EXIST - Must implement branching data structure:

```typescript
// In src/types/index.ts, ADD to Session interface:
branches?: {
  [branchId: string]: {
    parentId: string;
    messageId: string;
    createdAt: number;
  };
};
currentBranch?: string;

// In server/index.ts, implement branch creation API
app.post('/api/sessions/:id/branches', async (req, res) => {
  // Create new branch from message
  // Return branch ID
});
```

**Test manually:**
1. Click branch button on message
2. See branch created
3. Switch between branches
4. Verify message history diverges

---

#### 5.4 Integrate ImportButton into Header

**Component:** `src/components/ImportButton.tsx` ✅ EXISTS
**Status:** ❌ NOT INTEGRATED

**Where to add:** In `src/App.tsx` header or `Sidebar.tsx`

**Implementation:**
```tsx
// In App.tsx header:
<div className="header-actions">
  <SettingsButton />
  {/* ADD THIS */}
  <ImportButton onImport={handleImport} />
</div>
```

**Backend:** ✅ PARTIALLY EXISTS - Import logic in component, needs verification

**Test manually:**
1. Click import button
2. Upload Claude.ai JSON export
3. Verify sessions created
4. Check messages imported correctly

---

## SUCCESS CRITERIA - DO NOT DECLARE DONE UNTIL:

For EACH component integration:

1. ✅ Component is imported into parent file
2. ✅ Component renders in UI (verify by running app and looking at it)
3. ✅ Backend API exists (if needed)
4. ✅ Manual test passes (actually click/use the feature)
5. ✅ Data persists (refresh page, verify still there)
6. ✅ No console errors
7. ✅ Build passes
8. ✅ Tests pass (if applicable)

---

## INTEGRATION ORDER (Do in this sequence):

1. **Fix CopyButton tests** (5 minutes) - Immediate win
2. **Integrate FolderButton** (15 minutes) - Backend exists, easy win
3. **Integrate ArchiveButton** (15 minutes) - Backend exists, easy win
4. **Integrate MessageTimestamp** (10 minutes) - No backend needed
5. **Integrate FileUploadButton** (30 minutes) - Needs backend
6. **Integrate ArtifactViewer** (30 minutes) - Needs backend
7. **Integrate TokenUsageBar** (20 minutes) - Needs data model update
8. **Integrate ConversationBranch** (45 minutes) - Complex, needs backend
9. **Integrate ImportButton** (15 minutes) - Should be mostly done

**Estimated Total Time:** 3-4 hours of focused work

---

## FILES TO MODIFY:

### Core Integration Files:
- `src/App.tsx` - Add imports, integrate components
- `src/components/Sidebar.tsx` - Add FolderButton, ArchiveButton
- `src/components/ChatMessage.tsx` - Add ArtifactViewer, MessageTimestamp
- `src/types/index.ts` - Add token usage, branching fields
- `server/index.ts` - Add file upload, artifacts, branching APIs

### Test Files:
- `src/components/CopyButton.test.tsx` - Fix aria-label selectors

---

## COMMANDS TO RUN:

```bash
# Development server
cd /Volumes/Storage/FLOYD_CLI/FloydDesktopWeb
npm run dev

# Build (always verify after changes)
npm run build

# Tests (run frequently)
npm run test

# Check TypeScript
npx tsc --noEmit
```

---

## DESIGN SYSTEM REFERENCE:

Use these colors (crush palette):
- Primary: `bg-crush-primary` / `text-crush-primary`
- Secondary: `bg-crush-secondary` / `text-crush-secondary`
- Text: `text-crush-text-primary` / `text-crush-text-secondary`
- Overlay: `bg-crush-overlay`
- Borders: `border-crush-border`

Icons: `lucide-react` (already imported)

---

## FINAL WARNING:

The previous agent failed because they:
1. Created files without integrating them
2. Declared "100% complete" prematurely
3. Didn't manually test features
4. Didn't verify end-to-end functionality

**DO NOT REPEAT THESE MISTAKES.**

Integrate → Test → Verify → THEN mark complete.

**Good luck.**
