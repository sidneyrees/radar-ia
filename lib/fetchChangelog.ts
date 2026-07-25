import { SOURCES } from "./sources";
import { ReleaseItem, ChangelogResult } from "./types";

const RELEASES_PER_SOURCE = 5;
const GITHUB_API = "https://api.github.com";

/** Quita sintaxis markdown básica para dejar un excerpt de texto plano. */
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

async function fetchSource(source: (typeof SOURCES)[number]): Promise<ReleaseItem[]> {
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

/**
 * Trae los releases de todas las fuentes en paralelo. Una fuente que falla
 * (rate limit, repo renombrado, red caída) nunca tira abajo a las demás:
 * queda listada en `failedSources` y el resto se muestra igual.
 */
export async function getChangelog(): Promise<ChangelogResult> {
  const settled = await Promise.allSettled(SOURCES.map(fetchSource));

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
