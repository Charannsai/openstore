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
  const { theme, setTheme, settings, updateSetting } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl"
    >
      <h1 className="text-xl font-bold text-zinc-950 dark:text-white mb-6 tracking-tight">Settings</h1>

      <div className="space-y-4">
        {/* Theme & Appearance */}
        <SettingsSection title="Appearance & Theme" icon={<PaletteIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}>
          <div className="py-2.5 px-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-zinc-950 dark:text-zinc-100">Application Theme</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">Switch between light mode and dark mode aesthetics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-zinc-300 font-semibold'
                }`}
              >
                <MoonIcon className="w-5 h-5" />
                <span className="text-xs">Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-zinc-300 font-semibold'
                }`}
              >
                <SunIcon className="w-5 h-5" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-zinc-300 font-semibold'
                }`}
              >
                <MonitorIcon className="w-5 h-5" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* General */}
        <SettingsSection title="General" icon={<MonitorIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}>
          <SettingRow
            label="Install directory"
            description="Default location for installed applications"
            value={settings.installDir}
          />
          <SettingRow
            label="Auto-check updates"
            description="Periodically check for application updates"
            toggle={true}
            checked={settings.autoCheckUpdates}
            onToggle={(checked) => updateSetting('autoCheckUpdates', checked)}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy & Security" icon={<ShieldIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}>
          <SettingRow
            label="Send diagnostics"
            description="Help improve the platform by sending anonymized crash reports"
            toggle={true}
            checked={settings.sendDiagnostics}
            onToggle={(checked) => updateSetting('sendDiagnostics', checked)}
          />
          <SettingRow
            label="Verify checksums"
            description="Always verify file integrity before installation"
            toggle={true}
            checked={settings.verifyChecksums}
            onToggle={(checked) => updateSetting('verifyChecksums', checked)}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={<BellIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}>
          <SettingRow
            label="Update notifications"
            description="Show notifications when updates are available"
            toggle={true}
            checked={settings.updateNotifications}
            onToggle={(checked) => updateSetting('updateNotifications', checked)}
          />
        </SettingsSection>

        {/* Storage */}
        <SettingsSection title="Storage" icon={<HardDriveIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}>
          <SettingRow
            label="Cache size"
            description="Downloaded installers and temporary files"
            value="Local disk cache"
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon={<InfoIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}>
          <SettingRow label="Version" value={BRAND.version} />
          <SettingRow label="Architecture" value="Local Desktop App" />
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
        <span className="text-zinc-600 dark:text-zinc-400">{icon}</span>
        <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">{title}</h2>
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
  checked,
  onToggle,
  action,
}: {
  label: string;
  description?: string;
  value?: string;
  toggle?: boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors">
      <div>
        <p className="text-xs font-bold text-zinc-950 dark:text-zinc-200">{label}</p>
        {description && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">{description}</p>}
      </div>
      {toggle && (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={(e) => onToggle?.(e.target.checked)}
          />
          <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 rounded-full peer peer-checked:bg-zinc-950 dark:peer-checked:bg-white transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-950 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      )}
      {value && !toggle && (
        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">{value}</span>
      )}
      {action && (
        <button className="text-xs font-bold text-zinc-950 dark:text-zinc-100 hover:underline transition-all cursor-pointer">
          {action}
        </button>
      )}
    </div>
  );
}
