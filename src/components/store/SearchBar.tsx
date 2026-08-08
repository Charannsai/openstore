'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import { Search, X, Star, ArrowUpRight, Loader2 } from 'lucide-react';
import { searchGitHubRepos } from '@/lib/github-api';
import type { Application } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const { setSearchQuery, navigate } = useAppStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced real-time GitHub search suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchGitHubRepos(query);
      setSuggestions(results.slice(0, 5));
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
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

  const handleSuggestionClick = (app: Application) => {
    // Inject fetched application into global state so AppDetail can render it
    useAppStore.setState((state) => ({
      applications: state.applications.some((a) => a.id === app.id)
        ? state.applications
        : [app, ...state.applications],
    }));

    navigate('app-detail', { slug: app.slug });
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center rounded-xl transition-all duration-200
            ${
              isFocused
                ? 'bg-zinc-900 border border-white/20 shadow-xl'
                : 'bg-zinc-900/80 border border-white/10 hover:border-white/15'
            }
          `}
        >
          <Search
            className={`absolute left-3.5 w-4 h-4 transition-colors ${
              isFocused ? 'text-zinc-200' : 'text-zinc-500'
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
            className="w-full pl-10 pr-10 py-3 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
          />

          {isLoading ? (
            <Loader2 className="absolute right-3.5 w-4 h-4 text-zinc-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 rounded-xl overflow-hidden z-50 border border-white/10 shadow-2xl"
          >
            <div className="px-3 py-2 text-[10px] uppercase font-semibold text-zinc-500 border-b border-white/[0.06] tracking-wider">
              GitHub Repositories & Apps
            </div>

            {suggestions.map((app) => (
              <button
                key={app.id}
                onClick={() => handleSuggestionClick(app)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-4 h-4 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-left truncate">
                    <p className="font-medium text-zinc-100 truncate">{app.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{app.developer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 text-zinc-500">
                  {app.star_count > 0 && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Star className="w-3 h-3 text-zinc-400" />
                      {(app.star_count / 1000).toFixed(1)}k
                    </span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
                </div>
              </button>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] transition-colors bg-zinc-950/50"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>See all results for &quot;{query}&quot;</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
