import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/** Public path where the app is served (e.g. `/syntaxerror/`). Set via `VITE_BASE` in `.env*`. */
function normalizeBase(raw: string | undefined): string {
  const s = raw?.trim()
  if (!s || s === '/') return '/'
  let out = s.startsWith('/') ? s : `/${s}`
  if (!out.endsWith('/')) out = `${out}/`
  return out
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: normalizeBase(env.VITE_BASE),
    plugins: [react(), tailwindcss()],
    build: {
      // Avoid gzip pass on every output file (can look "stuck" on small VPS / low RAM).
      reportCompressedSize: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
