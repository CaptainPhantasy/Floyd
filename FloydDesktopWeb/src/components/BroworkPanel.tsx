/**
 * Browork Panel - Sub-agent delegation interface
 * Like Claude Cowork - spawn autonomous agents to work on tasks
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Plus, 
  Play, 
  Square, 
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Terminal,
  Brain,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface AgentLog {
  timestamp: number;
  type: 'info' | 'tool' | 'thinking' | 'error';
  message: string;
}

interface AgentToolCall {
  tool: string;
  args: Record<string, unknown>;
  result?: any;
  timestamp: number;
}

interface AgentTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  created: number;
  started?: number;
  completed?: number;
  result?: string;
  error?: string;
  logs: AgentLog[];
  toolCalls: AgentToolCall[];
}

interface BroworkPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BroworkPanel({ isOpen, onClose }: BroworkPanelProps) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ name: '', description: '' });
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
      // Poll for updates every 2 seconds when panel is open
      pollRef.current = setInterval(loadTasks, 2000);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [isOpen]);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/browork/tasks');
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const createTask = async () => {
    if (!newTask.name || !newTask.description) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/browork/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const task = await res.json();
      
      // Auto-start the task
      await fetch(`/api/browork/tasks/${task.id}/start`, { method: 'POST' });
      
      setNewTask({ name: '', description: '' });
      setShowCreateForm(false);
      await loadTasks();
    } catch (err: any) {
      console.error('Failed to create task:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelTask = async (taskId: string) => {
    await fetch(`/api/browork/tasks/${taskId}/cancel`, { method: 'POST' });
    await loadTasks();
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/browork/tasks/${taskId}`, { method: 'DELETE' });
    await loadTasks();
  };

  const clearFinished = async () => {
    await fetch('/api/browork/clear', { method: 'POST' });
    await loadTasks();
  };

  const getStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-crush-text-secondary" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-crush-info animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-crush-ready" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-crush-error" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-crush-warning" />;
    }
  };

  const getStatusColor = (status: AgentTask['status']) => {
    switch (status) {
      case 'pending': return 'border-crush-modal';
      case 'running': return 'border-crush-info/50 bg-crush-info/5';
      case 'completed': return 'border-crush-ready/50 bg-crush-ready/5';
      case 'failed': return 'border-crush-error/50 bg-crush-error/5';
      case 'cancelled': return 'border-crush-warning/50 bg-crush-warning/5';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  if (!isOpen) return null;

  const runningTasks = tasks.filter(t => t.status === 'running');
  const finishedTasks = tasks.filter(t => ['completed', 'failed', 'cancelled'].includes(t.status));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-[600px] bg-crush-elevated h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-crush-overlay flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/browork-logo.png" alt="Browork" className="w-5 h-5" />
            <h2 className="font-semibold">Browork</h2>
            <span className="text-xs text-crush-text-secondary">Sub-Agent System</span>
            {runningTasks.length > 0 && (
              <span className="text-xs bg-crush-info/20 text-crush-info px-2 py-0.5 rounded-full animate-pulse">
                {runningTasks.length} running
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-crush-text-secondary hover:text-crush-text-selected">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Intro */}
          <div className="bg-gradient-to-r from-crush-tertiary/10 to-crush-secondary/10 border border-crush-tertiary/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-crush-tertiary mt-0.5" />
              <div>
                <div className="font-medium text-crush-tertiary">Delegate tasks to autonomous agents</div>
                <div className="text-sm text-crush-text-secondary mt-1">
                  Browork spawns sub-agents that work independently on tasks. 
                  Each agent can use tools, execute code, and manage files.
                </div>
              </div>
            </div>
          </div>

          {/* Create task form */}
          {showCreateForm ? (
            <div className="bg-crush-modal/50 rounded-lg border border-crush-modal p-4 space-y-3">
              <div className="font-medium text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-crush-tertiary" />
                Create New Agent Task
              </div>
              
              <input
                placeholder="Task name (e.g., 'Refactor auth module')"
                value={newTask.name}
                onChange={(e) => setNewTask(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-crush-elevated border border-crush-modal rounded px-3 py-2 text-sm"
              />
              
              <textarea
                placeholder="Detailed description of what the agent should do..."
                value={newTask.description}
                onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-crush-elevated border border-crush-modal rounded px-3 py-2 text-sm h-24 resize-none"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={createTask}
                  disabled={!newTask.name || !newTask.description || loading}
                  className="px-4 py-2 bg-crush-tertiary text-sm rounded hover:bg-crush-julep disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Create & Start
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-crush-overlay text-sm rounded hover:bg-crush-modal"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full py-3 border border-dashed border-crush-tertiary/50 rounded-lg text-sm text-crush-tertiary hover:border-crush-tertiary hover:bg-crush-tertiary/5 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Agent Task
            </button>
          )}

          {/* Tasks list */}
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {finishedTasks.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFinished}
                    className="text-xs text-crush-text-secondary hover:text-crush-text-selected flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear finished
                  </button>
                </div>
              )}
              
              {tasks.map(task => (
                <div 
                  key={task.id}
                  className={cn(
                    'rounded-lg border transition-colors',
                    getStatusColor(task.status)
                  )}
                >
                  {/* Task header */}
                  <div 
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    {getStatusIcon(task.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="text-xs text-crush-text-secondary truncate">
                        {task.description}
                      </div>
                    </div>

                    {task.status === 'running' && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-crush-modal rounded-full overflow-hidden">
                          <div
                            className="h-full bg-crush-info transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-crush-text-secondary">{task.progress}%</span>
                      </div>
                    )}

                    {task.status === 'running' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelTask(task.id);
                        }}
                        className="p-1 hover:bg-crush-overlay rounded"
                        title="Cancel"
                      >
                        <Square className="w-4 h-4 text-crush-warning" />
                      </button>
                    )}

                    {['completed', 'failed', 'cancelled'].includes(task.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="p-1 hover:bg-crush-overlay rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-crush-text-secondary" />
                      </button>
                    )}

                    {expandedTask === task.id ? (
                      <ChevronDown className="w-4 h-4 text-crush-text-secondary" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-crush-text-secondary" />
                    )}
                  </div>

                  {/* Expanded details */}
                  {expandedTask === task.id && (
                    <div className="border-t border-crush-overlay p-3 space-y-3">
                      {/* Timing */}
                      <div className="flex gap-4 text-xs text-crush-text-secondary">
                        <span>Created: {new Date(task.created).toLocaleTimeString()}</span>
                        {task.started && (
                          <span>Runtime: {formatTime(
                            (task.completed || Date.now()) - task.started
                          )}</span>
                        )}
                        {task.toolCalls.length > 0 && (
                          <span>Tool calls: {task.toolCalls.length}</span>
                        )}
                      </div>

                      {/* Result or Error */}
                      {task.result && (
                        <div className="bg-crush-ready/10 border border-crush-ready/30 rounded p-2">
                          <div className="text-xs text-crush-ready font-medium mb-1">Result</div>
                          <div className="text-sm text-crush-text-tertiary whitespace-pre-wrap">
                            {task.result.slice(0, 500)}
                            {task.result.length > 500 && '...'}
                          </div>
                        </div>
                      )}

                      {task.error && (
                        <div className="bg-crush-error/10 border border-crush-error/30 rounded p-2">
                          <div className="text-xs text-crush-error font-medium mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Error
                          </div>
                          <div className="text-sm text-crush-text-tertiary">{task.error}</div>
                        </div>
                      )}

                      {/* Logs */}
                      {task.logs.length > 0 && (
                        <div>
                          <div className="text-xs text-crush-text-subtle font-medium mb-2 flex items-center gap-1">
                            <Terminal className="w-3 h-3" />
                            Activity Log
                          </div>
                          <div className="bg-crush-base rounded p-2 max-h-48 overflow-y-auto space-y-1">
                            {task.logs.slice(-20).map((log, i) => (
                              <div 
                                key={i}
                                className={cn(
                                  'text-xs font-mono',
                                  log.type === 'error' && 'text-crush-error',
                                  log.type === 'tool' && 'text-crush-tertiary',
                                  log.type === 'thinking' && 'text-crush-text-secondary',
                                  log.type === 'info' && 'text-crush-ready',
                                )}
                              >
                                <span className="text-crush-text-subtle">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                {' '}
                                {log.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-crush-text-subtle">
              <img src="/browork-logo.png" alt="Browork" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div>No agent tasks yet</div>
              <div className="text-sm">Create a task to spawn an autonomous agent</div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-crush-modal/30 rounded-lg p-3">
            <div className="text-xs font-medium text-crush-text-secondary mb-2">Example tasks:</div>
            <ul className="text-xs text-crush-text-subtle space-y-1">
              <li>• "Analyze the codebase and create a README.md"</li>
              <li>• "Find all TODO comments and list them"</li>
              <li>• "Refactor the auth module to use async/await"</li>
              <li>• "Run tests and fix any failing ones"</li>
              <li>• "Search for security vulnerabilities in the API"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
