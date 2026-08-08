'use client';

import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/utils';
import {
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Play,
  Square,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  install: <Download className="w-4 h-4 text-emerald-400" />,
  update: <RefreshCw className="w-4 h-4 text-blue-400" />,
  uninstall: <Trash2 className="w-4 h-4 text-rose-400" />,
  error: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  launch: <Play className="w-4 h-4 text-indigo-400" />,
  stop: <Square className="w-4 h-4 text-zinc-400" />,
};

export default function ActivityPage() {
  const { activities } = useAppStore();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-xl font-bold text-white mb-6">Activity</h1>

      {activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 glass-card rounded-xl p-4"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                {iconMap[event.type] || <CheckCircle2 className="w-4 h-4 text-zinc-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300">{event.message}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <p className="text-zinc-500">No activity yet.</p>
        </div>
      )}
    </motion.div>
  );
}
