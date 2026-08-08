'use client';

import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import {
  Home,
  Compass,
  Package,
  RefreshCw,
  Activity,
  Settings,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'home' as const, label: 'Discover', icon: Home },
  { id: 'search' as const, label: 'Explore', icon: Compass },
  { id: 'my-apps' as const, label: 'My Apps', icon: Package },
  { id: 'updates' as const, label: 'Updates', icon: RefreshCw },
  { id: 'activity' as const, label: 'Activity', icon: Activity },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, navigate, installedApps } = useAppStore();

  const updatesCount = 1; // Mock: one app has an update
  const installedCount = installedApps.length;

  return (
    <aside className="w-[240px] h-screen flex flex-col border-r border-white/[0.06] bg-[#111114] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            {BRAND.name}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 relative group
                ${
                  isActive
                    ? 'text-white bg-white/[0.08]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-indigo-400' : ''}`} />
              <span>{item.label}</span>

              {/* Badge */}
              {item.id === 'updates' && updatesCount > 0 && (
                <span className="ml-auto bg-indigo-500/20 text-indigo-400 text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {updatesCount}
                </span>
              )}
              {item.id === 'my-apps' && installedCount > 0 && (
                <span className="ml-auto text-zinc-600 text-[11px] font-medium">
                  {installedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Info */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="glass-card p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-xs font-medium text-zinc-300">My Device</span>
          </div>
          <p className="text-[11px] text-zinc-500">Windows • x64</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">Agent connected</p>
        </div>
      </div>
    </aside>
  );
}
