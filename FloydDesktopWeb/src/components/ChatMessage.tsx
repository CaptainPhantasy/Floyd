/**
 * Chat Message Component - Phase 1 Tasks 1.2 & 1.3, Phase 2 Task 2.1
 * 
 * Displays chat messages with copy, regenerate, and edit functionality.
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Edit2, Check, X } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { RegenerateButton } from './RegenerateButton';
import { ContinueButton } from './ContinueButton';
import { MessageTimestamp } from './MessageTimestamp';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => Promise<void>; // Phase 1, Task 1.3
  isRegenerating?: boolean;
  onEdit?: (newContent: string) => void; // Phase 2, Task 2.1
  isEditing?: boolean;
  messageIndex?: number; // For tracking message position
  onContinue?: () => Promise<void>; // Phase 2, Task 2.2
  isContinuing?: boolean;
}

export function ChatMessage({ 
  message, 
  isStreaming,
  onRegenerate,
  isRegenerating,
  onEdit,
  isEditing = false,
  messageIndex,
  onContinue,
  isContinuing
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  
  // Phase 2, Task 2.1: Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditMode) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editContent, isEditMode]);

  const handleStartEdit = () => {
    setIsEditMode(true);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(editContent.trim());
    }
    setIsEditMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={cn(
      'flex gap-3 group relative',
      isUser ? 'justify-end' : 'justify-start',
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-crush-info flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-crush-text-inverse" />
        </div>
      )}

      {/* Phase 6, Task 6.3: Message timestamp - positioned above message bubble */}
      {message.timestamp && (
        <div className={cn(
          'absolute -top-5 text-xs',
          isUser ? 'right-0' : 'left-0'
        )}>
          <MessageTimestamp timestamp={message.timestamp} showRelative={true} showAbsolute={true} />
        </div>
      )}

      <div className={cn(
        'max-w-[70%] rounded-lg px-4 py-3 relative',
        isUser
          ? 'bg-crush-ready text-crush-base'
          : 'bg-crush-elevated text-crush-text-primary border border-crush-overlay',
      )}>
        {/* Action buttons container */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {/* Phase 1, Task 1.3: Regenerate button (assistant messages only) */}
          {isAssistant && onRegenerate && !isStreaming && !isEditMode && (
            <RegenerateButton
              onRegenerate={onRegenerate}
              isRegenerating={isRegenerating}
            />
          )}
          
          {/* Phase 2, Task 2.2: Continue button (assistant messages only) */}
          {isAssistant && onContinue && !isStreaming && !isEditMode && (
            <ContinueButton
              onContinue={onContinue}
              isContinuing={isContinuing}
            />
          )}
          
          {/* Phase 2, Task 2.1: Edit button (user messages only) */}
          {isUser && onEdit && !isStreaming && !isEditMode && (
            <button
              onClick={handleStartEdit}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-crush-overlay transition-all"
              title="Edit message"
            >
              <Edit2 className="w-4 h-4 text-crush-tertiary" />
            </button>
          )}
          
          {/* Phase 1, Task 1.2: Copy button */}
          {!isEditMode && <CopyButton content={message.content} />}
          
          {/* Phase 2, Task 2.1: Edit mode actions */}
          {isEditMode && (
            <>
              <button
                onClick={handleSaveEdit}
                className="p-1 rounded hover:bg-crush-overlay transition-all"
                title="Save (Enter)"
              >
                <Check className="w-4 h-4 text-crush-success" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 rounded hover:bg-crush-overlay transition-all"
                title="Cancel (Esc)"
              >
                <X className="w-4 h-4 text-crush-error" />
              </button>
            </>
          )}
        </div>

        {/* Phase 2, Task 2.1: Edit mode */}
        {isEditMode ? (
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full bg-transparent resize-none outline-none',
              isUser ? 'text-crush-base' : 'text-crush-text-primary',
              'font-medium pr-20',
              'min-h-[60px]'
            )}
            autoFocus
            placeholder="Edit your message..."
          />
        ) : (
          <>
            {isUser ? (
              <p className="whitespace-pre-wrap font-medium">{message.content}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match;

                      if (isInline) {
                        return (
                          <code className="bg-crush-base text-crush-tertiary px-1 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="relative">
                          <SyntaxHighlighter
                            style={oneDark as any}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg !bg-crush-base !mt-2 !mb-2 !border !border-crush-overlay"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                          {/* Copy button for code blocks */}
                          <div className="absolute top-2 right-2">
                            <CopyButton content={String(children)} size="sm" />
                          </div>
                        </div>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2 last:mb-0 text-crush-text-primary">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc list-inside mb-2 text-crush-text-primary">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal list-inside mb-2 text-crush-text-primary">{children}</ol>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-crush-tertiary animate-pulse ml-1" />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-crush-modal flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-crush-text-primary" />
        </div>
      )}
    </div>
  );
}
