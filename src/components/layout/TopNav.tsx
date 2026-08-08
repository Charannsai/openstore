'use client';

import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
import { motion } from 'framer-motion';
import WindowControls from './WindowControls';

const navItems = [
  { id: 'home' as const, label: 'Discover' },
  { id: 'search' as const, label: 'Explore' },
  { id: 'my-apps' as const, label: 'My Apps' },
  { id: 'updates' as const, label: 'Updates' },
  { id: 'activity' as const, label: 'Activity' },
  { id: 'settings' as const, label: 'Settings' },
];

export default function TopNav() {
  const { currentView, navigate, installedApps } = useAppStore();

  const updatesCount = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  ).length;
  const installedCount = installedApps.length;

  return (
    <header className="h-11 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 drag-region select-none bg-transparent">
      {/* Top Left: Text-only Nav Items (No Icons, No BG) */}
      <div className="flex items-center gap-1 no-drag">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`relative px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>

                {/* Badge Counts */}
                {item.id === 'updates' && updatesCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    {updatesCount}
                  </span>
                )}
                {item.id === 'my-apps' && installedCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-200/80 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {installedCount}
                  </span>
                )}

                {/* Active Indicator Underline */}
                {isActive && (
                  <motion.div
                    layoutId="top-nav-active-underline"
                    className="absolute -bottom-[9px] left-1 right-1 h-[2px] bg-zinc-950 dark:bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Top: OpenStore Branding Name */}
      <div className="absolute left-1/2 -translate-x-1/2 text-xs font-extrabold tracking-tight text-zinc-950 dark:text-white pointer-events-none select-none">
        {BRAND.name}
      </div>

      {/* Top Right: Window Controls */}
      <div className="flex items-center gap-2 no-drag">
        <WindowControls />
      </div>
    </header>
  );
}
