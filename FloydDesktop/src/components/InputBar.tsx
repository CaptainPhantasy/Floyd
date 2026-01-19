/**
 * FloydDesktop - Rich Input Bar Component
 * 
 * Multi-line input with file attachments, slash commands, @ mentions
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Paperclip, Send, X } from 'lucide-react';
import { ImagePreview } from './ImagePreview';

interface InputBarProps {
  onSend: (message: string, attachments?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  onExport?: () => void;
  onClear?: () => void;
  onShowTools?: () => void;
  onShowSettings?: () => void;
  onShowKeyboardShortcuts?: () => void;
}

interface SlashCommand {
  name: string;
  description: string;
  action: () => void;
}

export function InputBar({
  onSend,
  isLoading = false,
  placeholder = 'Send a message to Floyd...',
  onExport,
  onClear,
  onShowTools,
  onShowSettings,
  onShowKeyboardShortcuts,
}: InputBarProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commands: SlashCommand[] = [
    { name: 'help', description: 'Show keyboard shortcuts', action: () => onShowKeyboardShortcuts?.() },
    { name: 'clear', description: 'Clear conversation', action: () => onClear?.() },
    { name: 'export', description: 'Export conversation', action: () => onExport?.() },
    { name: 'tools', description: 'List available tools', action: () => onShowTools?.() },
    { name: 'project', description: 'Switch project', action: () => {} },
    { name: 'model', description: 'Change model', action: () => {} },
    { name: 'settings', description: 'Open settings', action: () => onShowSettings?.() },
  ];

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for slash command
    if (value.startsWith('/')) {
      const match = value.match(/^\/(\w*)/);
      if (match) {
        setShowCommands(true);
        // Reset command index when query changes
        setCommandIndex(0);
      } else {
        setShowCommands(false);
      }
    } else {
      setShowCommands(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCommandIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (commandIndex < filteredCommands.length) {
          const selected = filteredCommands[commandIndex];
          if (selected) {
            setInput('');
            setShowCommands(false);
            selected.action();
          }
        }
      } else if (e.key === 'Escape') {
        setShowCommands(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim(), attachments);
      setInput('');
      setAttachments([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          setAttachments((prev) => [...prev, file]);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files]);
    }

    // Handle file path from file browser drag
    const filePath = e.dataTransfer.getData('text/plain');
    if (filePath && !files.length) {
      // File was dragged from file browser - could add to context or attach
      // For now, just log it
      console.log('File dragged from browser:', filePath);
    }
  };

  const filteredCommands = input.startsWith('/')
    ? commands.filter((c) =>
        c.name.startsWith(input.slice(1).toLowerCase())
      )
    : [];

  return (
    <div className="border-t border-slate-700 p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="relative inline-block rounded-lg overflow-hidden"
              >
                {file.type.startsWith('image/') ? (
                  <ImagePreview file={file} />
                ) : (
                  <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-2">
                    <span className="text-sm truncate max-w-[200px]">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-red-600 rounded-full"
                  aria-label="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div
          className="relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            className={cn(
              'w-full px-4 py-3 pr-24 bg-slate-800 border border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all',
              'placeholder:text-slate-500'
            )}
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />

          {/* Slash Commands Dropdown */}
          {showCommands && filteredCommands.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-10">
              {filteredCommands.map((cmd, index) => (
                <div
                  key={cmd.name}
                  className={cn(
                    'px-3 py-2 cursor-pointer transition-colors',
                    index === commandIndex
                      ? 'bg-sky-600 text-white'
                      : 'hover:bg-slate-700 text-slate-200'
                  )}
                  onClick={() => {
                    setInput('');
                    setShowCommands(false);
                    cmd.action();
                  }}
                >
                  <div className="text-sm font-medium">/{cmd.name}</div>
                  <div className="text-xs opacity-75">{cmd.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.md,.json,.ts,.tsx,.js,.jsx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isLoading || !input.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-500 text-white hover:bg-sky-600'
              )}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
