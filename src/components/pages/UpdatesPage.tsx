'use client';

import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { RefreshCwIcon, CheckCircleIcon, ArrowRightIcon } from '@/components/ui/hugeicons';

export default function UpdatesPage() {
  const { installedApps } = useAppStore();

  const appsWithUpdates = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Updates</h1>
        <button className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 cursor-pointer">
          <RefreshCwIcon className="w-4 h-4 text-indigo-500" />
          <span>Check for updates</span>
        </button>
      </div>

      {appsWithUpdates.length > 0 ? (
        <div className="space-y-3">
          {appsWithUpdates.map((installed, i) => {
            const app = installed.application;
            return (
              <motion.div
                key={installed.id}
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center border border-slate-200 dark:border-white/10 flex-shrink-0">
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-7 h-7 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{app.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">v{installed.version}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">v{app.latest_version}</span>
                    </div>
                  </div>
                  <button className="btn-primary px-5 py-2 text-xs font-bold cursor-pointer">
                    Update Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-1">All applications up to date</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">No pending releases found for installed applications.</p>
        </div>
      )}
    </motion.div>
  );
}
