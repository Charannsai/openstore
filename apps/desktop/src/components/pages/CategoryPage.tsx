'use client';

import { useAppStore } from '@/store/app-store';
import { searchGitHubRepos } from '@/lib/github-api';
import { CATEGORIES } from '@/lib/constants';
import AppCard from '@/components/store/AppCard';
import type { Application } from '@/lib/types';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, Loader2Icon } from '@/components/ui/hugeicons';
import { useEffect, useState } from 'react';

export default function CategoryPage() {
  const { selectedCategoryId, navigate } = useAppStore();
  const category = CATEGORIES.find((c) => c.id === selectedCategoryId);
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryApps() {
      if (!category) return;
      setIsLoading(true);
      const results = await searchGitHubRepos(category.name);
      setApps(results);

      useAppStore.setState((state) => ({
        applications: [...results, ...state.applications],
      }));
      setIsLoading(false);
    }

    loadCategoryApps();
  }, [category]);

  if (!category) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-xs text-zinc-500 font-medium">Category not found.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Back */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-5 cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Discover</span>
      </button>

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{category.name} Repositories</h1>
          <p className="text-xs font-normal text-zinc-500 dark:text-zinc-400 mt-0.5">Top open-source projects in {category.name.toLowerCase()}</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching...</span>
          </div>
        )}
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-36 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : apps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {apps.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-xl border border-zinc-200 dark:border-white/10">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">No applications found in this category.</p>
        </div>
      )}
    </motion.div>
  );
}
