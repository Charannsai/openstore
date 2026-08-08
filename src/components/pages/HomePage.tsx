'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/store/SearchBar';
import AppCard from '@/components/store/AppCard';
import CategoryGrid from '@/components/store/CategoryGrid';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Cpu, ChevronRight, Loader2 } from 'lucide-react';
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

      // Store fetched apps in Zustand store
      useAppStore.setState((state) => ({
        applications: [...popular, ...aiResults],
      }));

      setIsLoading(false);
    }

    loadInitialData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative pt-4 pb-2"
      >
        <div className="relative text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Open-source software, simplified.
          </h1>
          <p className="text-xs text-zinc-400 mb-6 font-normal">
            Discover, install, and run open-source projects — directly from GitHub.
          </p>
          <SearchBar />
        </div>
      </motion.section>

      {/* Featured */}
      <Section title="Featured Projects" icon={<Sparkles className="w-3.5 h-3.5 text-zinc-400" />}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
      <Section title="Popular Repositories" icon={<TrendingUp className="w-3.5 h-3.5 text-zinc-400" />}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {popularApps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* AI Tools */}
      <Section title="AI & Machine Learning" icon={<Cpu className="w-3.5 h-3.5 text-zinc-400" />} showAll="ai-tools">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {aiApps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
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
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">{title}</h2>
        </div>
        {showAll && (
          <button
            onClick={() => navigate('category', { categoryId: showAll })}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-36 rounded-xl bg-zinc-900/60 border border-white/[0.05] animate-pulse" />
      ))}
    </div>
  );
}
