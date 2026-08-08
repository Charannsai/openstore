'use client';

import { useEffect } from 'react';
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
  const { currentView, navigate } = useAppStore();
  const PageComponent = pageComponents[currentView] || HomePage;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.getInstalledApps) {
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
      </div>
    </ErrorBoundary>
  );
}
