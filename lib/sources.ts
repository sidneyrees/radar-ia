import { Source } from "./types";

/**
 * Fuentes rastreadas. Cada una es un repo público de GitHub con Releases.
 * Para sumar una fuente nueva: agregá una entrada acá con owner/repo exactos
 * (verificalos en github.com/<owner>/<repo>/releases) y un color propio.
 *
 * Nota: herramientas cerradas (Claude, ChatGPT, Gemini, DeepSeek, Kimi, Grok)
 * no publican releases en GitHub -- necesitan otro tipo de fuente (RSS o
 * scraping de su página de changelog). Queda como próxima iteración.
 */
export const SOURCES: Source[] = [
  { id: "openclaw", label: "OpenClaw", owner: "openclaw", repo: "openclaw", color: "#FF8A65" },
  { id: "paperclip", label: "PaperClip", owner: "paperclipai", repo: "paperclip", color: "#7FD99A" },
  { id: "hermes", label: "Hermes Agent", owner: "NousResearch", repo: "hermes-agent", color: "#8FA8FF" },
  { id: "ollama", label: "Ollama", owner: "ollama", repo: "ollama", color: "#C792EA" },
  { id: "n8n", label: "n8n", owner: "n8n-io", repo: "n8n", color: "#EA4B71" },
];
