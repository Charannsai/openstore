'use client';

import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/utils';
import { Download, RefreshCw, Trash2, CheckCircle2, Play, Square } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  install: <Download className="w-3.5 h-3.5 text-zinc-400" />,
  update: <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />,
  uninstall: <Trash2 className="w-3.5 h-3.5 text-zinc-500" />,
  launch: <Play className="w-3.5 h-3.5 text-zinc-300" />,
  stop: <Square className="w-3.5 h-3.5 text-zinc-500" />,
};

export default function ActivityPage() {
  const { activities } = useAppStore();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Activity Log</h1>

      {activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 glass-card rounded-xl p-3.5 border border-white/[0.07]"
            >
              <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-white/10">
                {iconMap[event.type] || <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200">{event.message}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <p className="text-xs text-zinc-500">No activity recorded.</p>
        </div>
      )}
    </motion.div>
  );
}
