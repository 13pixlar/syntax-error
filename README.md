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

The app reads these at build/dev time via Vite. Without them, the client throws on startup so misconfiguration fails fast.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (default [http://localhost:5173](http://localhost:5173)) |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Deploying

Build static assets with `npm run build`, then host the `dist/` folder on any static host (CDN, Nginx, S3, etc.). Configure the host for **SPA routing** (fallback to `index.html` for client-side routes).

Ensure production env vars are set when building if you inject `VITE_*` at CI time.

## Stack

- Vite 6, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase JS client, howler.js (npm package) for audio.

## Repository layout

This directory is intended to be the **root of its own Git repository** (no `../` path dependencies). Clone it, install, add env, and run.

`.env.local` is for secrets and is ignored by git (see `.gitignore`); only `.env.example` is tracked as a template.
