# Radar IA

PWA chica que junta los releases de tu stack de IA en un solo feed, en vez de
revisar cada changelog por separado. Instalable (Add to Home Screen), se
actualiza sola cada hora.

**Fuentes (10):**
- **GitHub Releases API**: OpenClaw, PaperClip, Hermes Agent, Ollama, n8n,
  Kimi Code, Gemini CLI.
- **RSS/Atom**: OpenAI (RSS oficial, filtrado a categoría "Product" -- es el
  blog general de la empresa, no un changelog, así que el filtro es
  heurística) y Claude Code (Atom oficial que Anthropic genera junto al
  CHANGELOG.md del repo -- ya es 100% señal, sin filtro).
- **Markdown crudo**: Claude, vía el `.md` de sus release notes oficiales en
  `platform.claude.com` (cubre lanzamientos de modelo y cambios de API/Console;
  no cubre Claude Apps ni Claude Code, que tienen sus propias release notes).

**Quedaron afuera:**
- **DeepSeek**: sus lanzamientos abiertos están repartidos en ~35 repos de
  GitHub sin un changelog único y persistente -- V4 salió en un repo nuevo,
  no como release del repo de V3.
- **Grok (xAI)**: su changelog real (`x.ai/build/changelog`) es una página
  HTML sin feed ni `.md` crudo confirmado. Armar un scraper para esa página
  implicaría adivinar su estructura real de HTML -- lo que ves si la
  visitás ya viene limpiado por herramientas de lectura, no es el markup
  real -- y ese tipo de parser se rompe apenas la rediseñan. No lo sumé por
  eso; si aparece un feed real, es el primer candidato.

Ver "Sumar una fuente" para el detalle de cada tipo.

## Stack

Next.js 16 (App Router, TypeScript), cero dependencias de UI. CSS plano con
variables. El feed en sí no usa base de datos: se resuelve server-side,
con revalidación cada 1h (ISR). Fuentes self-hosted vía `@fontsource` (sin
llamadas a Google Fonts). Notificaciones push sí usan una base de datos
(Neon) -- ver esa sección.

## Correr local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Sumar una fuente

Tres tipos, todos en `lib/sources.ts`:

- **`kind: "github"`** -- un repo público con Releases. Agregá `owner`,
  `repo` (los de `github.com/<owner>/<repo>`) y un color. Nada más.
- **`kind: "rss"`** -- un feed RSS 2.0 o Atom. Agregá `url`, un color, y
  `format: "atom"` si corresponde (default es RSS 2.0). Si el feed mezcla
  contenido que no es release (como el de OpenAI), sumá
  `categoryFilter: ["categoria1", ...]` con las categorías reales del feed
  (mirá el XML crudo para saber cuáles usa).
- **`kind: "markdown"`** -- el `.md` crudo de una página de docs. Antes de
  scrapear HTML a ciegas, probá agregar `.md` al final de la URL de la
  página -- plataformas de docs tipo Mintlify lo exponen así (confirmalo
  con `curl`, no asumas: no todas las empresas usan Mintlify, y ni todas las
  que lo usan lo tienen habilitado). Por ahora `format` solo soporta
  `"dated-bullets"` (`### <fecha>` seguido de bullets con `*`, verificado
  contra Claude) -- si sumás una fuente con otra estructura, hace falta un
  parser nuevo en `lib/fetchChangelog.ts`, no reusar este a ciegas.

Si una fuente no tiene Releases de GitHub, ni RSS/Atom, ni un `.md` crudo --
solo HTML de una página sin ninguno de esos atajos -- hace falta scrapear
HTML de verdad contra el markup real (pedirlo con `curl`/`fetch` crudo, no
con una herramienta que ya lo limpia). Es más frágil que el resto y no está
implementado.

## Rate limit de GitHub

La API de GitHub sin autenticar permite 60 requests/hora por IP. Con 7 de
las 10 fuentes usando esa API y revalidación cada hora, en uso normal esto
alcanza de sobra. Si en producción empezás a ver "no se pudo cargar"
seguido (Vercel comparte rangos de IP entre proyectos), generá un
[token personal](https://github.com/settings/tokens) sin scopes especiales
(alcanza con acceso de lectura a repos públicos) y agregalo en Vercel como
variable de entorno `GITHUB_TOKEN`. Sube el límite a 5000/hora.

## Se borran solas las noticias viejas

Cualquier item de más de 3 meses se descarta en el servidor antes de armar
el feed (`MAX_AGE_MONTHS` en `lib/fetchChangelog.ts`). No es una config de
UI a propósito -- es lo que pediste, y tocar un solo número alcanza si en
algún momento lo querés distinto.

## Notificaciones push

Aviso del sistema operativo cuando hay algo nuevo -- no hace falta tener la
app abierta ni el celular "corriendo" nada en segundo plano; el chequeo lo
hace el servidor y el aviso llega como cualquier notificación push.

Necesita 3 variables de entorno que no vienen solas. Dos te las paso yo
directo (no van commiteadas al repo público -- son secretas):

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` -- el par de claves
  que autentican el envío. No dependen de ninguna cuenta ni proveedor, es
  el protocolo Web Push en sí (estándar, gratis, lo genera cualquiera con
  la librería `web-push`).
- `CRON_SECRET` -- string random que asegura que solo el cron de Vercel
  pueda disparar el chequeo (Vercel lo manda solo como header cuando existe
  esta variable).

Lo único que tenés que crear vos (gratis, sin tarjeta):

- **Neon** (Postgres), para guardar tu suscripción y qué ya se te avisó. En
  el dashboard de Vercel: Project → Storage → Connect Store → Neon (elegí
  tu cuenta/proyecto existente, o creá uno nuevo -- plan Free alcanza de
  sobra para esto). Al conectarlo, Vercel agrega sola la variable
  `DATABASE_URL`. Las tablas (`push_subscriptions`, `seen_items`) se crean
  solas la primera vez que la app las necesita -- no hay que correr ningún
  SQL a mano.

Con las 4 variables puestas en Vercel, redeploy. Entrá a la app y tocá
"activar notificaciones" arriba a la derecha del header.

**Por qué chequea 1 vez por día:** el cron nativo de Vercel (`vercel.json`)
es gratis pero el plan Hobby lo limita a 1 corrida diaria -- más seguido
pide plan Pro ($20/mes). El horario actual (13:00 UTC = 10am Argentina) se
cambia editando `vercel.json`. Si en algún momento 1 vez por día se siente
poco, la alternativa gratis es un GitHub Action en este mismo repo
pegándole a `/api/cron/check` cada 1 hora en vez de depender del cron de
Vercel -- no está armado todavía, es la primera mejora si hace falta.

**iPhone:** Apple exige que la PWA esté agregada a la pantalla de inicio
(Compartir → Agregar a inicio) para que el push funcione -- no anda desde
una pestaña de Safari suelta. Android/Chrome no tiene esa restricción.

## Deploy

Pensado para Vercel: importá el repo en vercel.com/new, sin configuración
adicional. El `GITHUB_TOKEN` de arriba es opcional.
