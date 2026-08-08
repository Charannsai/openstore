'use client';

import { useEffect } from 'react';
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
  SidebarToggleIcon,
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
  const { currentView, navigate, installedApps, theme, setTheme, isSidebarCollapsed, toggleSidebar } = useAppStore();

  useEffect(() => {
    const saved = localStorage.getItem('openstore-theme') as 'dark' | 'light' | 'system' | null;
    if (saved && saved !== theme) {
      setTheme(saved);
    }
  }, [setTheme, theme]);

  const updatesCount = 1;
  const installedCount = installedApps.length;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <aside
      className={`fixed left-4 top-4 bottom-4 z-40 select-none transition-all duration-300 ease-out ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Floating Crazy Curved Glass Dock Container */}
      <div
        className={`w-full h-full crazy-sidebar rounded-[24px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 ease-out bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 shadow-lg dark:shadow-2xl ${
          isSidebarCollapsed ? 'p-2.5' : 'p-3.5'
        }`}
      >
        {/* Top Header Section */}
        <div>
          {/* Brand & Collapse Header */}
          <div className="mb-4">
            {!isSidebarCollapsed ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('home')}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all group text-left flex-1 min-w-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                    OS
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white block truncate">
                      {BRAND.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal block truncate -mt-0.5">
                      Desktop Agent
                    </span>
                  </div>
                </button>

                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <SidebarToggleIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Single Centered Toggle Button when Collapsed (No OS Text) */
              <button
                onClick={toggleSidebar}
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 transition-all cursor-pointer shadow-xs"
                title="Expand Sidebar"
              >
                <SidebarToggleIcon className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 rounded-xl text-xs font-medium
                    transition-all duration-150 relative group cursor-pointer
                    ${isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
                    ${
                      isActive
                        ? 'text-zinc-950 dark:text-white font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="crazy-sidebar-active-bg"
                      className="absolute inset-0 rounded-xl bg-zinc-100 dark:bg-white/[0.08] border border-zinc-200 dark:border-white/10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}

                  {isActive && !isSidebarCollapsed && (
                    <motion.div
                      layoutId="crazy-sidebar-active-pill"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-950 dark:bg-white rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 z-10 transition-colors ${
                      isActive
                        ? 'text-zinc-950 dark:text-white'
                        : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white'
                    }`}
                  />

                  {!isSidebarCollapsed && (
                    <span className="z-10 tracking-tight truncate">{item.label}</span>
                  )}

                  {/* Badges */}
                  {!isSidebarCollapsed ? (
                    <>
                      {item.id === 'updates' && updatesCount > 0 && (
                        <span className="ml-auto z-10 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                          {updatesCount}
                        </span>
                      )}
                      {item.id === 'my-apps' && installedCount > 0 && (
                        <span className="ml-auto z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                          {installedCount}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {((item.id === 'updates' && updatesCount > 0) || (item.id === 'my-apps' && installedCount > 0)) && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-950 dark:bg-white shadow-xs z-10" />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Switcher & System Monitor */}
        <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-white/[0.06]">
          {/* Theme Toggle Button */}
          {!isSidebarCollapsed ? (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-900 dark:text-zinc-200">
                {theme === 'light' ? (
                  <SunIcon className="w-4 h-4 text-zinc-950" />
                ) : (
                  <MoonIcon className="w-4 h-4 text-zinc-300" />
                )}
                <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-200">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>

              <div className="w-7 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 p-0.5 relative transition-colors">
                <motion.div
                  animate={{ x: theme === 'light' ? 12 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-3 h-3 rounded-full bg-zinc-950 dark:bg-white shadow-xs"
                />
              </div>
            </button>
          ) : (
            <button
              onClick={toggleTheme}
              className="w-full flex justify-center p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 transition-all cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <SunIcon className="w-4 h-4 text-zinc-950" />
              ) : (
                <MoonIcon className="w-4 h-4 text-zinc-300" />
              )}
            </button>
          )}

          {/* System Status Card */}
          {!isSidebarCollapsed ? (
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 pulse-dot" />
                  <span className="text-[11px] font-semibold text-zinc-950 dark:text-zinc-100">
                    Windows x64
                  </span>
                </div>
                <CpuIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </div>

              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Local Agent Active</p>
            </div>
          ) : (
            <div
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex justify-center items-center"
              title="Windows x64 • Local Agent Active"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 pulse-dot" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
