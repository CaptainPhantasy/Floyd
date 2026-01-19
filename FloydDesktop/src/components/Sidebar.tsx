/**
 * FloydDesktop - Sidebar Component
 */

import { useState } from 'react';
import { cn } from '../lib/utils';
import type { SessionData } from '../types';

interface SidebarProps {
  sessions: SessionData[];
  currentSessionId?: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClose,
}: SidebarProps) {
  return (
    <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="font-semibold">Sessions</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium transition-colors"
        >
          New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onClick={() => onSelectSession(session.id)}
            onDelete={() => onDeleteSession(session.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: SessionData;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SessionItem({ session, isActive, onClick, onDelete }: SessionItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={cn(
        'group relative rounded-lg px-3 py-2 cursor-pointer transition-colors',
        isActive
          ? 'bg-slate-700'
          : 'hover:bg-slate-700/50'
      )}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="text-sm font-medium truncate">
        {session.title}
      </div>
      <div className="text-xs text-slate-400 mt-1">
        {new Date(session.updated).toLocaleDateString()}
      </div>

      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete session"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
