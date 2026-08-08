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
} from '@/components/ui/hugeicons';
import { motion } from 'framer-motion';

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
    <aside className="fixed left-4 top-4 bottom-4 w-[240px] z-40 select-none">
      {/* Floating Crazy Curved Glass Dock Container */}
      <div className="w-full h-full crazy-sidebar rounded-[24px] flex flex-col justify-between p-3.5 relative overflow-hidden transition-all duration-200">
        
        {/* Top Header Section */}
        <div>
          {/* Brand Logo Header */}
          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-white/[0.04] transition-all group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs flex items-center justify-center flex-shrink-0">
              OS
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 block">
                {BRAND.name}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block truncate -mt-0.5">
                Desktop Agent
              </span>
            </div>
          </button>

          {/* Navigation Menu */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium
                    transition-all duration-150 relative group cursor-pointer
                    ${
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="crazy-sidebar-active-bg"
                      className="absolute inset-0 rounded-xl bg-zinc-200/70 dark:bg-white/[0.08] border border-zinc-300/50 dark:border-white/10"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="crazy-sidebar-active-pill"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-900 dark:bg-zinc-100 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 z-10 transition-colors ${
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                    }`}
                  />
                  <span className="z-10 tracking-tight">{item.label}</span>

                  {/* Badges */}
                  {item.id === 'updates' && updatesCount > 0 && (
                    <span className="ml-auto z-10 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {updatesCount}
                    </span>
                  )}
                  {item.id === 'my-apps' && installedCount > 0 && (
                    <span className="ml-auto z-10 text-[10px] font-medium px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400">
                      {installedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Switcher & System Monitor */}
        <div className="space-y-2.5 pt-3 border-t border-zinc-200/80 dark:border-white/[0.06]">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 border border-zinc-300/40 dark:border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {mounted && theme === 'light' ? (
                <SunIcon className="w-4 h-4 text-zinc-700" />
              ) : (
                <MoonIcon className="w-4 h-4 text-zinc-300" />
              )}
              <span className="text-[11px] font-medium">
                {mounted && theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>

            <div className="w-7 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 p-0.5 relative transition-colors">
              <motion.div
                animate={{ x: mounted && theme === 'light' ? 12 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-3 h-3 rounded-full bg-zinc-900 dark:bg-zinc-100 shadow-sm"
              />
            </div>
          </button>

          {/* System Status Card */}
          <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 pulse-dot" />
                <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                  Windows x64
                </span>
              </div>
              <CpuIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            </div>

            <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Local Agent Active</p>
          </div>
        </div>

      </div>
    </aside>
  );
}
