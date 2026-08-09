'use client';

import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
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
    <header className="h-11 fixed top-0 left-0 right-0 z-40 flex items-center justify-between pl-6 pr-0 drag-region select-none bg-transparent border-none">
      {/* Top Left: Text-only Nav Items with Inline Numbers */}
      <div className="flex items-center gap-1 no-drag">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-2.5 py-1 text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-zinc-950 dark:text-white font-extrabold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium'
                }`}
              >
                <span>{item.label}</span>

                {/* Inline Count Beside Label (No Background) */}
                {item.id === 'updates' && updatesCount > 0 && (
                  <span className="text-[11px] font-medium opacity-60">
                    {updatesCount}
                  </span>
                )}
                {item.id === 'my-apps' && installedCount > 0 && (
                  <span className="text-[11px] font-medium opacity-60">
                    {installedCount}
                  </span>
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

      {/* Top Right: Integrated Window Controls (Inline, No Separate Line/Bg) */}
      <div className="flex items-center no-drag">
        <WindowControls />
      </div>
    </header>
  );
}
