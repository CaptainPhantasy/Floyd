/**
 * ExportButton Component - Phase 2, Task 2.3
 * 
 * Allows users to export chat conversations in various formats.
 * Features:
 * - Multiple export formats (Markdown, JSON, TXT)
 * - Dropdown menu for format selection
 * - Download functionality
 * - Visual feedback and error handling
 */

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, Session } from '@/types';

interface ExportButtonProps {
  session: Session;
  messages: Message[];
  className?: string;
}

type ExportFormat = 'markdown' | 'json' | 'txt';

export function ExportButton({ 
  session,
  messages,
  className
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTitle = (session: Session): string => {
    const title = session.customTitle || session.title;
    return title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  };

  const exportAsMarkdown = (): string => {
    let content = `# ${session.customTitle || session.title}\n\n`;
    content += `**Created:** ${new Date(session.created).toLocaleString()}\n`;
    content += `**Last Updated:** ${new Date(session.updated).toLocaleString()}\n`;
    content += `**Messages:** ${session.messages.length}\n\n`;
    content += `---\n\n`;

    for (const message of messages) {
      const role = message.role === 'user' ? '👤 **User**' : '🤖 **Assistant**';
      content += `${role}\n\n${message.content}\n\n`;
    }

    return content;
  };

  const exportAsJson = (): string => {
    const data = {
      metadata: {
        title: session.title,
        customTitle: session.customTitle,
        created: session.created,
        updated: session.updated,
        messageCount: session.messages.length,
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || null,
      }))
    };
    return JSON.stringify(data, null, 2);
  };

  const exportAsTxt = (): string => {
    let content = `${session.customTitle || session.title}\n`;
    content += `${'='.repeat(50)}\n\n`;
    content += `Created: ${new Date(session.created).toLocaleString()}\n`;
    content += `Last Updated: ${new Date(session.updated).toLocaleString()}\n`;
    content += `Messages: ${session.messages.length}\n\n`;
    content += `${'='.repeat(50)}\n\n`;

    for (const message of messages) {
      const role = message.role === 'user' ? 'USER' : 'ASSISTANT';
      content += `[${role}]\n${message.content}\n\n`;
    }

    return content;
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setError(null);

    try {
      let content: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case 'markdown':
          content = exportAsMarkdown();
          mimeType = 'text/markdown';
          extension = 'md';
          break;
        case 'json':
          content = exportAsJson();
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'txt':
          content = exportAsTxt();
          mimeType = 'text/plain';
          extension = 'txt';
          break;
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formatTitle(session)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to export');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded',
          'hover:bg-crush-overlay transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        title="Export chat"
      >
        <Download className="w-4 h-4 text-crush-tertiary" />
        <ChevronDown className="w-3 h-3 text-crush-tertiary" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-crush-elevated border border-crush-overlay rounded-lg shadow-lg z-10">
          <div className="p-1">
            <button
              onClick={() => handleExport('markdown')}
              disabled={isExporting}
              className="w-full text-left px-3 py-2 rounded hover:bg-crush-overlay transition-colors text-sm disabled:opacity-50"
            >
              <span className="font-medium">Markdown</span>
              <span className="block text-xs text-crush-text-subtle">.md file</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="w-full text-left px-3 py-2 rounded hover:bg-crush-overlay transition-colors text-sm disabled:opacity-50"
            >
              <span className="font-medium">JSON</span>
              <span className="block text-xs text-crush-text-subtle">.json file</span>
            </button>
            <button
              onClick={() => handleExport('txt')}
              disabled={isExporting}
              className="w-full text-left px-3 py-2 rounded hover:bg-crush-overlay transition-colors text-sm disabled:opacity-50"
            >
              <span className="font-medium">Plain Text</span>
              <span className="block text-xs text-crush-text-subtle">.txt file</span>
            </button>
          </div>
        </div>
      )}

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-crush-error text-crush-text-inverse text-xs rounded whitespace-nowrap z-20">
          {error}
        </div>
      )}
    </div>
  );
}
