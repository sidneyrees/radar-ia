import { Source } from "./types";

/**
 * Fuentes rastreadas. Cada una es un repo público de GitHub con Releases.
 * Para sumar una fuente nueva: agregá una entrada acá con owner/repo exactos
 * (verificalos en github.com/<owner>/<repo>/releases) y un color propio.
 *
 * Nota: DeepSeek no tiene un repo único con Releases persistente (sus
 * lanzamientos abiertos están repartidos en ~35 repos, uno nuevo por
 * versión mayor). Claude, ChatGPT, Gemini y Grok como modelos no publican
 * en GitHub -- Anthropic no tiene RSS oficial, y el de OpenAI es el blog
 * general de la empresa (mezcla lanzamientos con prensa/partnerships/casos
 * de cliente), no un changelog. Ver README, sección "Sumar una fuente".
 */
export const SOURCES: Source[] = [
  { id: "openclaw", label: "OpenClaw", owner: "openclaw", repo: "openclaw", color: "#FF8A65" },
  { id: "paperclip", label: "PaperClip", owner: "paperclipai", repo: "paperclip", color: "#7FD99A" },
  { id: "hermes", label: "Hermes Agent", owner: "NousResearch", repo: "hermes-agent", color: "#8FA8FF" },
  { id: "ollama", label: "Ollama", owner: "ollama", repo: "ollama", color: "#C792EA" },
  { id: "n8n", label: "n8n", owner: "n8n-io", repo: "n8n", color: "#EA4B71" },
  { id: "kimi-code", label: "Kimi Code", owner: "MoonshotAI", repo: "kimi-code", color: "#E0B33C" },
];
