'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  Loader2Icon,
  GlobeIcon,
  FolderOpenIcon,
  Code2Icon,
  TerminalIcon,
  ShieldCheckIcon,
  DownloadIcon,
} from '@/components/ui/hugeicons';
import type { InstalledApp } from '@/lib/types';
import { runRealInstallation } from '@/lib/installer-engine';

export default function InstallPage() {
  const { selectedAppSlug, navigate, applications, addInstalledApp, addActivity, updateInstalledAppStatus } = useAppStore();
  const app = applications.find((a) => a.slug === selectedAppSlug);

  const isBinary = app ? (app.installation_methods[0] === 'OFFICIAL_INSTALLER' && !app.repository_url?.includes('github.com')) : false;

  const [, setRunningWebUrls] = useState<Record<string, string>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed'>('running');
  const [installedRecord, setInstalledRecord] = useState<InstalledApp | null>(null);
  const [isStartingServer, setIsStartingServer] = useState(false);

  // Prerequisite State
  const [prereqs, setPrereqs] = useState<{ git: boolean; node: boolean }>({ git: true, node: true });
  const [wingetAvailable, setWingetAvailable] = useState(false);
  const [isInstallingWinget, setIsInstallingWinget] = useState<string | null>(null);

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    async function initCheck() {
      if (isElectron && window.electronAPI) {
        try {
          const [prereqCheck, wingetCheck] = await Promise.all([
            window.electronAPI.checkPrerequisites(),
            window.electronAPI.checkWinget(),
          ]);

          setPrereqs({
            git: prereqCheck.git.installed,
            node: prereqCheck.node.installed,
          });
          setWingetAvailable(wingetCheck.available);
        } catch {}
      }
    }
    initCheck();
  }, [isElectron]);

  useEffect(() => {
    if (!app) return;

    let isMounted = true;

    async function execute() {
      if (!app) return;
      try {
        const record = await runRealInstallation(app, {
          onTaskChange: () => {},
          onOverallProgress: (pct: number) => {
            if (isMounted) setOverallProgress(pct);
          },
          onLog: () => {},
        });

        if (isMounted) {
          setInstalledRecord(record);
          setStatus('completed');
          addInstalledApp(record);
          addActivity({
            id: `act-${Date.now()}`,
            type: 'install',
            application_name: app.name,
            application_icon: app.icon_url,
            message: `Installed ${app.name} (${app.latest_version})`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch {
        if (isMounted) {
          setStatus('failed');
        }
      }
    }

    execute();

    return () => {
      isMounted = false;
    };
  }, [app, addActivity, addInstalledApp]);

  const handleAutoFixPrerequisite = async (packageId: string) => {
    if (!isElectron || !window.electronAPI?.installWingetPackage) return;
    setIsInstallingWinget(packageId);

    try {
      const res = await window.electronAPI.installWingetPackage(packageId);
      if (res.success) {
        if (window.electronAPI.checkPrerequisites) {
          const updated = await window.electronAPI.checkPrerequisites();
          setPrereqs({ git: updated.git.installed, node: updated.node.installed });
        }
      }
    } catch {} finally {
      setIsInstallingWinget(null);
    }
  };

  const handleOpen = async () => {
    if (!installedRecord || !isElectron) return;

    const mode = installedRecord.run_mode || 'folder';
    const projPath = installedRecord.install_path;

    setIsStartingServer(true);

    try {
      switch (mode) {
        case 'browser': {
          const eco = await window.electronAPI!.inspectRepoEcosystem(projPath);
          const startCmd = installedRecord.start_command || eco.start_command;

          if (startCmd) {
            await window.electronAPI!.startBackgroundService(startCmd, projPath, installedRecord.id);
            const targetPort = eco.detected_port || 3000;
            const webUrl = `http://localhost:${targetPort}`;

            let retries = 0;
            const interval = setInterval(async () => {
              retries++;
              const check = await window.electronAPI!.checkPort(targetPort);
              if (check.inUse || retries >= 15) {
                clearInterval(interval);
                setIsStartingServer(false);
                updateInstalledAppStatus(installedRecord.id, 'running');
                setRunningWebUrls((prev) => ({ ...prev, [installedRecord.id]: webUrl }));
                await window.electronAPI!.launchApp({ url: webUrl });
              }
            }, 1000);
          }
          break;
        }

        case 'ide': {
          await window.electronAPI!.openInIDE(projPath);
          setIsStartingServer(false);
          break;
        }

        case 'terminal': {
          await window.electronAPI!.executeTerminalCommand(`start cmd /k "cd /d ${projPath}"`, projPath);
          setIsStartingServer(false);
          break;
        }

        default: {
          await window.electronAPI!.launchApp({ path: projPath });
          setIsStartingServer(false);
          break;
        }
      }
    } catch {
      setIsStartingServer(false);
    }
  };

  const handleOpenFolder = async () => {
    if (installedRecord?.install_path && isElectron) {
      await window.electronAPI!.launchApp({ path: installedRecord.install_path });
    }
  };

  if (!app) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-xs text-zinc-500">No application selected.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('app-detail', { slug: app.slug })}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Application</span>
      </button>

      {/* Main Installation Card */}
      <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/10 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-white/10 flex-shrink-0 p-2">
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-8 h-8 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-zinc-950 dark:text-white truncate tracking-tight">
              {status === 'completed' ? `${app.name} Ready` : `Installing ${app.name}`}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
              {status === 'completed'
                ? 'Installation complete & workspace configured'
                : status === 'failed'
                ? 'Installation failed'
                : 'Downloading & setting up dependencies...'}
            </p>
          </div>
          {status === 'running' && (
            <div className="text-right">
              <span className="text-lg font-extrabold text-zinc-950 dark:text-white font-mono tracking-tight">
                {overallProgress}%
              </span>
            </div>
          )}
        </div>

        {/* Clean Percentage Progress Bar */}
        {status !== 'completed' && (
          <div className="space-y-2">
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10">
              <motion.div
                className="h-full bg-zinc-950 dark:bg-white rounded-full"
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Prerequisite Missing Card */}
      {(!prereqs.git || !prereqs.node) && (
        <div className="glass-card rounded-2xl p-5 mt-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Prerequisites Missing</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                {!prereqs.git && !prereqs.node
                  ? 'Git CLI & Node.js are missing on your system.'
                  : !prereqs.git
                  ? 'Git CLI is not installed on your system.'
                  : 'Node.js runtime is not installed on your system.'}
              </p>
            </div>

            {wingetAvailable && (
              <div className="flex items-center gap-2">
                {!prereqs.git && (
                  <button
                    onClick={() => handleAutoFixPrerequisite('Git.Git')}
                    disabled={!!isInstallingWinget}
                    className="btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isInstallingWinget === 'Git.Git' ? (
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <DownloadIcon className="w-3.5 h-3.5" />
                    )}
                    <span>1-Click Fix Git</span>
                  </button>
                )}

                {!prereqs.node && (
                  <button
                    onClick={() => handleAutoFixPrerequisite('OpenJS.NodeJS')}
                    disabled={!!isInstallingWinget}
                    className="btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isInstallingWinget === 'OpenJS.NodeJS' ? (
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <DownloadIcon className="w-3.5 h-3.5" />
                    )}
                    <span>1-Click Fix Node</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Actions Card */}
      <AnimatePresence>
        {status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 mt-4 text-center border border-zinc-200 dark:border-white/10 shadow-xs space-y-4"
          >
            <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto" />
            <div>
              <h2 className="text-sm font-bold text-zinc-950 dark:text-white">
                Setup Complete
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto font-medium">
                {isBinary ? 'Binary installer verified and ready.' : 'Repository cloned and local environment configured.'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 pt-2">
              <button
                onClick={handleOpen}
                disabled={isStartingServer}
                className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isStartingServer ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : installedRecord?.run_mode === 'browser' ? (
                  <>
                    <GlobeIcon className="w-4 h-4" />
                    <span>Run Server & Open</span>
                  </>
                ) : installedRecord?.run_mode === 'ide' ? (
                  <>
                    <Code2Icon className="w-4 h-4" />
                    <span>Open in IDE</span>
                  </>
                ) : installedRecord?.run_mode === 'terminal' ? (
                  <>
                    <TerminalIcon className="w-4 h-4" />
                    <span>Open Terminal</span>
                  </>
                ) : (
                  <>
                    <FolderOpenIcon className="w-4 h-4" />
                    <span>Open</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenFolder}
                className="btn-secondary px-4 py-2.5 text-xs font-medium flex items-center gap-2 cursor-pointer"
                title="Open project folder in Windows Explorer"
              >
                <FolderOpenIcon className="w-4 h-4" />
                <span>Open Folder</span>
              </button>

              <button
                onClick={() => navigate('my-apps')}
                className="btn-secondary px-4 py-2.5 text-xs font-medium cursor-pointer"
              >
                My Apps
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
