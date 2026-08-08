'use client';

import { useAppStore } from '@/store/app-store';
import { CATEGORIES } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  CpuIcon,
  PackageIcon,
  Code2Icon,
  ActivityIcon,
  LayersIcon,
  ShieldCheckIcon,
  TerminalIcon,
  SparklesIcon,
} from '@/components/ui/hugeicons';

const iconMap: Record<string, React.ElementType> = {
  Cpu: CpuIcon,
  CheckSquare: PackageIcon,
  Code: Code2Icon,
  Film: ActivityIcon,
  Layout: LayersIcon,
  ShieldCheck: ShieldCheckIcon,
  Server: TerminalIcon,
  Terminal: TerminalIcon,
  Gamepad2: SparklesIcon,
};

export default function CategoryGrid() {
  const { navigate } = useAppStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
      {CATEGORIES.map((cat, i) => {
        const Icon = iconMap[cat.icon] || Code2Icon;

        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            onClick={() => navigate('category', { categoryId: cat.id })}
            className="glass-card p-3 rounded-xl text-left group cursor-pointer border border-zinc-200/80 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 transition-all flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-white/10 group-hover:border-zinc-400 dark:group-hover:border-white/20 flex-shrink-0 transition-colors">
              <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 transition-colors truncate tracking-tight">
              {cat.name}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
