/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCwIcon,
  ArrowRightIcon,
  Loader2Icon,
  ShieldCheckIcon,
  PackageIcon,
  SearchIcon,
  InfoIcon,
  ExternalLinkIcon,
  CheckIcon,
} from '@/components/ui/hugeicons';
import type { InstalledApp } from '@/lib/types';

export default function UpdatesPage() {
  const { installedApps, updateAppVersion, updateAllApps, addActivity, navigate } = useAppStore();
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [updatingAppIds, setUpdatingAppIds] = useState<Record<string, boolean>>({});
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'installed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [checkNotice, setCheckNotice] = useState<string | null>(null);

  // Sync registry on mount
  useEffect(() => {
    setLastChecked(new Date().toLocaleTimeString());
    if (typeof window !== 'undefined' && window.electronAPI?.getInstalledApps) {
      window.electronAPI
        .getInstalledApps()
        .then((list: InstalledApp[]) => {
          if (Array.isArray(list)) {
            useAppStore.setState({ installedApps: list });
          }
        })
        .catch((err: unknown) => {
          console.error('Error fetching installed apps:', err);
        });
    }
  }, []);

  const appsWithUpdates = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  );

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    setCheckNotice(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const now = new Date().toLocaleTimeString();
    setLastChecked(now);
    setIsChecking(false);
    
    const count = installedApps.filter((a) => a.version !== a.application.latest_version).length;
    if (count > 0) {
      setCheckNotice(`Found ${count} pending release update${count > 1 ? 's' : ''}.`);
    } else {
      setCheckNotice('All installed applications are up to date.');
    }

    setTimeout(() => {
      setCheckNotice(null);
    }, 3500);
  };

  const handleUpdateSingle = async (installedId: string, appName: string, newVersion: string) => {
    setUpdatingAppIds((prev) => ({ ...prev, [installedId]: true }));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const targetApp = installedApps.find((a) => a.id === installedId);
    updateAppVersion(installedId);
    addActivity({
      id: `act-${Date.now()}`,
      type: 'update',
      application_name: appName,
      application_icon: targetApp?.application.icon_url || '',
      message: `Upgraded ${appName} to version ${newVersion}`,
      timestamp: new Date().toISOString(),
    });

    setUpdatingAppIds((prev) => {
      const next = { ...prev };
      delete next[installedId];
      return next;
    });
  };

  const handleUpdateAll = async () => {
    if (appsWithUpdates.length === 0) return;
    setIsUpdatingAll(true);

    for (const app of appsWithUpdates) {
      setUpdatingAppIds((prev) => ({ ...prev, [app.id]: true }));
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const firstApp = appsWithUpdates[0]?.application;
    updateAllApps();

    addActivity({
      id: `act-${Date.now()}`,
      type: 'update',
      application_name: 'All Applications',
      application_icon: firstApp?.icon_url || '',
      message: `Successfully upgraded ${appsWithUpdates.length} application(s)`,
      timestamp: new Date().toISOString(),
    });

    setUpdatingAppIds({});
    setIsUpdatingAll(false);
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredInstalled = installedApps.filter((inst) =>
    inst.application.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.application.developer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-12 space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Updates</h1>
            {appsWithUpdates.length > 0 ? (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                {appsWithUpdates.length} available
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 flex items-center gap-1">
                <CheckIcon className="w-3 h-3 text-zinc-950 dark:text-white" /> Up to date
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {lastChecked ? `Last checked at ${lastChecked}` : 'Distribution channel ready'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {appsWithUpdates.length > 0 && (
            <button
              onClick={handleUpdateAll}
              disabled={isUpdatingAll || isChecking}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingAll ? (
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCwIcon className="w-3.5 h-3.5" />
              )}
              <span>{isUpdatingAll ? 'Updating All...' : `Update All (${appsWithUpdates.length})`}</span>
            </button>
          )}

          <button
            onClick={handleCheckUpdates}
            disabled={isChecking || isUpdatingAll}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Check for updates'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <AnimatePresence>
        {checkNotice && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <InfoIcon className="w-4 h-4 text-zinc-500" />
              <span>{checkNotice}</span>
            </div>
            <button onClick={() => setCheckNotice(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter / Subnav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-white/10 self-start">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Pending ({appsWithUpdates.length})
          </button>

          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'installed'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Installed ({installedApps.length})
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative min-w-[220px]">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search installed apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'pending' && (
        <div>
          {appsWithUpdates.length > 0 ? (
            <div className="space-y-3">
              {appsWithUpdates.map((installed, i) => {
                const app = installed.application;
                const isUpdatingThis = !!updatingAppIds[installed.id];
                const isExpanded = !!expandedNotes[installed.id];

                return (
                  <motion.div
                    key={installed.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          onClick={() => navigate('app-detail', { slug: app.slug })}
                          className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-2 flex-shrink-0 cursor-pointer"
                        >
                          <img
                            src={app.icon_url}
                            alt={app.name}
                            className="w-7 h-7 object-contain rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://raw.githubusercontent.com/feathericons/feather/master/icons/box.svg';
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              onClick={() => navigate('app-detail', { slug: app.slug })}
                              className="text-sm font-semibold text-zinc-950 dark:text-white hover:underline cursor-pointer truncate"
                            >
                              {app.name}
                            </h3>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                              {app.developer}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                              v{installed.version}
                            </span>
                            <ArrowRightIcon className="w-3 h-3 text-zinc-400" />
                            <span className="text-[11px] text-zinc-950 dark:text-white font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/10">
                              v{app.latest_version}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleNotes(installed.id)}
                          className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          {isExpanded ? 'Hide' : 'Details'}
                        </button>

                        <button
                          onClick={() => handleUpdateSingle(installed.id, app.name, app.latest_version)}
                          disabled={isUpdatingThis || isUpdatingAll}
                          className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isUpdatingThis ? (
                            <div className="flex items-center gap-1.5">
                              <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            'Update'
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400 space-y-1 overflow-hidden"
                        >
                          <p className="font-medium text-zinc-950 dark:text-white">Changelog for v{app.latest_version}:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 pl-1">
                            <li>Performance optimizations and security patches.</li>
                            <li>Updated upstream binaries for Windows runtime compatibility.</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Clean Minimal Up-to-Date State */
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 mx-auto flex items-center justify-center mb-3">
                <ShieldCheckIcon className="w-6 h-6 text-zinc-950 dark:text-white" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-white mb-1">
                All applications up to date
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
                No pending releases found for installed applications.
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleCheckUpdates}
                  disabled={isChecking}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer"
                >
                  {isChecking ? 'Checking...' : 'Check for updates'}
                </button>
                <button
                  onClick={() => navigate('home')}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Discover Apps
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Installed Applications Tab */}
      {activeTab === 'installed' && (
        <div className="space-y-2">
          {filteredInstalled.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredInstalled.map((installed) => {
                const app = installed.application;
                const isUpToDate = installed.version === app.latest_version;

                return (
                  <div
                    key={installed.id}
                    className="rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        onClick={() => navigate('app-detail', { slug: app.slug })}
                        className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <img
                          src={app.icon_url}
                          alt={app.name}
                          className="w-5 h-5 object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://raw.githubusercontent.com/feathericons/feather/master/icons/box.svg';
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <h4
                          onClick={() => navigate('app-detail', { slug: app.slug })}
                          className="text-xs font-semibold text-zinc-950 dark:text-white hover:underline cursor-pointer truncate"
                        >
                          {app.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          v{installed.version} • {app.developer}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isUpToDate ? (
                        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/10 flex items-center gap-1">
                          <CheckIcon className="w-3 h-3 text-zinc-950 dark:text-white" /> Up to date
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveTab('pending')}
                          className="text-[10px] font-semibold text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/10 cursor-pointer transition-colors"
                        >
                          Update available
                        </button>
                      )}

                      <button
                        onClick={() => navigate('app-detail', { slug: app.slug })}
                        className="p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded"
                        title="View Details"
                      >
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-8 text-center">
              <PackageIcon className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-zinc-950 dark:text-white">No installed applications found</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Explore the store to install open-source applications.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}


