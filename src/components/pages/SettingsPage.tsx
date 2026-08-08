'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/lib/constants';
import { useAppStore } from '@/store/app-store';
import {
  MonitorIcon,
  ShieldIcon,
  BellIcon,
  PaletteIcon,
  HardDriveIcon,
  InfoIcon,
  SunIcon,
  MoonIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@/components/ui/hugeicons';

type SettingsTab = 'appearance' | 'general' | 'privacy' | 'about';

export default function SettingsPage() {
  const { theme, setTheme, settings, updateSetting } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<SettingsTab>('appearance');

  const categories: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance & Theme', icon: PaletteIcon },
    { id: 'general', label: 'General & Storage', icon: MonitorIcon },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldIcon },
    { id: 'about', label: 'About OpenStore', icon: InfoIcon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Manage your application preferences, local workspaces, and privacy options
        </p>
      </div>

      {/* Main Grid: Left Sub-Nav + Right Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sub-Nav */}
        <div className="space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Panel Content */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Category 1: Appearance */}
              {activeCategory === 'appearance' && (
                <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-950 dark:text-white mb-1">Appearance & Aesthetics</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Customize color themes and interface modes for high clarity
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Dark Mode Option */}
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all cursor-pointer text-center ${
                        theme === 'dark'
                          ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 font-semibold'
                      }`}
                    >
                      <MoonIcon className="w-6 h-6" />
                      <div>
                        <span className="text-xs block font-bold">Dark Mode</span>
                        <span className="text-[10px] opacity-75 font-normal block mt-0.5">High-contrast dark palette</span>
                      </div>
                    </button>

                    {/* Light Mode Option */}
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all cursor-pointer text-center ${
                        theme === 'light'
                          ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 font-semibold'
                      }`}
                    >
                      <SunIcon className="w-6 h-6" />
                      <div>
                        <span className="text-xs block font-bold">Light Mode</span>
                        <span className="text-[10px] opacity-75 font-normal block mt-0.5">Clean daylight contrast</span>
                      </div>
                    </button>

                    {/* System Theme Option */}
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all cursor-pointer text-center ${
                        theme === 'system'
                          ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 font-semibold'
                      }`}
                    >
                      <MonitorIcon className="w-6 h-6" />
                      <div>
                        <span className="text-xs block font-bold">System Default</span>
                        <span className="text-[10px] opacity-75 font-normal block mt-0.5">Match OS theme setting</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Category 2: General & Storage */}
              {activeCategory === 'general' && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-4">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-950 dark:text-white mb-1">General Preferences</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Configure local paths, background updates, and workspace directories
                      </p>
                    </div>

                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                      <SettingRow
                        label="Local Workspace Path"
                        description="Location where cloned repositories and binaries are stored on disk"
                        value={settings.installDir}
                      />
                      <SettingRow
                        label="Auto-Check Updates"
                        description="Periodically check open-source releases for version updates"
                        toggle={true}
                        checked={settings.autoCheckUpdates}
                        onToggle={(checked) => updateSetting('autoCheckUpdates', checked)}
                      />
                      <SettingRow
                        label="Update Notifications"
                        description="Display desktop alerts when repository updates are released"
                        toggle={true}
                        checked={settings.updateNotifications}
                        onToggle={(checked) => updateSetting('updateNotifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <HardDriveIcon className="w-4 h-4 text-zinc-500" />
                      <h2 className="text-sm font-bold text-zinc-950 dark:text-white">Local Storage & Cache</h2>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2">
                      <div>
                        <p className="font-semibold text-zinc-950 dark:text-white">Installer Download Cache</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Temporary binaries stored in local machine cache</p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">Local Disk</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 3: Privacy & Security */}
              {activeCategory === 'privacy' && (
                <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-950 dark:text-white mb-1">Privacy & Security Policies</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Control security validations, integrity checks, and data privacy options
                    </p>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-white/5">
                    <SettingRow
                      label="Verify File Checksums"
                      description="Validate file integrity and SHA256 checksums before local execution"
                      toggle={true}
                      checked={settings.verifyChecksums}
                      onToggle={(checked) => updateSetting('verifyChecksums', checked)}
                    />
                    <SettingRow
                      label="Send Diagnostic Reports"
                      description="Allow sending anonymized local crash logs to improve platform stability"
                      toggle={true}
                      checked={settings.sendDiagnostics}
                      onToggle={(checked) => updateSetting('sendDiagnostics', checked)}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldIcon className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-bold text-zinc-950 dark:text-white">100% Local-First Architecture</h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      OpenStore operates entirely on your device. We do not inspect, upload, or collect your files, code, or personal data.
                    </p>
                  </div>
                </div>
              )}

              {/* Category 4: About OpenStore */}
              {activeCategory === 'about' && (
                <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                        OS
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-zinc-950 dark:text-white">{BRAND.name} Desktop Agent</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Version {BRAND.version} • Open Source Platform</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 uppercase">
                      100% Local & Open Source
                    </span>
                  </div>

                  {/* What is OpenStore */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">What is OpenStore?</h3>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      OpenStore is an open-source desktop application hub designed to let you discover, clone, build, and run open-source software and GitHub repositories locally on your Windows computer with 1-click simplicity.
                    </p>
                  </div>

                  {/* How Installation Works */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">How Installation Works</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">1. Direct Git Clone</span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-normal">
                          Clones repository source code directly into your local machine workspace (<code className="font-mono text-[10px]">Downloads/OpenStore</code>).
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">2. Local Build Engine</span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-normal">
                          Inspects manifests (<code className="font-mono text-[10px]">package.json</code>, <code className="font-mono text-[10px]">requirements.txt</code>) and installs dependencies locally via <code className="font-mono text-[10px]">npm</code>/<code className="font-mono text-[10px]">pip</code>.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">3. Official Binaries</span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-normal">
                          Retrieves official desktop installers directly from developer release assets or Winget manifests.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Limitations */}
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-2">
                    <h3 className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                      <ShieldIcon className="w-4 h-4 text-emerald-500" />
                      <span>Zero User-End Data Access Guarantee</span>
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      OpenStore does <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">NOT</strong> read, access, or upload any personal files, documents, or credentials from your computer. All cloning, builds, dependency downloads, and local servers run completely offline on your device.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
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
        {description && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium leading-relaxed">{description}</p>}
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
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-mono flex-shrink-0 truncate max-w-[200px]">
          {value}
        </span>
      )}
    </div>
  );
}

