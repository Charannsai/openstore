/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';

export default function MarketingLandingPage() {
  const downloadLinks = {
    windows: 'https://github.com/Charannsai/openstore/releases/latest',
    mac: 'https://github.com/Charannsai/openstore/releases/latest',
    linux: 'https://github.com/Charannsai/openstore/releases/latest',
    github: 'https://github.com/Charannsai/openstore',
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 glow-gradient pointer-events-none" />

      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-extrabold text-sm shadow-md">
              OS
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">OpenStore</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v0.1.0 Beta
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#platforms" className="hover:text-white transition-colors">Platforms</a>
            <a href={downloadLinks.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={downloadLinks.github}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 transition-all flex items-center gap-2"
            >
              <span>GitHub</span>
            </a>
            <a
              href="#download"
              className="px-4 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-all shadow-md"
            >
              Get Desktop App
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-zinc-300"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Next-Generation Open-Source Desktop Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          Discover, clone, and run <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            open-source software hands-free.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          OpenStore eliminates the friction of cloning repositories, setting up environment files, installing dependencies, and resolving build failures on your desktop.
        </motion.p>

        {/* Download Buttons CTAs */}
        <motion.div
          id="download"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-4"
        >
          <a
            href={downloadLinks.windows}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs flex items-center gap-2.5 transition-all shadow-xl"
          >
            <span>Download for Windows (.exe / .msi)</span>
          </a>

          <a
            href={downloadLinks.mac}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-white/10 font-bold text-xs flex items-center gap-2.5 transition-all"
          >
            <span>macOS (.dmg)</span>
          </a>

          <a
            href={downloadLinks.linux}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-white/10 font-bold text-xs flex items-center gap-2.5 transition-all"
          >
            <span>Linux (.AppImage)</span>
          </a>
        </motion.div>

        {/* Terminal Protocol One-Liner */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-300">
            <span className="text-emerald-400">git clone https://github.com/Charannsai/openstore.git</span>
          </div>
        </div>
      </section>

      {/* ── Features Breakdown ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Autonomous Agent Engine</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">Everything needed to run open-source locally.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white">Hands-Free Git Setup</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated Git cloning directly into your custom workspace directory with intelligent monorepo and ecosystem entry point inspection.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
              🚀
            </div>
            <h3 className="text-base font-bold text-white">Live Port & Daemon Runner</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Launches local background web servers, detects active ports, and connects to your browser automatically with 1 click.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              🤖
            </div>
            <h3 className="text-base font-bold text-white">Groq AI Auto-Healing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Powered by Groq's high-speed LPU AI model to diagnose broken builds, missing peer dependencies, and script errors in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Architecture Section ───────────────────────────────────────────── */}
      <section id="architecture" className="py-16 px-6 max-w-5xl mx-auto border-t border-white/5 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Monorepo Architecture</h2>
          <p className="text-2xl font-extrabold text-white">Engineered for Performance & Independence</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">apps/desktop</span>
            <h4 className="text-sm font-bold text-white">Native Electron & Desktop Dashboard</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct boot into the desktop dashboard, native OS terminal streaming, background daemon execution, and local disk workspace tools.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-2">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">apps/web</span>
            <h4 className="text-sm font-bold text-white">Pure Marketing Landing & Releases</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cloud-deployable Next.js web application for documentation, releases, and direct binary downloads with zero desktop baggage.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-xs text-zinc-500 space-y-3">
        <p className="font-medium text-zinc-400">
          OpenStore is 100% Free & Open Source under the MIT License.
        </p>
        <div className="flex items-center justify-center gap-6">
          <a href={downloadLinks.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            GitHub Repository
          </a>
          <a href={downloadLinks.github + '/issues'} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            Issue Tracker
          </a>
          <a href={downloadLinks.github + '/blob/main/LICENSE'} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            MIT License
          </a>
        </div>
      </footer>
    </div>
  );
}
