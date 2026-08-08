'use client';

import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UpdatesPage() {
  const { installedApps } = useAppStore();

  const appsWithUpdates = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Updates</h1>
        <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
          <RefreshCw className="w-3 h-3" />
          Check for updates
        </button>
      </div>

      {appsWithUpdates.length > 0 ? (
        <div className="space-y-2.5">
          {appsWithUpdates.map((installed, i) => {
            const app = installed.application;
            return (
              <motion.div
                key={installed.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-xl p-4 border border-white/[0.08]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-6 h-6 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-zinc-100">{app.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-500">v{installed.version}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600" />
                      <span className="text-[10px] text-zinc-300 font-medium">v{app.latest_version}</span>
                    </div>
                  </div>
                  <button className="btn-primary px-4 py-1.5 text-xs font-semibold">
                    Update
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <CheckCircle2 className="w-10 h-10 text-zinc-700 mb-3" />
          <h2 className="text-xs font-semibold text-zinc-300 mb-1">All applications up to date</h2>
          <p className="text-[11px] text-zinc-500">No pending releases found for installed applications.</p>
        </div>
      )}
    </motion.div>
  );
}
