# Radar IA

PWA chica que junta los releases de tu stack de IA en un solo feed, en vez de
revisar cada changelog por separado. Instalable (Add to Home Screen), se
actualiza sola cada hora.

**Fuentes**: OpenClaw, PaperClip, Hermes Agent, Ollama, n8n y Kimi Code vía
GitHub Releases API. OpenAI vía su RSS oficial (`openai.com/news/rss.xml`),
filtrado a posts categoría "Product" -- ese feed es el blog general de la
empresa, no un changelog, así que el filtro es una heurística: puede
perderse algún lanzamiento mal categorizado, o colar algún post de producto
que no sea un release real. Ajustar `categoryFilter` en `lib/sources.ts` si
en la práctica filtra mal.

Quedaron afuera: DeepSeek (sus lanzamientos abiertos están repartidos en ~35
repos sin un changelog único y persistente -- V4 salió en un repo nuevo, no
como release del repo de V3) y Claude/Gemini/Grok como modelos (no publican
releases en GitHub ni tienen RSS oficial). Ver "Sumar una fuente".

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

Dos tipos, ambos en `lib/sources.ts`:

- **`kind: "github"`** -- un repo público con Releases. Agregá `owner`,
  `repo` (los de `github.com/<owner>/<repo>`) y un color. Nada más.
- **`kind: "rss"`** -- un feed RSS/Atom. Agregá `url` y un color; si el feed
  mezcla contenido que no es release (como el de OpenAI), sumá
  `categoryFilter: ["categoria1", "categoria2"]` con las categorías reales
  del feed (mirá el XML crudo para saber cuáles usa).

Si una fuente no tiene ni Releases de GitHub ni RSS (scraping de una página
de changelog HTML), hace falta un tercer tipo de fetcher -- no está
implementado todavía. `lib/fetchChangelog.ts` es el lugar.

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
