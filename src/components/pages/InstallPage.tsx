'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { applications } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  PartyPopper,
} from 'lucide-react';
import type { Task, TaskState } from '@/lib/types';

// Simulated tasks for demo
function generateTasks(appName: string, installMethod: string): Task[] {
  const baseTasks: Task[] = [
    {
      id: 'detect-system',
      title: 'Detect system',
      description: 'Checking your operating system and architecture',
      type: 'CHECK',
      status: 'READY',
      prerequisites: [],
      actions: [{ capability: 'detect_os', params: {} }],
      estimated_duration: 2,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
    {
      id: 'check-compatibility',
      title: 'Check compatibility',
      description: 'Verifying system meets requirements',
      type: 'CHECK',
      status: 'LOCKED',
      prerequisites: ['detect-system'],
      actions: [{ capability: 'check_disk_space', params: {} }],
      estimated_duration: 3,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
  ];

  if (installMethod === 'CONTAINER') {
    baseTasks.push(
      {
        id: 'check-docker',
        title: 'Check Docker',
        description: 'Verifying Docker Desktop is installed and running',
        type: 'CHECK',
        status: 'LOCKED',
        prerequisites: ['check-compatibility'],
        actions: [{ capability: 'check_command', params: { command: 'docker' } }],
        estimated_duration: 3,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      },
      {
        id: 'pull-image',
        title: `Download ${appName}`,
        description: 'Pulling the official Docker image',
        type: 'DOWNLOAD',
        status: 'LOCKED',
        prerequisites: ['check-docker'],
        actions: [{ capability: 'run_process', params: { command: 'docker pull' } }],
        estimated_duration: 60,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      },
      {
        id: 'configure',
        title: 'Configure environment',
        description: 'Setting up container configuration',
        type: 'CONFIGURATION',
        status: 'LOCKED',
        prerequisites: ['pull-image'],
        actions: [{ capability: 'write_config', params: {} }],
        estimated_duration: 5,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      },
      {
        id: 'start',
        title: `Start ${appName}`,
        description: 'Starting the application container',
        type: 'LAUNCH',
        status: 'LOCKED',
        prerequisites: ['configure'],
        actions: [{ capability: 'run_process', params: { command: 'docker run' } }],
        estimated_duration: 10,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      },
      {
        id: 'verify',
        title: 'Verify',
        description: 'Checking that the application is responding',
        type: 'VERIFY',
        status: 'LOCKED',
        prerequisites: ['start'],
        actions: [{ capability: 'check_port', params: { port: 3000 } }],
        estimated_duration: 5,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      }
    );
  } else {
    baseTasks.push(
      {
        id: 'find-release',
        title: 'Find compatible release',
        description: 'Locating the best official release for your system',
        type: 'CHECK',
        status: 'LOCKED',
        prerequisites: ['check-compatibility'],
        actions: [],
        estimated_duration: 3,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      },
      {
        id: 'download',
        title: `Download ${appName}`,
        description: 'Downloading official installer from release source',
        type: 'DOWNLOAD',
        status: 'LOCKED',
        prerequisites: ['find-release'],
        actions: [{ capability: 'download_file', params: {} }],
        estimated_duration: 30,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      },
      {
        id: 'verify-file',
        title: 'Verify download',
        description: 'Checking file integrity with checksum',
        type: 'VERIFY',
        status: 'LOCKED',
        prerequisites: ['download'],
        actions: [{ capability: 'verify_checksum', params: {} }],
        estimated_duration: 3,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      },
      {
        id: 'install',
        title: `Install ${appName}`,
        description: 'Running official installer',
        type: 'INSTALL',
        status: 'LOCKED',
        prerequisites: ['verify-file'],
        actions: [{ capability: 'launch_installer', params: {} }],
        estimated_duration: 30,
        requires_user_interaction: true,
        requires_elevation: true,
        documentation: '',
        progress: 0,
      },
      {
        id: 'verify-install',
        title: 'Verify installation',
        description: 'Confirming the application was installed successfully',
        type: 'VERIFY',
        status: 'LOCKED',
        prerequisites: ['install'],
        actions: [{ capability: 'check_file', params: {} }],
        estimated_duration: 3,
        requires_user_interaction: false,
        requires_elevation: false,
        documentation: '',
        progress: 0,
      }
    );
  }

  return baseTasks;
}

export default function InstallPage() {
  const { selectedAppSlug, navigate, currentInstallation } = useAppStore();
  const app = applications.find((a) => a.slug === selectedAppSlug);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Initialize tasks
  useEffect(() => {
    if (app) {
      const t = generateTasks(app.name, app.installation_methods[0]);
      t[0].status = 'RUNNING';
      setTasks(t);
      setLogs([`[${new Date().toLocaleTimeString()}] Starting installation of ${app.name}...`]);
    }
  }, [app]);

  // Simulate task progression
  const advanceTask = useCallback(() => {
    setTasks((prev) => {
      const next = [...prev];
      const running = next.findIndex((t) => t.status === 'RUNNING');
      if (running === -1) return next;

      // Complete current task
      next[running] = { ...next[running], status: 'COMPLETED' as TaskState, progress: 100 };

      // Find and start next
      const nextIdx = running + 1;
      if (nextIdx < next.length) {
        next[nextIdx] = { ...next[nextIdx], status: 'RUNNING' as TaskState };
        setCurrentIdx(nextIdx);
      } else {
        setStatus('completed');
      }

      // Calculate progress
      const completed = next.filter((t) => t.status === 'COMPLETED').length;
      setOverallProgress(Math.round((completed / next.length) * 100));

      return next;
    });

    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Task completed successfully`,
    ]);
  }, []);

  // Auto-advance simulation
  useEffect(() => {
    if (status !== 'running') return;
    const runningTask = tasks.find((t) => t.status === 'RUNNING');
    if (!runningTask) return;

    const delay = (runningTask.estimated_duration || 2) * 300; // Faster for demo
    const timer = setTimeout(advanceTask, delay);
    return () => clearTimeout(timer);
  }, [tasks, status, advanceTask]);

  if (!app) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-zinc-500">No application selected.</p>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Back */}
      <button
        onClick={() => navigate('app-detail', { slug: app.slug })}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center border border-white/[0.06]">
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl">${app.name.charAt(0)}</span>`;
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {status === 'completed' ? `${app.name} is ready!` : `Installing ${app.name}`}
            </h1>
            <p className="text-xs text-zinc-500">
              {status === 'completed'
                ? 'Installation completed successfully'
                : `${completedCount} of ${tasks.length} tasks complete`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {status !== 'completed' && (
          <div className="relative w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-1">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full progress-bar"
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}
        {status !== 'completed' && (
          <p className="text-[11px] text-zinc-600 text-right">{overallProgress}%</p>
        )}
      </div>

      {/* Success state */}
      <AnimatePresence>
        {status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 mb-6 text-center glow-success"
          >
            <PartyPopper className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              🎉 {app.name} is ready
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              The application was installed successfully.
            </p>
            <div className="flex justify-center gap-3">
              <button className="btn-install px-6 py-2.5 rounded-xl text-white font-medium text-sm">
                Open {app.name}
              </button>
              <button
                onClick={() => navigate('my-apps')}
                className="px-6 py-2.5 rounded-xl bg-white/[0.06] text-zinc-300 font-medium text-sm hover:bg-white/[0.1] transition-colors"
              >
                View My Apps
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="space-y-1">
          {tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} index={i} isCurrent={i === currentIdx && status === 'running'} />
          ))}
        </div>
      </div>

      {/* Technical details toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-3"
      >
        {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{showDetails ? 'Hide' : 'View'} technical details</span>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-xl p-4 mb-6 font-mono text-[11px] text-zinc-500 overflow-hidden"
          >
            {logs.map((log, i) => (
              <p key={i} className="py-0.5">{log}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel */}
      {status === 'running' && (
        <div className="text-center">
          <button
            onClick={() => setShowCancelDialog(true)}
            className="text-xs text-zinc-600 hover:text-rose-400 transition-colors"
          >
            Cancel installation
          </button>
        </div>
      )}

      {/* Cancel dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-base font-semibold text-white mb-3">Cancel installation?</h3>
              <div className="space-y-2 mb-4">
                {tasks.filter((t) => t.status === 'COMPLETED').map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{t.title}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mb-5">
                Completed changes will not automatically be removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStatus('cancelled');
                    setShowCancelDialog(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-zinc-300 text-sm font-medium hover:bg-white/[0.1] transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Task Row ────────────────────────────────────────────────────────────────
function TaskRow({ task, index, isCurrent }: { task: Task; index: number; isCurrent: boolean }) {
  const statusIcon = {
    LOCKED: <Circle className="w-4 h-4 text-zinc-700" />,
    READY: <Circle className="w-4 h-4 text-zinc-500" />,
    RUNNING: <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />,
    WAITING_FOR_USER: <AlertCircle className="w-4 h-4 text-amber-400" />,
    VERIFYING: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
    COMPLETED: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    FAILED: <AlertCircle className="w-4 h-4 text-rose-400" />,
    SKIPPED: <Circle className="w-4 h-4 text-zinc-600" />,
    CANCELLED: <X className="w-4 h-4 text-zinc-600" />,
  };

  return (
    <div
      className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-colors ${
        isCurrent ? 'bg-white/[0.04]' : ''
      }`}
    >
      {statusIcon[task.status]}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.status === 'COMPLETED'
              ? 'text-zinc-400'
              : task.status === 'RUNNING'
              ? 'text-white'
              : task.status === 'LOCKED'
              ? 'text-zinc-600'
              : 'text-zinc-300'
          }`}
        >
          {task.title}
        </p>
        {isCurrent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-zinc-500 mt-0.5"
          >
            {task.description}
          </motion.p>
        )}
      </div>
      {task.requires_elevation && task.status !== 'COMPLETED' && task.status !== 'LOCKED' && (
        <span className="text-[10px] text-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 rounded">
          Admin
        </span>
      )}
    </div>
  );
}
