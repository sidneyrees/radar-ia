import { getChangelog } from "@/lib/fetchChangelog";
import { SOURCES } from "@/lib/sources";
import FeedClient from "./feed-client";
import { relativeDate } from "@/lib/formatDate";

export const revalidate = 3600;

export default async function Home() {
  const { items, failedSources, fetchedAt } = await getChangelog();

  const last30d = items.filter(
    (i) => Date.now() - new Date(i.publishedAt).getTime() < 30 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <main className="shell">
      <div className="header">
        <span className="blip" aria-hidden="true" />
        <span className="wordmark">Radar IA</span>
      </div>
      <p className="tagline">
        Lanzamientos de tu stack de IA en un solo feed — sin ir herramienta por herramienta.
      </p>

      <div className="statusline">
        <strong>{last30d}</strong> lanzamiento{last30d === 1 ? "" : "s"} en los últimos 30 días ·{" "}
        {SOURCES.length} fuentes · act. {relativeDate(fetchedAt)}
      </div>

      {failedSources.length > 0 && (
        <div className="notice">
          no se pudo cargar: {failedSources.join(", ")}. puede ser rate limit de GitHub —
          se reintenta solo en la próxima actualización.
        </div>
      )}

      <FeedClient items={items} sources={SOURCES} />

      <div className="footer">
        Fuentes rastreadas: {SOURCES.map((s) => s.label).join(" · ")}. Se actualiza cada hora.
        <br />
        Para sumar una fuente, editá <code>lib/sources.ts</code> en el repo.
      </div>
    </main>
  );
}
