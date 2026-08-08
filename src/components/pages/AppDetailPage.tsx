'use client';

import { useAppStore } from '@/store/app-store';
import { getAppBySlug } from '@/lib/mock-data';
import { getDifficultyInfo, formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Star,
  ExternalLink,
  GitBranch,
  Shield,
  CheckCircle2,
  Monitor,
  Cpu,
  HardDrive,
  Globe,
  BookOpen,
  Scale,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function AppDetailPage() {
  const { selectedAppSlug, navigate, startInstallation, installedApps } = useAppStore();
  const app = selectedAppSlug ? getAppBySlug(selectedAppSlug) : null;

  if (!app) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-zinc-500">Application not found.</p>
      </div>
    );
  }

  const difficulty = getDifficultyInfo(app.difficulty);
  const isInstalled = installedApps.some((a) => a.application_id === app.id);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      {/* Back button */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/[0.06]">
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-3xl font-bold text-zinc-400">${app.name.charAt(0)}</span>`;
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{app.name}</h1>
                <p className="text-sm text-zinc-400 mb-3">{app.developer}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Open Source Badge */}
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Open Source
                  </span>
                  {/* License */}
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-white/[0.06] text-zinc-400">
                    <Scale className="w-3 h-3" />
                    {app.license}
                  </span>
                  {/* Difficulty */}
                  <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${difficulty.bg} ${difficulty.color}`}>
                    {difficulty.emoji} {difficulty.label}
                  </span>
                </div>
              </div>

              {/* Install / Open */}
              <div className="flex flex-col items-end gap-2">
                {isInstalled ? (
                  <button className="px-6 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-medium text-sm border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                    ✓ Installed
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      startInstallation(app.id);
                      navigate('install', { slug: app.slug });
                    }}
                    className="btn-install px-8 py-2.5 rounded-xl text-white font-medium text-sm"
                  >
                    Install
                  </button>
                )}
                <span className="text-[11px] text-zinc-600">v{app.latest_version}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/[0.06]">
          <Stat icon={<Download className="w-3.5 h-3.5" />} label="Downloads" value={formatCount(app.download_count)} />
          {app.star_count > 0 && (
            <Stat icon={<Star className="w-3.5 h-3.5" />} label="Stars" value={formatCount(app.star_count)} />
          )}
          <Stat icon={<Clock className="w-3.5 h-3.5" />} label="Updated" value={formatRelativeTime(app.updated_at)} />
          <Stat
            icon={<Monitor className="w-3.5 h-3.5" />}
            label="Platforms"
            value={app.platforms.map((p) => p === 'windows' ? '🪟' : p === 'macos' ? '🍎' : '🐧').join(' ')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Main Content ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-3">About</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {app.long_description}
            </p>
          </div>

          {/* Requirements */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">System Requirements</h2>
            <div className="space-y-3">
              <RequirementRow
                icon={<Monitor className="w-4 h-4" />}
                label="Operating System"
                value={app.platforms.map(p => p === 'windows' ? 'Windows 10+' : p === 'macos' ? 'macOS 12+' : 'Linux').join(', ')}
                met={true}
              />
              <RequirementRow
                icon={<Cpu className="w-4 h-4" />}
                label="Architecture"
                value={app.architectures.map(a => a.toUpperCase()).join(', ')}
                met={true}
              />
              <RequirementRow
                icon={<HardDrive className="w-4 h-4" />}
                label="Storage"
                value="500 MB available"
                met={true}
              />
              {app.installation_methods.includes('CONTAINER') && (
                <RequirementRow
                  icon={<AlertTriangle className="w-4 h-4" />}
                  label="Docker"
                  value="Docker Desktop required"
                  met={false}
                />
              )}
            </div>
          </div>

          {/* Trust & Source */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Trust & Source</h2>
            <div className="space-y-2.5">
              <TrustItem label="Official repository identified" verified={true} />
              <TrustItem label="Official release detected" verified={true} />
              <TrustItem label="License identified" verified={true} />
              <TrustItem label="Source documentation available" verified={true} />
              <TrustItem label="Release checksum available" verified={app.installation_methods.includes('OFFICIAL_INSTALLER')} />
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-[11px] text-zinc-600">
                Source: {new URL(app.repository_url).hostname}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Sidebar ────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-3">
              <MetaRow label="Version" value={app.latest_version} />
              <MetaRow label="License" value={app.license} />
              <MetaRow label="Developer" value={app.developer} />
              {app.organization && <MetaRow label="Organization" value={app.organization} />}
              <MetaRow label="Install Method" value={app.installation_methods[0].replace(/_/g, ' ')} />
            </div>
          </div>

          {/* Links */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Links</h3>
            <div className="space-y-2">
              <LinkRow icon={<Globe className="w-3.5 h-3.5" />} label="Official Website" url={app.official_website} />
              <LinkRow icon={<GitBranch className="w-3.5 h-3.5" />} label="Repository" url={app.repository_url} />
              <LinkRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Documentation" url={app.documentation_url} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-zinc-500">
      {icon}
      <div>
        <p className="text-xs font-medium text-zinc-300">{value}</p>
        <p className="text-[10px] text-zinc-600">{label}</p>
      </div>
    </div>
  );
}

function RequirementRow({ icon, label, value, met }: { icon: React.ReactNode; label: string; value: string; met: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
      <div className="flex items-center gap-3">
        <span className={met ? 'text-emerald-400' : 'text-amber-400'}>{icon}</span>
        <div>
          <p className="text-xs font-medium text-zinc-300">{label}</p>
          <p className="text-[11px] text-zinc-500">{value}</p>
        </div>
      </div>
      <span className={`text-xs font-medium ${met ? 'text-emerald-400' : 'text-amber-400'}`}>
        {met ? '✓' : '⚠'}
      </span>
    </div>
  );
}

function TrustItem({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${verified ? 'text-emerald-400' : 'text-zinc-600'}`}>
        {verified ? '✓' : '○'}
      </span>
      <span className={`text-xs ${verified ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-300 font-medium">{value}</span>
    </div>
  );
}

function LinkRow({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
    >
      <span className="text-zinc-500 group-hover:text-indigo-400 transition-colors">{icon}</span>
      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors flex-1">{label}</span>
      <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
    </a>
  );
}
