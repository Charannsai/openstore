# Contributing to OpenStore

First off, thank you for considering contributing to OpenStore! 🎉

OpenStore is an open-source app store for open-source software, and it's built by people like you. Whether you're fixing a bug, adding a feature, improving documentation, or just giving feedback — every contribution matters.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by the [OpenStore Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or later — [Download](https://nodejs.org)
- **npm** 10.x or later (comes with Node.js)
- **Git** — [Download](https://git-scm.com)

Optional (for full feature testing):
- **Python** 3.8+ — for testing Python ecosystem detection
- **Docker** — for testing container-based installations
- A **Groq API key** — [Get one free](https://console.groq.com)

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on the [OpenStore GitHub page](https://github.com/Charannsai/openstore).

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/openstore.git
   cd openstore
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your values:
   ```
   GROQ_API_KEY=your_groq_api_key
   ```

5. **Run the development server**

   For web-only development:
   ```bash
   npm run dev
   ```

   For Electron desktop app development:
   ```bash
   npm run electron:dev
   ```

6. **Open in your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
openstore/
├── .github/             # GitHub config (issue templates, CI/CD)
├── electron/            # Electron main process
│   ├── main.js          # Electron entry point
│   ├── preload.js       # Preload script (IPC bridge)
│   ├── ipc-handlers.js  # IPC handler implementations
│   └── groq-agent.js    # Groq AI integration
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Main entry point
│   │   └── globals.css  # Global styles
│   ├── components/      # React components
│   │   ├── layout/      # Layout components (Sidebar, etc.)
│   │   ├── pages/       # Page components
│   │   ├── store/       # Store-specific components
│   │   └── ui/          # Reusable UI components
│   ├── lib/             # Utilities and core logic
│   │   ├── constants.ts # App constants and branding
│   │   ├── types.ts     # TypeScript type definitions
│   │   ├── github-api.ts    # GitHub API integration
│   │   ├── installer-engine.ts  # Installation orchestrator
│   │   └── utils.ts     # Utility functions
│   └── store/           # Zustand state management
└── package.json
```

### Key Architecture Decisions

- **Next.js App Router** — For the web UI and SSR capabilities
- **Electron** — For desktop app packaging with system-level access
- **GitHub API** — Live repository search and discovery
- **Groq AI** — Intelligent repository analysis and auto-healing
- **Zustand** — Lightweight, minimal state management
- **Framer Motion** — Smooth, performant animations

## Making Changes

### Branch Naming Convention

Create a branch from `main` with a descriptive name:

```
feature/add-linux-support
fix/install-path-spaces
docs/update-contributing
refactor/simplify-ipc-handlers
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Docker Compose installation support
fix: handle spaces in installation path
docs: update README with build instructions
refactor: simplify IPC handler registration
style: format CSS with consistent spacing
test: add unit tests for installer engine
chore: update dependencies
```

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure linting passes: `npm run lint`
4. Ensure the build succeeds: `npm run build`
5. Commit your changes with a descriptive message
6. Push to your fork and create a Pull Request

## Pull Request Process

1. **Fill out the PR template** completely
2. **Link related issues** using keywords (`Closes #123`, `Fixes #456`)
3. **Add screenshots** for any UI changes
4. **Keep PRs focused** — one feature or fix per PR
5. **Ensure CI passes** — the PR must pass all automated checks
6. **Request review** from a maintainer
7. **Address feedback** promptly

### PR Review Checklist

- [ ] Code follows the project's coding standards
- [ ] No unnecessary console.log statements
- [ ] TypeScript types are properly defined (no `any`)
- [ ] New features include appropriate documentation
- [ ] UI changes are responsive and accessible
- [ ] No security vulnerabilities introduced

## Coding Standards

### TypeScript

- Use strict TypeScript — avoid `any` types
- Define interfaces for all data structures in `src/lib/types.ts`
- Use `const` assertions for literal types
- Prefer named exports over default exports (except for page components)

### React Components

- Use functional components with hooks
- Co-locate component styles when possible
- Keep components small and focused
- Use Zustand for shared state, local state for component-specific state

### CSS / Styling

- Use Tailwind CSS utility classes
- Use CSS custom properties (variables) for theming
- Ensure dark/light mode compatibility
- Follow mobile-first responsive design

### Electron / IPC

- All system operations go through IPC handlers in `electron/ipc-handlers.js`
- Never expose Node.js APIs directly to the renderer
- Validate all IPC inputs before processing
- Use the preload script (`electron/preload.js`) as the bridge

## Reporting Bugs

Found a bug? Please [open an issue](https://github.com/Charannsai/openstore/issues/new?template=bug_report.yml) with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Node.js version, etc.)
- Screenshots or recordings if applicable

## Suggesting Features

Have an idea? Please [open a feature request](https://github.com/Charannsai/openstore/issues/new?template=feature_request.yml) with:

- A clear description of the problem you're solving
- Your proposed solution
- Alternative approaches you've considered
- Any relevant mockups or examples

## Good First Issues

New to the project? Look for issues labeled [`good first issue`](https://github.com/Charannsai/openstore/labels/good%20first%20issue). These are specifically chosen to be approachable for newcomers.

## Community

- 💬 **Discussions**: [GitHub Discussions](https://github.com/Charannsai/openstore/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Charannsai/openstore/issues)
- 📧 **Email**: openstore@proton.me

---

Thank you for helping make OpenStore better! Every contribution, no matter how small, is valued. 💛
