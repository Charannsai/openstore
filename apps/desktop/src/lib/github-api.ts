import type { Application, InstallStrategy } from './types';
import { searchApps as searchLocalApps } from './mock-data';

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  topics: string[];
  updated_at: string;
  created_at: string;
  homepage: string | null;
  default_branch: string;
}

const searchCache = new Map<string, Application[]>();

export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  if (!input) return null;
  const clean = input.trim().replace(/\.git$/, '');

  // Match full GitHub URLs: https://github.com/owner/repo or github.com/owner/repo
  const urlMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Match owner/repo pattern (e.g. vercel/next.js)
  const shortMatch = clean.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch && !clean.includes(' ')) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

export async function searchGitHubRepos(query: string): Promise<Application[]> {
  if (!query || query.trim().length === 0) {
    return getPopularGitHubRepos();
  }

  const cleanQuery = query.trim().toLowerCase();

  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery)!;
  }

  // 1. Direct GitHub Repository URL or owner/repo lookup
  const parsedRepo = parseGitHubUrl(query);
  if (parsedRepo) {
    try {
      const directRes = await fetch(`https://api.github.com/repos/${parsedRepo.owner}/${parsedRepo.repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (directRes.ok) {
        const item: GitHubRepoItem = await directRes.json();
        const directApp = mapGitHubRepoToApp(item);
        searchCache.set(cleanQuery, [directApp]);
        return [directApp];
      }
    } catch (err) {
      console.warn(`Direct GitHub repo fetch failed for ${parsedRepo.owner}/${parsedRepo.repo}:`, err);
    }
  }

  // 2. Cache prefix matching for regular query words
  for (const [key, cachedApps] of searchCache.entries()) {
    if (key === cleanQuery || cleanQuery.startsWith(key)) {
      const filtered = cachedApps.filter(
        (a) =>
          a.name.toLowerCase().includes(cleanQuery) ||
          a.description.toLowerCase().includes(cleanQuery) ||
          a.developer.toLowerCase().includes(cleanQuery)
      );
      if (filtered.length > 0) {
        return filtered;
      }
    }
  }

  // 3. Regular GitHub Search API query
  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      cleanQuery
    )}+is:public&sort=stars&order=desc&per_page=20`;

    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (res.ok) {
      const data = await res.json();
      const items: GitHubRepoItem[] = data.items || [];
      const apps = items.map(mapGitHubRepoToApp);

      if (apps.length > 0) {
        searchCache.set(cleanQuery, apps);
        return apps;
      }
    }
  } catch (err) {
    console.error('Network error reaching GitHub API:', err);
  }

  const localFallback = searchLocalApps(cleanQuery);
  searchCache.set(cleanQuery, localFallback);
  return localFallback;
}

export async function getPopularGitHubRepos(): Promise<Application[]> {
  const cacheKey = '__popular__';
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const url =
      'https://api.github.com/search/repositories?q=stars:>10000+is:public&sort=stars&order=desc&per_page=20';

    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (res.ok) {
      const data = await res.json();
      const items: GitHubRepoItem[] = data.items || [];
      const apps = items.map(mapGitHubRepoToApp);

      if (apps.length > 0) {
        searchCache.set(cacheKey, apps);
        return apps;
      }
    }
  } catch (err) {
    console.error('Failed to fetch popular GitHub repos:', err);
  }

  const localFallback = searchLocalApps('');
  searchCache.set(cacheKey, localFallback);
  return localFallback;
}

/**
 * Resolves the real download URL for an application:
 * 1. Checks GitHub latest release for Windows binaries (.exe / .msi / .zip).
 * 2. Falls back to project repository zip archive.
 */
