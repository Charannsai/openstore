'use client';

import { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 5) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updatesCount = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  ).length;
  const installedCount = installedApps.length;

  return (
    <>
      {/* Top Blurry Frosted Glass Gradient Overlay with Smooth Bottom Fade Mask */}
      <div
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%)',
        }}
        className={`fixed top-0 left-0 right-0 h-16 z-30 pointer-events-none transition-opacity duration-300 backdrop-blur-lg bg-white/80 dark:bg-[#0a0a0c]/80 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <header className="h-11 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 drag-region select-none bg-transparent border-none">
        {/* Top Left: Text-only Nav Items (No Icons, No BG, No Underline Cut) */}
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
    </>
  );
}
