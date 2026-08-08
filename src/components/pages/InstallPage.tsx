'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Terminal,
  Globe,
  FolderOpen,
} from 'lucide-react';
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
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="glass-card rounded-xl p-5 mb-5 border border-white/[0.08]">
        <div className="flex items-center gap-3.5 mb-4">
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
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">
              {status === 'completed' ? `${app.name} Ready` : `Installing ${app.name}`}
            </h1>
            <p className="text-[11px] text-zinc-500">
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
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-1 border border-white/[0.05]">
            <motion.div
              className="h-full bg-zinc-100 rounded-full"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6 mb-5 text-center border border-white/15"
          >
            <CheckCircle2 className="w-8 h-8 text-zinc-100 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-zinc-100 mb-1">
              Setup Complete
            </h2>
            <p className="text-xs text-zinc-400 mb-5 max-w-sm mx-auto">
              {isBinary ? 'Binary installer verified.' : 'Repository cloned directly via git clone and dependencies installed.'}
            </p>
            <div className="flex justify-center gap-2.5">
              <button
                onClick={handleRunAndOpen}
                disabled={isStartingServer}
                className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2"
              >
                {isStartingServer ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Starting Server...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Run Server & Open App</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenFolder}
                className="btn-secondary px-4 py-2.5 text-xs font-medium flex items-center gap-1.5"
                title="Open project folder in Windows Explorer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open Folder</span>
              </button>

              <button
                onClick={() => navigate('my-apps')}
                className="btn-secondary px-4 py-2.5 text-xs font-medium"
              >
                My Apps
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="glass-card rounded-xl p-4 mb-4 border border-white/[0.08]">
        <div className="space-y-0.5">
          {tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} isCurrent={i === currentIdx && status === 'running'} />
          ))}
        </div>
      </div>

      {/* Terminal Log */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>{showDetails ? 'Hide' : 'Show'} real terminal output</span>
        {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-lg p-3.5 mb-5 font-mono text-[11px] text-zinc-400 bg-zinc-950/90 border border-white/10 overflow-x-auto max-h-56"
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
      className={`flex items-center gap-3 py-2.5 px-2.5 rounded-lg transition-colors ${
        isCurrent ? 'bg-white/[0.04]' : ''
      }`}
    >
      {task.status === 'COMPLETED' ? (
        <Check className="w-3.5 h-3.5 text-zinc-200" />
      ) : task.status === 'RUNNING' ? (
        <Loader2 className="w-3.5 h-3.5 text-zinc-100 animate-spin" />
      ) : (
        <Circle className="w-3.5 h-3.5 text-zinc-700" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-xs font-medium ${
              task.status === 'COMPLETED'
                ? 'text-zinc-500'
                : task.status === 'RUNNING'
                ? 'text-zinc-100'
                : 'text-zinc-600'
            }`}
          >
            {task.title}
          </p>
          {task.status === 'RUNNING' && task.progress > 0 && (
            <span className="text-[10px] text-zinc-400 font-mono">{task.progress}%</span>
          )}
        </div>
      </div>
    </div>
  );
}
