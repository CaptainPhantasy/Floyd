# Floyd CLI Automation Hooks

**Purpose:** Configuration for automated orchestration via Claude CLI

---

## Trigger Files

Watch these files for changes:

```
.floyd/status/orchestrator.json   → Orchestrator state (handoff signals)
.floyd/status/desktop.json        → Desktop specialist progress
.floyd/status/cli.json            → CLI specialist progress
.floyd/status/chrome.json         → Chrome specialist progress
.floyd/status/browork.json        → Browork specialist progress
.floyd/ECOSYSTEM_ROADMAP.md       → Roadmap changes (verify parity)
.floyd/master_plan.md             → Master plan changes (verify parity)
```

---

## Status Signals

### Specialist Completion Signal
```json
{
  "status": "awaiting_verification",
  "readyForQualityGate": true
}
```

### Orchestrator Handoff Signal
```json
{
  "status": "handoff_ready",
  "sessionComplete": true,
  "nextOrchestratorNeeded": true
}
```

### Platform Ready Signal (THE GOAL)
```json
{
  "status": "ready_for_douglas",
  "qualityGatePassed": true,
  "allPlatformsTested": true
}
```

---

## CLI Commands

### Spawn Orchestrator
```bash
cd /Volumes/Storage/FLOYD_CLI
claude "You are the Floyd Orchestrator. Read .floyd/AGENT_ORCHESTRATION.md completely. Then read all .floyd/status/*.json files. Assess current state. Pick the highest priority task from the roadmap. Spawn the appropriate specialist. Work through 2-3 specialist cycles. Then prepare handoff notes for the next orchestrator."
```

### Spawn Specific Specialist
```bash
# Desktop Specialist
claude "You are DesktopSpec. Read .floyd/AGENT_ORCHESTRATION.md, find the Desktop Specialist Prompt. Your task is in .floyd/status/desktop.json. Complete it."

# CLI Specialist  
claude "You are CLISpec. Read .floyd/AGENT_ORCHESTRATION.md, find the CLI Specialist Prompt. Your task is in .floyd/status/cli.json. Complete it."

# Chrome Specialist
claude "You are ChromeSpec. Read .floyd/AGENT_ORCHESTRATION.md, find the Chrome Specialist Prompt. Your task is in .floyd/status/chrome.json. Complete it."

# Browork Specialist
claude "You are BroworkSpec. Read .floyd/AGENT_ORCHESTRATION.md, find the Browork Specialist Prompt. Your task is in .floyd/status/browork.json. Complete it."
```

### Check Handoff Status
```bash
claude "Read .floyd/status/orchestrator.json. Is sessionComplete true? What are the next priorities? Report status."
```

---

## Automation Loop (Pseudocode)

```bash
while true; do
    # Check if orchestrator is ready for handoff
    if grep -q '"status": "handoff_ready"' .floyd/status/orchestrator.json; then
        # Spawn fresh orchestrator
        claude "You are a fresh Orchestrator. Read .floyd/AGENT_ORCHESTRATION.md..."
    fi
    
    # Check if ready for Douglas
    if grep -q '"status": "ready_for_douglas"' .floyd/status/orchestrator.json; then
        echo "🎉 PLATFORM READY FOR DOUGLAS"
        break
    fi
    
    sleep 60  # Check every minute
done
```

---

## The Goal

When this status file shows this, we're done:

```json
{
  "status": "ready_for_douglas",
  "qualityGatePassed": true,
  "verificationReport": {
    "desktop": { "15turn": "PASS", "smokeTests": "97%" },
    "cli": { "15turn": "PASS", "smokeTests": "96%" },
    "chrome": { "15turn": "PASS", "smokeTests": "95%" },
    "browork": { "15turn": "PASS", "smokeTests": "95%" }
  },
  "message": "All platforms verified. Ready for Douglas to test."
}
```

---

*See `.floyd/AGENT_ORCHESTRATION.md` for full orchestration protocol.*
