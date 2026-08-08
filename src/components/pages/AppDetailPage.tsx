'use client';

import { useAppStore } from '@/store/app-store';
import { getAppBySlug } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  StarIcon,
  GitForkIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  MonitorIcon,
  CpuIcon,
  HardDriveIcon,
  GlobeIcon,
  InfoIcon,
  DownloadIcon,
} from '@/components/ui/hugeicons';

export default function AppDetailPage() {
  const { selectedAppSlug, navigate, startInstallation, installedApps, applications } = useAppStore();

  const app = applications.find((a) => a.slug === selectedAppSlug) || (selectedAppSlug ? getAppBySlug(selectedAppSlug) : null);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Repository metadata not found.</p>
        <button
          onClick={() => navigate('home')}
          className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    );
  }

  const isInstalled = installedApps.some((a) => a.id === app.id);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: 'blur(12px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(12px)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Discover</span>
      </button>

      {/* Header Banner Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* App Icon */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10 shadow-lg">
              <img
                src={app.icon_url}
                alt={app.name}
                className="w-11 h-11 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-xl font-extrabold text-slate-800 dark:text-zinc-200">${app.name.substring(0, 2).toUpperCase()}</span>`;
                  }
                }}
              />
            </div>

            {/* App Details */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{app.name}</h1>
                <span className="badge-minimal capitalize font-semibold">{app.difficulty}</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-1">{app.developer}</p>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                {app.star_count > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-slate-800 dark:text-zinc-200">{formatCount(app.star_count)} stars</span>
                  </div>
                )}
                {app.fork_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <GitForkIcon className="w-4 h-4 text-indigo-500" />
                    <span>{formatCount(app.fork_count)} forks</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isInstalled ? (
              <button
                disabled
                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Installed</span>
              </button>
            ) : (
              <button
                onClick={() => startInstallation(app.id)}
                className="flex-1 sm:flex-initial btn-primary px-7 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}

            {app.github_url && (
              <a
                href={app.github_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary p-3 rounded-2xl text-xs flex items-center justify-center"
                title="View on GitHub"
              >
                <ExternalLinkIcon className="w-4.5 h-4.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Description & System Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">About</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              {app.long_description || app.description}
            </p>
          </div>

          {app.tags && app.tags.length > 0 && (
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Tags & Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Specifications</h2>

            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                <GlobeIcon className="w-4 h-4 text-indigo-500" /> Platform
              </span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">Windows x64</span>
            </div>

            {app.license && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-indigo-500" /> License
                </span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{app.license}</span>
              </div>
            )}

            {app.size_mb && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-200/50 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                  <HardDriveIcon className="w-4 h-4 text-indigo-500" /> Download Size
                </span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{app.size_mb} MB</span>
              </div>
            )}

            {app.updated_at && (
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                  <InfoIcon className="w-4 h-4 text-indigo-500" /> Last Updated
                </span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{formatRelativeTime(app.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
