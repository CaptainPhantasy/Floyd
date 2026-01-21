/**
 * ArchiveButton Component - Phase 3, Task 3.3
 * Archive conversations to hide from main list
 */

import { useState } from 'react';
import { Archive, ArchiveRestore, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArchiveButtonProps {
  isArchived: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
}

export function ArchiveButton({
  isArchived,
  onArchive,
  onUnarchive,
}: ArchiveButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (isArchived) {
    return (
      <button
        onClick={onUnarchive}
        className={cn(
          'p-1.5 hover:bg-crush-overlay rounded transition-colors',
          'text-crush-warning hover:text-crush-text-primary'
        )}
        title="Unarchive chat"
      >
        <ArchiveRestore className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(!showConfirm)}
        className={cn(
          'p-1.5 hover:bg-crush-overlay rounded transition-colors',
          'text-crush-text-secondary hover:text-crush-text-primary'
        )}
        title="Archive chat"
      >
        <Archive className="w-4 h-4" />
      </button>

      {showConfirm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowConfirm(false)}
          />

          {/* Confirmation Popover */}
          <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-crush-elevated rounded-lg shadow-lg border border-crush-overlay p-3">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-crush-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-crush-text-primary">
                  Archive this chat?
                </div>
                <div className="text-xs text-crush-text-subtle mt-1">
                  Archived chats are hidden from the main list but can be accessed later.
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onArchive();
                  setShowConfirm(false);
                }}
                className="flex-1 px-3 py-1.5 bg-crush-warning hover:bg-crush-warning/80 text-sm font-medium rounded transition-colors"
              >
                Archive
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-3 py-1.5 bg-crush-overlay hover:bg-crush-base text-sm text-crush-text-primary rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
