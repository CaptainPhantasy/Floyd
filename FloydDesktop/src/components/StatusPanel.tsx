/**
 * FloydDesktop - Status Panel Component
 */

import { cn } from '../lib/utils';
import type { AgentStatus } from '../types';

interface StatusPanelProps {
  status: AgentStatus | null;
}

export function StatusPanel({ status }: StatusPanelProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            status?.connected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-sm text-slate-400">
          {status?.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Processing Status */}
      {status?.isProcessing && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-sm text-slate-400">Processing</span>
        </div>
      )}

      {/* Model */}
      {status?.model && (
        <div className="text-sm text-slate-400">
          {status.model}
        </div>
      )}
    </div>
  );
}
