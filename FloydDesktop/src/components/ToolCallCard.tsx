/**
 * FloydDesktop - Tool Call Card Component
 */

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';
import type { ToolCall } from '../types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = !toolCall.output;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-left"
        aria-expanded={expanded}
      >
        <svg
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform',
            expanded && 'rotate-90'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        {isRunning ? (
          <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-green-500" />
        )}

        <span className="font-medium text-sky-400">{toolCall.name}</span>

        <span className="text-sm text-slate-400 ml-auto">
          {isRunning ? 'Running...' : 'Completed'}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {/* Input */}
          <div>
            <div className="text-xs text-slate-400 uppercase mb-2">Input</div>
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: '8px', fontSize: '13px' }}
            >
              {JSON.stringify(toolCall.input, null, 2)}
            </SyntaxHighlighter>
          </div>

          {/* Output */}
          {toolCall.output && (
            <div>
              <div className="text-xs text-slate-400 uppercase mb-2">Output</div>
              <div className="bg-slate-900 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                {toolCall.output}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
