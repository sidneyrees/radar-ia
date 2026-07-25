import { Source } from "./types";

/**
 * Fuentes rastreadas. Dos tipos:
 * - kind: "github" -- un repo público con Releases. Para sumar una,
 *   verificá owner/repo en github.com/<owner>/<repo>/releases.
 * - kind: "rss" -- un feed RSS/Atom. Sumá categoryFilter si el feed mezcla
 *   contenido que no es release (ver el caso de OpenAI abajo).
 *
 * Nota: DeepSeek no tiene un repo único con Releases persistente (sus
 * lanzamientos abiertos están repartidos en ~35 repos, uno nuevo por
 * versión mayor). Anthropic no tiene RSS oficial. Ver README, sección
 * "Sumar una fuente".
 */
export const SOURCES: Source[] = [
  { kind: "github", id: "openclaw", label: "OpenClaw", owner: "openclaw", repo: "openclaw", color: "#FF8A65" },
  { kind: "github", id: "paperclip", label: "PaperClip", owner: "paperclipai", repo: "paperclip", color: "#7FD99A" },
  { kind: "github", id: "hermes", label: "Hermes Agent", owner: "NousResearch", repo: "hermes-agent", color: "#8FA8FF" },
  { kind: "github", id: "ollama", label: "Ollama", owner: "ollama", repo: "ollama", color: "#C792EA" },
  { kind: "github", id: "n8n", label: "n8n", owner: "n8n-io", repo: "n8n", color: "#EA4B71" },
  { kind: "github", id: "kimi-code", label: "Kimi Code", owner: "MoonshotAI", repo: "kimi-code", color: "#E0B33C" },
  {
    kind: "rss",
    id: "openai",
    label: "OpenAI",
    url: "https://openai.com/news/rss.xml",
    color: "#74AA9C",
    categoryFilter: ["product"],
  },
];
