/**
 * FloydDesktop - Agent Stream Hook
 *
 * Hook for streaming agent responses with real-time updates.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ToolCall, AgentStatus, StreamChunk, SessionData, UsageInfo } from '../types';

export function useAgentStream(session: SessionData | null) {
  const [messages, setMessages] = useState<Message[]>(
    session && Array.isArray(session.messages) ? session.messages : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [usage, setUsage] = useState<UsageInfo | undefined>(undefined);

  const streamingRef = useRef(false);

  // Load agent status on mount
  useEffect(() => {
    if (!window.floydAPI) {
      setAgentStatus({
        connected: false,
        model: 'unknown',
        isProcessing: false,
      });
      return;
    }
    window.floydAPI.getAgentStatus().then(setAgentStatus);
  }, []);

  // Update messages when session changes
  useEffect(() => {
    if (session) {
      // Ensure messages is always an array, even if session.messages is undefined
      setMessages(Array.isArray(session.messages) ? session.messages : []);
    } else {
      // Clear messages when session is null
      setMessages([]);
    }
  }, [session]);

  const sendMessage = useCallback(async (content: string) => {
    if (streamingRef.current) return;
    if (!window.floydAPI) {
      console.warn('Floyd API is unavailable. Is the preload script running?');
      return;
    }

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    streamingRef.current = true;

    try {
      await window.floydAPI.sendStreamedMessage(content);

      // Listen for chunks
      const handleChunk = (chunk: StreamChunk) => {
        if (chunk.error) {
          setIsLoading(false);
          streamingRef.current = false;
          window.floydAPI.removeStreamListener();
          return;
        }

        // Handle tool calls
        if (chunk.tool_call) {
          setActiveToolCalls((prev) => {
            const existing = prev.findIndex((t) => t.id === chunk.tool_call?.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = {
                ...updated[existing],
                ...chunk.tool_call,
              };
              return updated;
            }
            return [...prev, chunk.tool_call as ToolCall];
          });
        }

        // Handle tool completion
        if (chunk.tool_use_complete && chunk.output) {
          setActiveToolCalls((prev) =>
            prev.map((t) =>
              t.id === activeToolCalls[0]?.id
                ? { ...t, output: chunk.output || t.output }
                : t
            )
          );
        }

        // Handle text tokens
        if (chunk.token) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && !last.tool_calls?.length) {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + chunk.token },
              ];
            }
            return [
              ...prev,
              {
                role: 'assistant',
                content: chunk.token,
                timestamp: Date.now(),
              } as Message,
            ];
          });
        }

        // Handle usage info
        if (chunk.usage) {
          setUsage(chunk.usage);
        }

        // Handle completion
        if (chunk.done) {
          setIsLoading(false);
          streamingRef.current = false;

          // Move active tool calls to the last message
          if (activeToolCalls.length > 0) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, tool_calls: [...activeToolCalls] },
                ];
              }
              return prev;
            });
            setActiveToolCalls([]);
          }

          // Update agent status
          window.floydAPI.getAgentStatus().then(setAgentStatus);
          window.floydAPI.removeStreamListener();
        }
      };

      window.floydAPI.onStreamChunk(handleChunk);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      streamingRef.current = false;
    }
  }, [activeToolCalls]);

  return {
    messages,
    isLoading,
    activeToolCalls,
    agentStatus,
    usage,
    sendMessage,
  };
}
