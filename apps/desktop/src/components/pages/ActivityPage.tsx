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
  install: <DownloadIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />,
  update: <RefreshCwIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />,
  uninstall: <Trash2Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />,
  launch: <PlayIcon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />,
  stop: <SquareIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />,
};

export default function ActivityPage() {
  const { activities } = useAppStore();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Activity Log</h1>

      {activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 glass-card rounded-xl p-3.5 border border-zinc-200/80 dark:border-white/10"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-white/10">
                {iconMap[event.type] || <CheckCircleIcon className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">{event.message}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">No activity recorded.</p>
        </div>
      )}
    </motion.div>
  );
}
