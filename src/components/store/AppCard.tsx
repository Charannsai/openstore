'use client';

import type { Application } from '@/lib/types';
import { useAppStore } from '@/store/app-store';
import { Star, GitFork, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppCardProps {
  app: Application;
  index?: number;
}

export default function AppCard({ app, index = 0 }: AppCardProps) {
  const { navigate } = useAppStore();

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      onClick={() => navigate('app-detail', { slug: app.slug })}
      className="app-card glass-card p-4 rounded-xl text-left w-full group cursor-pointer border border-white/[0.07] hover:border-white/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon / Avatar */}
        <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/[0.08]">
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-7 h-7 object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-xs font-semibold text-zinc-300">${app.name.substring(0, 2).toUpperCase()}</span>`;
              }
            }}
          />
        </div>

        {/* Title + Developer */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-100 truncate group-hover:text-white transition-colors tracking-tight">
            {app.name}
          </h3>
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{app.developer}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 leading-normal mb-4 line-clamp-2 min-h-[32px] font-normal">
        {app.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
          {/* Stars */}
          {app.star_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-zinc-400" />
              <span>{formatCount(app.star_count)}</span>
            </div>
          )}

          {/* License */}
          {app.license && (
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-zinc-500" />
              <span className="truncate max-w-[80px]">{app.license}</span>
            </div>
          )}
        </div>

        {/* Difficulty pill */}
        <span className="badge-minimal">
          {app.difficulty.charAt(0).toUpperCase() + app.difficulty.slice(1)}
        </span>
      </div>
    </motion.button>
  );
}
