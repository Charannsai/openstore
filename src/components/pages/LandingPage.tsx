'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { BRAND } from '@/lib/constants';
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
  ChevronRightIcon,
  MonitorIcon,
  CpuIcon,
  LayersIcon,
} from '@/components/ui/hugeicons';
import SearchBar from '@/components/store/SearchBar';
import { motion } from 'framer-motion';

export default function LandingPage({ onLaunchWebApp }: { onLaunchWebApp?: () => void }) {
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300 font-sans selection:bg-zinc-800 selection:text-white">
      {/* ─── Header / Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-white/10">
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
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#search-sandbox" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Search Sandbox
            </a>
            <a href="#architecture" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#download" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Download
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer"
              title={mounted && theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {mounted && theme === 'light' ? (
                <SunIcon className="w-4 h-4 text-zinc-950" />
              ) : (
                <MoonIcon className="w-4 h-4 text-zinc-200" />
              )}
            </button>

            <a
              href="#download"
              className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download Agent</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
        >
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-6">
            <SparklesIcon className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
            <span>OpenStore Desktop Agent v0.1.0 Released</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-4 leading-tight">
            The Open-Source App Store & Local Execution Agent.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Discover, clone, auto-fix prerequisites via Winget, and run any GitHub repository or binary on your Windows PC hands-free.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#download"
              className="btn-primary px-6 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download for Windows (x64)</span>
            </a>

            {onLaunchWebApp && (
              <button
                onClick={onLaunchWebApp}
                className="btn-secondary px-5 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <MonitorIcon className="w-4 h-4" />
                <span>Launch Desktop App View</span>
              </button>
            )}

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary px-5 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <ExternalLinkIcon className="w-4 h-4" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </motion.div>

        {/* Mock Window Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-14 rounded-2xl overflow-hidden glass-card border border-zinc-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#121215] text-left p-4 relative"
        >
          {/* Window Control Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10 mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">OpenStore Agent — Windows x64</span>
            <div className="w-12" />
          </div>

          {/* Window Mock Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
            <div className="md:col-span-1 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-2">
              <div className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-[10px]">OS</div>
                <span>Navigation</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-200/70 dark:bg-white/[0.08] text-xs font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
                <CompassIcon className="w-3.5 h-3.5" />
                <span>Discover</span>
              </div>
              <div className="p-2 rounded-lg text-xs font-medium text-zinc-500 flex items-center gap-2">
                <PackageIcon className="w-3.5 h-3.5" />
                <span>My Apps (3)</span>
              </div>
            </div>

            <div className="md:col-span-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-950 dark:text-white">Developer Roadmap</h4>
                  <p className="text-[11px] text-zinc-500">github.com/kamranahmedse/developer-roadmap</p>
                </div>
                <span className="badge-minimal">Ready</span>
              </div>

              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                <span>[AGENT] Port 3000 active. Starting browser runner...</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">http://localhost:3000</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Interactive Search Sandbox ───────────────────────────────────── */}
      <section id="search-sandbox" className="py-16 px-6 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            <SearchIcon className="w-3.5 h-3.5" />
            <span>Try Live Repository Search</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3">
            Search Any GitHub Project or Paste a Repo Link
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto font-normal">
            Test the search engine right here. Search keywords or paste full GitHub repository URLs (e.g., <code className="bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">https://github.com/facebook/react</code>).
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
          <FeatureCard
            icon={<PackageIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />}
            title="Native Winget CLI Engine"
            description="Executes native winget install --id package --silent to install official Windows software directly via CLI."
          />

          <FeatureCard
            icon={<ShieldCheckIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />}
            title="1-Click Prerequisite Auto-Fixer"
            description="Detects missing Git, Node.js, Python, or Docker dependencies and fixes them in 1 click using Winget."
          />

          <FeatureCard
            icon={<GlobeIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />}
            title="Automated Web Server Runner"
            description="Detects web ports (e.g. 3000), monitors TCP sockets, and opens your local web app in the browser automatically."
          />

          <FeatureCard
            icon={<Code2Icon className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />}
            title="IDE & Terminal Launcher"
            description="Opens cloned workspaces directly in VS Code, Cursor, or Command Prompt with 1 click."
          />

          <FeatureCard
            icon={<TerminalIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />}
            title="Real-Time Terminal Output"
            description="Streams stdout and stderr logs into an inline terminal drawer so you can inspect execution details."
          />

          <FeatureCard
            icon={<LayersIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />}
            title="Clean High-Contrast Themes"
            description="Light Mode & Dark Mode with Inter typography, glassmorphism, and curvy Hugeicons."
          />
        </div>
      </section>

      {/* ─── Download CTA Section ─────────────────────────────────────────── */}
      <section id="download" className="py-20 px-6 border-t border-zinc-200 dark:border-white/10 bg-zinc-100/50 dark:bg-zinc-950/60">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 sm:p-12 text-center border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#121215] shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-extrabold text-base flex items-center justify-center mx-auto mb-5 shadow-sm">
            OS
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3">
            Get OpenStore Desktop Agent
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto font-normal">
            Compatible with Windows 10 & 11 (x64). Free and open source.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-8 py-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md w-full sm:w-auto justify-center"
            >
              <DownloadIcon className="w-4.5 h-4.5" />
              <span>Download OpenStore-Setup.exe</span>
            </a>

            {onLaunchWebApp && (
              <button
                onClick={onLaunchWebApp}
                className="btn-secondary px-6 py-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
              >
                <MonitorIcon className="w-4.5 h-4.5" />
                <span>Open Desktop Dashboard View</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-zinc-200 dark:border-white/10 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} OpenStore Platform. Open-source software desktop agent.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a>
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#download" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Download</a>
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
