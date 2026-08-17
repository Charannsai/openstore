'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import TopNav from '@/components/layout/TopNav';
import HomePage from '@/components/pages/HomePage';
import AppDetailPage from '@/components/pages/AppDetailPage';
import InstallPage from '@/components/pages/InstallPage';
import MyAppsPage from '@/components/pages/MyAppsPage';
import SearchPage from '@/components/pages/SearchPage';
import UpdatesPage from '@/components/pages/UpdatesPage';
import ActivityPage from '@/components/pages/ActivityPage';
import SettingsPage from '@/components/pages/SettingsPage';
import CategoryPage from '@/components/pages/CategoryPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';

const pageComponents: Record<string, React.ComponentType> = {
  home: HomePage,
  'app-detail': AppDetailPage,
  install: InstallPage,
  'my-apps': MyAppsPage,
  search: SearchPage,
  updates: UpdatesPage,
  activity: ActivityPage,
  settings: SettingsPage,
  category: CategoryPage,
};

export default function DesktopDashboard() {
  const [mounted, setMounted] = useState(false);
  const { currentView, navigate } = useAppStore();
  const PageComponent = pageComponents[currentView] || HomePage;
  const isNativeElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const [appUpdate, setAppUpdate] = useState<{
    has_update: boolean;
    current_version: string;
    latest_version?: string;
    download_url?: string;
    release_url?: string;
  } | null>(null);
  const [isUpdateDismissed, setIsUpdateDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('openstore-theme') as 'dark' | 'light' | 'system') || 'dark';
      useAppStore.getState().setTheme(savedTheme);

      if (window.electronAPI?.getInstalledApps) {
        window.electronAPI
          .getInstalledApps()
          .then((list) => {
            if (Array.isArray(list)) {
              useAppStore.setState({ installedApps: list });
            }
          })
          .catch((err) => {
            console.error('Failed to sync installed apps registry:', err);
          });
      }

      if (window.electronAPI?.checkAppUpdate) {
        window.electronAPI
          .checkAppUpdate()
          .then((info) => {
            if (info?.has_update) {
              setAppUpdate(info);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F / Cmd+F -> Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        navigate('search');
      }
      // Ctrl+, / Cmd+, -> Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        navigate('settings');
      }
      // Ctrl+1..4 -> Quick View Navigation
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        navigate('home');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        navigate('my-apps');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        navigate('updates');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '4') {
        e.preventDefault();
        navigate('activity');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // If someone directly opens the internal desktop port in Chrome/Edge, guard it
  if (mounted && !isNativeElectron) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <img src="/logo.png" alt="OpenStore Logo" className="w-14 h-14 object-contain drop-shadow-xl" />
        <div className="space-y-1 max-w-md">
          <h1 className="text-lg font-bold">OpenStore Desktop Application</h1>
          <p className="text-xs text-zinc-400 leading-relaxed font-normal">
            This dashboard requires the native Electron runtime to perform Git cloning, terminal streaming, and background process management.
          </p>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <a
            href="http://localhost:3000"
            className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all shadow-md"
          >
            Open Web Landing Page (Port 3000)
          </a>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative select-none bg-zinc-50 dark:bg-[#0a0a0c]">
        <TopNav />
        <main className="pt-16 pb-12">
          <div className="max-w-[1280px] mx-auto px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <PageComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom-Right New Version Notification Popup */}
        <AnimatePresence>
          {appUpdate && appUpdate.has_update && !isUpdateDismissed && (
            <motion.aside
              aria-label="Update notification"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed bottom-6 right-6 z-50 w-80 p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 shadow-2xl space-y-3 select-none"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                    New Version Available
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    OpenStore v{appUpdate.latest_version} is available.
                  </p>
                </div>
                <button
                  onClick={() => setIsUpdateDismissed(true)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs p-1 cursor-pointer"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    if (appUpdate.download_url && window.electronAPI?.launchApp) {
                      window.electronAPI.launchApp({ url: appUpdate.download_url });
                    } else if (appUpdate.release_url && window.electronAPI?.launchApp) {
                      window.electronAPI.launchApp({ url: appUpdate.release_url });
                    }
                  }}
                  className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Update</span>
                </button>
                <button
                  onClick={() => {
                    navigate('updates');
                    setIsUpdateDismissed(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
