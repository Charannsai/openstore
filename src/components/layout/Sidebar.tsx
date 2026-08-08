'use client';

import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import {
  Compass,
  Search,
  Package,
  RefreshCw,
  Activity,
  Settings,
  Terminal,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'home' as const, label: 'Discover', icon: Compass },
  { id: 'search' as const, label: 'Explore', icon: Search },
  { id: 'my-apps' as const, label: 'My Apps', icon: Package },
  { id: 'updates' as const, label: 'Updates', icon: RefreshCw },
  { id: 'activity' as const, label: 'Activity', icon: Activity },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, navigate, installedApps } = useAppStore();

  const updatesCount = 1;
  const installedCount = installedApps.length;

  return (
    <aside className="w-[230px] h-screen flex flex-col border-r border-white/[0.07] bg-[#0c0c0e] fixed left-0 top-0 z-40 select-none">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.04]">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-xs">
            OS
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100 block">
              {BRAND.name}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium block -mt-0.5">
              Desktop Agent
            </span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium
                transition-all duration-150 relative group
                ${
                  isActive
                    ? 'text-zinc-100 bg-white/[0.07] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-zinc-100 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              <span>{item.label}</span>

              {/* Badges */}
              {item.id === 'updates' && updatesCount > 0 && (
                <span className="ml-auto bg-zinc-800 text-zinc-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-white/10">
                  {updatesCount}
                </span>
              )}
              {item.id === 'my-apps' && installedCount > 0 && (
                <span className="ml-auto text-zinc-600 text-[10px] font-medium">
                  {installedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-white/[0.05]">
        <div className="glass-card p-3 rounded-lg border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 pulse-dot" />
            <span className="text-[11px] font-medium text-zinc-300">Windows x64</span>
          </div>
          <p className="text-[10px] text-zinc-500">Local Agent Active</p>
        </div>
      </div>
    </aside>
  );
}
