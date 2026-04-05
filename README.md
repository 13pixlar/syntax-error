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
| `VITE_BASE` | Optional. Public path where the app is served, e.g. `/syntaxerror/` or `/` (default). Must match your deploy URL; used for asset URLs and the router `basename`. |

The app reads these at build/dev time via Vite. Without Supabase vars, the client throws on startup so misconfiguration fails fast.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (default [http://localhost:5173](http://localhost:5173)) |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Deploying

Build static assets with `npm run build`, then host the **`dist/`** folder — not the repo root. If the server serves the wrong `index.html` (the one with `/src/main.tsx`), the browser will request TS sources from the site root and you will see MIME / blank page errors.

Set `VITE_BASE` in `.env.local` (or `.env.production` on the build host) to match your public URL path, e.g. `VITE_BASE=/syntaxerror/`. Omit it for a root deploy (`/`). `import.meta.env.BASE_URL` and React Router follow this automatically.

Configure the web server so the **built** `dist/` tree is what gets served at that path (not the repository root), and add an SPA fallback so unknown paths return `index.html`. See [Vite’s static deploy guide](https://vite.dev/guide/static-deploy.html).

For local dev with a non-root `VITE_BASE`, open e.g. `http://localhost:5173/syntaxerror/` (path must match `VITE_BASE`).

Ensure production env vars are set when building if you inject `VITE_*` at CI time.

Production builds set `build.reportCompressedSize: false` in `vite.config.ts` so `npm run build` does not spend a long time (or appear stuck) gzip-sizing every asset on small VPS hosts.

## Stack

- Vite 6, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase JS client, howler.js (npm package) for audio.

## Repository layout

This directory is intended to be the **root of its own Git repository** (no `../` path dependencies). Clone it, install, add env, and run.

`.env.local` is for secrets and is ignored by git (see `.gitignore`); only `.env.example` is tracked as a template.
