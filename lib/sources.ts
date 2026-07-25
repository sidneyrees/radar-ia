import { Source } from "./types";

export const SOURCES: Source[] = [
  { kind: "github", id: "openclaw", label: "OpenClaw", owner: "openclaw", repo: "openclaw", color: "#FF8A65" },
  { kind: "github", id: "paperclip", label: "PaperClip", owner: "paperclipai", repo: "paperclip", color: "#7FD99A" },
  { kind: "github", id: "hermes", label: "Hermes Agent", owner: "NousResearch", repo: "hermes-agent", color: "#8FA8FF" },
  { kind: "github", id: "ollama", label: "Ollama", owner: "ollama", repo: "ollama", color: "#C792EA" },
  { kind: "github", id: "n8n", label: "n8n", owner: "n8n-io", repo: "n8n", color: "#EA4B71" },
  { kind: "github", id: "kimi-code", label: "Kimi Code", owner: "MoonshotAI", repo: "kimi-code", color: "#E0B33C" },
  { kind: "github", id: "gemini-cli", label: "Gemini CLI", owner: "google-gemini", repo: "gemini-cli", color: "#4285F4" },
  {
    kind: "rss",
    id: "openai",
    label: "OpenAI",
    url: "https://openai.com/news/rss.xml",
    color: "#74AA9C",
    categoryFilter: ["product"],
  },
  {
    kind: "rss",
    id: "claude-code",
    label: "Claude Code",
    url: "https://raw.githubusercontent.com/anthropics/claude-code/main/feed.xml",
    color: "#D97757",
    format: "atom",
  },
  {
    kind: "markdown",
    id: "claude-platform",
    label: "Claude",
    url: "https://platform.claude.com/docs/en/release-notes/overview.md",
    pageUrl: "https://platform.claude.com/docs/en/release-notes/overview",
    color: "#CC785C",
    format: "dated-bullets",
  },
];
