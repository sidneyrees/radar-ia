"use client";

import { useEffect, useMemo, useState } from "react";
import { ReleaseItem, Source } from "@/lib/types";
import { relativeDate } from "@/lib/formatDate";

const READ_KEY = "radar-ia:read";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage puede fallar (modo privado, cuota llena) -- no rompe la app,
    // solo no persiste entre visitas.
  }
}

export default function FeedClient({
  items,
  sources,
}: {
  items: ReleaseItem[];
  sources: Source[];
}) {
  const [active, setActive] = useState<string | "all">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  function markRead(ids: string[]) {
    setReadIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      saveReadIds(next);
      return next;
    });
  }

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.sourceId, (map.get(item.sourceId) || 0) + 1);
    return map;
  }, [items]);

  const filtered = active === "all" ? items : items.filter((i) => i.sourceId === active);
  const unreadInView = filtered.filter((i) => !readIds.has(i.id));

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

      {filtered.length > 0 && (
        <div className="readBar">
          <span>{unreadInView.length} sin leer</span>
          {unreadInView.length > 0 && (
            <button
              className="readAllBtn"
              onClick={() => markRead(filtered.map((i) => i.id))}
            >
              marcar todo como leído
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="empty">nada por acá todavía.</p>
      ) : (
        <div className="feed">
          {filtered.map((item) => {
            const isRead = readIds.has(item.id);
            return (
              <a
                key={item.id}
                className={`card${isRead ? " isRead" : ""}`}
                style={{ ["--card-color" as string]: item.sourceColor }}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => markRead([item.id])}
              >
                <div className="cardTop">
                  <span className="sourceTag">{item.sourceLabel}</span>
                  <span className="versionTag">{item.version}</span>
                  <span className="cardDate">{relativeDate(item.publishedAt)}</span>
                </div>
                <div className="cardTitle">{item.title}</div>
                <p className="cardExcerpt">{item.excerpt}</p>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
