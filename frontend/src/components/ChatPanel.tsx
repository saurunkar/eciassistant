import { useEffect, useRef, useState } from 'react';
import { Send, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import type { Language, Message } from '../types';

interface ChatPanelProps {
  language: Language;
  sessionId: string;
}

const SUGGESTED_QUESTIONS = {
  en: [
    'How do I register to vote in India?',
    'How does an EVM work?',
    'What is the Model Code of Conduct?',
    'How are election results counted?',
    'What documents do I need to vote?',
  ],
  hi: [
    'मतदाता पंजीकरण कैसे करें?',
    'EVM कैसे काम करती है?',
    'आदर्श आचार संहिता क्या है?',
    'चुनाव परिणाम कैसे गिने जाते हैं?',
    'मतदान के लिए क्या दस्तावेज़ चाहिए?',
  ],
};

export function ChatPanel({ language, sessionId }: ChatPanelProps) {
  const { messages, isLoading, error, sendMessage, rateMessage, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text, language, sessionId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const toggleSources = (id: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isHindi = language === 'hi';

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] max-w-4xl mx-auto">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <div className="text-6xl">🏛️</div>
            <div className="text-center">
              <p className="text-gray-300 font-medium text-lg mb-1">
                {isHindi ? 'कोई प्रश्न पूछें' : 'Ask me anything about Indian elections'}
              </p>
              <p className="text-gray-500 text-sm">
                {isHindi ? 'आधिकारिक ECI जानकारी पर आधारित उत्तर' : 'Answers grounded in official ECI information'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {SUGGESTED_QUESTIONS[language].map((q) => (
                <button
                  key={q}
                  id={`suggest-${q.slice(0, 20).replace(/\s/g, '-')}`}
                  className="px-3 py-2 text-sm rounded-xl border border-white/10 text-gray-300 hover:border-saffron-500/40 hover:text-white hover:bg-saffron-500/5 transition-all duration-200"
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            language={language}
            sessionId={sessionId}
            sourcesExpanded={expandedSources.has(msg.id)}
            onToggleSources={() => toggleSources(msg.id)}
            onRate={(rating) => void rateMessage(msg.id, rating, sessionId, language)}
          />
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }}>🤖</div>
            <div className="message-bubble-ai rounded-2xl px-5 py-4">
              <div className="flex gap-1.5 items-center">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="pt-4 border-t border-white/8">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button onClick={clearMessages} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              {isHindi ? 'बातचीत साफ़ करें' : 'Clear conversation'}
            </button>
          </div>
        )}
        <div className="glass-card p-1 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isHindi ? 'चुनाव के बारे में कोई भी सवाल पूछें...' : 'Ask anything about Indian elections...'}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none px-4 py-3 text-sm max-h-32 min-h-[48px]"
            rows={1}
            maxLength={500}
            aria-label={isHindi ? 'चुनाव प्रश्न इनपुट' : 'Election question input'}
            style={{ fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : "'Inter', sans-serif" }}
          />
          <div className="flex items-center gap-2 px-2 pb-2">
            <span className="text-xs text-gray-600">{input.length}/500</span>
            <button
              id="send-button"
              onClick={() => void handleSend()}
              disabled={!input.trim() || isLoading || !sessionId}
              className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm"
              aria-label={isHindi ? 'भेजें' : 'Send message'}
            >
              {isLoading ? (
                <Sparkles size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span className="hidden sm:inline">{isHindi ? 'भेजें' : 'Send'}</span>
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          {isHindi
            ? 'AI सहायक · ECI दस्तावेज़ों पर आधारित · कोई PII संग्रहीत नहीं'
            : 'AI assistant · Grounded in ECI documents · No PII collected'}
        </p>
      </div>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
interface MessageBubbleProps {
  message: Message;
  language: Language;
  sessionId: string;
  sourcesExpanded: boolean;
  onToggleSources: () => void;
  onRate: (rating: 1 | -1) => void;
}

function MessageBubble({ message, language, sourcesExpanded, onToggleSources, onRate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isHindi = language === 'hi';

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
        isUser
          ? 'bg-white/10 border border-white/20'
          : ''
      }`}
        style={isUser ? {} : { background: 'linear-gradient(135deg, #FF9933, #138808)' }}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
          isUser ? 'message-bubble-user rounded-tr-sm' : 'message-bubble-ai rounded-tl-sm'
        }`}
          style={{ fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : "'Inter', sans-serif" }}>
          {isUser ? (
            <p className="text-gray-100">{message.content}</p>
          ) : (
            <div
              className="prose-election"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
            />
          )}
          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-saffron-500 ml-0.5 animate-pulse" />
          )}
        </div>

        {/* AI actions: sources + rating */}
        {!isUser && !message.isStreaming && message.content && (
          <div className="flex items-center gap-3 px-1">
            {/* Sources toggle */}
            {message.sources && message.sources.length > 0 && (
              <button
                onClick={onToggleSources}
                className="flex items-center gap-1 text-xs text-saffron-500/70 hover:text-saffron-500 transition-colors"
              >
                {sourcesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isHindi ? `${message.sources.length} स्रोत` : `${message.sources.length} source${message.sources.length > 1 ? 's' : ''}`}
              </button>
            )}

            {/* Feedback buttons */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                id={`rate-up-${message.id}`}
                onClick={() => onRate(1)}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  message.rating === 1
                    ? 'text-india-green bg-india-green/10'
                    : 'text-gray-500 hover:text-india-green hover:bg-india-green/10'
                }`}
                aria-label="Helpful"
              >
                <ThumbsUp size={13} />
              </button>
              <button
                id={`rate-down-${message.id}`}
                onClick={() => onRate(-1)}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  message.rating === -1
                    ? 'text-red-400 bg-red-400/10'
                    : 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
                }`}
                aria-label="Not helpful"
              >
                <ThumbsDown size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Sources panel */}
        {!isUser && sourcesExpanded && message.sources && message.sources.length > 0 && (
          <div className="w-full animate-fade-in">
            <div className="glass-card p-3 space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                {isHindi ? 'स्रोत' : 'Sources'}
              </p>
              {message.sources.map((src, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-saffron-500 text-xs mt-0.5 flex-shrink-0">📄</span>
                  <div>
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-saffron-400 hover:underline flex items-center gap-1">
                      {src.title} <ExternalLink size={10} />
                    </a>
                    {src.excerpt && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{src.excerpt}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Minimal Markdown renderer (no dependencies) ────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>').replace(/$/, '</p>');
}
