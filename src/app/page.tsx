'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import Sidebar from '@/components/layout/Sidebar';
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

export default function App() {
  const { currentView, isSidebarCollapsed } = useAppStore();
  const [isElectron, setIsElectron] = useState<boolean | null>(null);
  const [viewOverride, setViewOverride] = useState<'landing' | 'desktop' | null>(null);

  useEffect(() => {
    const checkElectron = typeof window !== 'undefined' && !!window.electronAPI;
    setIsElectron(checkElectron);
  }, []);

  const PageComponent = pageComponents[currentView] || HomePage;

  // Decide whether to show Landing Page or Desktop App
  // Web Browser -> Landing Page (unless user clicked "Launch Desktop App View")
  // Electron -> Desktop App Dashboard
  const isWebMode = isElectron === false;
  const showLandingPage = viewOverride === 'landing' || (isWebMode && viewOverride !== 'desktop');

  if (isElectron === null) {
    // Initial mount hydration check
    return <div className="min-h-screen bg-[var(--bg-app)]" suppressHydrationWarning />;
  }

  if (showLandingPage) {
    return <LandingPage onLaunchWebApp={() => setViewOverride('desktop')} />;
  }

  return (
    <div className="flex min-h-screen relative">
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
  );
}
