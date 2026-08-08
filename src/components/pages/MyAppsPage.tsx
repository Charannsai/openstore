'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { Play, Square, FolderOpen, Package, Loader2, Globe, Trash2, Code2, Terminal } from 'lucide-react';
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

  // ── Context-Aware Open Handler ─────────────────────────────────────────
  const handleOpen = async (installed: InstalledApp) => {
    if (!isElectron) return;

    const mode = installed.run_mode || 'folder';
    const path = installed.install_path;

    switch (mode) {
      case 'browser': {
        // Web app: start dev server → wait for port → open browser
        setStartingAppId(installed.id);

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
                updateInstalledAppStatus(installed.id, 'running');
                setRunningWebUrls((prev) => ({ ...prev, [installed.id]: webUrl }));
                setStartingAppId(null);
                await window.electronAPI!.launchApp({ url: webUrl });
              }
            }, 1000);
          }
        } catch {
          setStartingAppId(null);
        }
        break;
      }

      case 'ide': {
        // IDE project: open in VS Code / Cursor / available IDE
        try {
          const result = await window.electronAPI!.openInIDE(path);
          updateInstalledAppStatus(installed.id, 'running');
        } catch {
          // Fallback: open folder
          await window.electronAPI!.launchApp({ path });
        }
        break;
      }

      case 'terminal': {
        // CLI tool: open terminal at project directory
        try {
          if (typeof window.electronAPI!.executeTerminalCommand === 'function') {
            // Open Windows Terminal / cmd at the project path
            await window.electronAPI!.executeTerminalCommand(`start cmd /k "cd /d ${path}"`, path);
          }
        } catch {
          await window.electronAPI!.launchApp({ path });
        }
        break;
      }

      case 'executable': {
        // Desktop app / binary: launch the executable or start script
        await window.electronAPI!.launchApp({ path, command: installed.start_command });
        updateInstalledAppStatus(installed.id, 'running');
        break;
      }

      default: {
        // Folder: just open in Explorer
        await window.electronAPI!.launchApp({ path });
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

  // ── Run Mode Label & Icon Mapping ──────────────────────────────────────
  function getRunModeInfo(mode: string) {
    switch (mode) {
      case 'browser':
        return { label: 'Run Server & Open', icon: Globe, actionLabel: 'Open Browser' };
      case 'ide':
        return { label: 'Open in IDE', icon: Code2, actionLabel: 'Open in IDE' };
      case 'terminal':
        return { label: 'Open Terminal', icon: Terminal, actionLabel: 'Open Terminal' };
      case 'executable':
        return { label: 'Launch', icon: Play, actionLabel: 'Launch' };
      default:
        return { label: 'Open Folder', icon: FolderOpen, actionLabel: 'Open' };
    }
  }

  if (installedApps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <Package className="w-10 h-10 text-zinc-700 mb-3" />
        <h2 className="text-sm font-semibold text-zinc-300 mb-1">No apps installed</h2>
        <p className="text-xs text-zinc-500 mb-5 max-w-xs">
          Search open-source software or GitHub repos to set them up hands-free.
        </p>
        <button
          onClick={() => navigate('home')}
          className="btn-primary px-5 py-2 text-xs font-semibold"
        >
          Explore Projects
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl p-4 border border-white/[0.08]"
            >
              <div className="flex items-center gap-3.5">
                {/* Icon */}
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-zinc-100 truncate">{app.name}</h3>
                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-zinc-100 pulse-dot' : 'bg-zinc-700'}`} />
                    <span className="text-[10px] text-zinc-500">
                      {isStarting ? 'Starting...' : isRunning ? 'Active' : 'Ready'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-zinc-500">v{installed.version}</span>
                    <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5">
                      {mode === 'browser' ? 'Web App' : mode === 'ide' ? 'IDE Project' : mode === 'terminal' ? 'CLI Tool' : mode === 'executable' ? 'Desktop App' : 'Folder'}
                    </span>
                    <span className="text-[10px] text-zinc-600 truncate max-w-[180px]">
                      {installed.install_path}
                    </span>
                  </div>
                </div>

                {/* Context-Aware Actions */}
                <div className="flex items-center gap-1.5">
                  {isStarting ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg text-xs text-zinc-400 border border-white/10">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-200" />
                      <span>Starting...</span>
                    </div>
                  ) : isRunning && mode === 'browser' ? (
                    <>
                      {webUrl && (
                        <button
                          onClick={() => window.electronAPI?.launchApp({ url: webUrl })}
                          className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Open Browser</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleStopService(installed)}
                        className="btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1"
                        title="Stop background server process"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpen(installed)}
                      className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                      title={modeInfo.label}
                    >
                      <ModeIcon className="w-3.5 h-3.5" />
                      <span>{modeInfo.label}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenFolder(installed)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Open project directory"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setUninstallTarget(installed.id)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Uninstall"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Uninstall Dialog */}
      {uninstallTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="glass-card rounded-xl p-5 max-w-sm w-full border border-white/15"
          >
            <h3 className="text-sm font-semibold text-zinc-100 mb-2">
              Uninstall {installedApps.find((a) => a.id === uninstallTarget)?.application.name}?
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              This will stop any background processes and remove project files from your drive.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirmUninstall(uninstallTarget)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors"
              >
                Uninstall
              </button>
              <button
                onClick={() => setUninstallTarget(null)}
                className="flex-1 py-2 rounded-lg btn-primary text-xs font-semibold"
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
