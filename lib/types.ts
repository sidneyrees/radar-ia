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
  format?: "rss" | "atom";
  categoryFilter?: string[];
};

export type MarkdownSource = {
  kind: "markdown";
  id: string;
  label: string;
  url: string;
  color: string;
  pageUrl: string;
  format: "dated-bullets";
};

export type Source = GithubSource | RssSource | MarkdownSource;

export type ReleaseItem = {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceColor: string;
  version: string;
  title: string;
  url: string;
  publishedAt: string;
  excerpt: string;
};

export type ChangelogResult = {
  items: ReleaseItem[];
  failedSources: string[];
  fetchedAt: string;
};
