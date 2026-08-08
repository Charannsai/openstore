'use client';

import type { Application } from '@/lib/types';
import { useAppStore } from '@/store/app-store';
import { getDifficultyInfo } from '@/lib/utils';
import { Download, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppCardProps {
  app: Application;
  index?: number;
}

export default function AppCard({ app, index = 0 }: AppCardProps) {
  const { navigate } = useAppStore();

  const difficulty = getDifficultyInfo(app.difficulty);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      onClick={() => navigate('app-detail', { slug: app.slug })}
      className="app-card glass-card p-5 rounded-2xl text-left w-full group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-3.5">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/[0.06]">
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl">${app.name.charAt(0)}</span>`;
            }}
          />
        </div>

        {/* Title + Developer */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {app.name}
          </h3>
          <p className="text-xs text-zinc-500 truncate">{app.developer}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
        {app.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Downloads */}
          <div className="flex items-center gap-1 text-zinc-600">
            <Download className="w-3 h-3" />
            <span className="text-[11px]">{formatCount(app.download_count)}</span>
          </div>

          {/* Stars */}
          {app.star_count > 0 && (
            <div className="flex items-center gap-1 text-zinc-600">
              <Star className="w-3 h-3" />
              <span className="text-[11px]">{formatCount(app.star_count)}</span>
            </div>
          )}

          {/* License badge */}
          <div className="flex items-center gap-1 text-zinc-600">
            <Shield className="w-3 h-3" />
            <span className="text-[11px]">{app.license}</span>
          </div>
        </div>

        {/* Difficulty */}
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${difficulty.bg} ${difficulty.color}`}>
          {difficulty.emoji} {difficulty.label}
        </span>
      </div>
    </motion.button>
  );
}
