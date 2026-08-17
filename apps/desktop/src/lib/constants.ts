// ─── Branding ────────────────────────────────────────────────────────────────
// Centralized branding configuration
export const BRAND = {
  name: 'OpenStore',
  tagline: 'Open-source software, simplified.',
  description:
    'Discover, install, and manage open-source software — clean, fast, and minimal.',
  searchPlaceholder: 'Search open-source software, repositories, or tools...',
  version: '0.2.3',
} as const;

// ─── Categories ──────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'ai-tools', name: 'AI Tools', icon: 'Cpu' },
  { id: 'productivity', name: 'Productivity', icon: 'CheckSquare' },
  { id: 'development', name: 'Development', icon: 'Code' },
  { id: 'media', name: 'Media', icon: 'Film' },
  { id: 'design', name: 'Design', icon: 'Layout' },
  { id: 'privacy', name: 'Privacy', icon: 'ShieldCheck' },
  { id: 'self-hosting', name: 'Self-hosting', icon: 'Server' },
  { id: 'utilities', name: 'Utilities', icon: 'Terminal' },
  { id: 'games', name: 'Games', icon: 'Gamepad2' },
] as const;

// ─── Difficulty Levels (Monochrome) ─────────────────────────────────────────
export const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy' },
  moderate: { label: 'Moderate' },
  advanced: { label: 'Advanced' },
} as const;

// ─── Platforms & Strategies ──────────────────────────────────────────────────
export const PLATFORMS = ['windows', 'macos', 'linux'] as const;
export const ARCHITECTURES = ['x64', 'arm64'] as const;

export const INSTALL_STRATEGIES = [
  'OFFICIAL_INSTALLER',
  'PREBUILT_RELEASE',
  'SOURCE_BUILD',
  'CONTAINER',
  'git-clone',
  'release-download',
  'docker-compose',
  'script',
  'command',
] as const;

export const TASK_STATES = [
  'pending',
  'running',
  'completed',
  'failed',
  'paused',
  'cancelled',
  'LOCKED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
] as const;

export const TASK_TYPES = [
  'git-clone',
  'download',
  'exec',
  'service',
  'extract',
  'verify',
  'CHECK',
  'DOWNLOAD',
  'VERIFY',
  'LAUNCH',
] as const;

