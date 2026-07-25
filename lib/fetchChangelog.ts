import { SOURCES } from "./sources";
import { ReleaseItem, ChangelogResult, Source, GithubSource, RssSource } from "./types";

const RELEASES_PER_SOURCE = 5;
const GITHUB_API = "https://api.github.com";

function stripMarkdown(md: string, maxLen = 220): string {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
}

function stripHtml(text: string, maxLen = 220): string {
  const clean = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > maxLen ? clean.slice(0, maxLen).trim() + "…" : clean;
}

async function fetchGithubSource(source: GithubSource): Promise<ReleaseItem[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "radar-ia-app",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `${GITHUB_API}/repos/${source.owner}/${source.repo}/releases?per_page=${RELEASES_PER_SOURCE}`,
    { headers, next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    throw new Error(`${source.id}: GitHub respondió ${res.status}`);
  }

  const data = (await res.json()) as Array<{
    id: number;
    tag_name: string;
    name: string | null;
    html_url: string;
    published_at: string | null;
    created_at: string;
    body: string | null;
    draft: boolean;
    prerelease: boolean;
  }>;

  return data
    .filter((r) => !r.draft)
    .map((r) => ({
      id: `${source.id}-${r.id}`,
      sourceId: source.id,
      sourceLabel: source.label,
      sourceColor: source.color,
      version: r.tag_name,
      title: r.name?.trim() || r.tag_name,
      url: r.html_url,
      publishedAt: r.published_at || r.created_at,
      excerpt: r.body ? stripMarkdown(r.body) : "Sin descripción publicada.",
    }));
}

type RawRssItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  categories: string[];
};

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`);
  const match = block.match(re);
  if (!match) return "";
  return (match[1] ?? match[2] ?? "").trim();
}

function extractAllTags(block: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`, "g");
  return [...block.matchAll(re)].map((m) => (m[1] ?? m[2] ?? "").trim());
}

function parseRssItems(xml: string): RawRssItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return blocks.map((block) => ({
    title: extractTag(block, "title"),
    link: extractTag(block, "link"),
    pubDate: extractTag(block, "pubDate"),
    description: extractTag(block, "description"),
    categories: extractAllTags(block, "category"),
  }));
}

async function fetchRssSource(source: RssSource): Promise<ReleaseItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "radar-ia-app" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`${source.id}: feed respondió ${res.status}`);
  }

  const xml = await res.text();
  const rawItems = parseRssItems(xml);

  const filter = source.categoryFilter?.map((c) => c.toLowerCase());
  const filtered = filter
    ? rawItems.filter((it) => it.categories.some((c) => filter.includes(c.toLowerCase())))
    : rawItems;

  return filtered.slice(0, RELEASES_PER_SOURCE).map((it) => {
    const published = it.pubDate ? new Date(it.pubDate) : new Date();
    return {
      id: `${source.id}-${it.link}`,
      sourceId: source.id,
      sourceLabel: source.label,
      sourceColor: source.color,
      version: published.toISOString().slice(0, 10),
      title: it.title || "(sin título)",
      url: it.link,
      publishedAt: published.toISOString(),
      excerpt: it.description ? stripHtml(it.description) : "Sin descripción publicada.",
    };
  });
}

function fetchOneSource(source: Source): Promise<ReleaseItem[]> {
  return source.kind === "github" ? fetchGithubSource(source) : fetchRssSource(source);
}

export async function getChangelog(): Promise<ChangelogResult> {
  const settled = await Promise.allSettled(SOURCES.map(fetchOneSource));

  const items: ReleaseItem[] = [];
  const failedSources: string[] = [];

  settled.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      failedSources.push(SOURCES[i].label);
    }
  });

  items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return { items, failedSources, fetchedAt: new Date().toISOString() };
}
