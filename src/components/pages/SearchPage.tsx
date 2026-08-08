'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import AppCard from '@/components/store/AppCard';
import SearchBar from '@/components/store/SearchBar';
import { searchGitHubRepos } from '@/lib/github-api';
import type { Application } from '@/lib/types';
import { motion } from 'framer-motion';
import { SlidersIcon, XIcon, Loader2Icon, SearchIcon } from '@/components/ui/hugeicons';
import { CATEGORIES } from '@/lib/constants';

export default function SearchPage() {
  const { searchQuery } = useAppStore();
  const [results, setResults] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function performSearch() {
      setIsLoading(true);
      const queryToUse = searchQuery.trim() || 'open source';
      const fetched = await searchGitHubRepos(queryToUse);

      if (isMounted) {
        setResults(fetched);
        setIsLoading(false);

        useAppStore.setState((state) => ({
          applications: [...fetched, ...state.applications],
        }));
      }
    }

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  let filteredResults = results;
  if (activeCategory) {
    filteredResults = filteredResults.filter((a) => a.category_id === activeCategory);
  }
  if (activeDifficulty) {
    filteredResults = filteredResults.filter((a) => a.difficulty === activeDifficulty);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-zinc-700 dark:text-zinc-300 mr-1 flex items-center gap-1.5 font-bold">
          <SlidersIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all border cursor-pointer font-bold ${
              activeCategory === cat.id
                ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {(['easy', 'moderate', 'advanced'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all border cursor-pointer font-bold ${
              activeDifficulty === d
                ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        {(activeCategory || activeDifficulty) && (
          <button
            onClick={() => {
              setActiveCategory(null);
              setActiveDifficulty(null);
            }}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-1 ml-1 cursor-pointer font-bold"
          >
            <XIcon className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          {searchQuery ? `Results for "${searchQuery}" (${filteredResults.length})` : 'Popular Open-Source Projects'}
        </h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
            <Loader2Icon className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-400" />
            <span>Fetching repositories...</span>
          </div>
        )}
      </div>

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-36 rounded-xl bg-zinc-200/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredResults.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-xl border border-zinc-200 dark:border-white/10">
          <SearchIcon className="w-8 h-8 text-zinc-500 dark:text-zinc-500 mb-2" />
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200 mb-1">No repositories found for &quot;{searchQuery}&quot;</p>
          <p className="text-[11px] text-zinc-500 font-medium">Try searching for project names like &quot;obs-studio&quot;, &quot;ollama&quot;, or &quot;vscode&quot;.</p>
        </div>
      )}
    </motion.div>
  );
}
