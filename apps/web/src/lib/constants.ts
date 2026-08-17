// ─── Branding & Platform Configuration ──────────────────────────────────────
export const BRAND = {
  name: 'OpenStore',
  tagline: 'The Open-Source App Store & Execution Agent.',
  description:
    'Discover, install, auto-fix prerequisites via Winget, and run any GitHub repository or binary on your PC hands-free.',
  searchPlaceholder: 'Search repositories (e.g. excalidraw, ollama, affine) or paste GitHub URL...',
  version: '0.2.2',
  githubUrl: 'https://github.com/Charannsai/openstore',
  releasesUrl: 'https://github.com/Charannsai/openstore/releases',
  latestReleaseUrl: 'https://github.com/Charannsai/openstore/releases/latest',
  issuesUrl: 'https://github.com/Charannsai/openstore/issues',
  licenseUrl: 'https://github.com/Charannsai/openstore/blob/main/LICENSE',
  downloads: {
    windowsExe: 'https://github.com/Charannsai/openstore/releases/latest/download/OpenStore-Setup.exe',
    windowsPortable: 'https://github.com/Charannsai/openstore/releases/latest/download/OpenStore.exe',
    macDmg: 'https://github.com/Charannsai/openstore/releases/latest',
    linuxAppImage: 'https://github.com/Charannsai/openstore/releases/latest',
  },
} as const;

export const FEATURE_LIST = [
  {
    icon: 'Package',
    title: 'Native Winget CLI Engine',
    description: 'Executes native winget install --id package --silent to install official Windows software directly via CLI.',
  },
  {
    icon: 'ShieldCheck',
    title: '1-Click Prerequisite Auto-Fixer',
    description: 'Detects missing Git, Node.js, Python, or Docker dependencies and fixes them in 1 click using Winget.',
  },
  {
    icon: 'Globe',
    title: 'Automated Web Server Runner',
    description: 'Detects web ports (e.g. 3000), monitors TCP sockets, and opens your local web app in the browser automatically.',
  },
  {
    icon: 'Code2',
    title: 'IDE & Terminal Launcher',
    description: 'Opens cloned workspaces directly in VS Code, Cursor, or Command Prompt with 1 click.',
  },
  {
    icon: 'Terminal',
    title: 'Real-Time Terminal Drawer',
    description: 'Streams stdout and stderr logs into an inline terminal drawer so you can inspect execution details.',
  },
  {
    icon: 'Cpu',
    title: 'AI Auto-Healing & Diagnostics',
    description: 'Powered by high-speed Groq AI model to diagnose broken builds, missing dependencies, and script errors instantly.',
  },
] as const;
