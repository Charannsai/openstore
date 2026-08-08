'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import {
  CompassIcon,
  SearchIcon,
  PackageIcon,
  RefreshCwIcon,
  ActivityIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  CpuIcon,
  SparklesIcon,
} from '@/components/ui/hugeicons';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'home' as const, label: 'Discover', icon: CompassIcon },
  { id: 'search' as const, label: 'Explore', icon: SearchIcon },
  { id: 'my-apps' as const, label: 'My Apps', icon: PackageIcon },
  { id: 'updates' as const, label: 'Updates', icon: RefreshCwIcon },
  { id: 'activity' as const, label: 'Activity', icon: ActivityIcon },
  { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const { currentView, navigate, installedApps, theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatesCount = 1;
  const installedCount = installedApps.length;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-[250px] z-40 select-none">
      {/* Floating Crazy Curved Glass Dock Container */}
      <div className="w-full h-full crazy-sidebar rounded-[28px] flex flex-col justify-between p-3.5 relative overflow-hidden transition-all duration-300">
        
        {/* Background Ambient Glow Orbs */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Section */}
        <div>
          {/* Brand Logo & Shimmer Emblem */}
          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/[0.05] dark:hover:bg-white/[0.04] transition-all group text-left relative overflow-hidden"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-900/90 dark:bg-zinc-950/90 rounded-[10px] flex items-center justify-center backdrop-blur-md">
                <SparklesIcon className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gradient tracking-tight">
                  {BRAND.name}
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block truncate">
                Desktop Agent
              </span>
            </div>
          </button>

          {/* Navigation Menu */}
          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold
                    transition-all duration-200 relative group cursor-pointer
                    ${
                      isActive
                        ? 'text-indigo-600 dark:text-zinc-100 font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="crazy-sidebar-active-bg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="crazy-sidebar-active-pill"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 z-10 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-indigo-500'
                    }`}
                  />
                  <span className="z-10 tracking-tight">{item.label}</span>

                  {/* Badges */}
                  {item.id === 'updates' && updatesCount > 0 && (
                    <span className="ml-auto z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {updatesCount}
                    </span>
                  )}
                  {item.id === 'my-apps' && installedCount > 0 && (
                    <span className="ml-auto z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border border-slate-300/40 dark:border-white/10">
                      {installedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Switcher & System Monitor */}
        <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
          {/* Quick Theme Toggle Card */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 border border-slate-200/60 dark:border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
              {mounted && theme === 'light' ? (
                <SunIcon className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <MoonIcon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
              )}
              <span className="text-[11px] font-semibold">
                {mounted && theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>

            <div className="w-7 h-4 rounded-full bg-slate-300 dark:bg-zinc-700 p-0.5 relative transition-colors">
              <motion.div
                animate={{ x: mounted && theme === 'light' ? 12 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-3 h-3 rounded-full bg-white shadow-sm"
              />
            </div>
          </button>

          {/* System Status Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-100/60 to-slate-200/40 dark:from-zinc-900/40 dark:to-zinc-950/60 border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-2.5 h-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-ring" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                  Agent Active
                </span>
              </div>
              <CpuIcon className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
              <span>Windows x64</span>
              <span className="text-indigo-500 font-semibold">Ready</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
