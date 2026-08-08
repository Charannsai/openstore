import type { Application, InstallStrategy } from './types';

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

// In-memory search cache to prevent hitting GitHub rate limits
const searchCache = new Map<string, Application[]>();

export async function searchGitHubRepos(query: string): Promise<Application[]> {
  if (!query || query.trim().length === 0) {
    return getPopularGitHubRepos();
  }

  const cleanQuery = query.trim().toLowerCase();
  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery)!;
  }

  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      cleanQuery
    )}+is:public&sort=stars&order=desc&per_page=16`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`GitHub API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const items: GitHubRepoItem[] = data.items || [];
    const apps = items.map(mapGitHubRepoToApp);

    searchCache.set(cleanQuery, apps);
    return apps;
  } catch (err) {
    console.error('Failed to search GitHub repos:', err);
    return [];
  }
}

export async function getPopularGitHubRepos(): Promise<Application[]> {
  const cacheKey = '__popular__';
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const url =
      'https://api.github.com/search/repositories?q=stars:>10000+is:public&sort=stars&order=desc&per_page=16';

    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const items: GitHubRepoItem[] = data.items || [];
    const apps = items.map(mapGitHubRepoToApp);

    searchCache.set(cacheKey, apps);
    return apps;
  } catch (err) {
    console.error('Failed to fetch popular GitHub repos:', err);
    return [];
  }
}

export function mapGitHubRepoToApp(item: GitHubRepoItem): Application {
  const name = item.name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // Determine difficulty based on language & topics
  let difficulty: 'easy' | 'moderate' | 'advanced' = 'easy';
  const topicsStr = (item.topics || []).join(' ').toLowerCase();
  if (topicsStr.includes('docker') || topicsStr.includes('kubernetes') || topicsStr.includes('self-hosted')) {
    difficulty = 'moderate';
  } else if (topicsStr.includes('compiler') || topicsStr.includes('kernel') || item.language === 'C++' || item.language === 'Rust') {
    difficulty = 'advanced';
  }

  // Determine installation strategy
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
