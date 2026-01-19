/**
 * FloydDesktop - Chat Panel Component
 */

import { useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message, ToolCall } from '../types';
import { ToolCallCard } from './ToolCallCard';
import { InputBar } from './InputBar';
import { cn, parseContent } from '../lib/utils';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  activeToolCalls: ToolCall[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  onExport?: () => void;
  onClear?: () => void;
  onShowTools?: () => void;
  onShowSettings?: () => void;
  onShowKeyboardShortcuts?: () => void;
}

export function ChatPanel({
  messages,
  isLoading,
  activeToolCalls,
  onSendMessage,
  onExport,
  onClear,
  onShowTools,
  onShowSettings,
  onShowKeyboardShortcuts,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeToolCalls]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">Welcome to Floyd</h2>
              <p className="text-slate-400">Your local AI coding assistant</p>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}

          {activeToolCalls.map((toolCall) => (
            <ToolCallCard key={toolCall.id} toolCall={toolCall} />
          ))}

          {isLoading && messages.length === 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-200" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <InputBar
        onSend={onSendMessage}
        isLoading={isLoading}
        onExport={onExport}
        onClear={onClear}
        onShowTools={onShowTools}
        onShowSettings={onShowSettings}
        onShowKeyboardShortcuts={onShowKeyboardShortcuts}
      />
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-3xl rounded-2xl px-4 py-3',
          isUser
            ? 'bg-sky-600 text-white'
            : 'bg-slate-800 text-slate-100'
        )}
      >
        <MessageContent content={message.content} />
      </div>
    </div>
  );
}

interface MessageContentProps {
  content: string;
}

function MessageContent({ content }: MessageContentProps) {
  const parts = parseContent(content);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={part.lang || 'typescript'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          );
        }

        if (part.type === 'heading') {
          const level = part.level || 1;
          const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
          return (
            <Tag
              key={index}
              className={cn(
                'font-semibold',
                level === 1 && 'text-xl',
                level === 2 && 'text-lg',
                level === 3 && 'text-base'
              )}
            >
              {part.content}
            </Tag>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {part.content}
          </p>
        );
      })}
    </div>
  );
}
