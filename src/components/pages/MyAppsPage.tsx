/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  SquareIcon,
  FolderOpenIcon,
  PackageIcon,
  Loader2Icon,
  GlobeIcon,
  Trash2Icon,
  Code2Icon,
  TerminalIcon,
  XIcon,
} from '@/components/ui/hugeicons';
import type { InstalledApp } from '@/lib/types';

export default function MyAppsPage() {
  const { installedApps, navigate, updateInstalledAppStatus, removeInstalledApp } = useAppStore();
  const [uninstallTarget, setUninstallTarget] = useState<string | null>(null);
  const [startingAppId, setStartingAppId] = useState<string | null>(null);
  const [runningWebUrls, setRunningWebUrls] = useState<Record<string, string>>({});
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    async function syncRegistry() {
      if (isElectron && typeof window.electronAPI?.getInstalledApps === 'function') {
        try {
          const list: InstalledApp[] = await window.electronAPI.getInstalledApps();
          if (list && list.length > 0) {
            useAppStore.setState({ installedApps: list });
          }
        } catch (err) {
          console.error('Error reading installed apps registry:', err);
        }
      }
    }
    syncRegistry();
  }, [isElectron]);

  const handleLaunchOrRun = async (installed: InstalledApp) => {
    if (!isElectron) {
      alert('Local agent execution is available in the desktop application.');
      return;
    }

    const mode = installed.run_mode || 'folder';
    const path = installed.install_path;

    setStartingAppId(installed.id);

    switch (mode) {
      case 'browser': {
        try {
          const eco = await window.electronAPI!.inspectRepoEcosystem(path);
          const startCmd = installed.start_command || eco.start_command;

          if (startCmd) {
            await window.electronAPI!.startBackgroundService(startCmd, path, installed.id);
            const targetPort = eco.detected_port || 3000;
            const webUrl = `http://localhost:${targetPort}`;

            let retries = 0;
            const interval = setInterval(async () => {
              retries++;
              const check = await window.electronAPI!.checkPort(targetPort);
              if (check.inUse || retries >= 15) {
                clearInterval(interval);
                setStartingAppId(null);
                updateInstalledAppStatus(installed.id, 'running');
                setRunningWebUrls((prev) => ({ ...prev, [installed.id]: webUrl }));
                await window.electronAPI!.launchApp({ url: webUrl });
              }
            }, 1000);
          } else {
            setStartingAppId(null);
            await window.electronAPI!.launchApp({ path });
          }
        } catch (err) {
          console.error('Error launching service:', err);
          setStartingAppId(null);
        }
        break;
      }

      case 'ide': {
        await window.electronAPI!.openInIDE(path);
        setStartingAppId(null);
        break;
      }

      case 'terminal': {
        await window.electronAPI!.executeTerminalCommand(`start cmd /k "cd /d ${path}"`, path);
        setStartingAppId(null);
        break;
      }

      case 'executable': {
        await window.electronAPI!.launchApp({ path, command: installed.start_command });
        updateInstalledAppStatus(installed.id, 'running');
        setStartingAppId(null);
        break;
      }

      default: {
        await window.electronAPI!.launchApp({ path });
        setStartingAppId(null);
        break;
      }
    }
  };

  const handleStopService = async (installed: InstalledApp) => {
    if (isElectron && typeof window.electronAPI?.stopBackgroundService === 'function') {
      await window.electronAPI.stopBackgroundService(installed.id);
    }
    updateInstalledAppStatus(installed.id, 'stopped');
    setRunningWebUrls((prev) => {
      const copy = { ...prev };
      delete copy[installed.id];
      return copy;
    });
  };

  const handleOpenFolder = async (installed: InstalledApp) => {
    if (isElectron && installed.install_path) {
      await window.electronAPI!.launchApp({ path: installed.install_path });
    }
  };

  const handleConfirmUninstall = async (id: string) => {
    const target = installedApps.find((a) => a.id === id);
    if (target) {
      if (isElectron) {
        await window.electronAPI!.stopBackgroundService(target.id);
        await window.electronAPI!.uninstallApp(target.id, target.install_path);
      }
      removeInstalledApp(id);
    }
    setUninstallTarget(null);
  };

  function getRunModeInfo(mode: string) {
    switch (mode) {
      case 'browser':
        return { label: 'Run Server & Open', icon: GlobeIcon, actionLabel: 'Open Browser' };
      case 'ide':
        return { label: 'Open in IDE', icon: Code2Icon, actionLabel: 'Open in IDE' };
      case 'terminal':
        return { label: 'Open Terminal', icon: TerminalIcon, actionLabel: 'Open Terminal' };
      case 'executable':
        return { label: 'Launch', icon: PlayIcon, actionLabel: 'Launch' };
      default:
        return { label: 'Open Folder', icon: FolderOpenIcon, actionLabel: 'Open' };
    }
  }

  if (installedApps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <PackageIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">No apps installed</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 max-w-xs font-normal">
          Search open-source software or GitHub repos to set them up hands-free.
        </p>
        <button
          onClick={() => navigate('home')}
          className="btn-primary px-5 py-2 text-xs font-semibold cursor-pointer"
        >
          Explore Projects
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
        Installed Applications ({installedApps.length})
      </h1>

      <div className="space-y-2.5">
        {installedApps.map((installed, i) => {
          const app = installed.application;
          const mode = installed.run_mode || 'folder';
          const isRunning = installed.status === 'running';
          const isStarting = startingAppId === installed.id;
          const webUrl = runningWebUrls[installed.id] || installed.local_url;
          const modeInfo = getRunModeInfo(mode);
          const ModeIcon = modeInfo.icon;

          return (
            <motion.div
              key={installed.id}
              initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl p-4 border border-zinc-200 dark:border-white/10"
            >
              <div className="flex items-center gap-3.5">
                {/* Icon */}
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">{app.name}</h3>
                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-zinc-900 dark:bg-zinc-100 pulse-dot' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {isStarting ? 'Starting...' : isRunning ? 'Active' : 'Ready'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-normal">
                    v{installed.version} • Installed {new Date(installed.installed_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {mode === 'browser' && isRunning ? (
                    <>
                      {webUrl && (
                        <a
                          href={webUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <GlobeIcon className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleStopService(installed)}
                        className="btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <SquareIcon className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleLaunchOrRun(installed)}
                      disabled={isStarting}
                      className="btn-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      {isStarting ? (
                        <>
                          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                          <span>Starting...</span>
                        </>
                      ) : (
                        <>
                          <ModeIcon className="w-3.5 h-3.5" />
                          <span>{modeInfo.label}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenFolder(installed)}
                    className="btn-secondary p-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer"
                    title="Open project folder"
                  >
                    <FolderOpenIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setUninstallTarget(installed.id)}
                    className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                    title="Uninstall App"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Blur Opening Modal Dialog for Uninstall Confirmation */}
      <AnimatePresence>
        {uninstallTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(12px)' }}
              transition={{ duration: 0.2 }}
              className="glass-panel rounded-2xl p-5 max-w-sm w-full border border-zinc-200 dark:border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Uninstall Application</h3>
                <button onClick={() => setUninstallTarget(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-5 font-normal">
                Are you sure you want to uninstall this application? Installed files will be removed from your disk.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setUninstallTarget(null)}
                  className="btn-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleConfirmUninstall(uninstallTarget)}
                  className="btn-primary px-3.5 py-1.5 font-semibold text-xs cursor-pointer"
                >
                  Uninstall
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
