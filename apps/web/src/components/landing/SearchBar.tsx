/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SearchIcon,
  XIcon,
  StarIcon,
  ArrowUpRightIcon,
  Loader2Icon,
  SparklesIcon,
} from '@/components/ui/hugeicons';
import { searchLiveGitHub } from '@/lib/github-api';
import type { GitHubRepoResult } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<GitHubRepoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isCancelled = false;
    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchLiveGitHub(cleanQuery);
      if (!isCancelled) {
        setResults(data.slice(0, 5));
        setIsLoading(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div className="relative z-40">
        <div
          className={`
            relative flex items-center rounded-2xl transition-all duration-200 backdrop-blur-xl
            ${
              isFocused
                ? 'bg-white dark:bg-[#151518] border-2 border-zinc-950 dark:border-white shadow-xl ring-4 ring-zinc-950/5 dark:ring-white/5'
                : 'bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 shadow-lg'
            }
          `}
        >
          <SearchIcon
            className={`absolute left-4 w-4.5 h-4.5 transition-colors ${
              isFocused ? 'text-zinc-950 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            placeholder="Search open-source repositories or paste GitHub link..."
            className="w-full pl-12 pr-12 py-3.5 bg-transparent text-xs sm:text-sm font-medium text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
          />

          {isLoading ? (
            <Loader2Icon className="absolute right-4 w-4 h-4 text-zinc-400 dark:text-zinc-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="absolute right-4 p-1 rounded-md text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Live Search Results Dropdown */}
        <AnimatePresence>
          {results.length > 0 && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 shadow-2xl divide-y divide-zinc-100 dark:divide-white/5"
            >
              <div className="px-4 py-2.5 text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
                <span className="flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Live Repository Results
                </span>
                <span>{results.length} matches</span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-white/5">
                {results.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 text-xs text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {repo.icon_url ? (
                          <img
                            src={repo.icon_url}
                            alt={repo.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="font-bold text-[10px] text-zinc-900 dark:text-zinc-100">
                            {repo.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-zinc-950 dark:text-white truncate group-hover:text-zinc-950 dark:group-hover:text-white">
                            {repo.name}
                          </p>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {repo.developer}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 max-w-md">
                          {repo.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 text-zinc-400 dark:text-zinc-500">
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                          <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                          {repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}
                        </span>
                      )}
                      <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>

              <div className="px-4 py-2.5 text-center bg-zinc-50/70 dark:bg-zinc-950/40">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Instant 1-click clone & run available inside OpenStore desktop agent
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
