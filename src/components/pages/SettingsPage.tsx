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
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">Settings</h1>

      <div className="space-y-4">
        {/* Theme & Appearance */}
        <SettingsSection title="Appearance & Theme" icon={<PaletteIcon className="w-4 h-4 text-zinc-500" />}>
          <div className="py-2.5 px-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Application Theme</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">Switch between light mode and dark mode aesthetics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer font-medium ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-zinc-100 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 font-bold shadow-md'
                    : 'bg-zinc-100/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                <MoonIcon className="w-5 h-5" />
                <span className="text-xs">Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer font-medium ${
                  theme === 'light'
                    ? 'bg-zinc-900 text-zinc-100 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 font-bold shadow-md'
                    : 'bg-zinc-100/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                <SunIcon className="w-5 h-5" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer font-medium ${
                  theme === 'system'
                    ? 'bg-zinc-900 text-zinc-100 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 font-bold shadow-md'
                    : 'bg-zinc-100/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                <MonitorIcon className="w-5 h-5" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* General */}
        <SettingsSection title="General" icon={<MonitorIcon className="w-4 h-4 text-zinc-500" />}>
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
        <SettingsSection title="Privacy & Security" icon={<ShieldIcon className="w-4 h-4 text-zinc-500" />}>
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
        <SettingsSection title="Notifications" icon={<BellIcon className="w-4 h-4 text-zinc-500" />}>
          <SettingRow
            label="Update notifications"
            description="Show notifications when updates are available"
            toggle={true}
            defaultChecked={true}
          />
        </SettingsSection>

        {/* Storage */}
        <SettingsSection title="Storage" icon={<HardDriveIcon className="w-4 h-4 text-zinc-500" />}>
          <SettingRow
            label="Cache size"
            description="Downloaded installers and temporary files"
            value="2.4 GB"
            action="Clear"
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon={<InfoIcon className="w-4 h-4 text-zinc-500" />}>
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
    <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
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
    <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-zinc-200/40 dark:hover:bg-white/[0.02] transition-colors">
      <div>
        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
        {description && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">{description}</p>}
      </div>
      {toggle && (
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
          <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 rounded-full peer peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-950 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      )}
      {value && !toggle && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{value}</span>
      )}
      {action && (
        <button className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline transition-all cursor-pointer">
          {action}
        </button>
      )}
    </div>
  );
}
