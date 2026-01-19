/**
 * FloydDesktop - Export Dialog Component
 */

import { useState } from 'react';
import { cn } from '../lib/utils';
import type { Message } from '../types';
import { Download, FileText, Code, FileCode } from 'lucide-react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  sessionTitle?: string;
}

type ExportFormat = 'markdown' | 'json' | 'html';

export function ExportDialog({ isOpen, onClose, messages, sessionTitle }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const exportToMarkdown = (): string => {
    let md = `# ${sessionTitle || 'Conversation Export'}\n\n`;
    md += `Exported on ${new Date().toLocaleString()}\n\n---\n\n`;

    for (const message of messages) {
      const role = message.role === 'user' ? 'User' : 'Floyd';
      md += `## ${role}\n\n`;
      md += `${message.content}\n\n`;
      if (message.tool_calls && message.tool_calls.length > 0) {
        md += `**Tool Calls:**\n`;
        for (const toolCall of message.tool_calls) {
          md += `- ${toolCall.name}: ${toolCall.output || 'No output'}\n`;
        }
        md += '\n';
      }
      md += '---\n\n';
    }

    return md;
  };

  const exportToJSON = (): string => {
    return JSON.stringify(
      {
        title: sessionTitle || 'Conversation Export',
        exportedAt: new Date().toISOString(),
        messages,
      },
      null,
      2
    );
  };

  const exportToHTML = (): string => {
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${sessionTitle || 'Conversation Export'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #38bdf8; }
    .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
    .user { background: #1e3a8a; }
    .assistant { background: #1e293b; }
    .tool-call { margin-top: 10px; padding: 10px; background: #334155; border-radius: 4px; font-size: 0.9em; }
    code { background: #1e293b; padding: 2px 6px; border-radius: 4px; }
    pre { background: #1e293b; padding: 15px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${sessionTitle || 'Conversation Export'}</h1>
  <p>Exported on ${new Date().toLocaleString()}</p>
`;

    for (const message of messages) {
      const roleClass = message.role === 'user' ? 'user' : 'assistant';
      html += `  <div class="message ${roleClass}">\n`;
      html += `    <strong>${message.role === 'user' ? 'User' : 'Floyd'}</strong>\n`;
      html += `    <div>${message.content.replace(/\n/g, '<br>').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>\n`;
      if (message.tool_calls && message.tool_calls.length > 0) {
        html += `    <div class="tool-call">\n`;
        html += `      <strong>Tool Calls:</strong><br>\n`;
        for (const toolCall of message.tool_calls) {
          html += `      ${toolCall.name}: ${toolCall.output || 'No output'}<br>\n`;
        }
        html += `    </div>\n`;
      }
      html += `  </div>\n`;
    }

    html += `</body>\n</html>`;
    return html;
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'markdown':
          content = exportToMarkdown();
          filename = `${sessionTitle || 'conversation'}.md`;
          mimeType = 'text/markdown';
          break;
        case 'json':
          content = exportToJSON();
          filename = `${sessionTitle || 'conversation'}.json`;
          mimeType = 'application/json';
          break;
        case 'html':
          content = exportToHTML();
          filename = `${sessionTitle || 'conversation'}.html`;
          mimeType = 'text/html';
          break;
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Failed to export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Export Conversation</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'markdown' as ExportFormat, label: 'Markdown', icon: FileText },
                { value: 'json' as ExportFormat, label: 'JSON', icon: Code },
                { value: 'html' as ExportFormat, label: 'HTML', icon: FileCode },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors',
                      format === option.value
                        ? 'border-sky-500 bg-sky-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-slate-400">
            {messages.length} messages will be exported
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || messages.length === 0}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
              isExporting || messages.length === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            )}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
