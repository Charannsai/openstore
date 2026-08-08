'use client';

import { useAppStore } from '@/store/app-store';
import { applications, categories } from '@/lib/mock-data';
import AppCard from '@/components/store/AppCard';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const { selectedCategoryId, navigate } = useAppStore();
  const category = categories.find((c) => c.id === selectedCategoryId);
  const categoryApps = applications.filter((a) => a.category_id === selectedCategoryId);

  if (!category) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-zinc-500">Category not found.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Back */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${category.color}15` }}
        >
          <span className="text-lg" style={{ color: category.color }}>
            {category.name.charAt(0)}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{category.name}</h1>
          <p className="text-xs text-zinc-500">{category.description}</p>
        </div>
      </div>

      {/* Apps */}
      {categoryApps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryApps.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-zinc-500">No applications in this category yet.</p>
        </div>
      )}
    </motion.div>
  );
}
