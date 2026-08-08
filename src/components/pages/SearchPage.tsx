'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { searchApps, applications, categories } from '@/lib/mock-data';
import AppCard from '@/components/store/AppCard';
import SearchBar from '@/components/store/SearchBar';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

export default function SearchPage() {
  const { searchQuery, navigate } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);

  let results = searchQuery ? searchApps(searchQuery) : applications;

  if (activeCategory) {
    results = results.filter((a) => a.category_id === activeCategory);
  }
  if (activeDifficulty) {
    results = results.filter((a) => a.difficulty === activeDifficulty);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-zinc-500 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
              activeCategory === cat.id
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/[0.04] text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {(['easy', 'moderate', 'advanced'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
            className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
              activeDifficulty === d
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/[0.04] text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            {d === 'easy' ? '🟢' : d === 'moderate' ? '🟡' : '🔴'} {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        {(activeCategory || activeDifficulty) && (
          <button
            onClick={() => {
              setActiveCategory(null);
              setActiveDifficulty(null);
            }}
            className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-400">
          {searchQuery ? (
            <>
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </>
          ) : (
            <>{results.length} applications</>
          )}
        </h2>
      </div>

      {/* Results grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-zinc-500 mb-2">No applications found</p>
          <p className="text-xs text-zinc-600">Try a different search or adjust filters.</p>
        </div>
      )}
    </motion.div>
  );
}
