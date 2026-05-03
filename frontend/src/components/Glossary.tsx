import { useEffect, useMemo, useState } from 'react';
import { Search, Tag } from 'lucide-react';
import { fetchGlossary } from '../services/api';
import type { GlossaryTerm, Language } from '../types';

interface GlossaryProps {
  language: Language;
}

const CATEGORY_COLORS: Record<string, string> = {
  Institutions: '#FF9933',
  Technology: '#4CAF50',
  Documents: '#2196F3',
  Rules: '#9C27B0',
  Officials: '#FF5722',
  Constitution: '#607D8B',
  'Voting System': '#00BCD4',
  'Voting Process': '#795548',
};

export function Glossary({ language }: GlossaryProps) {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const isHindi = language === 'hi';

  useEffect(() => {
    fetchGlossary()
      .then(setTerms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => Array.from(new Set(terms.map((t) => t.category))), [terms]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return terms.filter((t) => {
      const matchesQuery =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.term_hi.includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.definition_hi.includes(q);
      const matchesCategory = !activeCategory || t.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [terms, query, activeCategory]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card h-16 shimmer-bg rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isHindi ? '📖 चुनाव शब्दावली' : '📖 Election Glossary'}
        </h2>
        <p className="text-gray-400">
          {isHindi
            ? `${terms.length} प्रमुख चुनाव शब्द — खोजें या श्रेणी चुनें`
            : `${terms.length} key election terms — search or filter by category`}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          id="glossary-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isHindi ? 'शब्द खोजें... (जैसे EVM, MCC)' : 'Search terms... (e.g. EVM, MCC, VVPAT)'}
          className="w-full glass-card rounded-xl pl-12 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-saffron-500/50 transition-all duration-200"
          style={{ fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : 'inherit' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            ✕
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          id="cat-all"
          onClick={() => setActiveCategory(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
            !activeCategory
              ? 'bg-saffron-500/20 border-saffron-500/50 text-saffron-400'
              : 'border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
          }`}>
          <Tag size={11} />
          {isHindi ? 'सभी' : 'All'} ({terms.length})
        </button>
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat] ?? '#888';
          const count = terms.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              id={`cat-${cat.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                activeCategory === cat
                  ? 'text-white'
                  : 'border-white/10 text-gray-400 hover:text-gray-200'
              }`}
              style={
                activeCategory === cat
                  ? { background: `${color}22`, borderColor: `${color}55`, color }
                  : {}
              }
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {query && (
        <p className="text-xs text-gray-500 mb-4">
          {isHindi ? `${filtered.length} परिणाम मिले` : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Terms list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>{isHindi ? 'कोई परिणाम नहीं मिला' : 'No results found'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((term) => {
            const key = term.term;
            const isOpen = expanded === key;
            const color = CATEGORY_COLORS[term.category] ?? '#888';

            return (
              <div
                key={key}
                id={`glossary-${term.term.replace(/\s/g, '-').toLowerCase()}`}
                className={`glass-card-hover cursor-pointer p-4 transition-all duration-300 ${isOpen ? '' : ''}`}
                style={isOpen ? { borderColor: `${color}33` } : {}}
                onClick={() => setExpanded(isOpen ? null : key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded(isOpen ? null : key)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                      style={{ background: `${color}18`, color }}>
                      {term.category}
                    </span>
                    <div className="min-w-0">
                      <span className="text-white font-semibold text-sm">
                        {isHindi ? term.term_hi : term.term}
                      </span>
                      {isHindi && term.term !== term.term_hi && (
                        <span className="text-gray-500 text-xs ml-2">({term.term})</span>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs flex-shrink-0">
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-white/8 animate-fade-in">
                    <p
                      className="text-gray-300 text-sm leading-relaxed"
                      style={{ fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : 'inherit' }}>
                      {isHindi ? term.definition_hi : term.definition}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
