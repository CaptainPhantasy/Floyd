/**
 * Tool Call Card - Displays tool execution in chat
 */

import { cn } from '@/lib/utils';
import {
  FileText,
  Folder,
  Terminal,
  Search,
  Trash2,
  Move,
  FolderPlus,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

interface ToolCallCardProps {
  tool: string;
  args: Record<string, unknown>;
  result?: any;
  success?: boolean;
  isExecuting?: boolean;
}

const TOOL_ICONS: Record<string, any> = {
  read_file: FileText,
  write_file: FileText,
  list_directory: Folder,
  search_files: Search,
  execute_command: Terminal,
  create_directory: FolderPlus,
  delete_file: Trash2,
  move_file: Move,
};

const TOOL_LABELS: Record<string, string> = {
  read_file: 'Reading file',
  write_file: 'Writing file',
  list_directory: 'Listing directory',
  search_files: 'Searching files',
  execute_command: 'Executing command',
  create_directory: 'Creating directory',
  delete_file: 'Deleting',
  move_file: 'Moving file',
};

export function ToolCallCard({ tool, args, result, success, isExecuting }: ToolCallCardProps) {
  const Icon = TOOL_ICONS[tool] || Terminal;
  const label = TOOL_LABELS[tool] || tool;

  // Get primary argument to display
  const primaryArg = args.path || args.command || args.source || Object.values(args)[0];

  return (
    <div className={cn(
      'rounded-lg border p-3 my-2',
      'bg-crush-elevated/50 border-crush-overlay',
      success === true && 'border-crush-ready/50',
      success === false && 'border-crush-error/50',
    )}>
      <div className="flex items-center gap-2">
        <div className={cn(
          'p-1.5 rounded',
          isExecuting && 'bg-crush-working/20 text-crush-working',
          success === true && 'bg-crush-ready/20 text-crush-ready',
          success === false && 'bg-crush-error/20 text-crush-error',
          success === undefined && !isExecuting && 'bg-crush-modal text-crush-text-secondary',
        )}>
          {isExecuting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success === true ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : success === false ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-crush-text-tertiary">
            {label}
          </div>
          <div className="text-xs text-crush-text-secondary truncate">
            {typeof primaryArg === 'string' ? primaryArg : JSON.stringify(primaryArg)}
          </div>
        </div>
      </div>

      {/* Show result if available */}
      {result && !isExecuting && (
        <div className="mt-2 pt-2 border-t border-crush-overlay">
          <pre className={cn(
            'text-xs overflow-x-auto max-h-32 overflow-y-auto',
            'p-2 rounded bg-crush-base',
            success === false && 'text-crush-error',
            success === true && 'text-crush-text-primary',
          )}>
            {typeof result === 'string'
              ? result.slice(0, 500)
              : JSON.stringify(result, null, 2).slice(0, 500)}
            {(typeof result === 'string' ? result.length : JSON.stringify(result).length) > 500 && '...'}
          </pre>
        </div>
      )}
    </div>
  );
}
