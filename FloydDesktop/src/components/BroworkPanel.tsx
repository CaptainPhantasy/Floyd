/**
 * FloydDesktop - Browork Panel Component
 * 
 * Sub-agent task management and delegation
 */

import { useState, useEffect } from 'react';
import type { SubAgent } from '../types';
import { Users, Plus, X, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

interface BroworkPanelProps {
  // Props kept for future use if needed
}

export function BroworkPanel({}: BroworkPanelProps) {
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [showSpawnDialog, setShowSpawnDialog] = useState(false);
  const [spawnType, setSpawnType] = useState<SubAgent['type']>('research');
  const [spawnTask, setSpawnTask] = useState('');

  useEffect(() => {
    loadSubAgents();
    const interval = setInterval(loadSubAgents, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSubAgents = async () => {
    if (!window.floydAPI?.listSubAgents) return;

    try {
      const result = await window.floydAPI.listSubAgents();
      if (result.success && result.subAgents) {
        setSubAgents(result.subAgents as SubAgent[]);
      }
    } catch (error) {
      console.error('Failed to load sub-agents:', error);
    }
  };

  const handleSpawn = async () => {
    if (!spawnTask.trim() || !window.floydAPI?.spawnSubAgent) return;

    try {
      const result = await window.floydAPI.spawnSubAgent(spawnType, spawnTask.trim());
      if (result.success) {
        setSpawnTask('');
        setShowSpawnDialog(false);
        await loadSubAgents();
      }
    } catch (error) {
      console.error('Failed to spawn sub-agent:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.floydAPI?.cancelSubAgent) return;

    try {
      await window.floydAPI.cancelSubAgent(id);
      await loadSubAgents();
    } catch (error) {
      console.error('Failed to cancel sub-agent:', error);
    }
  };

  const getStatusIcon = (status: SubAgent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader className="w-4 h-4 text-sky-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTypeLabel = (type: SubAgent['type']) => {
    switch (type) {
      case 'research':
        return 'Research';
      case 'code':
        return 'Code';
      case 'review':
        return 'Review';
      case 'test':
        return 'Test';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold">Browork</h3>
          </div>
          <button
            onClick={() => setShowSpawnDialog(true)}
            className="p-1 hover:bg-slate-700 rounded"
            aria-label="Spawn sub-agent"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spawn Dialog */}
      {showSpawnDialog && (
        <div className="p-3 border-b border-slate-700 space-y-2">
          <div className="text-xs text-slate-400 mb-2">Spawn Sub-Agent</div>
          <select
            value={spawnType}
            onChange={(e) => setSpawnType(e.target.value as SubAgent['type'])}
            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="research">Research</option>
            <option value="code">Code</option>
            <option value="review">Review</option>
            <option value="test">Test</option>
          </select>
          <textarea
            value={spawnTask}
            onChange={(e) => setSpawnTask(e.target.value)}
            placeholder="Enter task description..."
            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSpawn}
              disabled={!spawnTask.trim()}
              className="flex-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-xs transition-colors"
            >
              Spawn
            </button>
            <button
              onClick={() => {
                setShowSpawnDialog(false);
                setSpawnTask('');
              }}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sub-Agents List */}
      <div className="flex-1 overflow-y-auto p-3">
        {subAgents.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-slate-400">No active sub-agents</p>
            <p className="text-xs text-slate-500 mt-1">
              Spawn a sub-agent to delegate tasks
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {subAgents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 bg-slate-700/50 rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(agent.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {getTypeLabel(agent.type)}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {agent.task}
                      </div>
                    </div>
                  </div>
                  {(agent.status === 'pending' || agent.status === 'running') && (
                    <button
                      onClick={() => handleCancel(agent.id)}
                      className="p-1 hover:bg-red-600 rounded"
                      aria-label="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Progress */}
                {agent.status === 'running' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-300">{agent.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 transition-all"
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Output Preview */}
                {agent.output && (
                  <div className="text-xs text-slate-400 line-clamp-2">
                    {agent.output}
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-slate-500">
                  Started {new Date(agent.startedAt).toLocaleTimeString()}
                  {agent.completedAt &&
                    ` • Completed ${new Date(agent.completedAt).toLocaleTimeString()}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