export async function getGitHubReleaseAssetUrl(app: Application): Promise<string> {
  const repoUrl = app.repository_url;
  if (!repoUrl || !repoUrl.includes('github.com')) {
    return `https://github.com/obsproject/obs-studio/releases/download/31.0.1/OBS-Studio-31.0.1-Windows-x64.exe`;
  }

  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return `${repoUrl}/archive/refs/heads/main.zip`;
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (res.ok) {
      const release = await res.json();
      const assets = release.assets || [];

      interface GitHubReleaseAsset {
        name: string;
        browser_download_url: string;
      }

      // Find Windows executable or zip asset
      const exeAsset = assets.find((a: GitHubReleaseAsset) =>
        a.name.endsWith('.exe') || a.name.endsWith('.msi') || a.name.includes('win64') || a.name.includes('x64')
      );

      if (exeAsset && exeAsset.browser_download_url) {
        return exeAsset.browser_download_url;
      }

      const zipAsset = assets.find((a: GitHubReleaseAsset) => a.name.endsWith('.zip'));
      if (zipAsset && zipAsset.browser_download_url) {
        return zipAsset.browser_download_url;
      }
    }
  } catch (err) {
    console.warn(`Could not fetch GitHub releases for ${owner}/${repo}:`, err);
  }

  // Default fallback: Source code zip archive directly from repository default branch
  return `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
}

export function mapGitHubRepoToApp(item: GitHubRepoItem): Application {
  const name = item.name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  let difficulty: 'easy' | 'moderate' | 'advanced' = 'easy';
  const topicsStr = (item.topics || []).join(' ').toLowerCase();
  if (topicsStr.includes('docker') || topicsStr.includes('kubernetes') || topicsStr.includes('self-hosted')) {
    difficulty = 'moderate';
  } else if (topicsStr.includes('compiler') || topicsStr.includes('kernel') || item.language === 'C++' || item.language === 'Rust') {
    difficulty = 'advanced';
  }

  const installMethods: InstallStrategy[] = ['OFFICIAL_INSTALLER'];
  if (topicsStr.includes('docker') || topicsStr.includes('container')) {
    installMethods.unshift('CONTAINER');
  }

  return {
    id: `gh-${item.id}`,
    name,
    slug: item.full_name.replace('/', '--'),
    description: item.description || 'Open-source software repository on GitHub.',
    long_description: `${item.description || 'Open-source software repository.'}\n\nLanguage: ${item.language || 'Multiple'}\nDefault Branch: ${item.default_branch}\nForks: ${item.forks_count.toLocaleString()}`,
    icon_url: item.owner.avatar_url,
    category_id: inferCategory(item.topics, item.language, item.name),
    license: item.license?.spdx_id || item.license?.name || 'Open Source',
    repository_url: item.html_url,
    official_website: item.homepage || item.html_url,
    documentation_url: item.homepage || `${item.html_url}#readme`,
    developer: item.owner.login,
    organization: item.owner.login,
    platforms: ['windows', 'macos', 'linux'],
    architectures: ['x64', 'arm64'],
    latest_version: 'latest',
    installation_methods: installMethods,
    difficulty,
    is_featured: item.stargazers_count > 30000,
    download_count: item.forks_count * 15,
    star_count: item.stargazers_count,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

function inferCategory(topics: string[] = [], language: string | null, name: string): string {
  const all = [...topics, language || '', name].join(' ').toLowerCase();

  if (all.includes('ai') || all.includes('llm') || all.includes('gpt') || all.includes('machine-learning') || all.includes('model')) return 'ai-tools';
  if (all.includes('media') || all.includes('video') || all.includes('audio') || all.includes('stream') || all.includes('player')) return 'media';
  if (all.includes('design') || all.includes('image') || all.includes('drawing') || all.includes('graphics') || all.includes('3d')) return 'design';
  if (all.includes('editor') || all.includes('ide') || all.includes('compiler') || all.includes('cli') || all.includes('tool')) return 'development';
  if (all.includes('privacy') || all.includes('security') || all.includes('encrypt') || all.includes('vpn') || all.includes('password')) return 'privacy';
  if (all.includes('docker') || all.includes('self-hosted') || all.includes('server') || all.includes('dashboard')) return 'self-hosting';
  if (all.includes('game') || all.includes('engine') || all.includes('emulator')) return 'games';
  if (all.includes('note') || all.includes('task') || all.includes('productivity') || all.includes('office')) return 'productivity';

  return 'utilities';
}
