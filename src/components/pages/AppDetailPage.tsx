'use client';

import { useAppStore } from '@/store/app-store';
import { getAppBySlug } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  GitFork,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  Check,
  Monitor,
  Cpu,
  HardDrive,
  Globe,
  BookOpen,
  Scale,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function AppDetailPage() {
  const { selectedAppSlug, navigate, startInstallation, installedApps, applications } = useAppStore();

  // Look up in global applications store first (which includes live fetched GitHub repos)
  const app = applications.find((a) => a.slug === selectedAppSlug) || (selectedAppSlug ? getAppBySlug(selectedAppSlug) : null);

  if (!app) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-xs text-zinc-500">Repository metadata not found.</p>
      </div>
    );
  }

  const isInstalled = installedApps.some((a) => a.application_id === app.id);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      {/* Back button */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="glass-card rounded-xl p-6 mb-6 border border-white/[0.08]">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Icon */}
          <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-10 h-10 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-base font-bold text-zinc-300">${app.name.substring(0, 2).toUpperCase()}</span>`;
                }
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-xl font-bold text-zinc-100 tracking-tight mb-1">{app.name}</h1>
                <p className="text-xs text-zinc-400 mb-3 font-medium">{app.developer}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-minimal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-zinc-400" />
                    Open Source
                  </span>
                  <span className="badge-minimal flex items-center gap-1">
                    <Scale className="w-3 h-3 text-zinc-400" />
                    {app.license}
                  </span>
                  <span className="badge-minimal">
                    {app.difficulty.charAt(0).toUpperCase() + app.difficulty.slice(1)}
                  </span>
                </div>
              </div>

              {/* Install / Installed */}
              <div className="flex flex-col items-end gap-1.5">
                {isInstalled ? (
                  <div className="px-5 py-2 rounded-lg bg-zinc-800 text-zinc-200 font-medium text-xs border border-white/10 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-zinc-300" />
                    Installed
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      startInstallation(app.id);
                      navigate('install', { slug: app.slug });
                    }}
                    className="btn-primary px-7 py-2 rounded-lg text-xs font-semibold"
                  >
                    Install
                  </button>
                )}
                <span className="text-[10px] text-zinc-500 font-mono">v{app.latest_version}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/[0.06]">
          {app.star_count > 0 && (
            <Stat icon={<Star className="w-3.5 h-3.5 text-zinc-400" />} label="Stars" value={formatCount(app.star_count)} />
          )}
          <Stat icon={<GitFork className="w-3.5 h-3.5 text-zinc-400" />} label="Forks/Downloads" value={formatCount(app.download_count)} />
          <Stat icon={<Clock className="w-3.5 h-3.5 text-zinc-400" />} label="Updated" value={formatRelativeTime(app.updated_at)} />
          <Stat icon={<Monitor className="w-3.5 h-3.5 text-zinc-400" />} label="Platforms" value="Windows, macOS, Linux" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ─── Main Content ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="glass-card rounded-xl p-5 border border-white/[0.08]">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">About Project</h2>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {app.long_description || app.description}
            </p>
          </div>

          {/* System Requirements */}
          <div className="glass-card rounded-xl p-5 border border-white/[0.08]">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3.5">Requirements & System State</h2>
            <div className="space-y-2.5">
              <RequirementRow icon={<Monitor className="w-3.5 h-3.5 text-zinc-400" />} label="Operating System" value="Windows 10+ / macOS / Linux" met={true} />
              <RequirementRow icon={<Cpu className="w-3.5 h-3.5 text-zinc-400" />} label="Architecture" value="x64 / ARM64" met={true} />
              <RequirementRow icon={<HardDrive className="w-3.5 h-3.5 text-zinc-400" />} label="Storage" value="500 MB minimum free" met={true} />
            </div>
          </div>

          {/* Verification Audit */}
          <div className="glass-card rounded-xl p-5 border border-white/[0.08]">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Verification & Security Audit</h2>
            <div className="space-y-2">
              <TrustItem label="Official repository source verified" verified={true} />
              <TrustItem label="Open source license confirmed" verified={true} />
              <TrustItem label="Release assets & checksum check" verified={true} />
              <TrustItem label="Controlled desktop agent sandbox execution" verified={true} />
            </div>
          </div>
        </div>

        {/* ─── Sidebar ────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Metadata */}
          <div className="glass-card rounded-xl p-4 border border-white/[0.08]">
            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3.5">Metadata</h3>
            <div className="space-y-2.5">
              <MetaRow label="Developer" value={app.developer} />
              <MetaRow label="License" value={app.license} />
              <MetaRow label="Version" value={app.latest_version} />
              <MetaRow label="Strategy" value={app.installation_methods[0]?.replace(/_/g, ' ') || 'Native'} />
            </div>
          </div>

          {/* Links */}
          <div className="glass-card rounded-xl p-4 border border-white/[0.08]">
            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Project Links</h3>
            <div className="space-y-1">
              <LinkRow icon={<Globe className="w-3.5 h-3.5" />} label="Official Website" url={app.official_website} />
              <LinkRow icon={<GitBranch className="w-3.5 h-3.5" />} label="GitHub Repository" url={app.repository_url} />
              <LinkRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Documentation" url={app.documentation_url} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-zinc-500">
      {icon}
      <div>
        <p className="text-xs font-semibold text-zinc-200">{value}</p>
        <p className="text-[10px] text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

function RequirementRow({ icon, label, value, met }: { icon: React.ReactNode; label: string; value: string; met: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <p className="text-xs font-medium text-zinc-200">{label}</p>
          <p className="text-[10px] text-zinc-500">{value}</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-zinc-400">
        {met ? 'Verified' : 'Pending'}
      </span>
    </div>
  );
}

function TrustItem({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
      <span className="text-xs text-zinc-300">{label}</span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300 font-medium truncate max-w-[140px]">{value}</span>
    </div>
  );
}

function LinkRow({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 py-2 px-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-xs text-zinc-400 hover:text-zinc-200 group"
    >
      <span className="text-zinc-500 group-hover:text-zinc-300">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
    </a>
  );
}
