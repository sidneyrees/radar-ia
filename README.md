# Radar IA

PWA chica que junta los releases de tu stack de IA en un solo feed, en vez de
revisar cada changelog por separado. Instalable (Add to Home Screen), se
actualiza sola cada hora.

**Fuentes** (todas vía GitHub Releases API): OpenClaw, PaperClip, Hermes
Agent, Ollama, n8n, Kimi Code.

Se evaluaron y quedaron afuera por ahora: DeepSeek (sus lanzamientos abiertos
están repartidos en ~35 repos sin un changelog único y persistente — V4 salió
en un repo nuevo, no como release del repo de V3) y Claude/ChatGPT/Gemini/Grok
como modelos (Anthropic no tiene RSS oficial; el RSS de OpenAI existe pero es
el blog general de la empresa, no un changelog — mezcla lanzamientos con
notas de prensa, partnerships y casos de cliente). Ver "Sumar una fuente".

## Stack

Next.js 16 (App Router, TypeScript), cero dependencias de UI. CSS plano con
variables. Sin base de datos: todo se resuelve server-side contra la API
pública de GitHub, con revalidación cada 1h (ISR). Fuentes self-hosted vía
`@fontsource` (sin llamadas a Google Fonts).

## Correr local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Sumar una fuente

Si el proyecto está en GitHub, editá `lib/sources.ts` y agregá una entrada
con `owner`, `repo` (los de la URL `github.com/<owner>/<repo>`) y un color.
Nada más — se suma sola al feed y al filtro.

Para fuentes que **no** son un repo de GitHub (Claude, ChatGPT, Gemini,
DeepSeek, Kimi, Grok, etc.) hace falta un fetcher distinto por proveedor
(RSS si publican uno, o parseo de su página de changelog). `lib/fetchChangelog.ts`
es el lugar para sumar ese segundo tipo de fuente cuando se quiera encarar.

## Rate limit de GitHub

La API de GitHub sin autenticar permite 60 requests/hora por IP. Con 6
fuentes y revalidación cada hora, en uso normal esto alcanza de sobra. Si en
producción empezás a ver "no se pudo cargar" seguido (Vercel comparte rangos
de IP entre proyectos), generá un
[token personal](https://github.com/settings/tokens) sin scopes especiales
(alcanza con acceso de lectura a repos públicos) y agregalo en Vercel como
variable de entorno `GITHUB_TOKEN`. Sube el límite a 5000/hora.

## Deploy

Pensado para Vercel: importá el repo en vercel.com/new, sin configuración
adicional. El `GITHUB_TOKEN` de arriba es opcional.
