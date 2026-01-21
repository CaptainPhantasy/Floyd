/**
 * SearchBar Component - Phase 3, Task 3.1
 * Search through all conversations by content
 */

import { useState, useCallback, useEffect } from 'react';
import { Search, X, Clock, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Session } from '@/types';

interface SearchResult {
  session: Session;
  matchedMessages: Array<{
    index: number;
    content: string;
    timestamp: number;
  }>;
  matchCount: number;
}

interface SearchBarProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  onClose: () => void;
}

export function SearchBar({ sessions, onSelectSession, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search through sessions
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchLower = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    sessions.forEach(session => {
      const matchedMessages: Array<{
        index: number;
        content: string;
        timestamp: number;
      }> = [];

      // Search in session title
      const titleMatch = session.title?.toLowerCase().includes(searchLower) || 
                         session.customTitle?.toLowerCase().includes(searchLower);

      // Search in messages
      session.messages?.forEach((msg, idx) => {
        if (msg.content?.toLowerCase().includes(searchLower)) {
          matchedMessages.push({
            index: idx,
            content: msg.content,
            timestamp: msg.timestamp || Date.now(),
          });
        }
      });

      // Include session if title matches or has message matches
      if (titleMatch || matchedMessages.length > 0) {
        searchResults.push({
          session,
          matchedMessages,
          matchCount: matchedMessages.length + (titleMatch ? 1 : 0),
        });
      }
    });

    // Sort by match count and recency
    searchResults.sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.session.updatedAt - a.session.updatedAt;
    });

    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, sessions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev === 0 ? results.length - 1 : prev - 1);
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        onSelectSession(results[selectedIndex].session.id);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onSelectSession, onClose]);

  const highlightMatch = (content: string, query: string) => {
    if (!query.trim()) return content;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = content.split(regex);

    return parts.map((part, idx) => 
      regex.test(part) ? (
        <mark key={idx} className="bg-crush-secondary/20 text-crush-secondary rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50">
      <div className="w-full max-w-2xl mx-4 bg-crush-elevated rounded-xl shadow-2xl border border-crush-overlay overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-crush-overlay">
          <Search className="w-5 h-5 text-crush-text-secondary flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent border-none outline-none text-crush-text-primary placeholder-crush-text-subtle"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-crush-overlay rounded transition-colors"
            >
              <X className="w-4 h-4 text-crush-text-secondary" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="p-8 text-center text-crush-text-secondary">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations found</p>
              <p className="text-sm text-crush-text-subtle mt-1">Try a different search term</p>
            </div>
          )}

          {!query && (
            <div className="p-8 text-center text-crush-text-secondary">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Search your conversations</p>
              <p className="text-sm text-crush-text-subtle mt-1">
                Type to search through chat content
              </p>
            </div>
          )}

          {results.map((result, idx) => (
            <div
              key={result.session.id}
              onClick={() => {
                onSelectSession(result.session.id);
                onClose();
              }}
              className={cn(
                'p-4 border-b border-crush-overlay cursor-pointer transition-colors',
                'hover:bg-crush-overlay',
                idx === selectedIndex && 'bg-crush-overlay'
              )}
            >
              {/* Session Header */}
              <div className="flex items-start gap-3 mb-2">
                <FolderOpen className="w-4 h-4 text-crush-secondary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-crush-text-primary truncate">
                      {result.session.customTitle || result.session.title}
                    </h3>
                    {result.session.pinned && (
                      <span className="text-crush-warning text-xs">📌</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-crush-text-subtle mt-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(result.session.updatedAt)}
                    <span>•</span>
                    <span>{result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Matched Messages */}
              {result.matchedMessages.length > 0 && (
                <div className="ml-7 space-y-1">
                  {result.matchedMessages.slice(0, 2).map((match, msgIdx) => (
                    <div
                      key={msgIdx}
                      className="text-sm text-crush-text-secondary bg-crush-base/50 rounded px-2 py-1"
                    >
                      {truncateContent(match.content)}
                    </div>
                  ))}
                  {result.matchedMessages.length > 2 && (
                    <div className="text-xs text-crush-text-subtle ml-2">
                      +{result.matchedMessages.length - 2} more matches
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-crush-base border-t border-crush-overlay text-xs text-crush-text-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>Esc Close</span>
          </div>
          {results.length > 0 && (
            <span>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
