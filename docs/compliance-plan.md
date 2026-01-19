# FLOYD CLI/TUI Compliance Remediation Plan

**Date:** 2026-01-13
**Based On:** `compliance-audit.md` (Score: 42/100)
**Target Score:** 95%+
**Approach:** Audit → Plan → Fix → Re-audit loop until compliant

---

## Phase 1: P0 Critical Fixes (Week 1-2)

**Goal:** Fix all P0 violations to reach ~60% compliance. These are fundamental usability and accessibility issues.

### 1.1 NO_COLOR Detection & Monochrome Fallback
**Priority:** P0
**Files:** `agenttui/styles.go`, `ui/floydui/styles.go`, `tui/colors.go`
**Effort:** 4 hours

**Tasks:**
1. Create `checkMonochrome()` function that checks:
   - `NO_COLOR` environment variable
   - Terminal capabilities (if detectable)
2. Create `createMonochromeStyles()` function
3. Update all `NewStyles()` calls to check monochrome first
4. Test in monochrome terminal with `NO_COLOR=1 ./floyd`

**Implementation:**
```go
// agenttui/styles.go
var forceMonochrome = os.Getenv("NO_COLOR") != ""

func NewStyles(theme string) Styles {
    if forceMonochrome {
        return createMonochromeStyles()
    }
    return createColorfulStyles(theme)
}

func createMonochromeStyles() Styles {
    // Use bold, dim, italic - never color
    return Styles{
        UserMsg: lipgloss.NewStyle().Bold(true),
        AssistantMsg: lipgloss.NewStyle(),
        SystemMsg: lipgloss.NewStyle().Faint(true).Italic(true),
        Error: lipgloss.NewStyle().Bold(true).Underline(true),
        Status: lipgloss.NewStyle(),
        // All styles semantic, no colors
    }
}
```

**Verification:**
- [ ] Run with `NO_COLOR=1` - no colors anywhere
- [ ] Run with colored terminal - colors work
- [ ] All functionality accessible in monochrome mode
- [ ] Update `compliance-audit.md` score

---

### 1.2 Structured Error Messages
**Priority:** P0
**Files:** `agenttui/viewport.go`, `ui/floydui/update.go`, `tui/errors.go`
**Effort:** 6 hours

**Tasks:**
1. Define `ErrorDetails` struct with fields:
   - Icon (string) - Unicode symbol
   - What (string) - What failed
   - Why (string) - Why it failed
   - HowToFix (string) - Actionable fix
   - Location (string) - [file:line] reference
   - Verbose (string) - Stack trace (hidden by default)
2. Update `AppendError()` to accept `ErrorDetails`
3. Update all error sites to use structured format
4. Create error templates for common scenarios

**Implementation:**
```go
// agenttui/errors.go
package agenttui

type ErrorDetails struct {
    Icon     string
    What     string
    Why      string
    HowToFix  string
    Location  string
    Verbose   string
}

// Common error templates
func ConnectionTimeoutError(timeout time.Duration) ErrorDetails {
    return ErrorDetails{
        Icon:    "❌",
        What:    "Connection failed to API endpoint",
        Why:     fmt.Sprintf("Connection timeout after %v", timeout),
        HowToFix: "Check network connectivity or use --timeout flag to increase wait time",
        Location: "[agent/client.go:312]",
    }
}

func APIKeyError() ErrorDetails {
    return ErrorDetails{
        Icon:    "⚠",
        What:    "API key not configured",
        Why:     "No ANTHROPIC_AUTH_TOKEN, GLM_API_KEY, or ZHIPU_API_KEY found",
        HowToFix: "Set environment variable: export ANTHROPIC_AUTH_TOKEN='your-key'",
        Location: "[agent/client.go:45]",
    }
}

// Format error for display
func (e ErrorDetails) String() string {
    var sb strings.Builder
    sb.WriteString(e.Icon + " " + e.What + "\n")
    sb.WriteString("   Reason: " + e.Why + "\n")
    sb.WriteString("   Fix:    " + e.HowToFix + "\n")
    sb.WriteString("   " + e.Location)
    return sb.String()
}
```

**Usage Migration:**
```go
// Before
m.viewport.AppendError(msg.Error.Error())

// After
m.viewport.AppendError(ConnectionTimeoutError(30*time.Second))
```

**Verification:**
- [ ] All errors show icon
- [ ] All errors explain what + why + fix
- [ ] All errors include [file:line] reference
- [ ] Stack traces only shown with --verbose
- [ ] Update `compliance-audit.md` score

---

### 1.3 Progress Indicators with ETA
**Priority:** P0
**Files:** `ui/floydui/update.go`, `agenttui/update.go`, `ui/components/footer/`
**Effort:** 8 hours

**Tasks:**
1. Create `ProgressTracker` struct with:
   - Total tokens/items
   - Processed count
   - Start time
   - Current rate calculation
   - ETA calculation
