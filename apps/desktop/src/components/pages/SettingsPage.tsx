'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/lib/constants';
import { useAppStore } from '@/store/app-store';
import {
  MonitorIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  LockIcon,
  Code2Icon,
  PackageIcon,
  FolderOpenIcon,
} from '@/components/ui/hugeicons';

type SettingsTab = 'appearance' | 'general' | 'privacy' | 'about';

export default function SettingsPage() {
  const { theme, setTheme, settings, updateSetting } = useAppStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [isEditingPath, setIsEditingPath] = useState(false);
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const [resolvedDefaultDir, setResolvedDefaultDir] = useState<string>('Downloads/OpenStore');
  const [customPathInput, setCustomPathInput] = useState(settings.installDir);
  const [updateCheckStatus, setUpdateCheckStatus] = useState<'idle' | 'checking' | 'up-to-date'>('idle');
  const [updateInfo, setUpdateInfo] = useState<{
    has_update: boolean;
    current_version: string;
    latest_version?: string;
    download_url?: string;
    release_url?: string;
  } | null>(null);

  useState(() => {
    if (isElectron && window.electronAPI?.getDownloadsDir) {
      window.electronAPI.getDownloadsDir().then((dir) => {
        if (dir) {
          setResolvedDefaultDir(dir);
          if (!settings.installDir) {
            updateSetting('installDir', dir);
            setCustomPathInput(dir);
          }
        }
      }).catch(() => {});
    }
  });

  const handleCheckAppUpdateInSettings = async () => {
    if (!isElectron || !window.electronAPI?.checkAppUpdate) return;
    setUpdateCheckStatus('checking');
    try {
      const res = await window.electronAPI.checkAppUpdate();
      if (res?.has_update) {
        setUpdateInfo(res);
        setUpdateCheckStatus('idle');
      } else {
        setUpdateCheckStatus('up-to-date');
        setTimeout(() => setUpdateCheckStatus('idle'), 4000);
      }
    } catch {
      setUpdateCheckStatus('idle');
    }
  };

  const handleSelectDirectory = async () => {
    if (typeof window !== 'undefined' && typeof window.electronAPI?.selectDirectory === 'function') {
      try {
        const res = await window.electronAPI.selectDirectory(settings.installDir || resolvedDefaultDir);
        if (res?.success && res.path) {
          updateSetting('installDir', res.path);
          setCustomPathInput(res.path);
        }
      } catch (err) {
        console.error('Error opening file manager dialog:', err);
      }
    } else {
      setCustomPathInput(settings.installDir || resolvedDefaultDir);
      setIsEditingPath(true);
    }
  };

  const handleSaveCustomPath = () => {
    if (customPathInput && customPathInput.trim()) {
      updateSetting('installDir', customPathInput.trim());
    }
    setIsEditingPath(false);
  };

  const handleResetDirectory = async () => {
    if (isElectron && typeof window.electronAPI?.getDownloadsDir === 'function') {
      try {
        const defaultFolder = await window.electronAPI.getDownloadsDir();
        updateSetting('installDir', defaultFolder);
        setCustomPathInput(defaultFolder);
      } catch {
        updateSetting('installDir', 'Downloads/OpenStore');
        setCustomPathInput('Downloads/OpenStore');
      }
    } else {
      updateSetting('installDir', 'Downloads/OpenStore');
      setCustomPathInput('Downloads/OpenStore');
    }
    setIsEditingPath(false);
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'general', label: 'General & Storage' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'about', label: 'About OpenStore' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto space-y-6 pb-16"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Manage workspace preferences, interface theme, and privacy configurations
        </p>
      </div>

      {/* Horizontal Segmented Tab Bar */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-white/10 pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'text-zinc-950 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="settings-tab-pill"
                  className="absolute inset-0 bg-zinc-100 dark:bg-white/[0.08] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-6"
        >
          {/* Panel 1: Appearance */}
          {activeTab === 'appearance' && (
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Interface Theme</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
                  Select your preferred desktop visual presentation mode
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dark Mode */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-start gap-3 transition-all cursor-pointer text-left relative ${
                    theme === 'dark'
                      ? 'border-zinc-950 dark:border-white bg-zinc-100/80 dark:bg-white/[0.08] text-zinc-950 dark:text-white shadow-xs'
                      : 'border-zinc-200 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <MoonIcon className="w-5 h-5" />
                    {theme === 'dark' && <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Dark Mode</span>
                    <span className="text-[11px] opacity-75 font-normal block mt-0.5">High-contrast dark palette</span>
                  </div>
                </button>

                {/* Light Mode */}
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-start gap-3 transition-all cursor-pointer text-left relative ${
                    theme === 'light'
                      ? 'border-zinc-950 dark:border-white bg-zinc-100/80 dark:bg-white/[0.08] text-zinc-950 dark:text-white shadow-xs'
                      : 'border-zinc-200 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <SunIcon className="w-5 h-5" />
                    {theme === 'light' && <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Light Mode</span>
                    <span className="text-[11px] opacity-75 font-normal block mt-0.5">Clean daylight contrast</span>
                  </div>
                </button>

                {/* System */}
                <button
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-start gap-3 transition-all cursor-pointer text-left relative ${
                    theme === 'system'
                      ? 'border-zinc-950 dark:border-white bg-zinc-100/80 dark:bg-white/[0.08] text-zinc-950 dark:text-white shadow-xs'
                      : 'border-zinc-200 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <MonitorIcon className="w-5 h-5" />
                    {theme === 'system' && <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">System Default</span>
                    <span className="text-[11px] opacity-75 font-normal block mt-0.5">Match operating system settings</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Panel 2: General & Storage */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-2">
                <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-2">Workspace & Updates</h2>
                <div className="divide-y divide-zinc-100 dark:divide-white/5">
                  {/* Local Workspace Directory Selector */}
                  <div className="py-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-zinc-950 dark:text-zinc-100">Local Workspace Directory</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal leading-relaxed">
                          Choose your custom location where cloned apps and binaries stay (defaults to <code className="font-mono text-[10px]">Downloads/OpenStore</code>)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={handleResetDirectory}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                          title="Reset to default Downloads/OpenStore directory"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>

                    {isEditingPath ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customPathInput}
                          onChange={(e) => setCustomPathInput(e.target.value)}
                          placeholder="Enter custom path (e.g. C:\OpenSourceApps)..."
                          className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/20 text-xs font-mono text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        />
                        <button
                          onClick={handleSaveCustomPath}
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold cursor-pointer transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingPath(false)}
                          className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-800 dark:text-zinc-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderOpenIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                          <span className="truncate">{settings.installDir}</span>
                        </div>
                        <button
                          onClick={handleSelectDirectory}
                          className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all flex-shrink-0"
                          title="Open File Explorer to select Desktop or any custom folder"
                        >
                          <FolderOpenIcon className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <SettingRow
                    label="Automatic Update Check"
                    description="Periodically check open-source releases for version updates"
                    toggle={true}
                    checked={settings.autoCheckUpdates}
                    onToggle={(checked) => updateSetting('autoCheckUpdates', checked)}
                  />
                  <SettingRow
                    label="Desktop Notifications"
                    description="Display notifications when background services or updates complete"
                    toggle={true}
                    checked={settings.updateNotifications}
                    onToggle={(checked) => updateSetting('updateNotifications', checked)}
                  />
                </div>
              </div>

              {/* Groq AI Auto-Healing Key Card */}
              <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">AI Auto-Healing Engine (Optional)</h2>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
                      Powered by Groq's high-speed LPU AI model to automatically diagnose and fix repository build failures.
                    </p>
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Get Free API Key
                  </a>
                </div>

                <div className="pt-1">
                  <input
                    type="password"
                    placeholder="Enter Groq API Key (gsk_...)"
                    value={settings.groqApiKey || ''}
                    onChange={(e) => updateSetting('groqApiKey', e.target.value.trim())}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    Keys are stored 100% locally on your machine and never transmitted to OpenStore servers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Panel 3: Privacy & Security */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-2">
                <h2 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-2">Security Validations</h2>
                <div className="divide-y divide-zinc-100 dark:divide-white/5">
                  <SettingRow
                    label="Verify Checksums"
                    description="Validate file integrity and SHA256 checksums before local execution"
                    toggle={true}
                    checked={settings.verifyChecksums}
                    onToggle={(checked) => updateSetting('verifyChecksums', checked)}
                  />
                  <SettingRow
                    label="Anonymized Diagnostics"
                    description="Allow sending anonymized crash reports to improve application stability"
                    toggle={true}
                    checked={settings.sendDiagnostics}
                    onToggle={(checked) => updateSetting('sendDiagnostics', checked)}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Zero User-End Data Access</h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                  OpenStore is built with a strict 100% local-first privacy model. We do not access, extract, or transmit any personal files, code, credentials, or user information from your device.
                </p>
              </div>
            </div>
          )}

          {/* Panel 4: About OpenStore */}
          {activeTab === 'about' && (
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/logo.png"
                    alt="OpenStore Logo"
                    className="w-11 h-11 object-contain flex-shrink-0 drop-shadow-md"
                  />
                  <div>
                    <h2 className="text-sm font-bold text-zinc-950 dark:text-white">{BRAND.name} Desktop Agent</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Version {BRAND.version}
                      </p>
                      {updateCheckStatus === 'checking' ? (
                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                          Checking for updates...
                        </span>
                      ) : updateInfo?.has_update ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                            v{updateInfo.latest_version} Available
                          </span>
                          <button
                            onClick={() => {
                              if (updateInfo.download_url && window.electronAPI?.launchApp) {
                                window.electronAPI.launchApp({ url: updateInfo.download_url });
                              } else if (updateInfo.release_url && window.electronAPI?.launchApp) {
                                window.electronAPI.launchApp({ url: updateInfo.release_url });
                              }
                            }}
                            className="btn-primary px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Update OpenStore</span>
                          </button>
                        </div>
                      ) : updateCheckStatus === 'up-to-date' ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckIcon className="w-3 h-3" /> Up to date
                        </span>
                      ) : (
                        <button
                          onClick={handleCheckAppUpdateInSettings}
                          className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white underline underline-offset-2 cursor-pointer"
                        >
                          Check for new release
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 uppercase tracking-wider">
                    100% Local Execution
                  </span>
                </div>
              </div>

              {/* What is OpenStore */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">What is OpenStore?</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                  OpenStore is an open-source desktop application store that empowers developers and users to discover, clone, build, and run open-source software and GitHub repositories locally on their Windows computers with 1-click simplicity.
                </p>
              </div>

              {/* How Installation Works */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">How Installation Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Code2Icon className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-950 dark:text-white">1. Direct Git Clone</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal font-normal">
                      Clones repository source code directly into your local machine directory (<code className="font-mono text-[10px]">Downloads/OpenStore</code>).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <PackageIcon className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-950 dark:text-white">2. Local Build Setup</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal font-normal">
                      Inspects project manifests (<code className="font-mono text-[10px]">package.json</code>, <code className="font-mono text-[10px]">requirements.txt</code>) and installs dependencies locally via <code className="font-mono text-[10px]">npm</code>/<code className="font-mono text-[10px]">pip</code>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldIcon className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-950 dark:text-white">3. Verified Binaries</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal font-normal">
                      Retrieves official desktop installers directly from developer release assets or Winget manifests with checksum validation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Guarantee Card */}
              <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 space-y-2">
                <h3 className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <LockIcon className="w-4 h-4 text-emerald-500" />
                  <span>Privacy & Security Guarantee</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">Zero User-End Data Access:</strong> OpenStore does NOT read, collect, or transmit any personal files, documents, or credentials from your computer. Everything runs completely locally on your machine.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function SettingRow({
  label,
  description,
  value,
  toggle,
  checked,
  onToggle,
}: {
  label: string;
  description?: string;
  value?: string;
  toggle?: boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="pr-4">
        <p className="text-xs font-bold text-zinc-950 dark:text-zinc-100">{label}</p>
        {description && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal leading-relaxed">{description}</p>}
      </div>

      {toggle && (
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={(e) => onToggle?.(e.target.checked)}
          />
          <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-zinc-950 dark:peer-checked:bg-white transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-950 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-xs" />
        </label>
      )}

      {value && !toggle && (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-mono flex-shrink-0 truncate max-w-[220px]">
          {value}
        </span>
      )}
    </div>
  );
}
