'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useAppStore } from '@/store/app-store';
import Sidebar from '@/components/layout/Sidebar';
import WindowControls from '@/components/layout/WindowControls';
import HomePage from '@/components/pages/HomePage';
import AppDetailPage from '@/components/pages/AppDetailPage';
import InstallPage from '@/components/pages/InstallPage';
import MyAppsPage from '@/components/pages/MyAppsPage';
import SearchPage from '@/components/pages/SearchPage';
import UpdatesPage from '@/components/pages/UpdatesPage';
import ActivityPage from '@/components/pages/ActivityPage';
import SettingsPage from '@/components/pages/SettingsPage';
import CategoryPage from '@/components/pages/CategoryPage';
import LandingPage from '@/components/pages/LandingPage';
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

import ErrorBoundary from '@/components/ErrorBoundary';

const subscribe = () => () => {};
const getSnapshot = () => typeof window !== 'undefined' && !!window.electronAPI;
const getServerSnapshot = () => false;

export default function App() {
  const { currentView, isSidebarCollapsed } = useAppStore();
  const isElectron = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [viewOverride, setViewOverride] = useState<'landing' | 'desktop' | null>(null);

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

  // Decide whether to show Landing Page or Desktop App
  // Web Browser -> Landing Page (unless user clicked "Launch Desktop App View")
  // Electron -> Desktop App Dashboard
  const isWebMode = isElectron === false;
  const showLandingPage = viewOverride === 'landing' || (isWebMode && viewOverride !== 'desktop');

  if (showLandingPage) {
    return (
      <ErrorBoundary>
        <LandingPage onLaunchWebApp={() => setViewOverride('desktop')} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen relative">
        <div className="fixed top-0 left-0 right-0 h-10 drag-region z-40 pointer-events-auto" />
        <WindowControls />
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 ease-out ${
            isSidebarCollapsed ? 'ml-[104px]' : 'ml-[280px]'
          }`}
        >
          <div className="max-w-[1240px] mx-auto px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, scale: 0.97, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(12px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
