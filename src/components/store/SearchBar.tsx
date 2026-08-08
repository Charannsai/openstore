'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import {
  SearchIcon,
  XIcon,
  StarIcon,
  ArrowUpRightIcon,
  Loader2Icon,
} from '@/components/ui/hugeicons';
import { searchGitHubRepos } from '@/lib/github-api';
import type { Application } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const { setSearchQuery, navigate, searchQuery } = useAppStore();
  const [query, setQuery] = useState(searchQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery && searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

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
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery) {
      setSearchQuery(cleanQuery);
      setSuggestions([]);
      inputRef.current?.blur();
      navigate('search');
    }
  };

  const handleSuggestionClick = (app: Application) => {
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
            relative flex items-center rounded-xl transition-all duration-200 backdrop-blur-xl
            ${
              isFocused
                ? 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-500 shadow-lg'
                : 'bg-zinc-100/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
            }
          `}
        >
          <SearchIcon
            className={`absolute left-3.5 w-4 h-4 transition-colors ${
              isFocused ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'
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
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
          />

          {isLoading ? (
            <Loader2Icon className="absolute right-3.5 w-4 h-4 text-zinc-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -4, filter: 'blur(8px)', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: -4, filter: 'blur(8px)', scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 glass-panel border border-zinc-200 dark:border-white/10 shadow-xl"
          >
            <div className="px-3.5 py-2 text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/[0.06] tracking-wider flex items-center justify-between">
              <span>GitHub Repositories & Apps</span>
            </div>

            {suggestions.map((app) => (
              <button
                key={app.id}
                onClick={() => handleSuggestionClick(app)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/[0.05] transition-colors border-b border-zinc-200/50 dark:border-white/[0.04] last:border-0 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-300/60 dark:border-white/10">
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
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">{app.name}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{app.developer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 text-zinc-500 font-medium">
                  {app.star_count > 0 && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <StarIcon className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                      {(app.star_count / 1000).toFixed(1)}k
                    </span>
                  )}
                  <ArrowUpRightIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                </div>
              </button>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-white/[0.06] transition-colors bg-zinc-100 dark:bg-zinc-950/60 cursor-pointer"
            >
              <SearchIcon className="w-3.5 h-3.5" />
              <span>See all results for &quot;{query}&quot;</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
