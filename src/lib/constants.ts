// ─── Branding ────────────────────────────────────────────────────────────────
// All branding is centralized here so the product name can be changed in one place.
export const BRAND = {
  name: 'OpenStore',
  tagline: 'Open-source software, simplified.',
  description:
    'Discover, install, and manage open-source software — no terminal required.',
  searchPlaceholder: 'What are you looking for?',
  version: '0.1.0',
} as const;

// ─── Categories ──────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'ai-tools', name: 'AI Tools', icon: 'brain', color: '#a78bfa' },
  { id: 'productivity', name: 'Productivity', icon: 'briefcase', color: '#60a5fa' },
  { id: 'development', name: 'Development', icon: 'code', color: '#34d399' },
  { id: 'media', name: 'Media', icon: 'film', color: '#f472b6' },
  { id: 'design', name: 'Design', icon: 'palette', color: '#fb923c' },
  { id: 'education', name: 'Education', icon: 'graduation-cap', color: '#facc15' },
  { id: 'privacy', name: 'Privacy', icon: 'shield', color: '#2dd4bf' },
  { id: 'self-hosting', name: 'Self-hosting', icon: 'server', color: '#818cf8' },
  { id: 'utilities', name: 'Utilities', icon: 'wrench', color: '#94a3b8' },
  { id: 'games', name: 'Games', icon: 'gamepad-2', color: '#e879f9' },
  { id: 'server', name: 'Server Software', icon: 'database', color: '#f87171' },
] as const;

// ─── Installation Strategies ─────────────────────────────────────────────────
export const INSTALL_STRATEGIES = [
  'NATIVE_PACKAGE',
  'OFFICIAL_INSTALLER',
  'PACKAGE_MANAGER',
  'CONTAINER',
  'PREBUILT_RELEASE',
  'SOURCE_BUILD',
  'DOCUMENTATION_GUIDED',
  'MANUAL_GUIDED',
] as const;

// ─── Task States ─────────────────────────────────────────────────────────────
export const TASK_STATES = [
  'LOCKED',
  'READY',
  'RUNNING',
  'WAITING_FOR_USER',
  'VERIFYING',
  'COMPLETED',
  'FAILED',
  'SKIPPED',
  'CANCELLED',
] as const;

// ─── Task Types ──────────────────────────────────────────────────────────────
export const TASK_TYPES = [
  'CHECK',
  'DOWNLOAD',
  'INSTALL',
  'COMMAND',
  'FILE_OPERATION',
  'CONFIGURATION',
  'USER_ACTION',
  'WAIT',
  'VERIFY',
  'LAUNCH',
  'SERVICE',
  'CONTAINER',
  'BROWSER',
] as const;

// ─── Difficulty Levels ───────────────────────────────────────────────────────
export const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', color: '#22c55e', emoji: '🟢' },
  moderate: { label: 'Moderate', color: '#eab308', emoji: '🟡' },
  advanced: { label: 'Advanced', color: '#ef4444', emoji: '🔴' },
} as const;

// ─── Platforms ───────────────────────────────────────────────────────────────
export const PLATFORMS = ['windows', 'macos', 'linux'] as const;
export const ARCHITECTURES = ['x64', 'arm64'] as const;

// ─── Supabase ────────────────────────────────────────────────────────────────
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
