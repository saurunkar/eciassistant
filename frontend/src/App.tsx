import { useEffect, useState } from 'react';
import {
  MessageCircle, Clock, BookOpen, MapPin, Globe,
  Menu, X, CheckCircle, ExternalLink, Lightbulb,
} from 'lucide-react';
import { ChatPanel } from './components/ChatPanel';
import { Timeline } from './components/Timeline';
import { Glossary } from './components/Glossary';
import { LanguagePicker } from './components/LanguagePicker';
import { useSession } from './hooks/useSession';
import { fetchVoterGuide } from './services/api';
import type { Language, Tab, VoterGuideStep } from './types';

// ── Voter Guide Panel ─────────────────────────────────────────────────────────
function VoterGuidePanel({ language }: { language: Language }) {
  const [steps, setSteps] = useState<VoterGuideStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const isHindi = language === 'hi';

  useEffect(() => {
    fetchVoterGuide().then(setSteps).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 shimmer-bg h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isHindi ? '🗳️ पहली बार मतदाता गाइड' : '🗳️ First-Time Voter Guide'}
        </h2>
        <p className="text-gray-400">
          {isHindi
            ? 'अपना पहला वोट डालने के लिए 5 आसान चरण'
            : '5 simple steps to cast your first vote'}
        </p>
      </div>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5"
          style={{ background: 'linear-gradient(to bottom, #FF9933, #138808, transparent)' }} />

        <div className="space-y-4">
          {steps.map((step) => {
            const isOpen = expanded === step.step;
            return (
              <div key={step.step} className="relative pl-16">
                {/* Step number circle */}
                <div
                  className="absolute left-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white border-2 border-saffron-500 bg-surface"
                  style={{ top: '1.25rem' }}
                >
                  {step.step}
                </div>

                <div
                  id={`voter-guide-step-${step.step}`}
                  className={`glass-card-hover p-5 cursor-pointer transition-all duration-300 ${isOpen ? 'glow-saffron' : ''}`}
                  onClick={() => setExpanded(isOpen ? null : step.step)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setExpanded(isOpen ? null : step.step)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {isHindi ? step.title_hi : step.title}
                      </h3>
                      <p className="text-gray-400 mt-1 text-sm leading-relaxed">
                        {isHindi ? step.description_hi : step.description}
                      </p>
                    </div>
                    <CheckCircle
                      size={22}
                      className={`flex-shrink-0 mt-0.5 transition-colors ${isOpen ? 'text-saffron-500' : 'text-gray-600'}`}
                    />
                  </div>

                  {isOpen && (
                    <div className="mt-4 animate-fade-in border-t border-white/8 pt-4 space-y-3">
                      {(isHindi ? step.tips_hi : step.tips).length > 0 && (
                        <div className="bg-saffron-500/5 rounded-xl p-4 border border-saffron-500/15">
                          <p className="text-saffron-400 text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Lightbulb size={12} />
                            {isHindi ? 'सुझाव' : 'Tips'}
                          </p>
                          <ul className="space-y-1.5">
                            {(isHindi ? step.tips_hi : step.tips).map((tip, i) => (
                              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-saffron-500 mt-0.5 flex-shrink-0">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.action_url && (
                        <a
                          href={step.action_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-saffron-400 hover:text-saffron-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                          {isHindi ? 'आधिकारिक वेबसाइट खोलें' : 'Open official portal'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ECI helpline footer */}
      <div className="mt-10 glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold">
            {isHindi ? 'मतदाता हेल्पलाइन' : 'Voter Helpline'}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            {isHindi ? 'टोल-फ्री, सभी राज्यों में' : 'Toll-free, available in all states'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold saffron-text">1950</div>
          <a
            href="https://eci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-saffron-500/30 text-saffron-400 hover:bg-saffron-500/10 transition-all text-sm"
          >
            <Globe size={14} /> eci.gov.in
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; labelHi: string; icon: React.ReactNode }[] = [
  { id: 'chat',     label: 'Ask ElectGuide',   labelHi: 'प्रश्न पूछें',     icon: <MessageCircle size={18} /> },
  { id: 'timeline', label: 'Election Timeline', labelHi: 'चुनाव समयरेखा', icon: <Clock size={18} /> },
  { id: 'glossary', label: 'Glossary',          labelHi: 'शब्दावली',        icon: <BookOpen size={18} /> },
  { id: 'guide',    label: 'Voter Guide',       labelHi: 'मतदाता गाइड',    icon: <MapPin size={18} /> },
];

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [language, setLanguage] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sessionId = useSession();
  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* India flag colour bar */}
      <div className="india-flag-bar w-full" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-md"
        style={{ background: 'rgba(13,17,23,0.95)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }}
              >
                🗳️
              </div>
              <div>
                <p className="text-lg font-bold leading-none">
                  <span className="saffron-text">Elect</span>
                  <span className="text-white">Guide</span>
                  <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-india-navy/60 text-blue-300 font-normal border border-blue-700/40">
                    India
                  </span>
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {isHindi
                    ? 'ECI की जानकारी | AI द्वारा संचालित'
                    : 'Powered by ECI info · AI assisted'}
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    activeTab === tab.id
                      ? 'tab-active border-saffron-500/40 text-white'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {isHindi ? tab.labelHi : tab.label}
                </button>
              ))}
            </nav>

            {/* Right: Language + mobile menu */}
            <div className="flex items-center gap-3">
              <LanguagePicker language={language} onChange={setLanguage} />
              <button
                id="mobile-menu-toggle"
                className="md:hidden btn-ghost p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-3 pt-2 flex flex-col gap-1 animate-fade-in">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    activeTab === tab.id
                      ? 'tab-active border-saffron-500/40'
                      : 'border-transparent text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {isHindi ? tab.labelHi : tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Hero banner (chat tab only) ───────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div
          className="relative overflow-hidden border-b border-white/5"
          style={{ background: 'linear-gradient(135deg, #0f0a1a 0%, #0d1f2d 100%)' }}
        >
          <div className="absolute inset-0 bg-saffron-glow opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
            <div className="inline-flex items-center gap-2 bg-saffron-500/10 border border-saffron-500/25 rounded-full px-4 py-1.5 text-sm text-saffron-400 mb-5">
              <Globe size={14} />
              {isHindi ? 'आधिकारिक ECI स्रोतों पर आधारित' : 'Grounded in official ECI documents'}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {isHindi ? (
                <>भारतीय चुनाव को <span className="saffron-text">समझें</span></>
              ) : (
                <>Understand Indian <span className="saffron-text">Elections</span></>
              )}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {isHindi
                ? 'पंजीकरण से मतगणना तक — पहली बार के मतदाताओं के लिए सरल भाषा में उत्तर।'
                : 'From registration to result counting — clear answers for first-time voters, backed by ECI.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              {[
                { en: '🗳️ How to register', hi: '🗳️ कैसे पंजीकरण करें' },
                { en: '🖥️ How EVMs work',   hi: '🖥️ EVM कैसे काम करती है' },
                { en: '📋 MCC rules',       hi: '📋 MCC नियम' },
                { en: '🏆 Election results', hi: '🏆 चुनाव परिणाम' },
              ].map((q) => (
                <span
                  key={q.en}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300"
                >
                  {isHindi ? q.hi : q.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chat'     && <ChatPanel language={language} sessionId={sessionId} />}
        {activeTab === 'timeline' && <Timeline language={language} />}
        {activeTab === 'glossary' && <Glossary language={language} />}
        {activeTab === 'guide'    && <VoterGuidePanel language={language} />}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="border-t border-white/8 py-6 text-center text-sm text-gray-500"
        style={{ background: 'rgba(13,17,23,0.9)' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-1">
            {isHindi ? 'स्रोत: भारत निर्वाचन आयोग — ' : 'Source: Election Commission of India — '}
            <a
              href="https://eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron-500 hover:underline"
            >
              eci.gov.in
            </a>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {isHindi
              ? 'यह एक गैर-सरकारी AI सहायक है। आधिकारिक जानकारी के लिए eci.gov.in देखें। | हेल्पलाइन: 1950'
              : 'Non-official AI assistant. For official information visit eci.gov.in | Voter Helpline: 1950'}
          </p>
        </div>
      </footer>
    </div>
  );
}
