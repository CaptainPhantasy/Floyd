/**
 * Floyd Web - Main Application
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import type { Session, Message, Settings } from '@/types';
import { SettingsModal } from '@/components/SettingsModal';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ToolCallCard } from '@/components/ToolCallCard';
import { SkillsPanel } from '@/components/SkillsPanel';
import { ProjectsPanel } from '@/components/ProjectsPanel';
import { BroworkPanel } from '@/components/BroworkPanel';
import { SplashScreen } from '@/components/SplashScreen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ExportButton } from '@/components/ExportButton';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { SearchBar } from '@/components/SearchBar'; // Phase 3, Task 3.1
import {
  Settings as SettingsIcon,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Sparkles,
  FolderKanban,
  Users,
  Bot,
  Search as SearchIcon // Phase 3, Task 3.1
} from 'lucide-react';

export default function App() {
  const api = useApi();
  
  // State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [_settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'no-key' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('');
  const [showSkills, setShowSkills] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showBrowork, setShowBrowork] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false); // Phase 2, Task 2.4
  const [showSearch, setShowSearch] = useState(false); // Phase 3, Task 3.1
  const [regeneratingMessageIndex, setRegeneratingMessageIndex] = useState<number | null>(null); // Phase 1, Task 1.3
  const [continuingMessageIndex, setContinuingMessageIndex] = useState<number | null>(null); // Phase 2, Task 2.2
  const [activeToolCalls, setActiveToolCalls] = useState<Array<{
    id: string;
    tool: string;
    args: any;
    result?: any;
    success?: boolean;
    isExecuting: boolean;
  }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingContentRef = useRef<string>('');

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Initialize
  useEffect(() => {
    async function init() {
      try {
        const health = await api.checkHealth();
        const settingsData = await api.getSettings();
        setSettings(settingsData);
        
        if (!health.hasApiKey) {
          setStatus('no-key');
          setStatusMessage('API key not configured. Click Settings to add your Anthropic API key.');
          setShowSettings(true);
          return;
        }
        
        // Load sessions
        const sessionList = await api.getSessions();
        setSessions(sessionList);
        
        // Create or load session
        if (sessionList.length > 0) {
          const session = await api.getSession(sessionList[0].id);
          setCurrentSession(session);
          setMessages(session.messages);
        } else {
          const session = await api.createSession();
          setSessions([session]);
          setCurrentSession(session);
          setMessages([]);
        }
        
        setStatus('ready');
        setStatusMessage(`Connected to ${health.model}`);
      } catch (err: any) {
        setStatus('error');
        setStatusMessage(err.message || 'Failed to connect to server');
      }
    }
    
    init();
  }, []);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isStreaming || !currentSession) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');
    streamingContentRef.current = '';
    setActiveToolCalls([]);
    
    try {
      await api.sendMessageStream(
        currentSession.id,
        userMessage.content,
        // onText
        (text) => {
          streamingContentRef.current += text;
          setStreamingContent(streamingContentRef.current);
        },
        // onDone
        async (usage, sessionId) => {
          const fullContent = streamingContentRef.current;
          if (fullContent) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: fullContent,
              timestamp: Date.now(),
            }]);
          }
          setStreamingContent('');
          streamingContentRef.current = '';
          setIsStreaming(false);
          setActiveToolCalls([]);
          
          // Refresh sessions list
          const sessionList = await api.getSessions();
          setSessions(sessionList);
        },
        // onError
        (error) => {
          setStatusMessage(`Error: ${error}`);
          setIsStreaming(false);
          setStreamingContent('');
          streamingContentRef.current = '';
          setActiveToolCalls([]);
        },
        // onToolCall
        (tool, args, id) => {
          setActiveToolCalls(prev => [...prev, {
            id,
            tool,
            args,
            isExecuting: true,
          }]);
        },
        // onToolResult
        (tool, id, result, success) => {
          setActiveToolCalls(prev => prev.map(tc => 
            tc.id === id 
              ? { ...tc, result, success, isExecuting: false }
              : tc
          ));
        }
      );
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
      setIsStreaming(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle new session
  const handleNewSession = async () => {
    try {
      const session = await api.createSession();
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
      inputRef.current?.focus();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  // Handle select session
  const handleSelectSession = async (sessionId: string) => {
    try {
      const session = await api.getSession(sessionId);
      setCurrentSession(session);
      setMessages(session.messages);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  // Handle delete session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        if (sessions.length > 1) {
          const remaining = sessions.filter(s => s.id !== sessionId);
          const next = await api.getSession(remaining[0].id);
          setCurrentSession(next);
          setMessages(next.messages);
        } else {
          const session = await api.createSession();
          setSessions([session]);
          setCurrentSession(session);
          setMessages([]);
        }
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  // Handle settings save
  const handleSettingsSave = async () => {
    const settingsData = await api.getSettings();
    setSettings(settingsData);
    
    const health = await api.checkHealth();
    if (health.hasApiKey) {
      setStatus('ready');
      setStatusMessage(`Connected to ${health.model}`);
    }
  };

  // Handle rename session (Phase 1, Task 1.1)
  const handleRenameSession = async (sessionId: string, customTitle: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customTitle }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename session');
      }

      const data = await response.json();
      
      // Update sessions list with new title
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, customTitle: data.session.customTitle }
          : s
      ));

      // Update current session if it's the one being renamed
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, customTitle: data.session.customTitle } : null);
      }

      setStatusMessage('Chat renamed successfully');
      setTimeout(() => {
        if (status === 'ready') {
          setStatusMessage(`Connected to ${settings?.model || 'Claude'}`);
        }
      }, 2000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
      throw err; // Re-throw for component to handle
    }
  };

  // Handle toggle pin session (Phase 1, Task 1.4)
  const handleTogglePinSession = async (sessionId: string, pinned: boolean) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update pin status');
      }

      const data = await response.json();
      
      // Update sessions list with new pin status
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, pinned: data.session.pinned }
          : s
      ));

      // Update current session if needed
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, pinned: data.session.pinned } : null);
      }

      setStatusMessage(pinned ? 'Chat pinned' : 'Chat unpinned');
      setTimeout(() => {
        if (status === 'ready') {
          setStatusMessage(`Connected to ${settings?.model || 'Claude'}`);
        }
      }, 2000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  // Handle assign folder (Phase 3, Task 3.2)
  const handleAssignFolder = async (sessionId: string, folder: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/folder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign folder');
      }

      const data = await response.json();

      // Update sessions list with new folder
      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, folder: data.session.folder || undefined }
          : s
      ));

      // Update current session if needed
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, folder: data.session.folder || undefined } : null);
      }

      setStatusMessage(folder ? `Added to ${folder}` : 'Removed from folder');
      setTimeout(() => {
        if (status === 'ready') {
          setStatusMessage(`Connected to ${settings?.model || 'Claude'}`);
        }
      }, 2000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  // Handle create folder (Phase 3, Task 3.2)
  const handleCreateFolder = async (folderName: string) => {
    // The folder is created implicitly when assigning it to a session
    // Just show feedback - the actual folder creation happens in handleAssignFolder
    setStatusMessage(`Folder "${folderName}" created`);
    setTimeout(() => {
      if (status === 'ready') {
        setStatusMessage(`Connected to ${settings?.model || 'Claude'}`);
      }
    }, 2000);
  };

  // Handle toggle archive (Phase 3, Task 3.3)
  const handleToggleArchive = async (sessionId: string, archived: boolean) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update archive status');
      }

      const data = await response.json();

      // Update sessions list with new archive status
      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, archived: data.session.archived }
          : s
      ));

      // Update current session if needed
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, archived: data.session.archived } : null);
      }

      setStatusMessage(archived ? 'Chat archived' : 'Chat unarchived');
      setTimeout(() => {
        if (status === 'ready') {
          setStatusMessage(`Connected to ${settings?.model || 'Claude'}`);
        }
      }, 2000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };

  // Handle edit user message (Phase 2, Task 2.1)
  const handleEditMessage = async (messageIndex: number, newContent: string) => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/messages/${messageIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit message');
      }

      const data = await response.json();
      
      // Update messages with edited content
      setMessages(data.messages);
      
      // Update session in list
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id 
          ? { ...s, ...data.session }
          : s
      ));

      setCurrentSession(prev => prev ? { ...prev, ...data.session } : null);

      setStatusMessage('Message updated');
      setTimeout(() => {
        if (status === 'ready') {
          setStatusMessage(`Connected to ${settings?.model || 'Claude'}`);
        }
      }, 2000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  // Handle regenerate response (Phase 1, Task 1.3)
  const handleRegenerate = async (messageIndex: number) => {
    if (!currentSession || isStreaming) return;

    setRegeneratingMessageIndex(messageIndex);
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/sessions/${currentSession.id}/regenerate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to regenerate');
      }

      // Remove the message being regenerated and all after it
      const messagesToKeep = messages.slice(0, messageIndex);
      setMessages(messagesToKeep);

      // Stream the new response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let regeneratedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  regeneratedContent += data.content;
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: regeneratedContent,
                  }]);
                } else if (data.type === 'done') {
                  // Finalize the response
                  setMessages(prev => [...prev.slice(0, -1), {
                    role: 'assistant',
                    content: data.content || regeneratedContent,
                    timestamp: Date.now(),
                  }]);
                  
                  // Refresh session
                  const session = await api.getSession(currentSession.id);
                  setCurrentSession(session);
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      setStatusMessage('Response regenerated');
      setTimeout(() => {
        if (status === 'ready') {
          setStatusMessage(`Connected to ${settings?.model || 'Claude'}`);
        }
      }, 2000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setRegeneratingMessageIndex(null);
      setIsStreaming(false);
    }
  };

  // Phase 2, Task 2.4: Keyboard shortcuts hook
  const handleExport = useCallback(() => {
    // Trigger export button click
    const exportButton = document.querySelector('[title="Export chat"]') as HTMLButtonElement;
    exportButton?.click();
  }, []);

  const { shortcuts } = useKeyboardShortcuts({
    onNewChat: handleNewSession,
    onFocusInput: useCallback(() => inputRef.current?.focus(), []),
    onExport: handleExport,
    onOpenSettings: useCallback(() => setShowSettings(true), []),
    onSearch: useCallback(() => setShowSearch(true), []), // Phase 3, Task 3.1
  });

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {!showSplash && (
        <div className="h-screen flex bg-crush-base text-crush-text-primary">
          {/* Sidebar */}
          <Sidebar
            sessions={sessions}
            currentSessionId={currentSession?.id}
            onNewSession={handleNewSession}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onOpenSettings={() => setShowSettings(true)}
            onRenameSession={handleRenameSession}
            onTogglePinSession={handleTogglePinSession}
            onAssignFolder={handleAssignFolder}
            onCreateFolder={handleCreateFolder}
            onToggleArchive={handleToggleArchive}
          />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-crush-overlay flex items-center justify-between px-4 bg-crush-elevated">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-crush-secondary">Floyd</h1>
            <span className="text-sm text-crush-text-secondary">
              {currentSession?.title || 'New Chat'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search Button - Phase 3, Task 3.1 */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Search conversations (⌘K)"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
            
            {/* Export Button - Phase 2, Task 2.3 */}
            {currentSession && (
              <ExportButton 
                session={currentSession}
                messages={messages}
              />
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Status indicator */}
            <div className={cn(
              'flex items-center gap-2 text-sm px-3 py-1 rounded-full',
              status === 'ready' && 'bg-crush-ready/10 text-crush-ready',
              status === 'loading' && 'bg-crush-working/10 text-crush-working',
              status === 'no-key' && 'bg-crush-warning/10 text-crush-warning',
              status === 'error' && 'bg-crush-error/10 text-crush-error',
            )}>
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'ready' && <CheckCircle2 className="w-4 h-4" />}
              {status === 'no-key' && <AlertCircle className="w-4 h-4" />}
              {status === 'error' && <AlertCircle className="w-4 h-4" />}
              <span className="max-w-[200px] truncate">{statusMessage}</span>
            </div>
            
            <button
              onClick={() => setShowBrowork(true)}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Browork (Sub-agents)"
            >
              <img src="/browork-logo.png" alt="Browork" className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowProjects(true)}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Projects"
            >
              <FolderKanban className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSkills(true)}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Skills"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4">
              <div className="mb-4">
                <img src="/logo-128.png" alt="Floyd" className="w-16 h-16" />
              </div>
              <h2 className="text-2xl font-semibold text-crush-text-selected mb-2">Welcome to Floyd Desktop</h2>
              <p className="text-crush-text-secondary text-center mb-8">
                Your personal AI assistant with full system access. Free from API costs.
              </p>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-8">
                <button
                  onClick={() => setShowBrowork(true)}
                  className="flex items-center gap-3 p-3 bg-crush-elevated hover:bg-crush-overlay rounded-lg border border-crush-overlay transition-colors text-left"
                >
                  <img src="/browork-logo.png" alt="Browork" className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium">Browork</div>
                    <div className="text-xs text-crush-text-subtle">Spawn sub-agents</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowSkills(true)}
                  className="flex items-center gap-3 p-3 bg-crush-elevated hover:bg-crush-overlay rounded-lg border border-crush-overlay transition-colors text-left"
                >
                  <Sparkles className="w-5 h-5 text-crush-secondary" />
                  <div>
                    <div className="text-sm font-medium">Skills</div>
                    <div className="text-xs text-crush-text-subtle">Customize behavior</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowProjects(true)}
                  className="flex items-center gap-3 p-3 bg-crush-elevated hover:bg-crush-overlay rounded-lg border border-crush-overlay transition-colors text-left"
                >
                  <FolderKanban className="w-5 h-5 text-crush-info" />
                  <div>
                    <div className="text-sm font-medium">Projects</div>
                    <div className="text-xs text-crush-text-subtle">Add context files</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-3 p-3 bg-crush-elevated hover:bg-crush-overlay rounded-lg border border-crush-overlay transition-colors text-left"
                >
                  <SettingsIcon className="w-5 h-5 text-crush-text-secondary" />
                  <div>
                    <div className="text-sm font-medium">Settings</div>
                    <div className="text-xs text-crush-text-subtle">API & model config</div>
                  </div>
                </button>
              </div>

              {/* Capabilities */}
              <div className="bg-crush-elevated/50 rounded-lg p-4 w-full max-w-md border border-crush-overlay">
                <div className="text-sm font-medium text-crush-text-tertiary mb-3">What Floyd can do:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-crush-text-secondary">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-crush-ready" />
                    Read & write files
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-crush-ready" />
                    Execute commands
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-crush-ready" />
                    Run Python/Node code
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-crush-ready" />
                    Search codebase
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-crush-ready" />
                    Edit files surgically
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-crush-ready" />
                    Manage processes
                  </div>
                </div>
              </div>

              <p className="text-xs text-crush-text-subtle mt-6">
                Try: "List the files in this directory" or "What's in package.json?"
              </p>
            </div>
          )}
          
          {messages.map((message, index) => {
            const isLastAssistantMessage = message.role === 'assistant' && index === messages.length - 1;
            const isUserMessage = message.role === 'user';
            return (
              <ChatMessage 
                key={index} 
                message={message} 
                messageIndex={index}
                onRegenerate={isLastAssistantMessage ? () => handleRegenerate(index) : undefined}
                isRegenerating={regeneratingMessageIndex === index}
                onEdit={isUserMessage ? (newContent) => handleEditMessage(index, newContent) : undefined}
              />
            );
          })}
          
          {/* Tool calls */}
          {activeToolCalls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-crush-text-secondary">
                <Wrench className="w-4 h-4 text-crush-tertiary" />
                <span>Using tools...</span>
              </div>
              {activeToolCalls.map((tc) => (
                <ToolCallCard
                  key={tc.id}
                  tool={tc.tool}
                  args={tc.args}
                  result={tc.result}
                  success={tc.success}
                  isExecuting={tc.isExecuting}
                />
              ))}
            </div>
          )}
          
          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <ChatMessage 
              message={{ role: 'assistant', content: streamingContent }} 
              isStreaming 
            />
          )}
          
          {/* Loading indicator */}
          {isStreaming && !streamingContent && activeToolCalls.length === 0 && (
            <div className="flex items-center gap-2 text-crush-text-secondary">
              <Loader2 className="w-5 h-5 animate-spin text-crush-working" />
              <span>Thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-crush-overlay p-4 bg-crush-elevated">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={status === 'ready' ? 'Type a message...' : 'Configure API key in settings...'}
              disabled={status !== 'ready' || isStreaming}
              className={cn(
                'flex-1 bg-crush-base border border-crush-overlay rounded-lg px-4 py-3 text-crush-text-primary',
                'resize-none focus:outline-none focus:ring-2 focus:ring-crush-primary',
                'placeholder:text-crush-text-subtle disabled:opacity-50',
              )}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || status !== 'ready' || isStreaming}
              className={cn(
                'px-4 py-2 bg-crush-primary rounded-lg transition-colors',
                'hover:bg-crush-grape disabled:opacity-50 disabled:cursor-not-allowed text-crush-text-inverse',
              )}
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSettingsSave}
      />
      
      {/* Skills Panel */}
      <SkillsPanel
        isOpen={showSkills}
        onClose={() => setShowSkills(false)}
      />
      
      {/* Projects Panel */}
      <ProjectsPanel
        isOpen={showProjects}
        onClose={() => setShowProjects(false)}
      />
      
      {/* Browork Panel */}
      <BroworkPanel
        isOpen={showBrowork}
        onClose={() => setShowBrowork(false)}
      />

      {/* Phase 2, Task 2.4: Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />
      
      {/* Phase 3, Task 3.1: Search Bar */}
      {showSearch && (
        <SearchBar
          sessions={sessions}
          onSelectSession={handleSelectSession}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
      )}
    </>
  );
}
