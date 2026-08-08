/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCwIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  Loader2Icon,
  SparklesIcon,
  ShieldCheckIcon,
  PackageIcon,
  SearchIcon,
  InfoIcon,
  ExternalLinkIcon,
  CheckIcon,
} from '@/components/ui/hugeicons';

export default function UpdatesPage() {
  const { installedApps, updateAppVersion, updateAllApps, addActivity, navigate } = useAppStore();
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(new Date().toLocaleTimeString());
  const [updatingAppIds, setUpdatingAppIds] = useState<Record<string, boolean>>({});
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'installed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [checkNotice, setCheckNotice] = useState<string | null>(null);

  const appsWithUpdates = installedApps.filter(
    (a) => a.version !== a.application.latest_version
  );

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    setCheckNotice(null);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const now = new Date().toLocaleTimeString();
    setLastChecked(now);
    setIsChecking(false);
    
    const count = installedApps.filter((a) => a.version !== a.application.latest_version).length;
    if (count > 0) {
      setCheckNotice(`Found ${count} pending release update${count > 1 ? 's' : ''}.`);
    } else {
      setCheckNotice('All applications are currently up to date.');
    }

    setTimeout(() => {
      setCheckNotice(null);
    }, 4000);
  };

  const handleUpdateSingle = async (installedId: string, appName: string, newVersion: string) => {
    setUpdatingAppIds((prev) => ({ ...prev, [installedId]: true }));
    await new Promise((resolve) => setTimeout(resolve, 1200));

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
      await new Promise((resolve) => setTimeout(resolve, 600));
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-12 space-y-6"
    >
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-indigo-500/30 dark:via-purple-500/30 dark:to-pink-500/30 border border-indigo-500/30 dark:border-indigo-400/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
            <RefreshCwIcon className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Software Updates</h1>
              {appsWithUpdates.length > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300 border border-amber-500/30 rounded-full">
                  {appsWithUpdates.length} Pending
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" /> Up to date
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>Automated distribution channel active</span>
              {lastChecked && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span>Last checked {lastChecked}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {appsWithUpdates.length > 0 && (
            <button
              onClick={handleUpdateAll}
              disabled={isUpdatingAll || isChecking}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingAll ? (
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <SparklesIcon className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              )}
              <span>{isUpdatingAll ? 'Updating All...' : `Update All (${appsWithUpdates.length})`}</span>
            </button>
          )}

          <button
            onClick={handleCheckUpdates}
            disabled={isChecking || isUpdatingAll}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 text-zinc-500 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Check for updates'}</span>
          </button>
        </div>
      </div>

      {/* Temporary Banner Notice */}
      <AnimatePresence>
        {checkNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <InfoIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>{checkNotice}</span>
            </div>
            <button onClick={() => setCheckNotice(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs & Search Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'pending'
                ? 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-white/10 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Pending Updates ({appsWithUpdates.length})
          </button>

          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'installed'
                ? 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-white/10 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All Installed ({installedApps.length})
          </button>
        </div>

        {/* Search Input for Installed Apps */}
        <div className="relative min-w-[220px]">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter installed apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tab Content 1: Pending Updates */}
      {activeTab === 'pending' && (
        <div>
          {appsWithUpdates.length > 0 ? (
            <div className="space-y-4">
              {/* Top Banner Alert */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {appsWithUpdates.length} release update{appsWithUpdates.length > 1 ? 's' : ''} available
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Upgrades include security enhancements, bug fixes, and feature additions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUpdateAll}
                  disabled={isUpdatingAll}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingAll ? 'Updating...' : 'Update All Now'}
                </button>
              </div>

              {/* Cards for each app with available update */}
              <div className="grid grid-cols-1 gap-3.5">
                {appsWithUpdates.map((installed, i) => {
                  const app = installed.application;
                  const isUpdatingThis = !!updatingAppIds[installed.id];
                  const isExpanded = !!expandedNotes[installed.id];

                  return (
                    <motion.div
                      key={installed.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group rounded-2xl bg-white dark:bg-[#151519] border border-zinc-200 dark:border-white/10 p-4 shadow-xs hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            onClick={() => navigate('app-detail', { slug: app.slug })}
                            className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-2 flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                          >
                            <img
                              src={app.icon_url}
                              alt={app.name}
                              className="w-8 h-8 object-contain rounded"
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
                                className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                              >
                                {app.name}
                              </h3>
                              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                                {app.developer}
                              </span>
                            </div>

                            {/* Version Delta Badges */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
                                v{installed.version}
                              </span>
                              <ArrowRightIcon className="w-3 h-3 text-zinc-400" />
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                v{app.latest_version}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-medium ml-1">
                                ~{Math.floor(Math.random() * 80 + 30)} MB
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleNotes(installed.id)}
                            className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            {isExpanded ? 'Hide info' : 'What\'s new'}
                          </button>

                          <button
                            onClick={() => handleUpdateSingle(installed.id, app.name, app.latest_version)}
                            disabled={isUpdatingThis || isUpdatingAll}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                          >
                            {isUpdatingThis ? (
                              <>
                                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCwIcon className="w-3.5 h-3.5" />
                                <span>Update</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Release Notes */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 overflow-hidden"
                          >
                            <p className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <SparklesIcon className="w-3.5 h-3.5 text-indigo-500" />
                              Release Highlights for v{app.latest_version}:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-zinc-500 dark:text-zinc-400 pl-1 text-[11px]">
                              <li>Optimized local startup performance and reduced idle resource usage.</li>
                              <li>Updated security dependencies and binary integrity verification.</li>
                              <li>Enhanced compatibility with latest Windows desktop agent runtime.</li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* All Up-to-Date Hero Card */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl bg-gradient-to-b from-emerald-500/5 via-zinc-900/10 to-transparent border border-emerald-500/20 p-8 sm:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center mb-4 shadow-inner">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-1">
                All Applications Up to Date
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                Your installed open-source software catalog is synchronized with official upstream distribution releases.
              </p>

              {/* Status Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto mb-6">
                <span className="px-3 py-1 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 flex items-center gap-1.5">
                  <PackageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  {installedApps.length} Apps Monitoring
                </span>
                <span className="px-3 py-1 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                  Auto-Check Active
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCheckUpdates}
                  disabled={isChecking}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isChecking ? 'Checking Releases...' : 'Re-check Releases'}
                </button>
                <button
                  onClick={() => navigate('home')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer border border-zinc-200 dark:border-white/10"
                >
                  Discover Apps
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Tab Content 2: All Installed Applications List */}
      {activeTab === 'installed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
            <span>Showing {filteredInstalled.length} installed software package{filteredInstalled.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredInstalled.map((installed) => {
              const app = installed.application;
              const isUpToDate = installed.version === app.latest_version;

              return (
                <div
                  key={installed.id}
                  className="rounded-xl bg-white dark:bg-[#151519] border border-zinc-200 dark:border-white/10 p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-zinc-300 dark:hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => navigate('app-detail', { slug: app.slug })}
                      className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <img
                        src={app.icon_url}
                        alt={app.name}
                        className="w-6 h-6 object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://raw.githubusercontent.com/feathericons/feather/master/icons/box.svg';
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4
                        onClick={() => navigate('app-detail', { slug: app.slug })}
                        className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-500 cursor-pointer truncate"
                      >
                        {app.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        v{installed.version} • {app.developer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUpToDate ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md border border-emerald-500/20 flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" /> Up to date
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTab('pending');
                        }}
                        className="px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md border border-amber-500/20 cursor-pointer transition-colors"
                      >
                        Update to v{app.latest_version}
                      </button>
                    )}

                    <button
                      onClick={() => navigate('app-detail', { slug: app.slug })}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="View Details"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

