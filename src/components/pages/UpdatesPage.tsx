'use client';

import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { Download, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UpdatesPage() {
  const { installedApps, navigate } = useAppStore();

  // Find apps with updates (version mismatch)
  const appsWithUpdates = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Updates</h1>
        <button className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]">
          <RefreshCw className="w-3.5 h-3.5" />
          Check for updates
        </button>
      </div>

      {appsWithUpdates.length > 0 ? (
        <div className="space-y-3">
          {appsWithUpdates.map((installed, i) => {
            const app = installed.application;
            return (
              <motion.div
                key={installed.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center border border-white/[0.06]">
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
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{app.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-zinc-500">v{installed.version}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600" />
                      <span className="text-[11px] text-indigo-400 font-medium">v{app.latest_version}</span>
                    </div>
                  </div>
                  <button className="btn-install px-5 py-2 rounded-xl text-white font-medium text-xs">
                    Update
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mb-4" />
          <h2 className="text-base font-semibold text-zinc-400 mb-2">All up to date</h2>
          <p className="text-sm text-zinc-600">Your installed apps are running the latest versions.</p>
        </div>
      )}
    </motion.div>
  );
}
