/**
 * ConversationBranch Component - Phase 6, Task 6.1
 * Create and manage conversation branches
 */

import { useState } from 'react';
import { GitBranch, Plus, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Branch {
  id: string;
  name: string;
  createdAt: number;
  messageCount: number;
  isMain: boolean;
}

interface ConversationBranchProps {
  branches: Branch[];
  currentBranchId: string;
  onBranchSelect: (branchId: string) => void;
  onBranchCreate: (fromMessageIndex: number) => void;
  onBranchDelete?: (branchId: string) => void;
}

export function ConversationBranch({
  branches,
  currentBranchId,
  onBranchSelect,
  onBranchCreate,
  onBranchDelete,
}: ConversationBranchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const currentBranch = branches.find(b => b.id === currentBranchId);
  const branchCount = branches.length;

  return (
    <div className="relative">
      {/* Branch Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5',
          'bg-crush-elevated hover:bg-crush-overlay',
          'border border-crush-overlay rounded-lg',
          'text-sm text-crush-text-primary',
          'transition-colors'
        )}
      >
        <GitBranch className="w-4 h-4 text-crush-secondary" />
        <span className="font-medium">
          {currentBranch?.name || 'Main Branch'}
        </span>
        {branchCount > 1 && (
          <span className="text-xs bg-crush-secondary/20 text-crush-secondary px-1.5 rounded">
            {branchCount}
          </span>
        )}
        <ChevronDown className={cn(
          'w-4 h-4 text-crush-text-subtle transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Branch Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 z-20 w-72 bg-crush-elevated rounded-lg shadow-lg border border-crush-overlay overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-crush-overlay bg-crush-base">
              <div className="text-xs font-medium text-crush-text-tertiary">
                Conversation Branches
              </div>
            </div>

            {/* Branch List */}
            <div className="max-h-64 overflow-y-auto">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-crush-overlay transition-colors cursor-pointer"
                  onClick={() => {
                    onBranchSelect(branch.id);
                    setIsOpen(false);
                  }}
                >
                  <GitBranch className={cn(
                    'w-4 h-4 flex-shrink-0',
                    branch.isMain ? 'text-crush-info' : 'text-crush-text-secondary'
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-crush-text-primary truncate">
                        {branch.name}
                      </span>
                      {branch.isMain && (
                        <span className="text-xs bg-crush-info/20 text-crush-info px-1.5 rounded">
                          Main
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-crush-text-subtle mt-0.5">
                      {branch.messageCount} messages · {new Date(branch.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {branch.id === currentBranchId && (
                    <Check className="w-4 h-4 text-crush-ready flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-crush-overlay p-2">
              {!showCreateMenu ? (
                <button
                  onClick={() => setShowCreateMenu(true)}
                  className="w-full px-3 py-2 hover:bg-crush-overlay rounded transition-colors text-left"
                >
                  <div className="flex items-center gap-2 text-sm text-crush-secondary">
                    <Plus className="w-4 h-4" />
                    <span>Create new branch</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-crush-text-subtle px-3 py-1">
                    Create branch from message:
                  </div>
                  
                  {/* Message indices for branching */}
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {[1, 2, 3, 5, 10].map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          onBranchCreate(count);
                          setShowCreateMenu(false);
                          setIsOpen(false);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-crush-overlay rounded transition-colors text-left text-sm text-crush-text-primary"
                      >
                        Last {count} message{count !== 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowCreateMenu(false)}
                    className="w-full px-3 py-1.5 hover:bg-crush-overlay rounded transition-colors text-left text-sm text-crush-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface BranchIndicatorProps {
  branchCount: number;
  currentBranchName: string;
  onBranchClick: () => void;
}

export function BranchIndicator({
  branchCount,
  currentBranchName,
  onBranchClick,
}: BranchIndicatorProps) {
  return (
    <button
      onClick={onBranchClick}
      className="flex items-center gap-2 px-2 py-1 bg-crush-elevated hover:bg-crush-overlay border border-crush-overlay rounded text-xs text-crush-text-secondary transition-colors"
    >
      <GitBranch className="w-3 h-3" />
      <span>{currentBranchName}</span>
      {branchCount > 1 && (
        <span className="bg-crush-secondary/20 text-crush-secondary px-1 rounded">
          {branchCount}
        </span>
      )}
    </button>
  );
}
