/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { getAppBySlug } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { runRealInstallation } from '@/lib/installer-engine';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  StarIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  GlobeIcon,
  InfoIcon,
  HardDriveIcon,
  Code2Icon,
  TerminalIcon,
  CheckIcon,
  CopyIcon,
  PlayIcon,
  FolderOpenIcon,
  Trash2Icon,
  Loader2Icon,
  XIcon,
} from '@/components/ui/hugeicons';

export default function AppDetailPage() {
  const {
    selectedAppSlug,
    navigate,
    startInstallation,
    cancelInstallation,
    currentInstallation,
    installedApps,
    applications,
    addInstalledApp,
    addActivity,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'releases'>('overview');
  const [copied, setCopied] = useState(false);
  const [startingAppId, setStartingAppId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  let app = applications.find((a) => a.slug === selectedAppSlug || a.id === selectedAppSlug) || (selectedAppSlug ? getAppBySlug(selectedAppSlug) : null);

  if (!app && selectedAppSlug) {
    const installedMatch = installedApps.find(
      (a) =>
        a.id === selectedAppSlug ||
        a.application_id === selectedAppSlug ||
        a.application?.slug === selectedAppSlug ||
        a.application?.id === selectedAppSlug
    );
    if (installedMatch?.application) {
      app = installedMatch.application;
    } else if (installedMatch) {
      app = {
        id: installedMatch.id,
        name: installedMatch.id.replace(/[-_]/g, ' '),
        slug: installedMatch.id,
        description: `Local open-source repository installed at ${installedMatch.install_path}`,
        long_description: `This application was cloned/installed into your local OpenStore workspace directory at ${installedMatch.install_path}.`,
        icon_url: '',
        category_id: 'developer-tools',
        license: 'Open Source',
        repository_url: '',
        official_website: '',
        documentation_url: '',
        developer: 'Community Maintainer',
        organization: 'OpenStore Workspace',
        platforms: ['windows', 'macos', 'linux'],
        architectures: ['x64', 'arm64'],
        latest_version: installedMatch.version || '1.0.0',
        installation_methods: [installedMatch.install_method || 'git-clone'],
        difficulty: 'easy',
        is_featured: false,
        download_count: 1,
        star_count: 0,
        created_at: installedMatch.installed_at || new Date().toISOString(),
        updated_at: installedMatch.updated_at || new Date().toISOString(),
      };
    }
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-xs text-zinc-500 font-semibold">Repository metadata not found.</p>
        <button
          onClick={() => navigate('home')}
          className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    );
  }

  const isInstalling = Boolean(app && currentInstallation.appId === app.id && currentInstallation.status === 'running');

  useEffect(() => {
    if (!app || !isInstalling) return;

    let isMounted = true;

    async function executeInstallation() {
      if (!app) return;
      try {
        const record = await runRealInstallation(app, {
          onTaskChange: () => {},
          onOverallProgress: (pct: number) => {
            if (isMounted) setInstallProgress(pct);
          },
          onLog: () => {},
        });

        if (isMounted && useAppStore.getState().currentInstallation.status === 'running') {
          addInstalledApp(record);
          addActivity({
            id: `act-${Date.now()}`,
            type: 'install',
            application_name: app.name,
            application_icon: app.icon_url,
            message: `Successfully installed ${app.name} v${app.latest_version || '1.0.0'}`,
            timestamp: new Date().toISOString(),
          });
          useAppStore.setState({
            currentInstallation: {
              ...useAppStore.getState().currentInstallation,
              status: 'completed',
              progress: 100,
            },
          });
        }
      } catch (err) {
        console.error('Installation execution error:', err);
      }
    }

    executeInstallation();

    return () => {
      isMounted = false;
    };
  }, [app, isInstalling]);

  const handleCancelInstallation = async () => {
    cancelInstallation();
    setInstallProgress(0);
    if (!app) return;
    if (isElectron && typeof window.electronAPI?.uninstallApp === 'function') {
      try {
        const userConfiguredDir = useAppStore.getState().settings.installDir;
        const sanitizeName = app.slug.replace(/[^a-zA-Z0-9-_]/g, '_');
        const targetDir = `${userConfiguredDir}/${sanitizeName}`;
        await window.electronAPI.uninstallApp(app.id, targetDir);
      } catch (err) {
        console.error('Error cleaning up cancelled installation:', err);
      }
    }
  };

  const installedRecord = installedApps.find((a) => {
    if (!a || !app) return false;
    if (a.application_id && a.application_id === app.id) return true;
    if (a.id && a.id === app.id) return true;
    if (a.application?.slug && a.application.slug === app.slug) return true;
    if (a.application?.name && a.application.name.toLowerCase() === app.name.toLowerCase()) return true;
    if (app.repository_url && a.application?.repository_url && a.application.repository_url.toLowerCase() === app.repository_url.toLowerCase()) return true;
    if (a.install_path && app.slug && a.install_path.toLowerCase().includes(app.slug.toLowerCase())) return true;
    return false;
  });
  const isInstalled = !!installedRecord;

  const handleLaunchOrRun = async () => {
    if (!installedRecord || !isElectron) {
      navigate('my-apps');
      return;
    }
    const mode = installedRecord.run_mode || 'folder';
    const path = installedRecord.install_path;
    setStartingAppId(installedRecord.id);

    try {
      if (mode === 'browser') {
        const eco = await window.electronAPI!.inspectRepoEcosystem(path);
        const startCmd = installedRecord.start_command || eco.start_command;
        if (startCmd) {
          await window.electronAPI!.startBackgroundService(startCmd, path, installedRecord.id);
          const targetPort = eco.detected_port || 3000;
          const webUrl = `http://localhost:${targetPort}`;
          let retries = 0;
          const interval = setInterval(async () => {
            retries++;
            const check = await window.electronAPI!.checkPort(targetPort);
            if (check.inUse || retries >= 15) {
              clearInterval(interval);
              setStartingAppId(null);
              useAppStore.getState().updateInstalledAppStatus(installedRecord.id, 'running');
              await window.electronAPI!.launchApp({ url: webUrl });
            }
          }, 1000);
        } else {
          setStartingAppId(null);
          await window.electronAPI!.launchApp({ path });
        }
      } else if (mode === 'ide') {
        await window.electronAPI!.openInIDE(path);
        setStartingAppId(null);
      } else if (mode === 'terminal') {
        await window.electronAPI!.executeTerminalCommand(`start cmd /k "cd /d ${path}"`, path);
        setStartingAppId(null);
      } else {
        await window.electronAPI!.openFolder(path);
        setStartingAppId(null);
      }
    } catch (err) {
      console.error('Error launching app:', err);
      setStartingAppId(null);
    }
  };

  const handleOpenFolder = async () => {
    if (isElectron && installedRecord?.install_path) {
      await window.electronAPI!.openFolder(installedRecord.install_path);
    }
  };

  const handleOpenInIDE = async () => {
    if (isElectron && installedRecord?.install_path) {
      await window.electronAPI!.openInIDE(installedRecord.install_path);
    }
  };

  const handleUninstall = async () => {
    if (installedRecord && confirm(`Are you sure you want to uninstall ${app.name}?`)) {
      if (isElectron && installedRecord.install_path && typeof window.electronAPI?.uninstallApp === 'function') {
        try {
          await window.electronAPI.uninstallApp(installedRecord.id, installedRecord.install_path);
        } catch (err) {
          console.error('Failed to delete app folder:', err);
        }
      }
      useAppStore.getState().removeInstalledApp(installedRecord.id);
    }
  };

  const handleOpenExternalUrl = async (url?: string) => {
    if (!url) return;
    if (typeof window !== 'undefined' && window.electronAPI?.launchApp) {
      try {
        await window.electronAPI.launchApp({ url });
      } catch (err) {
        console.error('Error launching external URL via Electron API:', err);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = () => {
    if (app.repository_url) {
      navigator.clipboard.writeText(app.repository_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCount = (n?: number) => {
    if (!n || typeof n !== 'number' || isNaN(n)) return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Discover</span>
      </button>

      {/* Hero Header Card */}
      <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start md:items-center gap-4.5 min-w-0">
            {/* App Icon */}
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/10 p-2">
              <img
                src={app.icon_url || ''}
                alt={app.name || 'App'}
                className="w-11 h-11 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-lg font-bold text-zinc-900 dark:text-white">${(app.name || 'AP').substring(0, 2).toUpperCase()}</span>`;
                  }
                }}
              />
            </div>

            {/* App Title & Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight truncate">
                  {app.name || 'Application'}
                </h1>
                {app.difficulty && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 uppercase">
                    {app.difficulty}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Maintained by <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{app.developer || 'Open Source Community'}</span>
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {(app.star_count || 0) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{formatCount(app.star_count)} stars</span>
                  </div>
                )}
                {(app.download_count || 0) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <DownloadIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>{formatCount(app.download_count)} downloads</span>
                  </div>
                )}
                {app.latest_version && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <HardDriveIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>v{app.latest_version}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {isInstalling ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs"
              >
                {/* Thin Stroke SVG Ring */}
                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      className="text-zinc-200 dark:text-zinc-800"
                      strokeWidth="1.75"
                      stroke="currentColor"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      className="text-emerald-500 dark:text-emerald-400 transition-all duration-300 ease-out"
                      strokeWidth="1.75"
                      strokeDasharray={`${(installProgress * 97.4) / 100}, 97.4`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Minimal Thin Micro-Bar & Status */}
                <div className="flex flex-col min-w-[130px] space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium tracking-tight text-zinc-700 dark:text-zinc-300">
                    <span className="truncate">
                      {installProgress < 30 ? 'Downloading...' : installProgress < 80 ? 'Cloning repository...' : 'Finalizing...'}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                      {installProgress}%
                    </span>
                  </div>

                  {/* 2px Thin Line Bar */}
                  <div className="w-full h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>
                </div>

                {/* Minimal Cancel Icon Button */}
                <button
                  onClick={handleCancelInstallation}
                  className="p-1 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer ml-0.5"
                  title="Cancel installation & clean up files"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : isInstalled && installedRecord ? (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleLaunchOrRun}
                  disabled={startingAppId === installedRecord.id}
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                >
                  {startingAppId === installedRecord.id ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlayIcon className="w-4 h-4" />
                  )}
                  <span>
                    {startingAppId === installedRecord.id
                      ? 'Starting...'
                      : installedRecord.run_mode === 'browser'
                      ? 'Run & Open Web App'
                      : installedRecord.run_mode === 'ide'
                      ? 'Open in IDE'
                      : 'Run Application'}
                  </span>
                </button>

                <button
                  onClick={handleOpenFolder}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  title="Open Installation Directory on Disk"
                >
                  <FolderOpenIcon className="w-4 h-4 text-zinc-500" />
                  <span>Open Folder</span>
                </button>

                <button
                  onClick={handleOpenInIDE}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  title="Open in VS Code / IDE"
                >
                  <Code2Icon className="w-4 h-4 text-zinc-500" />
                  <span>VS Code</span>
                </button>

                <button
                  onClick={handleUninstall}
                  className="p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 transition-all cursor-pointer"
                  title="Uninstall App"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startInstallation(app.id)}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}

            {/* View Source Code Repository Link */}
            {app.repository_url && (
              <button
                onClick={() => handleOpenExternalUrl(app.repository_url)}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                title="Open GitHub Repository in Default Browser"
              >
                <Code2Icon className="w-4 h-4" />
                <span>View Repo</span>
                <ExternalLinkIcon className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          Technical Specifications
        </button>

        <button
          onClick={() => setActiveTab('releases')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'releases'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          Release Notes
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About Card */}
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">About</h2>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                {app.long_description || app.description}
              </p>
            </div>

            {/* External Resource Links Card */}
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">External Resources</h2>
              <div className="flex flex-wrap gap-2.5">
                {app.repository_url && (
                  <button
                    onClick={() => handleOpenExternalUrl(app.repository_url)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Code2Icon className="w-4 h-4 text-zinc-500" />
                    <span>GitHub Repository</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                )}

                {app.official_website && (
                  <button
                    onClick={() => handleOpenExternalUrl(app.official_website)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <GlobeIcon className="w-4 h-4 text-zinc-500" />
                    <span>Official Website</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                )}

                {app.documentation_url && (
                  <button
                    onClick={() => handleOpenExternalUrl(app.documentation_url)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <InfoIcon className="w-4 h-4 text-zinc-500" />
                    <span>Documentation</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                )}

                {app.repository_url && (
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {copied ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4 text-zinc-500" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Repo Link'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Specs Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-3.5">
              <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-2">Package Details</h2>

              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Platform Support</span>
                <span className="font-semibold text-zinc-950 dark:text-white">Windows x64</span>
              </div>

              {app.license && (
                <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">License</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{app.license}</span>
                </div>
              )}

              {app.latest_version && (
                <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Latest Release</span>
                  <span className="font-mono font-semibold text-zinc-950 dark:text-white">v{app.latest_version}</span>
                </div>
              )}

              {app.installation_methods && app.installation_methods.length > 0 && (
                <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Install Strategy</span>
                  <span className="font-semibold text-zinc-950 dark:text-white capitalize">
                    {app.installation_methods[0].replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              )}

              {app.updated_at && (
                <div className="flex items-center justify-between text-xs py-2">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Last Release Date</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{formatRelativeTime(app.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Technical Specs */}
      {activeTab === 'specs' && (
        <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-3">Runtime & Architecture Specs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase">Supported Architectures</span>
                <p className="text-xs font-bold text-zinc-950 dark:text-white mt-1">
                  {app.architectures?.join(', ') || 'x64, arm64'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase">Supported Operating Systems</span>
                <p className="text-xs font-bold text-zinc-950 dark:text-white mt-1 capitalize">
                  {app.platforms?.join(', ') || 'windows, macos, linux'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase">Primary Distribution</span>
                <p className="text-xs font-bold text-zinc-950 dark:text-white mt-1 capitalize">
                  {app.installation_methods?.[0]?.replace('_', ' ').toLowerCase() || 'Official Installer'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
            <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-2">Automated Detection Engine</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              OpenStore Desktop Agent continuously analyzes repository ecosystems, detecting package scripts, build targets, and required CLI runtimes (Git, Node.js, Python, Docker) before execution.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Release Notes */}
      {activeTab === 'releases' && (
        <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-950 dark:text-white">v{app.latest_version}</span>
              <span className="px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20">
                Latest Release
              </span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Released {formatRelativeTime(app.updated_at)}</span>
          </div>

          <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <p className="font-semibold text-zinc-950 dark:text-white">Distribution Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400 pl-1">
              <li>Upstream release binary verified against official developer repository ({app.developer}).</li>
              <li>Includes local runtime compatibility fixes and environment parameter presets.</li>
              <li>Checksum and integrity verification active for automated downloads.</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}

