export type Source = {
  id: string;
  label: string;
  owner: string;
  repo: string;
  color: string;
};

export type ReleaseItem = {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceColor: string;
  version: string;
  title: string;
  url: string;
  publishedAt: string; // ISO date
  excerpt: string;
};

export type ChangelogResult = {
  items: ReleaseItem[];
  failedSources: string[];
  fetchedAt: string; // ISO date
};
