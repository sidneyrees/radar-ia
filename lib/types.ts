export type GithubSource = {
  kind: "github";
  id: string;
  label: string;
  owner: string;
  repo: string;
  color: string;
};

export type RssSource = {
  kind: "rss";
  id: string;
  label: string;
  url: string;
  color: string;
  /** Si está presente, solo entran items cuya <category> matchee alguna de estas (case-insensitive). */
  categoryFilter?: string[];
};

export type Source = GithubSource | RssSource;

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
