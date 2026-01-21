/**
 * FolderButton Component - Phase 3, Task 3.2
 * Add conversations to folders
 */

import { useState } from 'react';
import { Folder, FolderOpen, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderButtonProps {
  currentFolder?: string;
  availableFolders: string[];
  onAssignFolder: (folder: string) => void;
  onCreateFolder: (folderName: string) => void;
}

export function FolderButton({
  currentFolder,
  availableFolders = [],
  onAssignFolder,
  onCreateFolder,
}: FolderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-1.5 hover:bg-crush-overlay rounded transition-colors',
          'text-crush-text-secondary hover:text-crush-text-primary',
          currentFolder && 'text-crush-info'
        )}
        title={currentFolder ? `Folder: ${currentFolder}` : 'Add to folder'}
      >
        {currentFolder ? (
          <FolderOpen className="w-4 h-4" />
        ) : (
          <Folder className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-crush-elevated rounded-lg shadow-lg border border-crush-overlay overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-crush-overlay">
              <div className="text-xs font-medium text-crush-text-tertiary">
                Add to Folder
              </div>
            </div>

            {/* Current Folder */}
            {currentFolder && (
              <div className="px-3 py-2 bg-crush-info/10 border-b border-crush-overlay">
                <div className="flex items-center gap-2 text-sm text-crush-info">
                  <FolderOpen className="w-4 h-4" />
                  <span className="font-medium">{currentFolder}</span>
                  <Check className="w-4 h-4 ml-auto" />
                </div>
              </div>
            )}

            {/* Folder List */}
            <div className="max-h-48 overflow-y-auto">
              {availableFolders.length === 0 && !currentFolder && (
                <div className="px-3 py-4 text-sm text-crush-text-subtle text-center">
                  No folders yet
                </div>
              )}

              {availableFolders
                .filter(folder => folder !== currentFolder)
                .map((folder) => (
                  <button
                    key={folder}
                    onClick={() => {
                      onAssignFolder(folder);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-crush-overlay transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 text-sm text-crush-text-primary">
                      <Folder className="w-4 h-4 text-crush-text-secondary" />
                      <span>{folder}</span>
                    </div>
                  </button>
                ))}
            </div>

            {/* Create New Folder */}
            <div className="border-t border-crush-overlay p-2">
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full px-3 py-2 hover:bg-crush-overlay rounded transition-colors text-left"
                >
                  <div className="flex items-center gap-2 text-sm text-crush-secondary">
                    <Plus className="w-4 h-4" />
                    <span>Create new folder</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFolder();
                      } else if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewFolderName('');
                      }
                    }}
                    placeholder="Folder name..."
                    className="w-full px-3 py-1.5 bg-crush-base border border-crush-overlay rounded text-sm text-crush-text-primary placeholder-crush-text-subtle focus:outline-none focus:ring-2 focus:ring-crush-primary"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                      className="flex-1 px-3 py-1.5 bg-crush-primary hover:bg-crush-grape text-crush-text-inverse text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewFolderName('');
                      }}
                      className="flex-1 px-3 py-1.5 bg-crush-overlay hover:bg-crush-base text-sm text-crush-text-primary rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Remove from Folder */}
            {currentFolder && (
              <div className="border-t border-crush-overlay p-2">
                <button
                  onClick={() => {
                    onAssignFolder('');
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-crush-error/10 rounded transition-colors text-left"
                >
                  <div className="text-sm text-crush-error">
                    Remove from folder
                  </div>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
