/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { BRAND, FEATURE_LIST } from '@/lib/constants';
import {
  DownloadIcon,
  SearchIcon,
  PackageIcon,
  TerminalIcon,
  GlobeIcon,
  ShieldCheckIcon,
  Code2Icon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  ExternalLinkIcon,
  CompassIcon,
  CpuIcon,
  LayersIcon,
  CopyIcon,
  CheckIcon,
  GithubIcon,
} from '@/components/ui/hugeicons';
import SearchBar from '@/components/landing/SearchBar';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('openstore-theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('openstore-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const copyCloneCommand = () => {
    navigator.clipboard.writeText('git clone https://github.com/Charannsai/openstore.git');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="ambient-glow" />

      {/* ─── Header / Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 dark:bg-zinc-950/75 border-b border-zinc-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center shadow-xs">
              OS
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white block">
                {BRAND.name}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block truncate -mt-0.5">
                Desktop Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Preview
            </a>
            <a href="#search-sandbox" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Search Sandbox
            </a>
            <a href="#download" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Download Agent
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            <a
              href={BRAND.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Star</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <SunIcon className="w-4 h-4 text-zinc-950" />
              ) : (
                <MoonIcon className="w-4 h-4 text-zinc-200" />
              )}
            </button>

            <a
              href="#download"
              className="btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">App</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-16 px-6 text-center max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-6 shadow-xs">
            <SparklesIcon className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
            <span>OpenStore Desktop Agent v{BRAND.version} Released</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-4 leading-[1.15]">
            The Open-Source App Store & Local Execution Agent.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            {BRAND.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={BRAND.downloads.windowsExe}
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-6 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download for Windows (x64)</span>
            </a>

            <a
              href={BRAND.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary px-5 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View Source on GitHub</span>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>

          {/* Copyable Git Clone Snippet */}
          <div className="pt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              <span className="truncate">git clone https://github.com/Charannsai/openstore.git</span>
              <button
                type="button"
                onClick={copyCloneCommand}
                className="ml-2 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex-shrink-0"
                title="Copy to clipboard"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── Mock Window Preview ────────────────────────────────────────── */}
        <motion.div
          id="preview"
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-12 rounded-2xl overflow-hidden glass-card border border-zinc-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#121215] text-left p-4 relative"
        >
          {/* Window Control Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10 mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              OpenStore Desktop Agent — Local Workspace Runner
            </span>
            <div className="w-12" />
          </div>

          {/* Window Mock Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
            {/* Sidebar Mock */}
            <div className="md:col-span-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-2">
              <div className="text-xs font-semibold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                  OS
                </div>
                <span>Navigation</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-200/70 dark:bg-white/[0.08] text-xs font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
                <CompassIcon className="w-3.5 h-3.5" />
                <span>Discover</span>
              </div>
              <div className="p-2 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <PackageIcon className="w-3.5 h-3.5" />
                <span>My Apps (4)</span>
              </div>
              <div className="p-2 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>Terminal Output</span>
              </div>
            </div>

            {/* Active Execution Mock */}
            <div className="md:col-span-3 p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-950 dark:text-white">Developer Roadmap</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">github.com/kamranahmedse/developer-roadmap</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                  <span className="badge-minimal">Port Active: 3000</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              </div>

              {/* Simulated Terminal Log Drawer */}
              <div className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-[11px] space-y-1">
                <div className="text-zinc-400">[WINGET] Detected Git (2.44), Node.js (v20.12). Prerequisites satisfied.</div>
                <div className="text-zinc-400">[AGENT] npm install completed (34 packages added).</div>
                <div className="text-emerald-400 flex items-center justify-between">
                  <span>[RUNNER] Local daemon started on TCP socket :3000</span>
                  <span className="font-semibold underline">http://localhost:3000</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Interactive Search Sandbox ───────────────────────────────────── */}
      <section id="search-sandbox" className="py-16 px-6 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-4 shadow-xs">
            <SearchIcon className="w-3.5 h-3.5" />
            <span>Try Live Repository Search</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3">
            Search Any GitHub Project or Paste a Repo Link
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto font-normal">
            Test the search engine right here. Search keywords or paste full GitHub repository URLs (e.g., <code className="bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-mono">https://github.com/excalidraw/excalidraw</code>).
          </p>

          <div className="max-w-2xl mx-auto text-left">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ─── Feature Highlights Grid ──────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto border-t border-zinc-200 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3">
            Built for Developers & Power Users
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            Everything you need to discover, install, auto-fix, and run open-source software on your desktop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURE_LIST.map((feat) => {
            const Icon = getFeatureIcon(feat.icon);
            return (
              <FeatureCard
                key={feat.title}
                icon={<Icon className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />}
                title={feat.title}
                description={feat.description}
              />
            );
          })}
        </div>
      </section>

      {/* ─── Download CTA Section ─────────────────────────────────────────── */}
      <section id="download" className="py-20 px-6 border-t border-zinc-200 dark:border-white/10 bg-zinc-100/50 dark:bg-zinc-950/60">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 sm:p-12 text-center border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#121215] shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-base flex items-center justify-center mx-auto mb-5 shadow-xs">
            OS
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3">
            Get OpenStore Desktop Agent
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto font-normal">
            Compatible with Windows 10 & 11 (x64). Free and open source under MIT License.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={BRAND.downloads.windowsExe}
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-8 py-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md w-full sm:w-auto justify-center"
            >
              <DownloadIcon className="w-4.5 h-4.5" />
              <span>Download OpenStore-Setup.exe</span>
            </a>

            <a
              href={BRAND.releasesUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary px-6 py-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <LayersIcon className="w-4.5 h-4.5" />
              <span>All Releases (macOS / Linux)</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-zinc-200 dark:border-white/10 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} OpenStore Platform. Open-source software desktop agent.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href={BRAND.githubUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Preview
            </a>
            <a href={BRAND.licenseUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141417] text-left hover:border-zinc-400 dark:hover:border-white/20 transition-all">
      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-white/10 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-950 dark:text-white mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">{description}</p>
    </div>
  );
}

function getFeatureIcon(iconName: string): React.FC<any> {
  switch (iconName) {
    case 'Package':
      return PackageIcon;
    case 'ShieldCheck':
      return ShieldCheckIcon;
    case 'Globe':
      return GlobeIcon;
    case 'Code2':
      return Code2Icon;
    case 'Terminal':
      return TerminalIcon;
    case 'Cpu':
      return CpuIcon;
    default:
      return PackageIcon;
  }
}
