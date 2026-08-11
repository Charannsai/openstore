/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { BRAND, FEATURE_LIST } from '@/lib/constants';
import { fetchRepoStarCount, formatStarCount } from '@/lib/github-api';
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
  CompassIcon,
  CpuIcon,
  LayersIcon,
  CopyIcon,
  CheckIcon,
  GithubIcon,
  StarIcon,
  ArrowUpRightIcon,
  XIcon,
} from '@/components/ui/hugeicons';
import SearchBar from '@/components/landing/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'overview' | 'sandbox' | 'engine' | 'download';
type PreviewModeType = 'runner' | 'explore' | 'detail' | 'install';

const TABS: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sandbox', label: 'Live Sandbox' },
  { id: 'engine', label: 'Engine Features' },
  { id: 'download', label: 'Get Desktop App' },
];

const CURATED_HIGHLIGHTS = [
  {
    name: 'Excalidraw',
    dev: 'excalidraw',
    stars: '84.2k',
    desc: 'Virtual whiteboard with end-to-end encryption.',
    url: 'https://github.com/excalidraw/excalidraw',
    tag: 'Design',
  },
  {
    name: 'Ollama',
    dev: 'ollama',
    stars: '112k',
    desc: 'Run Llama 3.3, Mistral, and LLMs locally.',
    url: 'https://github.com/ollama/ollama',
    tag: 'Local AI',
  },
  {
    name: 'Supabase',
    dev: 'supabase',
    stars: '76.8k',
    desc: 'Open-source Firebase alternative with Postgres.',
    url: 'https://github.com/supabase/supabase',
    tag: 'Backend',
  },
  {
    name: 'AFFiNE',
    dev: 'toeverything',
    stars: '48.5k',
    desc: 'Next-gen privacy-first Notion alternative.',
    url: 'https://github.com/toeverything/AFFiNE',
    tag: 'Workspace',
  },
];

const PREVIEW_SCREENSHOTS = {
  explore: {
    src: '/screenshots/explore-store.png',
    alt: 'OpenStore Explore Open-Source Projects',
    title: 'Explore & Discover 100M+ Repositories',
    desc: 'Filter by category (AI, Dev, Media, Privacy), difficulty, and stars.',
  },
  detail: {
    src: '/screenshots/app-detail.png',
    alt: 'OpenStore Application Details View',
    title: 'App Overview & Architecture Specs',
    desc: 'Full package details, licensing, and 1-click install triggers.',
  },
  install: {
    src: '/screenshots/app-install.png',
    alt: 'OpenStore 1-Click Automated Installation',
    title: '1-Click Automated Lifecycle & Progress',
    desc: 'Real-time cloning, automated winget dependencies, and background daemon execution.',
  },
};

