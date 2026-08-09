/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  StarIcon,
  ArrowUpRightIcon,
} from '@/components/ui/hugeicons';
import SearchBar from '@/components/landing/SearchBar';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'hero', label: 'Overview', number: '01' },
  { id: 'sandbox', label: 'Live Sandbox', number: '02' },
  { id: 'features', label: 'Engine', number: '03' },
  { id: 'download', label: 'Get Started', number: '04' },
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

export default function LandingPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeSection, setActiveSection] = useState('hero');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Track active section on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollPos / height);
      if (SECTIONS[index]) {
        setActiveSection(SECTIONS[index].id);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyCloneCommand = () => {
    navigator.clipboard.writeText('git clone https://github.com/Charannsai/openstore.git');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300 font-sans relative">
      {/* Background Ambient Glow */}
      <div className="ambient-glow" />

      {/* ─── Floating Top Navigation Pill Bar ────────────────────────────── */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between border border-zinc-200/80 dark:border-white/10 shadow-lg">
          {/* Brand Emblem */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center shadow-xs">
              OS
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold tracking-tight text-zinc-950 dark:text-white block">
                {BRAND.name}
              </span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium block -mt-0.5">
                Desktop Platform
              </span>
            </div>
          </button>

          {/* Section Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-white/5">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {sec.label}
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
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1.5 text-[11px] font-semibold"
              title="GitHub Star"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Star</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <SunIcon className="w-3.5 h-3.5 text-zinc-950" />
              ) : (
                <MoonIcon className="w-3.5 h-3.5 text-zinc-200" />
              )}
            </button>

            <button
              onClick={() => scrollToSection('download')}
              className="btn-primary px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Get App</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Floating Right-Side Screen Indicators ───────────────────────── */}
      <div className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-3">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="group flex items-center gap-2.5 cursor-pointer"
              title={sec.label}
            >
              <span
                className={`text-[10px] font-mono transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${
                  isActive ? 'text-zinc-950 dark:text-white font-bold opacity-100' : 'text-zinc-400'
                }`}
              >
                {sec.label}
              </span>
              <div
                className={`w-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'h-6 bg-zinc-950 dark:bg-white shadow-xs'
                    : 'h-2.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ─── Full-Screen Snap Scroll Container ────────────────────────────── */}
      <div ref={containerRef} className="snap-container no-scrollbar">
        {/* ════ SCREEN 1: HERO & LIVE DESKTOP SIMULATOR ═════════════════════ */}
        <section
          id="hero"
          className="snap-section flex flex-col justify-center items-center px-4 sm:px-8 pt-16 pb-6 relative overflow-hidden"
        >
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-6 space-y-4 text-left"
            >
              {/* Release Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
                <SparklesIcon className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                <span>OpenStore Agent v{BRAND.version} Released</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
                The Open-Source App Store & Local Agent.
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-lg">
                Discover, clone, auto-fix prerequisites via Winget, and run any GitHub repository or binary on your Windows PC hands-free.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={BRAND.downloads.windowsExe}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Download for Windows (x64)</span>
                </a>

                <button
                  onClick={() => scrollToSection('sandbox')}
                  className="btn-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <SearchIcon className="w-4 h-4" />
                  <span>Try Live Sandbox</span>
                </button>
              </div>

              {/* Copyable Git Command */}
              <div className="pt-2 max-w-md">
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
            </motion.div>

            {/* Right Interactive Desktop App Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-6 w-full"
            >
              <div className="rounded-2xl overflow-hidden glass-card border border-zinc-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#121215] p-3 sm:p-4 text-left relative">
                {/* Window Bar */}
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-white/10 mb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400">OpenStore Agent — Windows x64</span>
                  <div className="w-10" />
                </div>

                {/* Inner Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mini Sidebar */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 space-y-1.5">
                    <div className="text-[11px] font-semibold text-zinc-950 dark:text-white flex items-center gap-1.5 mb-2">
                      <div className="w-4 h-4 rounded bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-[8px] font-bold">OS</div>
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

                  {/* Execution Monitor */}
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

                    {/* Console Output */}
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
              </div>
            </motion.div>
          </div>

          {/* Bottom Scroll Prompt */}
          <button
            onClick={() => scrollToSection('sandbox')}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Explore Live Sandbox</span>
            <div className="w-1 h-3 rounded-full bg-zinc-400 animate-bounce" />
          </button>
        </section>

        {/* ════ SCREEN 2: INTERACTIVE LIVE SANDBOX ══════════════════════════ */}
        <section
          id="sandbox"
          className="snap-section flex flex-col justify-center items-center px-4 sm:px-8 pt-16 pb-6 relative overflow-hidden bg-zinc-50/40 dark:bg-zinc-950/30 border-t border-zinc-200 dark:border-white/5"
        >
          <div className="max-w-4xl w-full mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
              <SearchIcon className="w-3.5 h-3.5" />
              <span>Interactive Repository Sandbox</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Search Any GitHub Project or Paste a Repo Link
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-normal">
              Test repository discovery in real-time. Search keywords, explore star counts, or inspect open-source tools before installing.
            </p>

            {/* Sandbox Search Bar */}
            <div className="max-w-2xl mx-auto text-left pt-1">
              <SearchBar />
            </div>

            {/* Curated Sample Grid */}
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
          </div>

          <button
            onClick={() => scrollToSection('features')}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Engine Features</span>
            <div className="w-1 h-3 rounded-full bg-zinc-400 animate-bounce" />
          </button>
        </section>

        {/* ════ SCREEN 3: AUTONOMOUS ENGINE & FEATURES ═══════════════════════ */}
        <section
          id="features"
          className="snap-section flex flex-col justify-center items-center px-4 sm:px-8 pt-16 pb-6 relative overflow-hidden border-t border-zinc-200 dark:border-white/5"
        >
          <div className="max-w-5xl w-full mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
              <CpuIcon className="w-3.5 h-3.5" />
              <span>Platform Engine Architecture</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Built for Developers & Power Users
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-normal">
              Autonomous background workers handle repository lifecycle, dependencies, and environment setup.
            </p>

            {/* 6 Feature Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left pt-2">
              {FEATURE_LIST.map((feat) => {
                const Icon = getFeatureIcon(feat.icon);
                return (
                  <div
                    key={feat.title}
                    className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 transition-all space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-white/10">
                      <Icon className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-950 dark:text-white tracking-tight">{feat.title}</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">{feat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => scrollToSection('download')}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Get Started</span>
            <div className="w-1 h-3 rounded-full bg-zinc-400 animate-bounce" />
          </button>
        </section>

        {/* ════ SCREEN 4: DOWNLOAD HUB & PINNED FOOTER ═══════════════════════ */}
        <section
          id="download"
          className="snap-section flex flex-col justify-between items-center px-4 sm:px-8 pt-20 pb-4 relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40 border-t border-zinc-200 dark:border-white/5"
        >
          <div className="w-full max-w-3xl mx-auto my-auto text-center space-y-5">
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-white/15 shadow-2xl bg-white dark:bg-[#121215] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-base flex items-center justify-center mx-auto shadow-xs">
                OS
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Get OpenStore Desktop Agent
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto font-normal">
                Compatible with Windows 10 & 11 (x64). Free and open source under MIT License.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={BRAND.downloads.windowsExe}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary px-7 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md w-full sm:w-auto justify-center"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Download OpenStore-Setup.exe</span>
                </a>

                <a
                  href={BRAND.releasesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary px-5 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <LayersIcon className="w-4 h-4" />
                  <span>All Releases (macOS / Linux)</span>
                </a>
              </div>

              <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                <span>Requires Windows 10/11 x64</span>
                <span>•</span>
                <span>Version {BRAND.version}</span>
                <span>•</span>
                <a href={BRAND.githubUrl} target="_blank" rel="noreferrer" className="underline hover:text-zinc-900 dark:hover:text-white">
                  Source Code
                </a>
              </div>
            </div>
          </div>

          {/* Minimal Pinned Footer */}
          <footer className="w-full max-w-5xl mx-auto py-3 border-t border-zinc-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 gap-2">
            <p>© {new Date().getFullYear()} OpenStore Platform. Open-source software desktop agent.</p>
            <div className="flex items-center gap-5 font-medium">
              <button onClick={() => scrollToSection('hero')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Top
              </button>
              <button onClick={() => scrollToSection('sandbox')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Sandbox
              </button>
              <button onClick={() => scrollToSection('features')} className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
                Features
              </button>
              <a href={BRAND.githubUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                GitHub
              </a>
              <a href={BRAND.licenseUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                MIT License
              </a>
            </div>
          </footer>
        </section>
      </div>
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
