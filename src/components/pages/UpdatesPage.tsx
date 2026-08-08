/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { RefreshCwIcon, CheckCircleIcon, ArrowRightIcon, Loader2Icon } from '@/components/ui/hugeicons';

export default function UpdatesPage() {
  const { installedApps, startInstallation } = useAppStore();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    // Simulate real update check latency
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastChecked(new Date().toLocaleTimeString());
    setIsChecking(false);
  };

  const appsWithUpdates = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Updates</h1>
          {lastChecked && (
            <p className="text-[10px] text-zinc-400 mt-0.5">Last checked: {lastChecked}</p>
          )}
        </div>
        <button
          onClick={handleCheckUpdates}
          disabled={isChecking}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 cursor-pointer disabled:opacity-60"
        >
          {isChecking ? (
            <Loader2Icon className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
          ) : (
            <RefreshCwIcon className="w-3.5 h-3.5 text-zinc-500" />
          )}
          <span>{isChecking ? 'Checking...' : 'Check for updates'}</span>
        </button>
      </div>

      {appsWithUpdates.length > 0 ? (
        <div className="space-y-2.5">
          {appsWithUpdates.map((installed, i) => {
            const app = installed.application;
            return (
              <motion.div
                key={installed.id}
                initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-xl p-4 border border-zinc-200 dark:border-white/10"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-white/10 flex-shrink-0">
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
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{app.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-500 font-medium">v{installed.version}</span>
                      <ArrowRightIcon className="w-3 h-3 text-zinc-400" />
                      <span className="text-[10px] text-zinc-900 dark:text-zinc-100 font-semibold">v{app.latest_version}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startInstallation(app.id)}
                    className="btn-primary px-4 py-1.5 text-xs font-semibold cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <CheckCircleIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
          <h2 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">All applications up to date</h2>
          <p className="text-[11px] text-zinc-500">No pending releases found for installed applications.</p>
        </div>
      )}
    </motion.div>
  );
}
