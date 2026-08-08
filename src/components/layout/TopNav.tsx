'use client';

import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import {
  CompassIcon,
  SearchIcon,
  PackageIcon,
  RefreshCwIcon,
  ActivityIcon,
  SettingsIcon,
} from '@/components/ui/hugeicons';
import { motion } from 'framer-motion';
import WindowControls from './WindowControls';

const navItems = [
  { id: 'home' as const, label: 'Discover', icon: CompassIcon },
  { id: 'search' as const, label: 'Explore', icon: SearchIcon },
  { id: 'my-apps' as const, label: 'My Apps', icon: PackageIcon },
  { id: 'updates' as const, label: 'Updates', icon: RefreshCwIcon },
  { id: 'activity' as const, label: 'Activity', icon: ActivityIcon },
  { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
];

export default function TopNav() {
  const { currentView, navigate, installedApps } = useAppStore();

  const updatesCount = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  ).length;
  const installedCount = installedApps.length;

  return (
    <header className="h-12 bg-white/80 dark:bg-[#121215]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 drag-region select-none">
      {/* Left: Brand Logo & Navigation Items (No BG design) */}
      <div className="flex items-center gap-4 no-drag">
        {/* Brand Logo & Name */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
        >
          <div className="w-6 h-6 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-xs">
            OS
          </div>
          <span className="text-xs font-bold tracking-tight text-zinc-950 dark:text-white">
            {BRAND.name}
          </span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-white/10" />

        {/* Nav Items - No BG, Clean VS Code Style Tabs */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? 'text-zinc-950 dark:text-white'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <span>{item.label}</span>

                {/* Badge Counts */}
                {item.id === 'updates' && updatesCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    {updatesCount}
                  </span>
                )}
                {item.id === 'my-apps' && installedCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                    {installedCount}
                  </span>
                )}

                {/* Active Indicator Underline */}
                {isActive && (
                  <motion.div
                    layoutId="top-nav-active-underline"
                    className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-zinc-950 dark:bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center gap-2 no-drag">
        <WindowControls />
      </div>
    </header>
  );
}
