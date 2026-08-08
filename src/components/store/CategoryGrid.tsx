'use client';

import { useAppStore } from '@/store/app-store';
import { CATEGORIES } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  Cpu,
  CheckSquare,
  Code,
  Film,
  Layout,
  ShieldCheck,
  Server,
  Terminal,
  Gamepad2,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  CheckSquare,
  Code,
  Film,
  Layout,
  ShieldCheck,
  Server,
  Terminal,
  Gamepad2,
};

export default function CategoryGrid() {
  const { navigate } = useAppStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
      {CATEGORIES.map((cat, i) => {
        const Icon = iconMap[cat.icon] || Code;

        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            onClick={() => navigate('category', { categoryId: cat.id })}
            className="glass-card p-3 rounded-lg text-left group cursor-pointer border border-white/[0.06] hover:border-white/20 transition-all flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-white/20 flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
            </div>
            <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors truncate">
              {cat.name}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
