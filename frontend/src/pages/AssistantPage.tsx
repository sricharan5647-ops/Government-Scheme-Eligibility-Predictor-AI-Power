import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Building2,
  Bot,
  User,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { AssistantCitation, AssistantResponse } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

// ── Types ───────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: AssistantCitation[];
  confidence?: string;
  disclaimer?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function CitationCard({ c }: { c: AssistantCitation }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs shadow-xs">
      <div className="font-semibold text-slate-900">{c.scheme_name}</div>
      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
        <Building2 className="w-3 h-3" />
        <span>{c.department}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
        <Calendar className="w-3 h-3" />
        <span>
          Verified:{' '}
          {new Date(c.verified_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <a
        href={c.official_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-teal-700 hover:underline font-semibold pt-1 text-[11px]"
      >
        <span>Visit Department Portal</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export const AssistantPage: React.FC = () => {
  const { t } = useLanguage();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const samplePrompts = [
    'What are the land rules for Rythu Bandhu in Telangana?',
    'Ambedkar overseas scholarship income and age limits',
    'Who is eligible for Aarogyasri health insurance in Telangana?',
    'National Apprenticeship Promotion Scheme age and stipend details',
    'PM-KISAN benefits and registration documents',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim() || loading) return;

    // Add the user message immediately for snappy UX
    const userMsg: ChatMessage = { role: 'user', content: q.trim() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setError(null);
    setLoading(true);

    // Build history from current messages (before the new one was added)
    const historyForApi = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // Load citizen profile from session if available
      let citizenProfile: Record<string, any> = {};
      try {
        const saved = sessionStorage.getItem('schemesathi_profile');
        if (saved) citizenProfile = JSON.parse(saved);
      } catch {
        citizenProfile = {};
      }

      const res: AssistantResponse = await api.askAssistant({
        query: q.trim(),
        profile: citizenProfile,
        state_code: (citizenProfile.state_code as string) || 'TG',
        history: historyForApi.slice(-8),
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
        confidence: res.confidence,
        disclaimer: res.disclaimer,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the AI assistant.');
      // Remove the user message if the API completely failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">

      {/* ── Header ── */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Grounded Scheme Intelligence</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('askAssistantTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mt-1">
              {t('askAssistantSubtitle')}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 rounded-lg px-3 py-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Chat
            </button>
          )}
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* ── Chat Thread ── */}
      {messages.length > 0 ? (
        <div className="space-y-5">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {/* Assistant avatar */}
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Assistant extras: confidence badge + citations + disclaimer */}
                {msg.role === 'assistant' && (
                  <>
                    {/* Confidence badge */}
                    {msg.confidence && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md self-start ${
                          msg.confidence === 'grounded'
                            ? 'bg-emerald-100 text-emerald-900'
                            : msg.confidence === 'no_match'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {msg.confidence === 'grounded'
                          ? '✓ Verified Source Citations'
                          : msg.confidence === 'no_match'
                          ? 'No matching schemes found'
                          : 'Limited catalogue evidence'}
                      </span>
                    )}

                    {/* Official citations grid */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="w-full space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Official Sources &amp; Verified Dates
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.citations.map((c, ci) => (
                            <CitationCard key={ci} c={c} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    {msg.disclaimer && (
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-prose">
                        {msg.disclaimer}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* User avatar */}
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      ) : (
        /* ── Empty state: show sample prompts ── */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <p className="text-sm font-semibold text-slate-700">
            Ask anything about government schemes — or try a suggestion:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(p)}
                disabled={loading}
                className="text-left text-xs px-4 py-3 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200 transition-colors disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Input box ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 sticky bottom-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAsk();
          }}
        >
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              rows={2}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('askPlaceholder')}
              disabled={loading}
              className="flex-1 text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{loading ? 'Thinking…' : t('askButton')}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Press <kbd className="bg-slate-100 px-1 rounded text-slate-500">Enter</kbd> to send ·{' '}
            <kbd className="bg-slate-100 px-1 rounded text-slate-500">Shift+Enter</kbd> for new line
          </p>
        </form>
      </div>
    </div>
  );
};
