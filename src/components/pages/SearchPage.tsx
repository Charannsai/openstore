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
        <span className="text-xs text-slate-500 dark:text-zinc-400 mr-1 flex items-center gap-1.5 font-semibold">
          <SlidersIcon className="w-4 h-4 text-indigo-500" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all border cursor-pointer font-semibold ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {(['easy', 'moderate', 'advanced'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all border cursor-pointer font-semibold ${
              activeDifficulty === d
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-zinc-200'
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
            className="text-xs text-rose-500 font-bold hover:text-rose-600 transition-colors flex items-center gap-1 ml-1 cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          {searchQuery ? `Results for "${searchQuery}" (${filteredResults.length})` : 'Popular Open-Source Projects'}
        </h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-500 font-semibold">
            <Loader2Icon className="w-4 h-4 animate-spin" />
            <span>Fetching repositories...</span>
          </div>
        )}
      </div>

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-40 rounded-2xl bg-slate-200/50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl border border-slate-200/80 dark:border-white/10">
          <SearchIcon className="w-10 h-10 text-slate-400 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-300 mb-1">No repositories found for &quot;{searchQuery}&quot;</p>
          <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Try searching for project names like &quot;obs-studio&quot;, &quot;ollama&quot;, or &quot;vscode&quot;.</p>
        </div>
      )}
    </motion.div>
  );
}
