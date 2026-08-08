'use client';

import { motion } from 'framer-motion';
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
} from '@/components/ui/hugeicons';

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl"
    >
      <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Settings</h1>

      <div className="space-y-5">
        {/* Theme & Appearance */}
        <SettingsSection title="Appearance & Theme" icon={<PaletteIcon className="w-4 h-4 text-indigo-500" />}>
          <div className="py-3 px-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-200">Application Theme</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">Switch between light mode and dark mode aesthetics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                }`}
              >
                <MoonIcon className="w-5 h-5" />
                <span className="text-xs">Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                }`}
              >
                <SunIcon className="w-5 h-5 text-amber-500" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                }`}
              >
                <MonitorIcon className="w-5 h-5" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* General */}
        <SettingsSection title="General" icon={<MonitorIcon className="w-4 h-4 text-indigo-500" />}>
          <SettingRow
            label="Install directory"
            description="Default location for installed applications"
            value="C:\Users\user\OpenStore"
          />
          <SettingRow
            label="Auto-check updates"
            description="Periodically check for application updates"
            toggle={true}
            defaultChecked={true}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy & Security" icon={<ShieldIcon className="w-4 h-4 text-indigo-500" />}>
          <SettingRow
            label="Send diagnostics"
            description="Help improve the platform by sending anonymized crash reports"
            toggle={true}
            defaultChecked={false}
          />
          <SettingRow
            label="Verify checksums"
            description="Always verify file integrity before installation"
            toggle={true}
            defaultChecked={true}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={<BellIcon className="w-4 h-4 text-indigo-500" />}>
          <SettingRow
            label="Update notifications"
            description="Show notifications when updates are available"
            toggle={true}
            defaultChecked={true}
          />
        </SettingsSection>

        {/* Storage */}
        <SettingsSection title="Storage" icon={<HardDriveIcon className="w-4 h-4 text-indigo-500" />}>
          <SettingRow
            label="Cache size"
            description="Downloaded installers and temporary files"
            value="2.4 GB"
            action="Clear"
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon={<InfoIcon className="w-4 h-4 text-indigo-500" />}>
          <SettingRow label="Version" value={BRAND.version} />
          <SettingRow label="Agent status" value="Connected" />
        </SettingsSection>
      </div>
    </motion.div>
  );
}

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10">
      <div className="flex items-center gap-2.5 mb-4">
        <span>{icon}</span>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  value,
  toggle,
  defaultChecked,
  action,
}: {
  label: string;
  description?: string;
  value?: string;
  toggle?: boolean;
  defaultChecked?: boolean;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors">
      <div>
        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{label}</p>
        {description && <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">{description}</p>}
      </div>
      {toggle && (
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
          <div className="w-10 h-5 bg-slate-300 dark:bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-sm" />
        </label>
      )}
      {value && !toggle && (
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{value}</span>
      )}
      {action && (
        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
          {action}
        </button>
      )}
    </div>
  );
}