export default function LandingPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [previewMode, setPreviewMode] = useState<PreviewModeType>('runner');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [repoStars, setRepoStars] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('openstore_repo_stars');
      if (cached) {
        const parsed = parseInt(cached, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 3;
  });

  useEffect(() => {
    fetchRepoStarCount(BRAND.githubUrl).then((stars) => {
      if (stars !== null) {
        setRepoStars(stars);
        try {
          localStorage.setItem('openstore_repo_stars', stars.toString());
        } catch {}
      }
    });
  }, []);

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
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300 font-sans relative select-none">
      {/* Background Ambient Glow */}
      <div className="ambient-glow" />

      {/* ─── Top Navigation Header (No Background) ────────────────────────── */}
      <header className="w-full z-50 pt-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto px-2 py-2 flex items-center justify-between">
          {/* Brand Emblem */}
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <img src="/logo.png" alt="OpenStore Logo" className="w-7 h-7 object-contain drop-shadow-xs" />
            <div className="hidden sm:block">
              <span className="text-xs font-bold tracking-tight text-zinc-950 dark:text-white block">
                {BRAND.name}
              </span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium block -mt-0.5">
                Desktop Platform
              </span>
            </div>
          </button>

          {/* Tab Navigation Switcher */}
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <a
              href={BRAND.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="GitHub Repository & Stars"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Star</span>
              <span className="flex items-center gap-0.5 text-zinc-500 dark:text-zinc-400 font-normal">
                <StarIcon className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                {formatStarCount(repoStars)}
              </span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <SunIcon className="w-3.5 h-3.5 text-zinc-950" />
              ) : (
                <MoonIcon className="w-3.5 h-3.5 text-zinc-200" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('download')}
              className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get App</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Single-Screen Content View ──────────────────────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center relative overflow-hidden py-2">
        <AnimatePresence mode="wait">
          {/* VIEW 1: OVERVIEW & LIVE SIMULATOR / SCREENSHOT PREVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              transition={{ duration: 0.25 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column Content */}
              <div className="lg:col-span-6 space-y-3.5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
                  <SparklesIcon className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                  <span>OpenStore Desktop Agent v{BRAND.version} Released</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
                  The Open-Source App Store & Local Agent.
                </h1>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-lg">
                  Discover, clone, auto-fix prerequisites via Winget, and run any GitHub repository or binary on your Windows PC hands-free.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={BRAND.downloads.windowsExe}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download Setup (.exe)</span>
                  </a>
                  <a
                    href={BRAND.downloads.windowsPortable}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Portable (.exe)</span>
                  </a>

                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className="btn-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <SearchIcon className="w-4 h-4" />
                    <span>Try Live Sandbox</span>
                  </button>
                </div>

                <div className="pt-1 max-w-md">
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-white/10 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                    <span className="truncate">git clone https://github.com/Charannsai/openstore.git</span>
                    <button
                      type="button"
                      onClick={copyCloneCommand}
                      className="ml-2 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex-shrink-0"
                      title="Copy command"
                    >
                      {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column App Simulation & Live Screenshots */}
              <div className="lg:col-span-6 w-full">
                <div className="rounded-2xl overflow-hidden glass-card border border-zinc-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#121215] p-3 text-left relative">
                  {/* Window Bar with Preview Mode Tabs */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-white/10 mb-2.5 px-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>

                    {/* Preview Switcher Tabs */}
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-[10px] font-medium border border-zinc-200/60 dark:border-white/5">
                      <button
                        onClick={() => setPreviewMode('runner')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          previewMode === 'runner'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        Live Runner
                      </button>
                      <button
                        onClick={() => setPreviewMode('explore')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          previewMode === 'explore'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        Catalog
                      </button>
                      <button
                        onClick={() => setPreviewMode('detail')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          previewMode === 'detail'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setPreviewMode('install')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          previewMode === 'install'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        Install
                      </button>
                    </div>

                    <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">Windows x64</span>
                  </div>

                  {/* Mode 1: Simulated Runner */}
                  {previewMode === 'runner' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-1.5">
                        <div className="text-[11px] font-semibold text-zinc-950 dark:text-white flex items-center gap-1.5 mb-2">
                          <img src="/logo.png" alt="OpenStore Logo" className="w-4 h-4 object-contain" />
                          <span>OpenStore</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-zinc-200/70 dark:bg-white/[0.08] text-[10px] font-semibold text-zinc-950 dark:text-white flex items-center gap-1.5">
                          <CompassIcon className="w-3 h-3" />
                          <span>Discover</span>
                        </div>
                        <div className="p-1.5 rounded-lg text-[10px] font-medium text-zinc-500 flex items-center gap-1.5">
                          <PackageIcon className="w-3 h-3" />
                          <span>My Apps (4)</span>
                        </div>
                        <div className="p-1.5 rounded-lg text-[10px] font-medium text-zinc-500 flex items-center gap-1.5">
                          <TerminalIcon className="w-3 h-3" />
                          <span>Terminal</span>
                        </div>
                      </div>

                      <div className="sm:col-span-2 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-[11px] font-semibold text-zinc-950 dark:text-white">Developer Roadmap</h4>
                            <p className="text-[9px] text-zinc-500 font-mono">github.com/kamranahmedse/developer-roadmap</p>
                          </div>
                          <span className="badge-minimal text-[9px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                            Active :3000
                          </span>
                        </div>

                        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="w-5/6 h-full bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                        </div>

                        <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-[10px] leading-tight space-y-1">
                          <div className="text-zinc-400">[WINGET] Git 2.44 & Node.js v20.12 detected.</div>
                          <div className="text-zinc-400">[AGENT] npm install completed (0 errors).</div>
                          <div className="text-emerald-400 flex items-center justify-between">
                            <span>[RUNNER] Server online</span>
                            <span className="underline">http://localhost:3000</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Mode 2, 3, 4: Real Desktop App Screenshot Preview */
                    <div className="relative group cursor-pointer" onClick={() => setSelectedScreenshot(PREVIEW_SCREENSHOTS[previewMode as 'explore' | 'detail' | 'install'].src)}>
                      <div className="rounded-xl overflow-hidden border border-zinc-200/80 dark:border-white/10 bg-zinc-950 aspect-[16/9] relative">
                        <img
                          src={PREVIEW_SCREENSHOTS[previewMode as 'explore' | 'detail' | 'install'].src}
                          alt={PREVIEW_SCREENSHOTS[previewMode as 'explore' | 'detail' | 'install'].alt}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1 rounded-lg bg-zinc-900/90 text-white text-[11px] font-medium backdrop-blur-md border border-white/20">
                            Click to Expand Fullscreen
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{PREVIEW_SCREENSHOTS[previewMode as 'explore' | 'detail' | 'install'].title}</span>
                        <span className="text-[10px]">Real Desktop Screenshot</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: LIVE SEARCH SANDBOX */}
          {activeTab === 'sandbox' && (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-4xl mx-auto text-center space-y-3.5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
                <SearchIcon className="w-3.5 h-3.5" />
                <span>Interactive Repository Sandbox</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Search Any GitHub Project or Paste a Repo Link
              </h2>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-normal">
                Test repository discovery in real-time. Search keywords, explore star counts, or inspect open-source tools before installing.
              </p>

              <div className="max-w-2xl mx-auto text-left pt-1">
                <SearchBar />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
                {CURATED_HIGHLIGHTS.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-card rounded-xl p-3 border border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.tag}</span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                        <StarIcon className="w-3 h-3 text-amber-500" />
                        {item.stars}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-950 dark:text-white flex items-center justify-between">
                      <span>{item.name}</span>
                      <ArrowUpRightIcon className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{item.desc}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW 3: ENGINE FEATURES */}
          {activeTab === 'engine' && (
            <motion.div
              key="engine"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-5xl mx-auto text-center space-y-3.5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
                <CpuIcon className="w-3.5 h-3.5" />
                <span>Platform Engine Architecture</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Built for Developers & Power Users
              </h2>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-normal">
                Autonomous background workers handle repository lifecycle, dependencies, and environment setup.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left pt-1">
                {FEATURE_LIST.map((feat) => {
                  const Icon = getFeatureIcon(feat.icon);
                  return (
                    <div
                      key={feat.title}
                      className="glass-card rounded-2xl p-3.5 border border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 transition-all space-y-1.5"
                    >
                      <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-white/10">
                        <Icon className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                      </div>
                      <h3 className="text-xs font-semibold text-zinc-950 dark:text-white tracking-tight">{feat.title}</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">{feat.description}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* VIEW 4: DOWNLOAD & GET STARTED */}
          {activeTab === 'download' && (
            <motion.div
              key="download"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl mx-auto text-center space-y-4"
            >
              <div className="glass-card rounded-3xl p-6 sm:p-9 border border-zinc-200 dark:border-white/15 shadow-2xl bg-white dark:bg-[#121215] space-y-3.5">
                <img src="/logo.png" alt="OpenStore Logo" className="w-14 h-14 object-contain mx-auto drop-shadow-xl" />

                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Get OpenStore Desktop Agent
                </h2>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto font-normal">
                  Compatible with Windows 10 & 11 (x64). Free and open source under MIT License.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                  <a
                    href={BRAND.downloads.windowsExe}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary px-7 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md w-full sm:w-auto justify-center"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download Setup (.exe)</span>
                  </a>

                  <a
                    href={BRAND.downloads.windowsPortable}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary px-5 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download Portable (.exe)</span>
                  </a>
                </div>

                <div className="pt-2 space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center justify-center gap-2">
                    <span>Requires Windows 10/11 x64</span>
                    <span>•</span>
                    <span>Version {BRAND.version}</span>
                    <span>•</span>
                    <a href={BRAND.githubUrl} target="_blank" rel="noreferrer" className="underline hover:text-zinc-900 dark:hover:text-white">
                      Source Code
                    </a>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 max-w-md mx-auto">
                    *Windows SmartScreen notice: Click <strong className="text-zinc-600 dark:text-zinc-300 font-semibold">"More info"</strong> ➔ <strong className="text-zinc-600 dark:text-zinc-300 font-semibold">"Run anyway"</strong>. OpenStore is 100% open source.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Pinned Bottom Minimal Footer (No Background) ─────────────────── */}
      <footer className="w-full z-50 pb-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto py-2 px-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 gap-2">
          <p>© {new Date().getFullYear()} OpenStore Platform. Open-source software desktop agent.</p>
          <div className="flex items-center gap-4 font-medium">
            <button onClick={() => setActiveTab('overview')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
              Overview
            </button>
            <button onClick={() => setActiveTab('sandbox')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
              Sandbox
            </button>
            <button onClick={() => setActiveTab('engine')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
              Engine
            </button>
            <button onClick={() => setActiveTab('download')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
              Download
            </button>
            <span>•</span>
            <a href={BRAND.githubUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <span>GitHub</span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">★ {formatStarCount(repoStars)}</span>
            </a>
            <a href={BRAND.licenseUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              MIT License
            </a>
          </div>
        </div>
      </footer>

      {/* ─── Full-Screen Screenshot Lightbox Modal ────────────────────────── */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScreenshot(null)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-950"
            >
              <button
                type="button"
                onClick={() => setSelectedScreenshot(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/90 text-white hover:bg-zinc-800 border border-white/10 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
              <img
                src={selectedScreenshot}
                alt="OpenStore Desktop Preview"
                className="w-full h-auto object-contain max-h-[85vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
