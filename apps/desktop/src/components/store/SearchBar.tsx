/* eslint-disable @next/next/no-img-element */
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
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setQuery(searchQuery || '');
  }

  useEffect(() => {
    let isCancelled = false;
    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchGitHubRepos(cleanQuery);
      if (!isCancelled) {
        setSuggestions(results.slice(0, 5));
        setIsLoading(false);
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
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
    <div className="relative z-50 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center rounded-xl transition-all duration-200 backdrop-blur-xl
            ${
              isFocused
                ? 'bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 shadow-md ring-2 ring-zinc-900/5 dark:ring-white/10'
                : 'bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-xs'
            }
          `}
        >
          <SearchIcon
            className={`absolute left-3.5 w-4 h-4 transition-colors ${
              isFocused ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (val.trim().length < 2) {
                setSuggestions([]);
                setIsLoading(false);
              } else {
                setIsLoading(true);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={BRAND.searchPlaceholder}
            className="w-full pl-10 pr-10 py-3 bg-transparent text-xs font-medium text-zinc-950 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none"
          />

          {isLoading ? (
            <Loader2Icon className="absolute right-3.5 w-4 h-4 text-zinc-500 dark:text-zinc-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
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
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-[100] bg-white/98 dark:bg-zinc-900/98 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl divide-y divide-zinc-100 dark:divide-zinc-800/60"
          >
            <div className="px-3.5 py-2 text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
              <span>GitHub Repositories & Apps</span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
              {suggestions.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleSuggestionClick(app)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-white/10">
                      <img
                        src={app.icon_url}
                        alt={app.name}
                        className="w-4.5 h-4.5 object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-left truncate">
                      <p className="font-semibold text-zinc-950 dark:text-zinc-100 truncate tracking-tight">{app.name}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{app.developer}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-zinc-500 dark:text-zinc-400 font-medium">
                    {app.star_count > 0 && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                        {(app.star_count / 1000).toFixed(1)}k
                      </span>
                    )}
                    <ArrowUpRightIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-zinc-950 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors bg-zinc-50/80 dark:bg-zinc-950/60 cursor-pointer"
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
