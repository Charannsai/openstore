'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  Loader2Icon,
  ChevronRightIcon,
  CheckCircle2Icon,
  TerminalIcon,
  GlobeIcon,
  FolderOpenIcon,
  Code2Icon,
  XIcon,
} from '@/components/ui/hugeicons';
import type { Task, InstalledApp } from '@/lib/types';
import { runRealInstallation } from '@/lib/installer-engine';

export default function InstallPage() {
  const { selectedAppSlug, navigate, applications, addInstalledApp, addActivity, updateInstalledAppStatus } = useAppStore();
  const app = applications.find((a) => a.slug === selectedAppSlug);

  const isBinary = app ? (app.installation_methods[0] === 'OFFICIAL_INSTALLER' && !app.repository_url?.includes('github.com')) : false;

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Detect System Environment',
      description: 'Checking local OS, CPU architecture, and disk space',
      type: 'CHECK',
      status: 'RUNNING',
      prerequisites: [],
      actions: [],
      estimated_duration: 1,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
    {
      id: 'task-2',
      title: 'Check Prerequisites',
      description: 'Verifying Git, Node.js, and runtime dependencies',
      type: 'CHECK',
      status: 'LOCKED',
      prerequisites: [],
      actions: [],
      estimated_duration: 1,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
    {
      id: 'task-3',
      title: isBinary ? `Download ${app?.name || 'Installer'}` : `Git Clone ${app?.name || 'Repository'}`,
      description: isBinary ? 'Downloading official installer binary' : 'Cloning source repository directly into Downloads/OpenStore',
      type: 'DOWNLOAD',
      status: 'LOCKED',
      prerequisites: [],
      actions: [],
      estimated_duration: 10,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
    {
      id: 'task-4',
      title: isBinary ? 'Verify File Checksum' : 'Inspect & Install Dependencies',
      description: isBinary ? 'Verifying file integrity' : 'Inspecting package.json & running npm install',
      type: 'VERIFY',
      status: 'LOCKED',
      prerequisites: [],
      actions: [],
      estimated_duration: 15,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
    {
      id: 'task-5',
      title: 'Configure Service Lifecycle',
      description: 'Configuring run scripts and port detection',
      type: 'LAUNCH',
      status: 'LOCKED',
      prerequisites: [],
      actions: [],
      estimated_duration: 1,
      requires_user_interaction: true,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [showDetails, setShowDetails] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [installedRecord, setInstalledRecord] = useState<InstalledApp | null>(null);
  const [isStartingServer, setIsStartingServer] = useState(false);

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    if (!app) return;

    let isMounted = true;

    async function execute() {
      if (!app) return;
      setStatus('running');

      try {
        const record = await runRealInstallation(app, {
          onTaskChange: (idx, updatedTask) => {
            if (!isMounted) return;
            setTasks((prev) => {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...updatedTask };
              return copy;
            });
            setCurrentIdx(idx);
          },
          onLog: (msg) => {
            if (!isMounted) return;
            setLogs((prev) => [...prev, msg]);
          },
          onOverallProgress: (percent) => {
            if (!isMounted) return;
            setOverallProgress(percent);
          },
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
      } catch (err: any) {
        if (isMounted) {
          setStatus('failed');
          setLogs((prev) => [...prev, `[ERROR] Installation failed: ${err.message || err}`]);
        }
      }
    }

    execute();

    return () => {
      isMounted = false;
    };
  }, [app]);

  // ── Context-Aware Post-Install Open Handler ──────────────────────────────
  const handleOpen = async () => {
    if (!installedRecord || !isElectron) return;

    const mode = installedRecord.run_mode || 'folder';
    const projPath = installedRecord.install_path;

    setIsStartingServer(true);

    try {
      switch (mode) {
        case 'browser': {
          setLogs((prev) => [...prev, `[HANDS-FREE] Starting web server for ${app?.name}...`]);
          const eco = await window.electronAPI!.inspectRepoEcosystem(projPath);
          const startCmd = installedRecord.start_command || eco.start_command;

          if (startCmd) {
            await window.electronAPI!.startBackgroundService(startCmd, projPath, installedRecord.id);
            const targetPort = eco.detected_port || 3000;
            const webUrl = `http://localhost:${targetPort}`;
            setLogs((prev) => [...prev, `[HANDS-FREE] Monitoring port ${targetPort}...`]);

            let retries = 0;
            const interval = setInterval(async () => {
              retries++;
              const check = await window.electronAPI!.checkPort(targetPort);
              if (check.inUse || retries >= 15) {
                clearInterval(interval);
                setIsStartingServer(false);
                updateInstalledAppStatus(installedRecord.id, 'running');
                setLogs((prev) => [...prev, `[HANDS-FREE] Server ready! Opening ${webUrl}...`]);
                await window.electronAPI!.launchApp({ url: webUrl });
              }
            }, 1000);
          }
          break;
        }

        case 'ide': {
          setLogs((prev) => [...prev, `[HANDS-FREE] Opening project in IDE...`]);
          const result = await window.electronAPI!.openInIDE(projPath);
          setLogs((prev) => [...prev, `[HANDS-FREE] Opened in ${result.ide}`]);
          setIsStartingServer(false);
          break;
        }

        case 'terminal': {
          setLogs((prev) => [...prev, `[HANDS-FREE] Opening terminal at project directory...`]);
          await window.electronAPI!.executeTerminalCommand(`start cmd /k "cd /d ${projPath}"`, projPath);
          setIsStartingServer(false);
          break;
        }

        case 'executable': {
          await window.electronAPI!.launchApp({ path: projPath });
          setIsStartingServer(false);
          break;
        }

        default: {
          await window.electronAPI!.launchApp({ path: projPath });
          setIsStartingServer(false);
          break;
        }
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('app-detail', { slug: app.slug })}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="glass-card rounded-2xl p-5 mb-5 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center border border-slate-200 dark:border-white/10 flex-shrink-0">
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-6 h-6 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {status === 'completed' ? `${app.name} Ready` : `Installing ${app.name}`}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              {status === 'completed'
                ? 'Dependencies installed & workspace configured'
                : status === 'failed'
                ? 'Installation encountered an error'
                : `Task ${currentIdx + 1} of 5 in progress`}
            </p>
          </div>
        </div>

        {/* Real Progress bar */}
        {status !== 'completed' && (
          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-900 rounded-full overflow-hidden mb-1 border border-slate-300/40 dark:border-white/[0.05]">
            <motion.div
              className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      {/* Success State */}
      <AnimatePresence>
        {status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            className="glass-card rounded-2xl p-6 mb-5 text-center border border-indigo-500/30"
          >
            <CheckCircle2Icon className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Setup Complete
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5 max-w-sm mx-auto font-medium">
              {isBinary ? 'Binary installer verified.' : 'Repository cloned directly via git clone and dependencies installed.'}
            </p>
            <div className="flex justify-center gap-2.5">
              <button
                onClick={handleOpen}
                disabled={isStartingServer}
                className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                {isStartingServer ? (
                  <>
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : installedRecord?.run_mode === 'browser' ? (
                  <>
                    <GlobeIcon className="w-3.5 h-3.5" />
                    <span>Run Server & Open</span>
                  </>
                ) : installedRecord?.run_mode === 'ide' ? (
                  <>
                    <Code2Icon className="w-3.5 h-3.5" />
                    <span>Open in IDE</span>
                  </>
                ) : installedRecord?.run_mode === 'terminal' ? (
                  <>
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>Open Terminal</span>
                  </>
                ) : (
                  <>
                    <FolderOpenIcon className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenFolder}
                className="btn-secondary px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                title="Open project folder in Windows Explorer"
              >
                <FolderOpenIcon className="w-3.5 h-3.5" />
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

      {/* Task list */}
      <div className="glass-card rounded-2xl p-4 mb-4 border border-slate-200/80 dark:border-white/10">
        <div className="space-y-1">
          {tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} isCurrent={i === currentIdx && status === 'running'} />
          ))}
        </div>
      </div>

      {/* Terminal Log */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-zinc-200 transition-colors mb-3 cursor-pointer font-semibold"
      >
        <TerminalIcon className="w-4 h-4" />
        <span>{showDetails ? 'Hide' : 'Show'} real terminal output</span>
        <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
            className="glass-card rounded-xl p-3.5 mb-5 font-mono text-[11px] text-slate-800 dark:text-zinc-300 bg-slate-900 dark:bg-zinc-950/90 text-zinc-100 border border-slate-700 dark:border-white/10 overflow-x-auto max-h-56"
          >
            {logs.map((log, i) => (
              <p key={i} className="py-0.5 whitespace-pre-wrap">{log}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TaskRow({ task, isCurrent }: { task: Task; isCurrent: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
        isCurrent ? 'bg-indigo-500/10 border border-indigo-500/20' : ''
      }`}
    >
      {task.status === 'COMPLETED' ? (
        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
      ) : task.status === 'RUNNING' ? (
        <Loader2Icon className="w-4 h-4 text-indigo-500 animate-spin" />
      ) : (
        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-zinc-700" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-xs font-semibold ${
              task.status === 'COMPLETED'
                ? 'text-slate-500 dark:text-zinc-400'
                : task.status === 'RUNNING'
                ? 'text-slate-900 dark:text-zinc-100'
                : 'text-slate-400 dark:text-zinc-500'
            }`}
          >
            {task.title}
          </p>
          {task.status === 'RUNNING' && task.progress > 0 && (
            <span className="text-[10px] text-indigo-500 font-mono font-bold">{task.progress}%</span>
          )}
        </div>
      </div>
    </div>
  );
}
