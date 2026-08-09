import type { GitHubRepoResult } from './types';

const CURATED_REPOSITORIES: GitHubRepoResult[] = [
  {
    id: 'excalidraw/excalidraw',
    name: 'Excalidraw',
    developer: 'excalidraw',
    description: 'Virtual whiteboard for sketching hand-drawn like diagrams with end-to-end encryption.',
    stars: 84200,
    forks: 8300,
    language: 'TypeScript',
    license: 'MIT',
    url: 'https://github.com/excalidraw/excalidraw',
    icon_url: 'https://avatars.githubusercontent.com/u/61730979?s=64&v=4',
    tags: ['design', 'whiteboard', 'diagrams'],
  },
  {
    id: 'ollama/ollama',
    name: 'Ollama',
    developer: 'ollama',
    description: 'Get up and running with Llama 3.3, Mistral, Gemma 2, and other large language models locally.',
    stars: 112000,
    forks: 9800,
    language: 'Go',
    license: 'MIT',
    url: 'https://github.com/ollama/ollama',
    icon_url: 'https://avatars.githubusercontent.com/u/132925495?s=64&v=4',
    tags: ['ai-tools', 'llm', 'local-ai'],
  },
  {
    id: 'toeverything/affine',
    name: 'AFFiNE',
    developer: 'toeverything',
    description: 'A workspace with fully merged docs, whiteboards and databases. Privacy-first open-source Notion alternative.',
    stars: 48500,
    forks: 3200,
    language: 'TypeScript',
    license: 'MPL-2.0',
    url: 'https://github.com/toeverything/AFFiNE',
    icon_url: 'https://avatars.githubusercontent.com/u/98910405?s=64&v=4',
    tags: ['productivity', 'knowledge-base', 'notion-alt'],
  },
  {
    id: 'calcom/cal.com',
    name: 'Cal.com',
    developer: 'calcom',
    description: 'Scheduling infrastructure for everyone. Open source Calendly alternative.',
    stars: 33400,
    forks: 8200,
    language: 'TypeScript',
    license: 'AGPL-3.0',
    url: 'https://github.com/calcom/cal.com',
    icon_url: 'https://avatars.githubusercontent.com/u/79145102?s=64&v=4',
    tags: ['productivity', 'calendar', 'scheduling'],
  },
  {
    id: 'hoppscotch/hoppscotch',
    name: 'Hoppscotch',
    developer: 'hoppscotch',
    description: 'Open source API development ecosystem — lightweight, fast, and beautiful Postman alternative.',
    stars: 65100,
    forks: 4400,
    language: 'TypeScript',
    license: 'MIT',
    url: 'https://github.com/hoppscotch/hoppscotch',
    icon_url: 'https://avatars.githubusercontent.com/u/56705482?s=64&v=4',
    tags: ['development', 'api', 'testing'],
  },
  {
    id: 'supabase/supabase',
    name: 'Supabase',
    developer: 'supabase',
    description: 'The open source Firebase alternative. Build with Postgres, Auth, Edge Functions, and Realtime.',
    stars: 76800,
    forks: 6100,
    language: 'TypeScript',
    license: 'Apache-2.0',
    url: 'https://github.com/supabase/supabase',
    icon_url: 'https://avatars.githubusercontent.com/u/54469796?s=64&v=4',
    tags: ['development', 'database', 'backend'],
  },
  {
    id: 'shadcn/ui',
    name: 'shadcn/ui',
    developer: 'shadcn',
    description: 'Beautifully designed components that you can copy and paste into your apps. Accessible and customizable.',
    stars: 78900,
    forks: 6500,
    language: 'TypeScript',
    license: 'MIT',
    url: 'https://github.com/shadcn-ui/ui',
    icon_url: 'https://avatars.githubusercontent.com/u/124599?s=64&v=4',
    tags: ['design', 'ui-kit', 'react'],
  },
  {
    id: 'invoke-ai/InvokeAI',
    name: 'InvokeAI',
    developer: 'invoke-ai',
    description: 'Leading creative engine for Stable Diffusion models with professional canvas and workflow tools.',
    stars: 24300,
    forks: 2400,
    language: 'Python',
    license: 'Apache-2.0',
    url: 'https://github.com/invoke-ai/InvokeAI',
    icon_url: 'https://avatars.githubusercontent.com/u/105498308?s=64&v=4',
    tags: ['ai-tools', 'image-gen', 'diffusion'],
  },
];

export async function searchLiveGitHub(query: string): Promise<GitHubRepoResult[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Match local curated items first
  const localMatches = CURATED_REPOSITORIES.filter(
    (repo) =>
      repo.name.toLowerCase().includes(cleanQuery) ||
      repo.description.toLowerCase().includes(cleanQuery) ||
      repo.tags?.some((t) => t.toLowerCase().includes(cleanQuery)) ||
      repo.developer.toLowerCase().includes(cleanQuery)
  );

  // If we have strong local matches or offline, return them quickly
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`,
      {
        signal: controller.signal,
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((item: any) => ({
          id: item.full_name,
          name: item.name,
          developer: item.owner?.login || 'Community',
          description: item.description || 'Open-source repository on GitHub',
          stars: item.stargazers_count || 0,
          forks: item.forks_count || 0,
          language: item.language || 'Unknown',
          license: item.license?.spdx_id || item.license?.name || 'Open Source',
          url: item.html_url,
          icon_url: item.owner?.avatar_url,
          tags: item.topics || [],
        }));
      }
    }
  } catch {
    // Graceful fallback to local matches
  }

  return localMatches.length > 0 ? localMatches : CURATED_REPOSITORIES.slice(0, 4);
}
