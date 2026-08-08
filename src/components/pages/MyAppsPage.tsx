'use client';

import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  RotateCw,
  Trash2,
  ExternalLink,
  MoreVertical,
  Package,
} from 'lucide-react';
import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';

export default function MyAppsPage() {
  const { installedApps, navigate, updateInstalledAppStatus, removeInstalledApp } = useAppStore();
  const [uninstallTarget, setUninstallTarget] = useState<string | null>(null);

  if (installedApps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Package className="w-12 h-12 text-zinc-700 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-400 mb-2">No apps installed</h2>
        <p className="text-sm text-zinc-600 mb-6">
          Browse the store to discover open-source software.
        </p>
        <button
          onClick={() => navigate('home')}
          className="btn-install px-6 py-2.5 rounded-xl text-white font-medium text-sm"
        >
          Explore Apps
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-xl font-bold text-white mb-6">My Apps</h1>

      <div className="space-y-3">
        {installedApps.map((installed, i) => {
          const app = installed.application;
          const isRunning = installed.status === 'running';
          const hasUpdate = installed.version !== app.latest_version;

          return (
            <motion.div
              key={installed.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center border border-white/[0.06] flex-shrink-0">
                  <img
                    src={app.icon_url}
                    alt={app.name}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg">${app.name.charAt(0)}</span>`;
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{app.name}</h3>
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isRunning ? 'bg-emerald-400 pulse-dot' : 'bg-zinc-600'
                    }`} />
                    <span className={`text-[11px] ${isRunning ? 'text-emerald-400' : 'text-zinc-600'}`}>
                      {isRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-zinc-500">v{installed.version}</span>
                    <span className="text-[11px] text-zinc-600">
                      Installed {formatRelativeTime(installed.installed_at)}
                    </span>
                    {hasUpdate && (
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full font-medium">
                        Update available
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5">
                  {installed.local_url && (
                    <button className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-indigo-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  {isRunning ? (
                    <button
                      onClick={() => updateInstalledAppStatus(installed.id, 'stopped')}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-amber-400 transition-colors"
                      title="Stop"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => updateInstalledAppStatus(installed.id, 'running')}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-emerald-400 transition-colors"
                      title="Start"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors" title="Restart">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setUninstallTarget(installed.id)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Uninstall"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Uninstall Dialog */}
      {uninstallTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4"
          >
            <h3 className="text-base font-semibold text-white mb-4">
              Uninstall {installedApps.find((a) => a.id === uninstallTarget)?.application.name}?
            </h3>
            <div className="space-y-3 mb-5">
              <label className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Application</span>
                <span className="text-xs text-emerald-400">✓ Remove</span>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">User data</span>
                <span className="text-xs text-zinc-500">○ Keep</span>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Downloaded files</span>
                <span className="text-xs text-zinc-500">○ Remove</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  removeInstalledApp(uninstallTarget);
                  setUninstallTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors"
              >
                Uninstall
              </button>
              <button
                onClick={() => setUninstallTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-zinc-300 text-sm font-medium hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
