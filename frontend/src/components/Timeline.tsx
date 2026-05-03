import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchTimeline } from '../services/api';
import type { ElectionPhase, Language } from '../types';

interface TimelineProps {
  language: Language;
}

export function Timeline({ language }: TimelineProps) {
  const [phases, setPhases] = useState<ElectionPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const isHindi = language === 'hi';

  useEffect(() => {
    fetchTimeline()
      .then(setPhases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6 shimmer-bg h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isHindi ? '📅 चुनाव की समयरेखा' : '📅 Election Phase Timeline'}
        </h2>
        <p className="text-gray-400">
          {isHindi
            ? 'चुनाव घोषणा से परिणाम घोषणा तक की पूरी प्रक्रिया'
            : 'Complete election process from announcement to result declaration'}
        </p>
      </div>

      {/* Mobile: vertical stack | Desktop: horizontal scroll */}
      <div className="hidden md:flex items-start gap-0 mb-8 overflow-x-auto pb-4">
        {phases.map((phase, idx) => (
          <div key={phase.id} className="flex items-start min-w-[140px] flex-1">
            <div
              className={`relative flex flex-col items-center cursor-pointer group transition-all duration-300`}
              style={{ width: '100%' }}
              onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
            >
              {/* Connector line */}
              {idx < phases.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-0.5"
                  style={{ background: 'linear-gradient(to right, rgba(255,153,51,0.5), rgba(255,153,51,0.15))' }} />
              )}
              {/* Phase circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 transition-all duration-300 border-2 ${
                  activePhase === phase.id
                    ? 'scale-125 glow-saffron'
                    : 'group-hover:scale-110'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${phase.color}22, ${phase.color}44)`,
                  borderColor: activePhase === phase.id ? phase.color : `${phase.color}66`,
                }}>
                {phase.icon}
              </div>
              {/* Phase label */}
              <p className="text-xs text-center mt-2 text-gray-400 group-hover:text-gray-200 transition-colors px-1 leading-tight">
                {isHindi ? phase.title_hi : phase.title}
              </p>
              <div className="w-1.5 h-1.5 rounded-full mt-2"
                style={{ background: phase.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Phase detail card */}
      {activePhase !== null && (
        <PhaseDetailCard
          phase={phases.find((p) => p.id === activePhase)!}
          language={language}
          onClose={() => setActivePhase(null)}
        />
      )}

      {/* Mobile: vertical list */}
      <div className="md:hidden space-y-3">
        {phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            language={language}
            isActive={activePhase === phase.id}
            onToggle={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
          />
        ))}
      </div>

      {/* All phases grid for desktop (always visible below) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            language={language}
            isActive={activePhase === phase.id}
            onToggle={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Phase Card ────────────────────────────────────────────────────────────────
interface PhaseCardProps {
  phase: ElectionPhase;
  language: Language;
  isActive: boolean;
  onToggle: () => void;
}

export function PhaseCard({ phase, language, isActive, onToggle }: PhaseCardProps) {
  const isHindi = language === 'hi';
  return (
    <div
      id={`phase-card-${phase.id}`}
      className={`glass-card-hover cursor-pointer p-5 transition-all duration-300 ${isActive ? 'glow-saffron' : ''}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      style={isActive ? { borderColor: `${phase.color}44` } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{phase.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${phase.color}22`, color: phase.color }}>
                {isHindi ? `चरण ${phase.id}` : `Phase ${phase.id}`}
              </span>
            </div>
            <h3 className="text-white font-semibold mt-1 text-sm leading-tight">
              {isHindi ? phase.title_hi : phase.title}
            </h3>
          </div>
        </div>
        {isActive ? (
          <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-1" />
        )}
      </div>

      {isActive && (
        <div className="mt-4 animate-fade-in border-t border-white/8 pt-4">
          <p className="text-gray-300 text-sm mb-3 leading-relaxed">
            {isHindi ? phase.description_hi : phase.description}
          </p>
          <ul className="space-y-1.5">
            {(isHindi ? phase.steps_hi : phase.steps).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ background: `${phase.color}22`, color: phase.color }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Phase detail overlay ───────────────────────────────────────────────────────
function PhaseDetailCard({ phase, language, onClose }: { phase: ElectionPhase; language: Language; onClose: () => void }) {
  const isHindi = language === 'hi';
  return (
    <div className="glass-card p-6 mb-4 animate-slide-up" style={{ borderColor: `${phase.color}33` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{phase.icon}</span>
          <div>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${phase.color}22`, color: phase.color }}>
              {isHindi ? `चरण ${phase.id}` : `Phase ${phase.id}`}
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{isHindi ? phase.title_hi : phase.title}</h3>
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost text-xs">✕</button>
      </div>
      <p className="text-gray-300 leading-relaxed mb-4">{isHindi ? phase.description_hi : phase.description}</p>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: phase.color }}>
          {isHindi ? 'मुख्य चरण' : 'Key steps'}
        </p>
        <ul className="space-y-2">
          {(isHindi ? phase.steps_hi : phase.steps).map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: `${phase.color}22`, color: phase.color }}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
