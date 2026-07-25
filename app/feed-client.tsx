"use client";

import { useMemo, useState } from "react";
import { ReleaseItem, Source } from "@/lib/types";
import { relativeDate } from "@/lib/formatDate";

export default function FeedClient({
  items,
  sources,
}: {
  items: ReleaseItem[];
  sources: Source[];
}) {
  const [active, setActive] = useState<string | "all">("all");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.sourceId, (map.get(item.sourceId) || 0) + 1);
    return map;
  }, [items]);

  const filtered = active === "all" ? items : items.filter((i) => i.sourceId === active);

  return (
    <>
      <div className="chipRow" role="tablist" aria-label="Filtrar por herramienta">
        <button
          className={`chip ${active === "all" ? "chipActive" : ""}`}
          onClick={() => setActive("all")}
          role="tab"
          aria-selected={active === "all"}
        >
          todos · {items.length}
        </button>
        {sources.map((s) => (
          <button
            key={s.id}
            className={`chip ${active === s.id ? "chipActive" : ""}`}
            onClick={() => setActive(s.id)}
            role="tab"
            aria-selected={active === s.id}
            style={active === s.id ? { borderColor: s.color, color: s.color, background: `${s.color}22` } : undefined}
          >
            {s.label} · {counts.get(s.id) || 0}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">nada por acá todavía.</p>
      ) : (
        <div className="feed">
          {filtered.map((item) => (
            <a
              key={item.id}
              className="card"
              style={{ ["--card-color" as string]: item.sourceColor }}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="cardTop">
                <span className="sourceTag">{item.sourceLabel}</span>
                <span className="versionTag">{item.version}</span>
                <span className="cardDate">{relativeDate(item.publishedAt)}</span>
              </div>
              <div className="cardTitle">{item.title}</div>
              <p className="cardExcerpt">{item.excerpt}</p>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
