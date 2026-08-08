'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/store/SearchBar';
import AppCard from '@/components/store/AppCard';
import CategoryGrid from '@/components/store/CategoryGrid';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  TrendingUpIcon,
  CpuIcon,
  ChevronRightIcon,
  Loader2Icon,
} from '@/components/ui/hugeicons';
import { useAppStore } from '@/store/app-store';
import { getPopularGitHubRepos, searchGitHubRepos } from '@/lib/github-api';
import type { Application } from '@/lib/types';

export default function HomePage() {
  const [featuredApps, setFeaturedApps] = useState<Application[]>([]);
  const [aiApps, setAiApps] = useState<Application[]>([]);
  const [popularApps, setPopularApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);

      const [popular, aiResults] = await Promise.all([
        getPopularGitHubRepos(),
        searchGitHubRepos('ai llm local'),
      ]);

      setPopularApps(popular.slice(0, 8));
      setFeaturedApps(popular.slice(0, 4));
      setAiApps(aiResults.slice(0, 4));

      useAppStore.setState((state) => ({
        applications: [...popular, ...aiResults],
      }));

      setIsLoading(false);
    }

    loadInitialData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative pt-4 pb-2"
      >
        <div className="relative text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4 shadow-sm">
            <SparklesIcon className="w-4 h-4" />
            <span>Redesigned & Powered by OpenStore Agent</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Open-source software, <span className="text-gradient">simplified.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mb-8 font-medium">
            Discover, install, and run high-quality open-source desktop applications — directly from GitHub.
          </p>
          <SearchBar />
        </div>
      </motion.section>

      {/* Featured */}
      <Section title="Featured Projects" icon={<SparklesIcon className="w-4 h-4 text-indigo-500" />}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredApps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* Categories */}
      <Section title="Browse Categories" icon={null}>
        <CategoryGrid />
      </Section>

      {/* Popular */}
      <Section title="Popular Repositories" icon={<TrendingUpIcon className="w-4 h-4 text-indigo-500" />}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularApps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* AI Tools */}
      <Section title="AI & Machine Learning" icon={<CpuIcon className="w-4 h-4 text-indigo-500" />} showAll="ai-tools">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiApps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  showAll,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  showAll?: string;
  children: React.ReactNode;
}) {
  const { navigate } = useAppStore();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">{title}</h2>
        </div>
        {showAll && (
          <button
            onClick={() => navigate('category', { categoryId: showAll })}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>Explore All</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-40 rounded-2xl bg-slate-200/50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/10 animate-pulse" />
      ))}
    </div>
  );
}
