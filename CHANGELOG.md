# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Linux and macOS support
- Plugin system for custom app sources
- Auto-update mechanism
- Community app submissions

## [0.1.0] - 2024-08-08

### Added
- **Desktop Application** — Electron-based cross-platform desktop app
- **App Store Interface** — Browse, search, and discover open-source software
- **Smart Installation Engine** — Automated installation with ecosystem detection
  - Git clone and build from source
  - Pre-built release downloads
  - Docker Compose support
  - Winget package manager integration
- **AI-Powered Repo Analysis** — Groq AI integration for intelligent repository analysis
  - Automatic ecosystem detection (Node.js, Python, Rust, Go, etc.)
  - Smart command resolution (install, build, start)
  - Auto-healing for failed installations
- **App Lifecycle Management** — Launch, stop, and manage installed applications
  - Background service management
  - Process tracking
  - Multiple run modes (browser, IDE, terminal, executable)
- **Category System** — Organized browsing by category (AI Tools, Development, Media, etc.)
- **Landing Page** — Web-facing landing page for project discovery
- **Dark/Light Theme** — System-aware theme with manual override
- **Supabase Backend** — Database schema for apps, categories, releases, and workflows
- **Real-time Progress** — Live terminal output and download progress tracking
- **Prerequisite Checking** — Automatic detection of Git, Node.js, Python, Docker, etc.

### Technical Stack
- Next.js 16 with App Router
- Electron 41 for desktop packaging
- Supabase for backend database
- Groq AI for intelligent analysis
- Framer Motion for animations
- Zustand for state management
- Tailwind CSS 4 for styling

[Unreleased]: https://github.com/Charannsai/openstore/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Charannsai/openstore/releases/tag/v0.1.0