2. Add spinner for thinking state
3. Add batch counters (Processing 127/300)
4. Add ETA display for long operations
5. Use `\r` for status updates (don't spam scrollback)

**Implementation:**
```go
// agenttui/progress.go
package agenttui

import (
    "fmt"
    "time"
)

type ProgressTracker struct {
    total       int
    processed   int
    startTime   time.Time
    lastUpdate  time.Time
    spinner     string
    spinnerIdx  int
}

var spinners = []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}

func NewProgressTracker(total int) *ProgressTracker {
    return &ProgressTracker{
        total:      total,
        processed:  0,
        startTime:  time.Now(),
        lastUpdate: time.Now(),
    }
}

func (pt *ProgressTracker) Update(processed int) string {
    pt.processed = processed
    pt.lastUpdate = time.Now()

    // Calculate percentage
    percent := float64(pt.processed) / float64(pt.total) * 100

    // Calculate rate (tokens/sec)
    elapsed := pt.lastUpdate.Sub(pt.startTime).Seconds()
    rate := float64(pt.processed) / elapsed

    // Calculate ETA
    remaining := pt.total - pt.processed
    eta := time.Duration(float64(remaining)/rate) * time.Second

    // Update spinner
    pt.spinnerIdx = (pt.spinnerIdx + 1) % len(spinners)
    pt.spinner = spinners[pt.spinnerIdx]

    // Format progress
    return fmt.Sprintf("%s Processing %d/%d (%.1f%%, ETA: %s)",
        pt.spinner, pt.processed, pt.total, percent, eta.Round(time.Second))
}

func (pt *ProgressTracker) Complete() string {
    return fmt.Sprintf("✓ Completed %d items in %s", pt.total,
        time.Since(pt.startTime).Round(time.Millisecond))
}
```

**Integration in Update:**
```go
// ui/floydui/update.go
case tickMsg:
    if m.IsThinking {
        // Update progress tracker
        processed := len(m.CurrentResponse.String()) + len(m.PendingTokens)
        total := m.totalTokens // Track total expected tokens

        status := m.progressTracker.Update(processed)

        // Use \r for in-place updates (don't spam scrollback)
        m.Footer.SetStatus(status, false) // false = don't clear

        // Update viewport with buffered tokens
        if len(m.PendingTokens) > 0 {
            limit := 15
            for i := 0; i < limit && i < len(m.PendingTokens); i++ {
                m.CurrentResponse.WriteString(m.PendingTokens[0])
                m.PendingTokens = m.PendingTokens[1:]
            }
            m.updateViewportContent()
            m.Viewport.GotoBottom()
        }
    }
```

**Verification:**
- [ ] Spinner shows during thinking (>500ms)
- [ ] Progress bar shows percentage
- [ ] ETA calculated and displayed
- [ ] Batch counter shows (Processing 127/300)
- [ ] Status updates use `\r` (no scrollback spam)
- [ ] Update `compliance-audit.md` score

---

### 1.4 Keyboard Shortcuts Help Overlay
**Priority:** P0
**Files:** `ui/floydui/view.go`, `agenttui/view.go`, `ui/components/shortcuts/`
**Effort:** 6 hours

**Tasks:**
1. Create `ShortcutsOverlay` component
2. Define all keyboard shortcuts in one place
3. Group shortcuts by category (Navigation, Editing, etc.)
4. Add `?` or `Ctrl+?` to toggle overlay
5. Use overlay pattern (not inline footer help)

**Implementation:**
```go
// agenttui/shortcuts.go
package agenttui

import (
    "github.com/charmbracelet/lipgloss"
)

type ShortcutsOverlay struct {
    visible bool
}

type ShortcutGroup struct {
    Title   string
    Actions []Shortcut
}

type Shortcut struct {
    Keys   string
    Action string
}

var shortcutGroups = []ShortcutGroup{
    {
        Title: "Navigation",
        Actions: []Shortcut{
            {Keys: "i", Action: "Enter insert mode"},
            {Keys: "Esc", Action: "Return to normal mode"},
            {Keys: "j / k", Action: "Navigate history"},
            {Keys: "Ctrl+j / Ctrl+k", Action: "Navigate history"},
        },
    },
    {
        Title: "Input",
        Actions: []Shortcut{
            {Keys: "Enter", Action: "Submit message"},
            {Keys: "Ctrl+d", Action: "Submit (multi-line mode)"},
            {Keys: "Ctrl+l", Action: "Clear conversation"},
        },
    },
    {
        Title: "Display",
        Actions: []Shortcut{
            {Keys: "?", Action: "Show/hide this help"},
            {Keys: "Ctrl+s", Action: "Toggle auto-scroll"},
            {Keys: "Ctrl+r", Action: "Refresh viewport"},
        },
    },
    {
        Title: "System",
        Actions: []Shortcut{
            {Keys: "Ctrl+c", Action: "Cancel current operation"},
            {Keys: "q", Action: "Quit application"},
        },
    },
}

func (so *ShortcutsOverlay) Toggle() {
    so.visible = !so.visible
}

func (so ShortcutsOverlay) View(width, height int) string {
    if !so.visible {
        return ""
    }

    var sections []string

    // Title
    titleStyle := lipgloss.NewStyle().
        Bold(true).
        Foreground(lipgloss.Color("#89dceb")).
        MarginBottom(1)

    sections = append(sections, titleStyle.Render("Keyboard Shortcuts"))

    // Groups
    for _, group := range shortcutGroups {
        // Group title
        groupStyle := lipgloss.NewStyle().
            Bold(true).
            Foreground(lipgloss.Color("#cba6f7")).
            MarginTop(1).
            MarginBottom(0)

        sections = append(sections, groupStyle.Render(group.Title + ":"))

        // Actions with hanging indent
        for _, action := range group.Actions {
            keyStyle := lipgloss.NewStyle().
                Foreground(lipgloss.Color("#f38ba8")).
                Bold(true).
                Width(20).
                Align(lipgloss.Right)

            actionStyle := lipgloss.NewStyle().
                Foreground(lipgloss.Color("#cdd6f4"))

            line := keyStyle.Render(action.Keys) + " " + actionStyle.Render(action.Action)
            sections = append(sections, line)
        }
    }

    // Footer
    footerStyle := lipgloss.NewStyle().
        Faint(true).
        MarginTop(2)

    sections = append(sections, footerStyle.Render("Press ? to close this help"))

    // Render in centered box
    content := lipgloss.JoinVertical(lipgloss.Left, sections...)
    boxStyle := lipgloss.NewStyle().
        Border(lipgloss.RoundedBorder()).
        BorderForeground(lipgloss.Color("#45475a")).
        Padding(2).
        Width(min(width, 80)).
        Align(lipgloss.Center)

    return boxStyle.Render(content)
}
```

**Integration in View:**
```go
// agenttui/view.go
func (m AgentModel) View() string {
    // Base content
    content := m.renderBaseContent()

    // Overlay shortcuts if visible
    if m.shortcuts.visible {
        overlay := m.shortcuts.View(m.width, m.height)
        content = renderOverlay(content, overlay)
    }

    return content
}
```

**Verification:**
- [ ] `?` toggles help overlay
- [ ] Shortcuts grouped by category with headers
- [ ] Hanging indents for actions
- [ ] Press `?` to close overlay
- [ ] Update `compliance-audit.md` score

---

### 1.5 Focus Management System
**Priority:** P0
**Files:** `agenttui/focus.go` (new), `agenttui/model.go`, `agenttui/update.go`
**Effort:** 10 hours

**Tasks:**
1. Define `Focusable` interface
2. Implement `FocusManager` component
3. Make input and viewport Focusable
4. Add Tab/Shift+Tab for focus cycling
5. Add visual focus indicators (thick border)

**Implementation:**
```go
// agenttui/focus.go
package agenttui

import (
    tea "github.com/charmbracelet/bubbletea"
)

type Focusable interface {
    Focus()
    Blur()
    Focused() bool
    View(width, height int) string
}

type FocusManager struct {
    components []Focusable
    currentIndex int
}

func NewFocusManager() *FocusManager {
    return &FocusManager{
        components: make([]Focusable, 0),
        currentIndex: 0,
    }
}

func (fm *FocusManager) Register(component Focusable) {
    fm.components = append(fm.components, component)
}

func (fm *FocusManager) Next() tea.Cmd {
    if len(fm.components) == 0 {
        return nil
    }

    // Blur current
    fm.components[fm.currentIndex].Blur()

    // Move to next
    fm.currentIndex = (fm.currentIndex + 1) % len(fm.components)

    // Focus new
    fm.components[fm.currentIndex].Focus()

    return nil
}

func (fm *FocusManager) Previous() tea.Cmd {
    if len(fm.components) == 0 {
        return nil
    }

    // Blur current
    fm.components[fm.currentIndex].Blur()

    // Move to previous
    fm.currentIndex = (fm.currentIndex - 1 + len(fm.components)) % len(fm.components)

    // Focus new
    fm.components[fm.currentIndex].Focus()

    return nil
}

func (fm *FocusManager) Current() Focusable {
    if len(fm.components) == 0 {
        return nil
    }
    return fm.components[fm.currentIndex]
}
```

**Integration:**
```go
// agenttui/model.go
type AgentModel struct {
    // ... existing fields ...

    focusManager *FocusManager
}

func NewAgentModel() AgentModel {
    // ... existing init ...

    fm := NewFocusManager()

    // Wrap components to be Focusable
    inputWrapper := NewFocusableInput(&m.input)
    viewportWrapper := NewFocusableViewport(&m.viewport)

    fm.Register(inputWrapper)
    fm.Register(viewportWrapper)

    // ...
}
```

**Verification:**
- [ ] Tab cycles through focusable components
- [ ] Shift+Tab cycles backward
- [ ] Focused component has visual indicator (thick border)
- [ ] Only one component focused at a time
- [ ] Update `compliance-audit.md` score

---

### 1.6 Modal Stack System
**Priority:** P0
**Files:** `agenttui/modals.go` (new), `agenttui/view.go`, `ui/components/modals/`
**Effort:** 12 hours

**Tasks:**
1. Define `Modal` interface
2. Implement `ModalStack` component
3. Create command palette modal
4. Create confirmation modal (Yes/No)
5. Use modals instead of inline conditional rendering

**Implementation:**
```go
// agenttui/modals.go
package agenttui

import (
    "github.com/charmbracelet/bubbles/list"
    tea "github.com/charmbracelet/bubbletea"
    "github.com/charmbracelet/lipgloss"
)

type Modal interface {
    Update(msg tea.Msg) (Modal, tea.Cmd)
    View(width, height int) string
    Dismissible() bool
    OnShow()
    OnHide()
    Key() string // Unique identifier
}

type ModalStack struct {
    modals []Modal
}

func NewModalStack() *ModalStack {
    return &ModalStack{
        modals: make([]Modal, 0),
    }
}

func (ms *ModalStack) Push(modal Modal) tea.Cmd {
    modal.OnShow()
    ms.modals = append(ms.modals, modal)
    return nil
}

func (ms *ModalStack) Pop() tea.Cmd {
    if len(ms.modals) == 0 {
        return nil
    }

    ms.modals[len(ms.modals)-1].OnHide()
    ms.modals = ms.modals[:len(ms.modals)-1]
    return nil
}

func (ms *ModalStack) Top() Modal {
    if len(ms.modals) == 0 {
        return nil
    }
    return ms.modals[len(ms.modals)-1]
}

func (ms *ModalStack) IsEmpty() bool {
    return len(ms.modals) == 0
}

// Command Palette Modal
type CommandPaletteModal struct {
    list.Model
}

func NewCommandPaletteModal() CommandPaletteModal {
    items := []list.Item{
        CommandItem{Title: "New Session", Description: "Clear conversation history", Key: "new-session"},
        CommandItem{Title: "Clear History", Description: "Remove all messages", Key: "clear-history"},
        CommandItem{Title: "Export Chat", Description: "Save conversation to file", Key: "export"},
        CommandItem{Title: "Switch Theme", Description: "Change color scheme", Key: "theme"},
        CommandItem{Title: "Quit", Description: "Exit application", Key: "quit"},
    }

    list := list.New(items, list.NewDefaultDelegate(), 0, 0)
    list.Title = "Command Palette"
    list.SetShowHelp(false)

    return CommandPaletteModal{
        Model: list,
    }
}

func (cpm CommandPaletteModal) Key() string {
    return "command-palette"
}

func (cpm CommandPaletteModal) Dismissible() bool {
    return true
}

func (cpm CommandPaletteModal) OnShow()  {}
func (cpm CommandPaletteModal) OnHide()  {}

func (cpm CommandPaletteModal) Update(msg tea.Msg) (Modal, tea.Cmd) {
    var cmd tea.Cmd
    cpm.Model, cmd = cpm.Model.Update(msg)
    return cpm, cmd
}

func (cpm CommandPaletteModal) View(width, height int) string {
    boxStyle := lipgloss.NewStyle().
        Border(lipgloss.RoundedBorder()).
        BorderForeground(lipgloss.Color("#89dceb")).
        Padding(1).
        Width(min(width-4, 60)).
        Height(min(height-4, 20)).
        Align(lipgloss.Center)

    return boxStyle.Render(cpm.Model.View())
}

// Confirmation Modal
type ConfirmModal struct {
    message string
    yes     string
    no      string
    selected bool // true = yes, false = no
}

func NewConfirmModal(message, yes, no string) *ConfirmModal {
    return &ConfirmModal{
        message: message,
        yes:     yes,
        no:      no,
        selected: true, // Default to yes
    }
}

func (cm *ConfirmModal) Key() string { return "confirm" }
func (cm *ConfirmModal) Dismissible() bool { return true }
func (cm *ConfirmModal) OnShow()  {}
func (cm *ConfirmModal) OnHide()  {}

func (cm *ConfirmModal) Update(msg tea.Msg) (Modal, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.KeyMsg:
        switch msg.String() {
        case "left", "right", "h", "l":
            cm.selected = !cm.selected
        case "enter":
            if cm.selected {
                return cm, func() tea.Msg { return ConfirmYesMsg{} }
            } else {
                return cm, func() tea.Msg { return ConfirmNoMsg{} }
            }
        case "esc":
            return cm, func() tea.Msg { return ConfirmNoMsg{} }
        }
    }
    return cm, nil
}

func (cm ConfirmModal) View(width, height int) string {
    messageStyle := lipgloss.NewStyle().
        Foreground(lipgloss.Color("#cdd6f4")).
        MarginBottom(2)

    yesStyle := lipgloss.NewStyle().
        Foreground(lipgloss.Color("#a6e3a1")).
        Bold(true)

    noStyle := lipgloss.NewStyle().
        Foreground(lipgloss.Color("#f38ba8")).
        Bold(true)

    if cm.selected {
        yesStyle = yesStyle.Background(lipgloss.Color("#313244"))
    } else {
        noStyle = noStyle.Background(lipgloss.Color("#313244"))
    }

    var sb strings.Builder
    sb.WriteString(messageStyle.Render(cm.message))
    sb.WriteString("\n")
    sb.WriteString(yesStyle.Render(" " + cm.yes + " "))
    sb.WriteString(noStyle.Render(" " + cm.no + " "))

    boxStyle := lipgloss.NewStyle().
        Border(lipgloss.RoundedBorder()).
        BorderForeground(lipgloss.Color("#89dceb")).
        Padding(2).
        Align(lipgloss.Center)

    return boxStyle.Render(sb.String())
}

type ConfirmYesMsg struct{}
type ConfirmNoMsg struct{}
```

**Integration in View:**
```go
// agenttui/view.go
func (m AgentModel) View() string {
    // Render base content
    content := m.renderBaseContent()

    // Render modals on top
    for _, modal := range m.modalStack.modals {
        overlay := modal.View(m.width, m.height)
        content = m.renderOverlay(content, overlay)
    }

    return content
}

func (m AgentModel) renderOverlay(base, overlay string) string {
    // Create semi-transparent background for overlay
    baseStyle := lipgloss.NewStyle().
        Width(m.width).
        Height(m.height)

    overlayStyle := lipgloss.NewStyle().
        Align(lipgloss.Center, lipgloss.Center)

    return baseStyle.Render(baseStyle) + overlayStyle.Render(overlay)
}
```

**Verification:**
- [ ] Command palette opens with `Ctrl+P`
- [ ] Confirmation modal shows on dangerous actions
- [ ] Tab/Enter to navigate/confirm modals
- [ ] ESC to dismiss modals
- [ ] Only one modal active at a time
- [ ] Update `compliance-audit.md` score

---

### 1.7 State Machine for UI States
**Priority:** P0
**Files:** `agenttui/state.go` (new), `agenttui/model.go`, `agenttui/update.go`
**Effort:** 8 hours

**Tasks:**
1. Define explicit UI states (Loading, Ready, Streaming, Error, etc.)
2. Create `transitionTo()` method
3. Add `onStateEnter()` hooks
4. Route Update based on current state
5. Add state-specific handlers

**Implementation:**
```go
// agenttui/state.go
package agenttui

import (
    "fmt"
    "time"
)

type UIState int

const (
    StateInitializing UIState = iota
    StateReady
    StateStreaming
    StateToolRunning
    StateError
    StatePrompting
)

func (s UIState) String() string {
    switch s {
    case StateInitializing:
        return "INITIALIZING"
    case StateReady:
        return "READY"
    case StateStreaming:
        return "STREAMING"
    case StateToolRunning:
        return "TOOL_RUNNING"
    case StateError:
        return "ERROR"
    case StatePrompting:
        return "PROMPTING"
    default:
        return "UNKNOWN"
    }
}

// AgentModel updated to use state machine
type AgentModel struct {
    // ... existing fields ...

    currentState  UIState
    previousState UIState
}

func (m *AgentModel) transitionTo(newState UIState) {
    m.previousState = m.currentState
    m.currentState = newState

    // Call state enter hook
    m.onStateEnter(newState)
}

func (m *AgentModel) onStateEnter(state UIState) {
    switch state {
    case StateInitializing:
        m.SetStatus("Initializing...", 0)
    case StateReady:
        m.SetStatus("Ready", 3*time.Second)
    case StateStreaming:
        m.StartStream()
    case StateToolRunning:
        m.toolRunning = true
    case StateError:
        m.SetStatus("Error occurred", 0)
    case StatePrompting:
        // No action needed
    }
}

func (m AgentModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    // Route based on current state
    switch m.currentState {
    case StateInitializing:
        return m.handleInitializingState(msg)
    case StateReady:
        return m.handleReadyState(msg)
    case StateStreaming:
        return m.handleStreamingState(msg)
    case StateToolRunning:
        return m.handleToolRunningState(msg)
    case StateError:
        return m.handleErrorState(msg)
    case StatePrompting:
        return m.handlePromptingState(msg)
    }

    return m, nil
}

func (m AgentModel) handleReadyState(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.KeyMsg:
        return m.handleKeyPress(msg)
    case tea.WindowSizeMsg:
        cmd := m.HandleResize(msg.Width, msg.Height)
        return m, cmd
    case TickMsg:
        return m, m.tick()
    }
    return m, nil
}

func (m AgentModel) handleStreamingState(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case StreamChunkMsg:
        return m.handleStreamChunk(msg)
    case ToolStartMsg:
        m.transitionTo(StateToolRunning)
        return m.handleToolStart(msg)
    case TickMsg:
        return m, tea.Batch(m.tick(), m.waitForStream())
    }
    return m, nil
}
```

**Verification:**
- [ ] Explicit state transitions
- [ ] State-specific handlers
- [ ] State enter hooks
- [ ] No flat switches for state routing
- [ ] Update `compliance-audit.md` score

---

### 1.8 Spinner for Long Operations
**Priority:** P0
**Files:** `agenttui/spinner.go` (new), `ui/components/spinner/`
**Effort:** 4 hours

**Tasks:**
1. Use braille spinners (from guidelines)
2. Show spinner after 500ms of operation
3. Hide spinner when operation completes
4. Use spinner for: API calls, tool execution, file I/O

**Implementation:**
```go
// agenttui/spinner.go
package agenttui

import (
    "time"
)

type Spinner struct {
    frames   []string
    current  int
    startTime time.Time
    delay    time.Duration
}

var brailleSpinners = []string{
    "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏",
}

func NewSpinner() *Spinner {
    return &Spinner{
        frames:  brailleSpinners,
        current: 0,
        delay:   100 * time.Millisecond,
    }
}

func (s *Spinner) Start() {
    s.startTime = time.Now()
}

func (s *Spinner) Next() string {
    s.current = (s.current + 1) % len(s.frames)
    return s.frames[s.current]
}

func (s *Spinner) Frame() string {
    if time.Since(s.startTime) < 500*time.Millisecond {
        return "" // Don't show spinner for short ops
    }
    return s.frames[s.current]
}

func (s *Spinner) Reset() {
    s.current = 0
    s.startTime = time.Now()
}
```

**Integration:**
```go
// agenttui/view.go
func (m AgentModel) renderStatus() string {
    var status string

    if m.status != "" {
        status = m.status
    } else {
        if m.streaming {
            spinner := m.spinner.Frame()
            status = spinner + " Receiving response..."
        } else if m.toolRunning {
            spinner := m.spinner.Frame()
            status = spinner + " Running tool..."
        } else {
            status = "Ready"
        }
    }

    // ... render status
}
```

**Verification:**
- [ ] Spinner appears after 500ms
- [ ] Braille characters used
- [ ] Spinner hides on completion
- [ ] Update `compliance-audit.md` score

---

### 1.9 Actionable Error Messages with --fix
**Priority:** P0
**Files:** `agenttui/errors.go`, `agenttui/viewport.go`
**Effort:** 4 hours

**Tasks:**
1. Add `HowToFix` field to all error templates
2. Include --flag suggestions in fixes
3. Add fix command suggestions where applicable
4. Make errors actionable, not just descriptive

**Implementation:**
```go
// agenttui/errors.go (update existing)
func ConfigFileError(path string, err error) ErrorDetails {
    return ErrorDetails{
        Icon:    "❌",
        What:    "Failed to load configuration file",
        Why:     fmt.Sprintf("Parse error in %s: %v", path, err),
        HowToFix: "Run `floyd --init-config` to generate a fresh config file, or edit manually",
        Location: fmt.Sprintf("[%s]", path),
    }
}

func ToolExecutionError(toolName string, err error) ErrorDetails {
    return ErrorDetails{
        Icon:    "⚠",
        What:    fmt.Sprintf("Tool execution failed: %s", toolName),
        Why:     err.Error(),
        HowToFix: fmt.Sprintf("Try running tool manually: floyd tool %s --verbose", toolName),
        Location: "[agent/tools.go:145]",
    }
}
```

**Verification:**
- [ ] All errors include fix suggestions
- [ ] Fix suggestions use --flags where appropriate
- [ ] Errors suggest manual workarounds
- [ ] Update `compliance-audit.md` score

---

## Phase 2: P1 High Priority Fixes (Week 3-4)

**Goal:** Fix P1 violations to reach ~80% compliance. These improve quality and professionalism.

### 2.1 Unicode Icon Consistency
**Priority:** P1
**Files:** All files with hardcoded text
**Effort:** 6 hours

**Tasks:**
1. Define standard icon set in one place
2. Replace all hardcoded text with icons
3. Add ASCII fallback detection
4. Use Unicode consistently across UI

**Implementation:**
```go
// agenttui/icons.go
package agenttui

type IconSet struct {
    Success   string
    Error     string
    Warning   string
    Info      string
    Loading   string
    File      string
    Folder    string
    Tool      string
    Settings  string
}

var UnicodeIcons = IconSet{
    Success: "✓",
    Error:   "✗",
    Warning: "⚠",
    Info:    "ℹ",
    Loading: "⏳",
    File:    "📄",
    Folder:  "📁",
    Tool:    "🔧",
    Settings: "⚙",
}

var ASCIIIcons = IconSet{
    Success: "[OK]",
    Error:   "[!]",
    Warning: "[?]",
    Info:    "[i]",
    Loading: "...",
    File:    "[F]",
    Folder:  "[D]",
    Tool:    "[T]",
    Settings: "[S]",
}

var Icons = UnicodeIcons // Default to Unicode

func DetectIcons() {
    // Could check terminal capability or NO_UNICODE flag
    // For now, default to Unicode
}
```

**Verification:**
- [ ] All status icons consistent
- [ ] All text labels replaced with icons
- [ ] ASCII fallback available
- [ ] Update `compliance-audit.md` score

---

### 2.2 Help Grouping with Headers
**Priority:** P1
**Files:** `agenttui/view.go`, `ui/floydui/view.go`
**Effort:** 3 hours

**Tasks:**
1. Group help by category (Navigation, Editing, etc.)
2. Use headers for each group
3. Add 2-3 realistic examples
4. Use hanging indents

**Implementation:**
```go
// agenttui/view.go (update renderHelp)
func (m AgentModel) renderHelp() string {
    if !m.showHelp {
        return ""
    }

    var sb strings.Builder

    // Navigation section
    navStyle := lipgloss.NewStyle().
        Bold(true).
        Foreground(lipgloss.Color("#cba6f7"))

    sb.WriteString(navStyle.Render("Navigation Options:"))
    sb.WriteString("\n")
    sb.WriteString("  i           Enter insert mode\n")
    sb.WriteString("  Esc         Return to normal mode\n")
    sb.WriteString("  j / k       Navigate through history\n")

    // Input section
    sb.WriteString("\n")
    sb.WriteString(navStyle.Render("Input Options:"))
    sb.WriteString("\n")
    sb.WriteString("  Enter       Submit current message\n")
    sb.WriteString("  Ctrl+D      Submit (multi-line mode)\n")

    // Examples section
    sb.WriteString("\n")
    sb.WriteString(navStyle.Render("Examples:"))
    sb.WriteString("\n")
    sb.WriteString("  1. Ask a question: \"How do I implement a binary tree?\"\n")
    sb.WriteString("  2. Debug code: \"Why is this function returning nil?\"\n")
    sb.WriteString("  3. Generate docs: \"Write API documentation for this struct\"\n")

    // Render with style
    helpStyle := lipgloss.NewStyle().
        Foreground(lipgloss.Color("#6c7086")).
        Padding(0, 1)

    return helpStyle.Render(sb.String())
}
```

**Verification:**
- [ ] Help grouped by headers
- [ ] 2-3 examples included
- [ ] Hanging indents used
- [ ] Update `compliance-audit.md` score

---

### 2.3 Default Indicators
**Priority:** P1
**Files:** `agenttui/input.go`, `ui/floydui/`
**Effort:** 2 hours

**Tasks:**
1. Add `[default: value]` to all prompts
2. Highlight default value in input
3. Use Y/n pattern for confirmations

**Implementation:**
```go
// agenttui/input.go
func (i InputComponent) View() string {
    var sb strings.Builder

    // Mode indicator
    modeStyle := lipgloss.NewStyle().
        Foreground(lipgloss.Color("#89dceb")).
        Background(lipgloss.Color("#313244")).
        Bold(true).
        Padding(0, 1)

    sb.WriteString(modeStyle.Render(i.mode.String()))

    // Prompt with default
    promptStyle := lipgloss.NewStyle().
        Foreground(lipgloss.Color("#cdd6f4"))

    defaultValue := "" // Could be configurable
    if defaultValue != "" {
        sb.WriteString(promptStyle.Render(fmt.Sprintf(" [default: %s]", defaultValue)))
    }

    sb.WriteString("\n")
    sb.WriteString(i.Model.View())

    return sb.String()
}

// Confirmation modal with default
func NewConfirmModal(message string, defaultYes bool) *ConfirmModal {
    yesStr := "Y"
    noStr := "n"
    if !defaultYes {
        yesStr = "y"
        noStr = "N"
    }

    return &ConfirmModal{
        message:  message,
        yes:      yesStr,
        no:       noStr,
        selected: defaultYes,
    }
}
```

**Verification:**
- [ ] All prompts show defaults
- [ ] Default values highlighted
- [ ] Y/n pattern used (capital = default)
- [ ] Update `compliance-audit.md` score

---

### 2.4 Tab Completion
**Priority:** P1
**Files:** `agenttui/input.go`, `ui/floydui/update.go`
**Effort:** 8 hours

**Tasks:**
1. Implement path completion for file paths
2. Implement command completion for slash commands
3. Show completion suggestions inline
4. Use Tab/Shift+Tab for navigation

**Implementation:**
```go
// agenttui/completion.go
package agenttui

import (
    "os"
    "path/filepath"
    "strings"
)

type CompletionContext struct {
    input    string
    cursor   int
    word     string
    position int
}

type CompletionProvider interface {
    Complete(ctx CompletionContext) []string
}

type PathCompletionProvider struct{}

func (pcp PathCompletionProvider) Complete(ctx CompletionContext) []string {
    dir := filepath.Dir(ctx.word)
    prefix := filepath.Base(ctx.word)

    entries, err := os.ReadDir(dir)
    if err != nil {
        return []string{}
    }

    matches := []string{}
    for _, entry := range entries {
        name := entry.Name()
        if strings.HasPrefix(name, prefix) {
            fullPath := filepath.Join(dir, name)
            if entry.IsDir() {
                fullPath += "/"
            }
            matches = append(matches, fullPath)
        }
    }

    return matches
}

type CommandCompletionProvider struct {
    commands []string
}

func NewCommandCompletionProvider() *CommandCompletionProvider {
    return &CommandCompletionProvider{
        commands: []string{
            "/help",
            "/clear",
            "/export",
            "/theme",
            "/model",
            "/quit",
        },
    }
}

func (ccp *CommandCompletionProvider) Complete(ctx CompletionContext) []string {
    if !strings.HasPrefix(ctx.word, "/") {
        return []string{}
    }

    matches := []string{}
    for _, cmd := range ccp.commands {
        if strings.HasPrefix(cmd, ctx.word) {
            matches = append(matches, cmd)
        }
    }

    return matches
}

// Integration in input
func (i *InputComponent) Update(msg tea.Msg) (InputComponent, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.KeyMsg:
        if msg.String() == "tab" {
            // Trigger completion
            ctx := i.getCompletionContext()
            completions := i.complete(ctx)

            if len(completions) == 1 {
                // Auto-complete
                i.SetValue(completions[0])
            } else if len(completions) > 1 {
                // Show completion menu
                return i, func() tea.Msg {
                    return ShowCompletionsMsg{Options: completions}
                }
            }
        }
    }
    // ... rest of update
}
```

**Verification:**
- [ ] Tab completes file paths
- [ ] Tab completes slash commands
- [ ] Shift+Tab cycles through completions
- [ ] Inline suggestions shown
- [ ] Update `compliance-audit.md` score

---

### 2.5 Improved Spacing
**Priority:** P1
**Files:** `agenttui/view.go`, `ui/floydui/view.go`
**Effort:** 3 hours

**Tasks:**
1. Add one blank line between major sections
2. Use 2-space indentation (not 4)
3. Improve spacing consistency

**Implementation:**
```go
// agenttui/view.go
func (m AgentModel) View() string {
    if m.width == 0 {
        return "Initializing..."
    }

    var sections []string

    // 1. Header
    sections = append(sections, m.renderHeader())
    sections = append(sections, "") // Blank line

    // 2. Viewport
    sections = append(sections, m.renderViewport())

    // 3. Status
    sections = append(sections, m.renderStatus())

    // 4. Input
    sections = append(sections, "") // Blank line
    sections = append(sections, m.renderInput())

    // 5. Help
    sections = append(sections, "") // Blank line
    sections = append(sections, m.renderHelp())

    // Join with single newlines
    content := lipgloss.JoinVertical(lipgloss.Left, sections...)

    return lipgloss.NewStyle().
        Width(m.width).
        Height(m.height).
        Render(content)
}
```

**Verification:**
- [ ] One blank line between sections
- [ ] Consistent 2-space indentation
- [ ] No cramped sections
- [ ] Update `compliance-audit.md` score

---

## Phase 3: P2 Medium Priority Fixes (Week 5-6)

**Goal:** Fix remaining P2 violations to reach 95%+ compliance. These are nice-to-have but complete the professional feel.

### 3.1 Pipe-Friendly Output
**Priority:** P2
**Files:** `cmd/floyd/main.go`, `ui/floydui/`
**Effort:** 6 hours

**Tasks:**
1. Add `--output` flag with JSON/YAML options
2. Detect pipe (isatty check)
3. Use structured output when piping
4. Keep TUI for interactive mode

**Implementation:**
```go
// cmd/floyd/main.go
package main

import (
    "encoding/json"
    "flag"
    "fmt"
    "os"
)

var outputFile = flag.String("output", "", "Output format (json, yaml) for piping")
var verbose = flag.Bool("verbose", false, "Show verbose output")

type OutputMessage struct {
    Role    string `json:"role"`
    Content string `json:"content"`
    Time    string `json:"time"`
}

func main() {
    flag.Parse()

    p := tea.NewProgram(
        floydui.NewModel(*outputFile, *verbose),
        tea.WithAltScreen(),
    )

    if _, err := p.Run(); err != nil {
        fmt.Printf("Error: %v\n", err)
        os.Exit(1)
    }
}

// In floydui/model.go
func NewModel(outputFormat string, verbose bool) Model {
    // Check if we should use TUI
    useTUI := outputFormat == "" && isTerminal()

    if !useTUI {
        // Pipe mode - use structured output
        return Model{
            outputFormat: outputFormat,
            verbose:      verbose,
            useTUI:       false,
        }
    }

    // TUI mode
    // ... existing init
}

func isTerminal() bool {
    fi, err := os.Stdin.Stat()
    if err != nil {
        return false
    }
    return (fi.Mode() & os.ModeCharDevice) != 0
}
```

**Verification:**
- [ ] `--output json` produces JSON
- [ ] `--output yaml` produces YAML
- [ ] Pipe detection works
- [ ] TUI used for interactive mode
- [ ] Update `compliance-audit.md` score

---

### 3.2 Clipboard Integration
**Priority:** P2
**Files:** `agenttui/clipboard.go` (new), `agenttui/update.go`
**Effort:** 6 hours

**Tasks:**
1. Detect clipboard tool (pbcopy, xclip, clip)
2. Add `Ctrl+Shift+C` to copy viewport content
3. Add `Ctrl+Shift+V` to paste
4. Show error if clipboard unavailable

**Implementation:**
```go
// agenttui/clipboard.go
package agenttui

import (
    "os/exec"
    "runtime"
    "strings"
)

type Clipboard struct {
    command string
    args    []string
}

func NewClipboard() *Clipboard {
    switch runtime.GOOS {
    case "darwin":
        return &Clipboard{command: "pbcopy", args: []string{}}
    case "linux":
        // Try xclip, then clip
        if _, err := exec.LookPath("xclip"); err == nil {
            return &Clipboard{command: "xclip", args: []string{"-selection", "clipboard"}}
        }
        if _, err := exec.LookPath("clip"); err == nil {
            return &Clipboard{command: "clip", args: []string{}}
        }
    case "windows":
        return &Clipboard{command: "clip", args: []string{}}
    }
    return nil
}

func (cb *Clipboard) Copy(text string) error {
    if cb == nil {
        return fmt.Errorf("clipboard not available on this platform")
    }

    cmd := exec.Command(cb.command, cb.args...)
    cmd.Stdin = strings.NewReader(text)
    return cmd.Run()
}

func (cb *Clipboard) Available() bool {
    return cb != nil
}

// Integration
func (m AgentModel) handleKeyPress(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
    switch msg.String() {
    case "ctrl+shift+c":
        // Copy viewport content
        content := m.viewport.Content()
        if err := m.clipboard.Copy(content); err != nil {
            m.SetStatus("Clipboard error: "+err.Error(), 3*time.Second)
        } else {
            m.SetStatus("Copied to clipboard", 2*time.Second)
        }
        return m, nil
    }
    // ... rest of handler
}
```

**Verification:**
- [ ] Clipboard detection works
- [ ] Ctrl+Shift+C copies content
- [ ] Error shown if clipboard unavailable
- [ ] Update `compliance-audit.md` score

---

### 3.3 Undo/Redo System
**Priority:** P2
**Files:** `agenttui/undo.go` (new), `agenttui/update.go`
**Effort:** 8 hours

**Tasks:**
1. Define `Action` interface with Do/Undo
2. Implement `History` with bounded length
3. Add Ctrl+Z to undo
4. Add Ctrl+Y to redo
5. Track message edits

**Implementation:**
```go
// agenttui/undo.go
package agenttui

type Action struct {
    Do        func() error
    Undo      func() error
    Desc      string
}

type UndoHistory struct {
    actions   []Action
    current   int
    maxLen    int
}

func NewUndoHistory(maxLen int) *UndoHistory {
    return &UndoHistory{
        actions: make([]Action, 0, maxLen),
        current: -1,
        maxLen:  maxLen,
    }
}

func (uh *UndoHistory) Push(action Action) {
    // Remove any redo history
    if uh.current < len(uh.actions)-1 {
        uh.actions = uh.actions[:uh.current+1]
    }

    // Add new action
    uh.actions = append(uh.actions, action)
    uh.current = len(uh.actions) - 1

    // Trim if too long
    if len(uh.actions) > uh.maxLen {
        uh.actions = uh.actions[1:]
        uh.current--
    }
}

func (uh *UndoHistory) Undo() error {
    if uh.current < 0 {
        return fmt.Errorf("nothing to undo")
    }

    action := uh.actions[uh.current]
    if err := action.Undo(); err != nil {
        return err
    }

    uh.current--
    return nil
}

func (uh *UndoHistory) Redo() error {
    if uh.current >= len(uh.actions)-1 {
        return fmt.Errorf("nothing to redo")
    }

    uh.current++
    action := uh.actions[uh.current]
    return action.Do()
}

func (uh *UndoHistory) CanUndo() bool {
    return uh.current >= 0
}

func (uh *UndoHistory) CanRedo() bool {
    return uh.current < len(uh.actions)-1
}

// Integration
func (m AgentModel) handleKeyPress(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
    switch msg.String() {
    case "ctrl+z":
        if m.undoHistory.CanUndo() {
            if err := m.undoHistory.Undo(); err != nil {
                m.SetStatus("Undo failed: "+err.Error(), 2*time.Second)
            } else {
                m.SetStatus("Undone", 1*time.Second)
            }
        }
        return m, nil

    case "ctrl+y":
        if m.undoHistory.CanRedo() {
            if err := m.undoHistory.Redo(); err != nil {
                m.SetStatus("Redo failed: "+err.Error(), 2*time.Second)
            } else {
                m.SetStatus("Redone", 1*time.Second)
            }
        }
        return m, nil
    }
    // ... rest of handler
}
```

**Verification:**
- [ ] Ctrl+Z undoes last action
- [ ] Ctrl+Y redoes undone action
- [ ] History bounded in length
- [ ] Status shows undo/redo feedback
- [ ] Update `compliance-audit.md` score

---

## Phase 4: Final Polish & Testing (Week 7-8)

**Goal:** Reach 95%+ compliance and ensure all changes work together.

### 4.1 Integration Testing
**Tasks:**
1. Test all P0 fixes together
2. Test state transitions
3. Test focus management
4. Test modal stack
5. Test keyboard shortcuts

### 4.2 User Acceptance Testing
**Tasks:**
1. Test with different terminals (iTerm, Terminal.app, Alacritty)
2. Test in monochrome mode (`NO_COLOR=1`)
3. Test with small terminals (60x15)
4. Test with large terminals (200x100)
5. Test on different OS (macOS, Linux, Windows)

### 4.3 Documentation Updates
**Tasks:**
1. Update README with new keyboard shortcuts
2. Add documentation for slash commands
3. Add examples for common workflows
4. Document modal system
5. Document state machine

### 4.4 Performance Testing
**Tasks:**
1. Profile TUI rendering (use `pprof`)
2. Optimize slow paths
3. Reduce token rebuild overhead
4. Test with large histories
5. Measure FPS target (30fps minimum)

---

## Compliance Tracking

### Current Score: 42/100

| Phase | Target Score | Expected Completion |
|-------|--------------|-------------------|
| Phase 1 (P0) | 60/100 | Week 2 |
| Phase 2 (P1) | 80/100 | Week 4 |
| Phase 3 (P2) | 95/100 | Week 6 |
| Phase 4 (Polish) | 98+/100 | Week 8 |

### Audit Loop

**Stop Conditions:**
1. Compliance ≥ 95% (PASS)
2. Improvement < 5% for 2 consecutive audits (STOP - diminishing returns)

**Re-audit Schedule:**
- After Phase 1: Re-audit P0 items only
- After Phase 2: Full re-audit
- After Phase 3: Full re-audit
- After Phase 4: Final audit

**Progress Tracking:**
See `docs/compliance-progress.md` for detailed task-by-task progress.

---

## Risk Mitigation

**Risk 1: Breaking existing functionality**
- **Mitigation:** Run full test suite after each fix
- **Mitigation:** Use feature flags to enable/disable new features

**Risk 2: Scope creep**
- **Mitigation:** Stick to plan, add to P2 backlog instead
- **Mitigation:** Timebox each phase (2 weeks)

**Risk 3: Insufficient testing**
- **Mitigation:** Include testing in each phase (not just at end)
- **Mitigation:** Use user acceptance testing early

---

## Success Criteria

The FLOYD CLI/TUI will be considered compliant when:

1. [ ] **NO_COLOR detection works** - Monochrome mode fully functional
2. [ ] **Structured errors** - All errors actionable with fixes
3. [ ] **Progress feedback** - All long ops show spinner + ETA
4. [ ] **Help overlay** - Keyboard shortcuts documented and accessible
5. [ ] **Focus management** - Tab cycles through components
6. [ ] **Modal system** - Commands and confirmations use proper modals
7. [ ] **State machine** - Explicit states and transitions
8. [ ] **95% compliance** - Audit score meets target
9. [ ] **No regressions** - All existing tests pass
10. [ ] **User acceptance** - Real users report positive experience

---

**This plan is aggressive but achievable** with dedicated effort. The key is systematic implementation and continuous re-auditing to ensure progress.

**Next Steps:**
1. Review this plan with stakeholders
2. Begin Phase 1, Section 1.1 (NO_COLOR detection)
3. Track progress in `docs/compliance-progress.md`
4. Re-audit after each phase
