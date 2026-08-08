'use client';

import { useAppStore } from '@/store/app-store';
import { searchGitHubRepos } from '@/lib/github-api';
import { CATEGORIES } from '@/lib/constants';
import AppCard from '@/components/store/AppCard';
import type { Application } from '@/lib/types';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
        <p className="text-xs text-zinc-500">Category not found.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Back */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">{category.name} Repositories</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Top open-source projects in {category.name.toLowerCase()}</p>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-36 rounded-xl bg-zinc-900/60 border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : apps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {apps.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xs text-zinc-500">No applications found in this category.</p>
        </div>
      )}
    </motion.div>
  );
}
