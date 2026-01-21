/**
 * Sidebar Component
 */

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Session } from '@/types';
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react';
import { EditableTitle } from './EditableTitle';
import { PinButton } from './PinButton';
import { FolderButton } from './FolderButton';
import { ArchiveButton } from './ArchiveButton';

interface SidebarProps {
  sessions: Session[];
  currentSessionId?: string;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  onRenameSession?: (id: string, newTitle: string) => Promise<void>;  // Phase 1, Task 1.1
  onTogglePinSession?: (id: string, pinned: boolean) => Promise<void>; // Phase 1, Task 1.4
  onAssignFolder?: (id: string, folder: string) => Promise<void>;      // Phase 3, Task 3.2
  onCreateFolder?: (folderName: string) => Promise<void>;              // Phase 3, Task 3.2
  onToggleArchive?: (id: string, archived: boolean) => Promise<void>;  // Phase 3, Task 3.3
}

export function Sidebar({
  sessions,
  currentSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onRenameSession,
  onTogglePinSession,
  onAssignFolder,
  onCreateFolder,
  onToggleArchive,
}: SidebarProps) {
  // Get list of available folders from all sessions
  const availableFolders = useMemo(() => {
    const folders = new Set<string>();
    sessions.forEach(session => {
      if (session.folder) {
        folders.add(session.folder);
      }
    });
    return Array.from(folders).sort();
  }, [sessions]);

  // Sort sessions: pinned first (by updated time), then unpinned (by updated time)
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updated - a.updated;
  });

  const pinnedSessions = sortedSessions.filter(s => s.pinned);
  const unpinnedSessions = sortedSessions.filter(s => !s.pinned);

  return (
    <div className="w-64 bg-crush-elevated border-r border-crush-overlay flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-crush-overlay">
        <button
          onClick={onNewSession}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2',
            'bg-crush-primary hover:bg-crush-grape rounded-lg transition-colors',
            'text-sm font-medium text-crush-text-inverse',
          )}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="text-sm text-crush-text-subtle text-center py-4">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {/* Pinned Section */}
            {pinnedSessions.length > 0 && (
              <>
                {pinnedSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer',
                      'hover:bg-crush-overlay transition-colors',
                      currentSessionId === session.id && 'bg-crush-overlay',
                    )}
                  >
                    <MessageSquare className="w-4 h-4 text-crush-info flex-shrink-0" fill="currentColor" />

                    {/* Phase 1, Task 1.1: Editable Title */}
                    {onRenameSession ? (
                      <EditableTitle
                        title={session.title}
                        customTitle={session.customTitle}
                        onSave={(newTitle) => onRenameSession(session.id, newTitle)}
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1 text-sm truncate text-crush-text-primary">
                        {session.title}
                      </span>
                    )}

                    {/* Phase 3, Task 3.2: Folder Button */}
                    {onAssignFolder && onCreateFolder && (
                      <FolderButton
                        currentFolder={session.folder}
                        availableFolders={availableFolders}
                        onAssignFolder={(folder) => onAssignFolder(session.id, folder)}
                        onCreateFolder={onCreateFolder}
                      />
                    )}

                    {/* Phase 3, Task 3.3: Archive Button */}
                    {onToggleArchive && (
                      <ArchiveButton
                        isArchived={session.archived || false}
                        onArchive={() => onToggleArchive(session.id, true)}
                        onUnarchive={() => onToggleArchive(session.id, false)}
                      />
                    )}

                    {/* Phase 1, Task 1.4: Pin Button */}
                    {onTogglePinSession && (
                      <PinButton
                        pinned={session.pinned || false}
                        onToggle={() => onTogglePinSession(session.id, !(session.pinned || false))}
                      />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className={cn(
                        'p-1 rounded opacity-0 group-hover:opacity-100',
                        'hover:bg-crush-modal transition-all',
                      )}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-crush-text-secondary hover:text-crush-error" />
                    </button>
                  </div>
                ))}
                
                {/* Separator */}
                {unpinnedSessions.length > 0 && (
                  <div className="my-2 border-t border-crush-overlay relative">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-crush-elevated px-2 text-xs text-crush-text-subtle">
                      {pinnedSessions.length} pinned
                    </span>
                  </div>
                )}
              </>
            )}
            
            {/* Unpinned Section */}
            {unpinnedSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer',
                  'hover:bg-crush-overlay transition-colors',
                  currentSessionId === session.id && 'bg-crush-overlay',
                )}
              >
                <MessageSquare className="w-4 h-4 text-crush-text-secondary flex-shrink-0" />

                {/* Phase 1, Task 1.1: Editable Title */}
                {onRenameSession ? (
                  <EditableTitle
                    title={session.title}
                    customTitle={session.customTitle}
                    onSave={(newTitle) => onRenameSession(session.id, newTitle)}
                    className="flex-1"
                  />
                ) : (
                  <span className="flex-1 text-sm truncate text-crush-text-primary">
                    {session.title}
                  </span>
                )}

                {/* Phase 3, Task 3.2: Folder Button */}
                {onAssignFolder && onCreateFolder && (
                  <FolderButton
                    currentFolder={session.folder}
                    availableFolders={availableFolders}
                    onAssignFolder={(folder) => onAssignFolder(session.id, folder)}
                    onCreateFolder={onCreateFolder}
                  />
                )}

                {/* Phase 3, Task 3.3: Archive Button */}
                {onToggleArchive && (
                  <ArchiveButton
                    isArchived={session.archived || false}
                    onArchive={() => onToggleArchive(session.id, true)}
                    onUnarchive={() => onToggleArchive(session.id, false)}
                  />
                )}

                {/* Phase 1, Task 1.4: Pin Button */}
                {onTogglePinSession && (
                  <PinButton
                    pinned={session.pinned || false}
                    onToggle={() => onTogglePinSession(session.id, !(session.pinned || false))}
                  />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className={cn(
                    'p-1 rounded opacity-0 group-hover:opacity-100',
                    'hover:bg-cr-modal transition-all',
                  )}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-crush-text-secondary hover:text-crush-error" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-crush-overlay">
        <button
          onClick={onOpenSettings}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2',
            'hover:bg-crush-overlay rounded-lg transition-colors',
            'text-sm text-crush-text-secondary',
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
