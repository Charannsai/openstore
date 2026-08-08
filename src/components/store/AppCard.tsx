'use client';

import type { Application } from '@/lib/types';
import { useAppStore } from '@/store/app-store';
import { StarIcon, ShieldCheckIcon } from '@/components/ui/hugeicons';
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
      initial={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      onClick={() => navigate('app-detail', { slug: app.slug })}
      className="glass-card p-4 rounded-xl text-left w-full group cursor-pointer border border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/25 shadow-xs hover:shadow-md transition-all duration-150 bg-white dark:bg-[#141417]"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon / Avatar */}
        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/10 group-hover:scale-105 transition-transform">
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-7 h-7 object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-xs font-semibold text-zinc-900 dark:text-zinc-200">${app.name.substring(0, 2).toUpperCase()}</span>`;
              }
            }}
          />
        </div>

        {/* Title + Developer */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-zinc-950 dark:text-zinc-100 truncate group-hover:text-zinc-900 dark:group-hover:text-white transition-colors tracking-tight">
            {app.name}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-normal">{app.developer}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-normal mb-4 line-clamp-2 min-h-[32px] font-normal">
        {app.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200 dark:border-white/[0.04]">
        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
          {/* Stars */}
          {app.star_count > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-zinc-800 dark:text-zinc-200">{formatCount(app.star_count)}</span>
            </div>
          )}

          {/* License */}
          {app.license && (
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="truncate max-w-[80px] text-zinc-600 dark:text-zinc-400">{app.license}</span>
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
