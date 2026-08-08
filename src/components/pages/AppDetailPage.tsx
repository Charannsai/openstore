'use client';

import { useAppStore } from '@/store/app-store';
import { getAppBySlug } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  StarIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  GlobeIcon,
  InfoIcon,
  HardDriveIcon,
} from '@/components/ui/hugeicons';

export default function AppDetailPage() {
  const { selectedAppSlug, navigate, startInstallation, installedApps, applications } = useAppStore();

  const app = applications.find((a) => a.slug === selectedAppSlug) || (selectedAppSlug ? getAppBySlug(selectedAppSlug) : null);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-xs text-zinc-500">Repository metadata not found.</p>
        <button
          onClick={() => navigate('home')}
          className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
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
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Discover</span>
      </button>

      {/* Header Banner Card */}
      <div className="glass-card rounded-2xl p-6 border border-zinc-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* App Icon */}
            <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/10">
              <img
                src={app.icon_url}
                alt={app.name}
                className="w-10 h-10 object-contain rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-lg font-bold text-zinc-800 dark:text-zinc-200">${app.name.substring(0, 2).toUpperCase()}</span>`;
                  }
                }}
              />
            </div>

            {/* App Details */}
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{app.name}</h1>
                <span className="badge-minimal capitalize font-medium">{app.difficulty}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">{app.developer}</p>
              
              <div className="flex items-center gap-4 mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {app.star_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-zinc-800 dark:text-zinc-200">{formatCount(app.star_count)} stars</span>
                  </div>
                )}
                {app.download_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <DownloadIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>{formatCount(app.download_count)} downloads</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isInstalled ? (
              <button
                disabled
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                <span>Installed</span>
              </button>
            ) : (
              <button
                onClick={() => startInstallation(app.id)}
                className="flex-1 sm:flex-initial btn-primary px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer font-semibold"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}

            {app.repository_url && (
              <a
                href={app.repository_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary p-2.5 rounded-xl text-xs flex items-center justify-center"
                title="View Repository"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Description & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-zinc-200/80 dark:border-white/10">
            <h2 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-3">About</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {app.long_description || app.description}
            </p>
          </div>
        </div>

        {/* Sidebar Specs Panel */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-zinc-200/80 dark:border-white/10 space-y-3.5">
            <h2 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">Specifications</h2>

            <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-200/50 dark:border-white/[0.06]">
              <span className="text-zinc-500 dark:text-zinc-400 font-normal flex items-center gap-2">
                <GlobeIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" /> Platform
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Windows x64</span>
            </div>

            {app.license && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-200/50 dark:border-white/[0.06]">
                <span className="text-zinc-500 dark:text-zinc-400 font-normal flex items-center gap-2">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" /> License
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{app.license}</span>
              </div>
            )}

            {app.latest_version && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-200/50 dark:border-white/[0.06]">
                <span className="text-zinc-500 dark:text-zinc-400 font-normal flex items-center gap-2">
                  <HardDriveIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" /> Latest Version
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">v{app.latest_version}</span>
              </div>
            )}

            {app.updated_at && (
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-normal flex items-center gap-2">
                  <InfoIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" /> Last Updated
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatRelativeTime(app.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
