'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchApps } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const { setSearchQuery, navigate } = useAppStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; slug: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const results = searchApps(query).slice(0, 5);
      setSuggestions(results.map((r) => ({ name: r.name, slug: r.slug })));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
      navigate('search');
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (slug: string) => {
    navigate('app-detail', { slug });
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center rounded-2xl transition-all duration-300
            ${
              isFocused
                ? 'bg-white/[0.08] ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/5'
                : 'bg-white/[0.05] hover:bg-white/[0.07]'
            }
          `}
        >
          <Search
            className={`absolute left-4 w-5 h-5 transition-colors ${
              isFocused ? 'text-indigo-400' : 'text-zinc-500'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={BRAND.searchPlaceholder}
            className="w-full pl-12 pr-12 py-3.5 bg-transparent text-sm text-white placeholder-zinc-500 outline-none search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-50 border border-white/[0.08]"
          >
            {suggestions.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => handleSuggestionClick(s.slug)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{s.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
              </button>
            ))}
            <button
              onClick={handleSubmit}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors border-t border-white/[0.06]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search for &quot;{query}&quot;</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
