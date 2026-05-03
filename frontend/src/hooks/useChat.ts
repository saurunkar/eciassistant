/** Streaming chat hook — manages message history and SSE streaming. */

import { useCallback, useState } from 'react';
import { streamChat, submitFeedback } from '../services/api';
import type { Language, Message, SourceCitation } from '../types';

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string, language: Language, sessionId?: string) => Promise<void>;
  rateMessage: (messageId: string, rating: 1 | -1, sessionId: string, language: Language) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string, language: Language, sessionId?: string) => {
      if (!text.trim() || isLoading) return;
      setError(null);

      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: text.trim(),
        language,
        timestamp: Date.now(),
      };

      const assistantMsgId = makeId();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        language,
        isStreaming: true,
        sources: [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      const sid = sessionId ?? sessionStorage.getItem('electguide_session_id') ?? makeId();

      try {
        for await (const event of streamChat(sid, text.trim(), language)) {
          if (event.done) {
            const sources = (event.sources ?? []) as SourceCitation[];
            const backendId = event.message_id ?? assistantMsgId;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, id: backendId, isStreaming: false, sources, rating: null }
                  : m,
              ),
            );
          } else if (event.chunk) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: m.content + event.chunk }
                  : m,
              ),
            );
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong';
        setError(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const rateMessage = useCallback(
    async (messageId: string, rating: 1 | -1, sessionId: string, language: Language) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating } : m)),
      );
      try {
        await submitFeedback({ session_id: sessionId, message_id: messageId, rating, language });
      } catch {
        // non-critical — don't surface feedback errors to the user
      }
    },
    [],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, error, sendMessage, rateMessage, clearMessages };
}
