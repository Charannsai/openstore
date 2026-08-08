'use client';

import { motion } from 'framer-motion';
import { BRAND } from '@/lib/constants';
import {
  Monitor,
  Shield,
  Bell,
  Palette,
  HardDrive,
  Globe,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-4">
        {/* General */}
        <SettingsSection title="General" icon={<Monitor className="w-4 h-4" />}>
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
        <SettingsSection title="Privacy & Security" icon={<Shield className="w-4 h-4" />}>
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
        <SettingsSection title="Notifications" icon={<Bell className="w-4 h-4" />}>
          <SettingRow
            label="Update notifications"
            description="Show notifications when updates are available"
            toggle={true}
            defaultChecked={true}
          />
        </SettingsSection>

        {/* Storage */}
        <SettingsSection title="Storage" icon={<HardDrive className="w-4 h-4" />}>
          <SettingRow
            label="Cache size"
            description="Downloaded installers and temporary files"
            value="2.4 GB"
            action="Clear"
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon={<Info className="w-4 h-4" />}>
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
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-zinc-500">{icon}</span>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
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
    <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div>
        <p className="text-xs font-medium text-zinc-300">{label}</p>
        {description && <p className="text-[11px] text-zinc-600 mt-0.5">{description}</p>}
      </div>
      {toggle && (
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
          <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:bg-indigo-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      )}
      {value && !toggle && (
        <span className="text-xs text-zinc-500">{value}</span>
      )}
      {action && (
        <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}
