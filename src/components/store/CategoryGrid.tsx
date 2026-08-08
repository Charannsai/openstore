'use client';

import { useAppStore } from '@/store/app-store';
import { categories } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import {
  Brain,
  Briefcase,
  Code,
  Film,
  Palette,
  GraduationCap,
  Shield,
  Server,
  Wrench,
  Gamepad2,
  Database,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Brain, Briefcase, Code, Film, Palette, GraduationCap,
  Shield, Server, Wrench, Gamepad2, Database,
};

export default function CategoryGrid() {
  const { navigate } = useAppStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {categories.map((cat, i) => {
        const Icon = iconMap[cat.icon] || Briefcase;

        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            onClick={() => navigate('category', { categoryId: cat.id })}
            className="category-card glass-card p-4 rounded-xl text-left group cursor-pointer"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
              style={{ backgroundColor: `${cat.color}15` }}
            >
              <Icon
                className="w-[18px] h-[18px]"
                style={{ color: cat.color }}
              />
            </div>
            <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
              {cat.name}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
