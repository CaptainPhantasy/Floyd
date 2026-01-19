/**
 * FloydDesktop - Main App Component
 * 
 * Three-panel layout: Projects | Chat | Context
 */

import { useState, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { ProjectsPanel } from './components/ProjectsPanel';
import { ContextPanel } from './components/ContextPanel';
import { StatusPanel } from './components/StatusPanel';
import { SettingsModal } from './components/SettingsModal';
import { ThemeToggle } from './components/ThemeToggle';
import { TokenUsage } from './components/TokenUsage';
import { CommandPalette } from './components/CommandPalette';
import { ExportDialog } from './components/ExportDialog';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { useAgentStream } from './hooks/useAgentStream';
import { useSessions } from './hooks/useSessions';
import { useProjects } from './hooks/useProjects';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { SessionData } from './types';

function App() {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);

  const {
    messages,
    isLoading,
    sendMessage,
    activeToolCalls,
    agentStatus,
    usage,
  } = useAgentStream(currentSession);

  const {
    sessions,
    createSession,
    loadSession,
    deleteSession,
  } = useSessions();

  const {
    projects,
    currentProject,
    createProject,
    deleteProject,
    loadProject,
  } = useProjects();

  const handleNewProject = async () => {
    const name = prompt('Project name:');
    if (!name) return;

    const path = await window.floydAPI?.selectWorkingDirectory();
    if (!path) return;

    const project = await createProject(name, path);
    if (project) {
      await loadProject(project.id);
    }
  };

  useEffect(() => {
    // Load sessions on startup
    loadSessions();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlOrCmd: true,
      action: () => {
        const handleNew = async () => {
          if (!window.floydAPI?.createSession) return;
          try {
            const result = await window.floydAPI.createSession();
            if (result && 'id' in result) {
              setCurrentSession(result as SessionData);
            }
          } catch (error) {
            console.error('Failed to create session:', error);
          }
        };
        handleNew();
      },
    },
    {
      key: 'o',
      ctrlOrCmd: true,
      action: handleNewProject,
    },
    {
      key: ',',
      ctrlOrCmd: true,
      action: () => setSettingsOpen(true),
    },
    {
      key: 'k',
      ctrlOrCmd: true,
      action: () => setCommandPaletteOpen(true),
    },
    {
      key: '/',
      ctrlOrCmd: true,
      action: () => setProjectsPanelOpen((prev) => !prev),
    },
    {
      key: '.',
      ctrlOrCmd: true,
      action: () => setContextPanelOpen((prev) => !prev),
    },
    {
      key: 'Escape',
      action: () => {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        if (exportDialogOpen) setExportDialogOpen(false);
        if (settingsOpen) setSettingsOpen(false);
      },
    },
  ]);

  const loadSessions = async () => {
    if (!window.floydAPI) return;
    try {
      const sessionList = await window.floydAPI.listSessions();
      if (sessionList.length > 0) {
        setCurrentSession(sessionList[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Note: New sessions are created through ProjectsPanel or directly via createSession
  // const handleNewChat = async () => {
  //   const newSession = await createSession();
  //   setCurrentSession(newSession);
  // };

  const handleSelectSession = async (id: string) => {
    const session = await loadSession(id);
    if (session) {
      setCurrentSession(session);
    }
  };

  const handleSelectProject = async (id: string) => {
    await loadProject(id);
  };

  const handleNewSession = async (projectId?: string) => {
    try {
      const project = projectId ? projects.find((p) => p.id === projectId) : currentProject;
      const cwd = project?.path;
      const newSession = await createSession(cwd);
      if (newSession && projectId) {
        // Link session to project
        // TODO: Add IPC handler to link session to project
        // For now, this will be handled by the project manager when session is created in project directory
      }
      setCurrentSession(newSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Left Panel - Projects */}
      {projectsPanelOpen && (
        <ProjectsPanel
          projects={projects}
          sessions={sessions}
          currentProjectId={currentProject?.id}
          currentSessionId={currentSession?.id}
          onNewProject={handleNewProject}
          onNewSession={handleNewSession}
          onSelectProject={handleSelectProject}
          onSelectSession={handleSelectSession}
          onDeleteProject={deleteProject}
          onDeleteSession={deleteSession}
          onClose={() => setProjectsPanelOpen(false)}
        />
      )}

      {/* Center Panel - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {!projectsPanelOpen && (
              <button
                onClick={() => setProjectsPanelOpen(true)}
                className="p-2 hover:bg-slate-700 rounded-lg"
                aria-label="Open projects panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Floyd
            </h1>
            {currentProject && (
              <span className="text-sm text-slate-400 ml-2">
                {currentProject.name}
              </span>
            )}
            {currentSession && (
              <span className="text-sm text-slate-500 ml-2">
                / {currentSession.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {usage && <TokenUsage usage={usage} />}
            <StatusPanel status={agentStatus} />
            <ThemeToggle />
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Open settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {!contextPanelOpen && (
              <button
                onClick={() => setContextPanelOpen(true)}
                className="p-2 hover:bg-slate-700 rounded-lg"
                aria-label="Open context panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Chat Panel */}
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          activeToolCalls={activeToolCalls}
          onSendMessage={sendMessage}
          onExport={() => setExportDialogOpen(true)}
          onClear={async () => {
            // Clear current session messages
            if (currentSession && window.floydAPI?.saveSession) {
              try {
                await window.floydAPI.saveSession({
                  ...currentSession,
                  messages: [],
                });
                // Reload session to update UI
                await handleSelectSession(currentSession.id);
              } catch (error) {
                console.error('Failed to clear session:', error);
              }
            }
          }}
          onShowTools={() => setContextPanelOpen(true)}
          onShowSettings={() => setSettingsOpen(true)}
          onShowKeyboardShortcuts={() => setKeyboardShortcutsOpen(true)}
        />
      </div>

      {/* Right Panel - Context */}
      {contextPanelOpen && (
        <ContextPanel
          currentProjectPath={currentProject?.path}
          onClose={() => setContextPanelOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNewSession={async () => {
          if (!window.floydAPI?.createSession) return;
          try {
            const result = await window.floydAPI.createSession();
            setCurrentSession(result);
          } catch (error) {
            console.error('Failed to create session:', error);
          }
        }}
        onOpenProject={handleNewProject}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        messages={messages}
        sessionTitle={currentSession?.title}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={keyboardShortcutsOpen}
        onClose={() => setKeyboardShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
