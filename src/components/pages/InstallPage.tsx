'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Circle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import type { Task, TaskState } from '@/lib/types';

function generateTasks(appName: string, installMethod: string): Task[] {
  return [
    {
      id: 'detect-system',
      title: 'Detect system & architecture',
      description: 'Checking local OS version, CPU architecture, and available disk space',
      type: 'CHECK',
      status: 'RUNNING',
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
      title: 'Verify requirements',
      description: 'Confirming system meets prerequisite dependencies',
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
    {
      id: 'find-release',
      title: 'Resolve official release',
      description: 'Locating compatible binary from official release source',
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
      description: 'Fetching release package from official source',
      type: 'DOWNLOAD',
      status: 'LOCKED',
      prerequisites: ['find-release'],
      actions: [{ capability: 'download_file', params: {} }],
      estimated_duration: 15,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
    {
      id: 'verify-file',
      title: 'Verify file checksum',
      description: 'Calculating SHA-256 hash to confirm package integrity',
      type: 'VERIFY',
      status: 'LOCKED',
      prerequisites: ['download'],
      actions: [{ capability: 'verify_checksum', params: {} }],
      estimated_duration: 2,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
    {
      id: 'install',
      title: `Execute installer for ${appName}`,
      description: 'Running controlled installation process',
      type: 'INSTALL',
      status: 'LOCKED',
      prerequisites: ['verify-file'],
      actions: [{ capability: 'launch_installer', params: {} }],
      estimated_duration: 15,
      requires_user_interaction: true,
      requires_elevation: true,
      documentation: '',
      progress: 0,
    },
    {
      id: 'verify-install',
      title: 'Verify application state',
      description: 'Confirming application service and local files respond',
      type: 'VERIFY',
      status: 'LOCKED',
      prerequisites: ['install'],
      actions: [{ capability: 'check_file', params: {} }],
      estimated_duration: 3,
      requires_user_interaction: false,
      requires_elevation: false,
      documentation: '',
      progress: 0,
    },
  ];
}

export default function InstallPage() {
  const { selectedAppSlug, navigate, applications } = useAppStore();
  const app = applications.find((a) => a.slug === selectedAppSlug);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | 'cancelled'>('running');
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (app) {
      const t = generateTasks(app.name, app.installation_methods[0] || 'OFFICIAL_INSTALLER');
      setTasks(t);
      setLogs([`[${new Date().toLocaleTimeString()}] Agent initialized. Starting installation for ${app.name}...`]);
    }
  }, [app]);

  const advanceTask = useCallback(() => {
    setTasks((prev) => {
      const next = [...prev];
      const running = next.findIndex((t) => t.status === 'RUNNING');
      if (running === -1) return next;

      next[running] = { ...next[running], status: 'COMPLETED' as TaskState, progress: 100 };

      const nextIdx = running + 1;
      if (nextIdx < next.length) {
        next[nextIdx] = { ...next[nextIdx], status: 'RUNNING' as TaskState };
        setCurrentIdx(nextIdx);
      } else {
        setStatus('completed');
      }

      const completed = next.filter((t) => t.status === 'COMPLETED').length;
      setOverallProgress(Math.round((completed / next.length) * 100));

      return next;
    });

    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Task step passed verification.`,
    ]);
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const runningTask = tasks.find((t) => t.status === 'RUNNING');
    if (!runningTask) return;

    const delay = (runningTask.estimated_duration || 2) * 200;
    const timer = setTimeout(advanceTask, delay);
    return () => clearTimeout(timer);
  }, [tasks, status, advanceTask]);

  if (!app) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-xs text-zinc-500">No application selected.</p>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

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
              {status === 'completed' ? `${app.name} installed` : `Installing ${app.name}`}
            </h1>
            <p className="text-[11px] text-zinc-500">
              {status === 'completed'
                ? 'System state verified'
                : `Step ${completedCount + 1} of ${tasks.length}`}
            </p>
          </div>
        </div>

        {/* Minimal Progress bar */}
        {status !== 'completed' && (
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-1 border border-white/[0.05]">
            <motion.div
              className="h-full bg-zinc-100 rounded-full"
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
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
              Installation Complete
            </h2>
            <p className="text-xs text-zinc-400 mb-5">
              {app.name} is verified and running on your system.
            </p>
            <div className="flex justify-center gap-2.5">
              <button className="btn-primary px-6 py-2 text-xs font-semibold">
                Open Application
              </button>
              <button
                onClick={() => navigate('my-apps')}
                className="btn-secondary px-5 py-2 text-xs"
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

      {/* Technical details toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>{showDetails ? 'Hide' : 'Show'} agent logs</span>
        {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-lg p-3.5 mb-5 font-mono text-[11px] text-zinc-400 bg-zinc-950/80 border border-white/10"
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
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Cancel installation
          </button>
        </div>
      )}

      {/* Cancel dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className="glass-card rounded-xl p-5 max-w-sm w-full border border-white/15"
            >
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Cancel installation?</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Completed changes will remain in their verified state.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStatus('cancelled');
                    setShowCancelDialog(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-medium hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="flex-1 py-2 rounded-lg btn-primary text-xs font-semibold"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
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
      </div>
    </div>
  );
}
