<div align="center">

# OpenStore

### Open-source software, simplified.

Discover, install, and manage open-source software with a beautiful desktop experience.<br/>
No more `git clone && npm install && npm run build` — just click install.

[![MIT License](https://img.shields.io/badge/License-MIT-22c55e.svg?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.0-6366f1.svg?style=for-the-badge)](CHANGELOG.md)
[![GitHub Stars](https://img.shields.io/github/stars/Charannsai/openstore?style=for-the-badge&color=f59e0b)](https://github.com/Charannsai/openstore/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/Charannsai/openstore?style=for-the-badge&color=ef4444)](https://github.com/Charannsai/openstore/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-22d3ee.svg?style=for-the-badge)](CONTRIBUTING.md)

[**Download**](#download) · [**Features**](#features) · [**Quick Start**](#quick-start) · [**Contributing**](#contributing) · [**Roadmap**](#roadmap)

</div>

---

## What is OpenStore?

**OpenStore** is a desktop app store for open-source software. Think of it as the App Store or Microsoft Store, but exclusively for free and open-source tools.

Most open-source software requires you to clone a repo, install dependencies, configure environment variables, and figure out the right commands to run. **OpenStore automates all of that.** You browse, click install, and it handles the rest — including AI-powered analysis of repos it hasn't seen before.

### The Problem

> You find a cool open-source tool on GitHub. The README says to run 14 commands. You need Python 3.11, Docker, and a `.env` file you don't know how to configure. You give up.

### The Solution

> OpenStore clones the repo, detects the ecosystem, installs dependencies, configures the environment, and launches the app — all in one click. If something goes wrong, AI auto-heals the installation.

---

## Features

### Smart Discovery
- Browse curated categories: AI Tools, Development, Media, Privacy, Self-hosting, and more
- Full-text search across the entire app catalog
- Featured apps and trending projects

### One-Click Installation
- **Automated ecosystem detection** — Node.js, Python, Rust, Go, Docker, and more
- **Multiple install strategies** — Git clone, pre-built releases, Docker Compose, winget
- **Prerequisites checking** — Automatically detects missing tools (Git, Node, Python, Docker)
- **Real-time progress** — Live terminal output during installation

### AI-Powered Intelligence
- **Groq AI integration** for analyzing unknown repositories
- **Smart command resolution** — figures out install, build, and start commands
- **Auto-healing** — when an install fails, AI diagnoses the issue and fixes it automatically

### App Lifecycle Management
- Launch installed apps in the right mode (browser, IDE, terminal, or standalone)
- Background service management with process tracking
- Update detection and one-click updates
- Clean uninstallation

### Beautiful Interface
- Modern, minimal design with glassmorphism effects
- Dark and light themes with system-aware switching
- Smooth animations powered by Framer Motion
- Responsive sidebar navigation

### Local-First
- All installations happen on your machine
- No accounts required for core functionality
- Your data stays on your device

---

## Download

> **Note:** OpenStore is currently in early development (v0.1.0). Pre-built binaries will be available soon.

### From Source (Recommended for now)

See the [Quick Start](#quick-start) section below.

### Pre-built Releases (Coming Soon)

| Platform | Architecture | Download |
|----------|-------------|----------|
| Windows  | x64         | _Coming soon_ |
| macOS    | Apple Silicon | _Coming soon_ |
| macOS    | Intel       | _Coming soon_ |
| Linux    | x64         | _Coming soon_ |
| Linux    | ARM64       | _Coming soon_ |

---

## Quick Start

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| [Node.js](https://nodejs.org) | 20.x+ | Yes |
| [Git](https://git-scm.com) | 2.x+ | Yes |
| [Groq](https://console.groq.com) API key | — | Optional (for AI features) |

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Charannsai/openstore.git
cd openstore

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Groq API key (optional, for AI features)

# 4. Run the development server
npm run dev          # Web only
npm run electron:dev # Desktop app (Electron + Next.js)
```

Open [http://localhost:3000](http://localhost:3000) for the web version, or the Electron window will open automatically for the desktop app.

### Build for Production

```bash
# Build Next.js
npm run build

# Build Electron app (Windows/macOS/Linux)
npm run electron:build
```

---

## Architecture

```
openstore/
├── electron/              # Electron main process
│   ├── main.js            # App entry, window management
│   ├── preload.js         # Secure IPC bridge
│   ├── ipc-handlers.js    # System operations (git, terminal, etc.)
│   └── groq-agent.js      # AI-powered repo analysis
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React UI components
│   │   ├── layout/        # Sidebar, navigation
│   │   ├── pages/         # Full page views
│   │   ├── store/         # Store-specific components
│   │   └── ui/            # Reusable UI primitives
│   ├── lib/               # Core logic
│   │   ├── installer-engine.ts   # Installation orchestrator
│   │   ├── github-api.ts         # GitHub integration
│   │   ├── types.ts              # TypeScript definitions
│   │   └── constants.ts          # App configuration
│   └── store/             # Zustand state management
└── package.json
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | Web UI with App Router |
| **Desktop** | Electron 41 | Native desktop packaging |
| **Styling** | Tailwind CSS 4 | Utility-first styling |
| **Animations** | Framer Motion | Smooth transitions |
| **State** | Zustand | Lightweight state management |
| **Data** | GitHub API + Local catalog | Live repo search + built-in seed catalog |
| **AI** | Groq (LLaMA) | Repo analysis & auto-healing |

---

## Roadmap

- [x] Core desktop app with installation engine
- [x] AI-powered repository analysis
- [x] Category-based app discovery
- [x] Dark/light theme support
- [ ] **Linux & macOS support** — cross-platform packaging
- [ ] **Auto-updates** — in-app update mechanism
- [ ] **Plugin system** — custom app sources and install strategies
- [ ] **Community submissions** — submit your own app to the catalog
- [ ] **App ratings & reviews** — community feedback
- [ ] **Offline mode** — browse and manage installed apps without internet
- [ ] **CLI companion** — `openstore install <app>` from terminal

See the [open issues](https://github.com/Charannsai/openstore/issues) for a full list of proposed features and known issues.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. **Any contributions you make are greatly appreciated.**

Please read our [**Contributing Guide**](CONTRIBUTING.md) to get started. Here's the quick version:

```bash
# Fork → Clone → Branch → Code → Push → PR
git checkout -b feature/amazing-feature
# Make your changes
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# Open a Pull Request
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed setup instructions, coding standards, and PR guidelines.

### Contributors

<a href="https://github.com/Charannsai/openstore/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Charannsai/openstore" />
</a>

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## Community & Support

- **Bug Reports** — [Open an issue](https://github.com/Charannsai/openstore/issues/new?template=bug_report.yml)
- **Feature Requests** — [Request a feature](https://github.com/Charannsai/openstore/issues/new?template=feature_request.yml)
- **Discussions** — [Join the conversation](https://github.com/Charannsai/openstore/discussions)
- **Security** — [Report a vulnerability](SECURITY.md)

---

## Star History

If you find OpenStore useful, please consider giving it a star. It helps others discover the project.

[![Star History Chart](https://api.star-history.com/svg?repos=Charannsai/openstore&type=Date)](https://star-history.com/#Charannsai/openstore&Date)

---

<div align="center">

**Built for the open-source community**

[Back to top](#openstore)

</div>
