'use client';

import { getFeaturedApps, getPopularApps, getNewApps, applications } from '@/lib/mock-data';
import SearchBar from '@/components/store/SearchBar';
import AppCard from '@/components/store/AppCard';
import CategoryGrid from '@/components/store/CategoryGrid';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export default function HomePage() {
  const featured = getFeaturedApps();
  const popular = getPopularApps(8);
  const newest = getNewApps(8);
  const aiApps = applications.filter(a => a.category_id === 'ai-tools');

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative pt-4 pb-2"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent rounded-3xl pointer-events-none" />
        <div className="relative text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Open-source software,{' '}
            <span className="gradient-text">simplified</span>
          </h1>
          <p className="text-sm text-zinc-400 mb-6">
            Discover, install, and manage the best open-source apps — no terminal required.
          </p>
          <SearchBar />
        </div>
      </motion.section>

      {/* Featured */}
      <Section title="Featured" icon={<Sparkles className="w-4 h-4 text-amber-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {featured.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </Section>

      {/* Categories */}
      <Section title="Browse Categories" icon={null}>
        <CategoryGrid />
      </Section>

      {/* Popular */}
      <Section title="Popular this week" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {popular.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </Section>

      {/* AI Tools */}
      <Section title="AI Tools" icon={<span className="text-sm">🤖</span>} showAll="ai-tools">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aiApps.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </Section>

      {/* Newest */}
      <Section title="Recently Added" icon={<Clock className="w-4 h-4 text-blue-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {newest.slice(0, 4).map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>
        {showAll && (
          <button
            onClick={() => navigate('category', { categoryId: showAll })}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
