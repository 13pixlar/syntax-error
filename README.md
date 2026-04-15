# Syntax Error — web app

Retro-styled SPA for browsing and streaming episodes of the [Syntax Error](https://www.syntaxerror.nu/) radio show. Data comes from **Supabase** (Postgres over PostgREST).

## Requirements

- **Node.js 18+** (see `engines` in `package.json`)

## Setup

```bash
git clone <your-repo-url> syntax-error-web
cd syntax-error-web
npm install
```

### Environment

Copy the example env file and set your Supabase values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Project API URL (e.g. `https://<project-ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Publishable (anon) key from the Supabase dashboard |
| `VITE_PUBLIC_SITE_URL` | Public origin of this deployment, **no trailing slash** (e.g. `https://your-domain.com`). Required for production builds: canonical URLs, Open Graph, `sitemap.xml`, `robots.txt`, and prerendered HTML shells. |

The app reads these at build/dev time via Vite. Without them, the client throws on startup so misconfiguration fails fast.

#### Which `.env` file is used?

Vite loads several files; **later ones override earlier ones**:

| Command | Typical files (in order) |
|---------|---------------------------|
| `npm run dev` | `.env`, `.env.local`, `.env.development`, `.env.development.local` |
| `npm run build` | `.env`, `.env.local`, `.env.production`, `.env.production.local` |

So **yes** — for production builds, variables in **`.env.production`** (and `.env.production.local`) are picked up automatically. Use **`.env.local`** for secrets you never commit (gitignored). You can put production values in `.env.production` on the server, or export vars in the shell / CI before `npm run build`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (default [http://localhost:5173](http://localhost:5173)) |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Deploying

**Serve the `dist/` folder**, not the repository root.

The source [`index.html`](index.html) contains `<script src="/src/main.tsx">` for **development only**. After `npm run build`, the output in **`dist/index.html`** references hashed JS under **`/assets/`**. If your web server’s document root is the **repo** (or anything that serves the wrong `index.html`), the browser will try to load **`/src/main.tsx`**, which fails (wrong MIME, corrupted content, blank page).

Point the site’s document root (or `alias`) at **`dist/`**, or copy **`dist/*`** to the host path. Configure the server so that:

- **Prerendered routes** resolve to real files (e.g. `/episode/42` → `dist/episode/42/index.html` when using `try_files $uri $uri/ …` or your host’s equivalent).
- **Other client routes** still fall back to a SPA shell (`index.html`) where no prerender file exists.

See [Vite static deploy](https://vite.dev/guide/static-deploy.html).

Production builds set `build.reportCompressedSize: false` in `vite.config.ts` so `npm run build` does not spend a long time gzip-sizing every asset on small hosts.

### SEO (search and link previews)

After `npm run build`, **`dist/`** includes:

- **`sitemap.xml`** — URLs for `/`, `/about`, `/favorites`, `/games`, every `/episode/:ref`, and every `/games/:encodedName` (from `../data/episodes.json`).
- **`robots.txt`** — allows crawling and references the sitemap.
- **`og-default.png`** — default Open Graph / Twitter image.
- **Prerendered `index.html` files** under `about/`, `favorites/`, `games/`, `episode/<ref>/`, and `games/<encodedName>/` with `<title>`, meta description, canonical, Open Graph, Twitter Card, and JSON-LD in the first response (in addition to **`react-helmet-async`** updating tags at runtime).

Set **`VITE_PUBLIC_SITE_URL`** for production builds (see `.env.example`). The post-build step fails if it is missing.

**Search Console and Bing (manual):** verify site ownership, then submit `https://<your-domain>/sitemap.xml`. Use [Rich Results Test](https://search.google.com/test/rich-results) on a few episode URLs after deploy.

## Stack

- Vite 6, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase JS client, howler.js (npm package) for audio.

## Repository layout

This directory is intended to be the **root of its own Git repository** (no `../` path dependencies). Clone it, install, add env, and run.

`.env.local` is for secrets and is ignored by git (see `.gitignore`); only `.env.example` is tracked as a template.
