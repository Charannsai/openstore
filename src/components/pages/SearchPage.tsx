'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import AppCard from '@/components/store/AppCard';
import SearchBar from '@/components/store/SearchBar';
import { searchGitHubRepos } from '@/lib/github-api';
import type { Application } from '@/lib/types';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Loader2, Search } from 'lucide-react';
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

        // Store in global store for navigation
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
        <span className="text-xs text-zinc-500 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors border ${
              activeCategory === cat.id
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-medium'
                : 'bg-zinc-900 text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:border-white/20'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {(['easy', 'moderate', 'advanced'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors border ${
              activeDifficulty === d
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-medium'
                : 'bg-zinc-900 text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:border-white/20'
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
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 ml-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {searchQuery ? `Results for "${searchQuery}" (${filteredResults.length})` : 'Popular Open-Source Projects'}
        </h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching repositories...</span>
          </div>
        )}
      </div>

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-36 rounded-xl bg-zinc-900/60 border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredResults.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border border-white/[0.08]">
          <Search className="w-8 h-8 text-zinc-600 mb-3" />
          <p className="text-xs font-medium text-zinc-300 mb-1">No repositories found for &quot;{searchQuery}&quot;</p>
          <p className="text-[11px] text-zinc-500">Try searching for project names like &quot;obs-studio&quot;, &quot;ollama&quot;, or &quot;vscode&quot;.</p>
        </div>
      )}
    </motion.div>
  );
}
