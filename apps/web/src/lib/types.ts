export interface GitHubRepoResult {
  id: string;
  name: string;
  developer: string;
  description: string;
  stars: number;
  forks?: number;
  language?: string;
  license?: string;
  url: string;
  icon_url?: string;
  tags?: string[];
}
