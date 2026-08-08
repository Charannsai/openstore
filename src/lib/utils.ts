import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getDifficultyInfo(difficulty: 'easy' | 'moderate' | 'advanced') {
  const map = {
    easy: { label: 'Easy', emoji: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    moderate: { label: 'Moderate', emoji: '🟡', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    advanced: { label: 'Advanced', emoji: '🔴', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  };
  return map[difficulty];
}

export function getPlatformIcon(platform: string): string {
  const map: Record<string, string> = {
    windows: '🪟',
    macos: '🍎',
    linux: '🐧',
  };
  return map[platform] || '💻';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    running: 'text-emerald-400',
    stopped: 'text-zinc-500',
    error: 'text-rose-400',
    updating: 'text-amber-400',
  };
  return map[status] || 'text-zinc-500';
}
