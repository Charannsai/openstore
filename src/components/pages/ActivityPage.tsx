'use client';

import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/utils';
import {
  DownloadIcon,
  RefreshCwIcon,
  Trash2Icon,
  PlayIcon,
  SquareIcon,
  CheckCircleIcon,
} from '@/components/ui/hugeicons';

const iconMap: Record<string, React.ReactNode> = {
  install: <DownloadIcon className="w-4 h-4 text-indigo-500" />,
  update: <RefreshCwIcon className="w-4 h-4 text-indigo-500" />,
  uninstall: <Trash2Icon className="w-4 h-4 text-rose-500" />,
  launch: <PlayIcon className="w-4 h-4 text-emerald-500" />,
  stop: <SquareIcon className="w-4 h-4 text-amber-500" />,
};

export default function ActivityPage() {
  const { activities } = useAppStore();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-5">Activity Log</h1>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3.5 glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-white/10">
                {iconMap[event.type] || <CheckCircleIcon className="w-4 h-4 text-indigo-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{event.message}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">No activity recorded.</p>
        </div>
      )}
    </motion.div>
  );
}
