/**
 * Post-build: OG image, sitemap.xml, robots.txt, and prerendered index.html shells
 * with title/meta/JSON-LD in the first HTML response (run after `vite build`).
 *
 * Requires VITE_PUBLIC_SITE_URL (e.g. https://example.com) in env — see .env.example.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import type { Episode } from '../src/lib/api/episodes'
import { episodeSeoDescription, episodeSeoTitle } from '../src/lib/seo/episodeMeta'
import { uniqueFeaturedGameNamesSorted } from '../src/lib/seo/gamesFromEpisodes'
import {
  breadcrumbJsonLd,
  podcastEpisodeJsonLd,
  webSiteJsonLd,
} from '../src/lib/seo/jsonLd'
import { setPublicSiteUrlOverride } from '../src/lib/seo/siteUrl'
import { SEO, gamePageCopy } from '../src/lib/seo/staticCopy'

const __dirname = dirname(fileURLToPath(import.meta.url))
const webRoot = join(__dirname, '..')
const repoRoot = join(webRoot, '..')
const distDir = join(webRoot, 'dist')

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

function siteBase(): string {
  const u =
    process.env.VITE_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') ?? ''
  return u
}

type HeadMeta = {
  title: string
  description: string
  canonicalPath: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  noIndex?: boolean
}

function buildMetaBlock(base: string, m: HeadMeta): string {
  const canonical = `${base}${m.canonicalPath.startsWith('/') ? m.canonicalPath : `/${m.canonicalPath}`}`
  const ogImage = `${base}/og-default.png`
  const robots = m.noIndex
    ? '    <meta name="robots" content="noindex, nofollow" />\n'
    : ''
  const jsonBlocks = m.jsonLd
    ? (Array.isArray(m.jsonLd) ? m.jsonLd : [m.jsonLd])
        .map(
          (obj) =>
            `    <script type="application/ld+json">${safeJsonLd(obj)}</script>`,
        )
        .join('\n')
    : ''
  return `
    <meta name="description" content="${escapeHtml(m.description)}" />
${robots}    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(m.title)}" />
    <meta property="og:description" content="${escapeHtml(m.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(m.title)}" />
    <meta name="twitter:description" content="${escapeHtml(m.description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
${jsonBlocks ? `${jsonBlocks}\n` : ''}`.trimEnd()
}

function injectHead(html: string, base: string, meta: HeadMeta): string {
  const title = escapeHtml(meta.title)
  const titled = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  const block = buildMetaBlock(base, meta)
  return titled.replace(
    /(<\/title>)/,
    `$1\n    ${block.replace(/\n/g, '\n    ')}`,
  )
}

function writeHtmlDir(subPath: string, html: string) {
  const dir = join(distDir, subPath)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html, 'utf8')
}

async function writeOgImagePng() {
  const w = 1200
  const h = 630
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#052e16"/>
      <stop offset="100%" style="stop-color:#0a1628"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="42%" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="56" font-weight="bold">Syntax Error</text>
  <text x="50%" y="58%" text-anchor="middle" fill="#86efac" font-family="monospace" font-size="28">8-bit &amp; 16-bit SID · episode archive</text>
</svg>`
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  writeFileSync(join(distDir, 'og-default.png'), buf)
}

function episodeFromJson(row: unknown): Episode {
  return row as Episode
}

function loadEpisodesJson(): Episode[] {
  const raw = readFileSync(join(repoRoot, 'data', 'episodes.json'), 'utf8')
  const data = JSON.parse(raw) as unknown[]
  return data.map(episodeFromJson)
}

function sitemapUrl(loc: string, base: string): string {
  const path = loc.startsWith('/') ? loc : `/${loc}`
  return `${base}${path}`
}

/** XML-escape URL for sitemap loc (e.g. & in query strings). */
function xmlLoc(url: string): string {
  return url
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildSitemap(urls: string[], base: string): string {
  const lines = urls.map(
    (u) =>
      `  <url><loc>${xmlLoc(sitemapUrl(u, base))}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>
`
}

async function main() {
  const base = siteBase()
  if (!base) {
    console.error(
      'generate-seo-artifacts: VITE_PUBLIC_SITE_URL is required for sitemap, robots, and prerender.',
    )
    process.exit(1)
  }
  setPublicSiteUrlOverride(base)

  const indexPath = join(distDir, 'index.html')
  let indexHtml: string
  try {
    indexHtml = readFileSync(indexPath, 'utf8')
  } catch {
    console.error('generate-seo-artifacts: dist/index.html not found. Run vite build first.')
    process.exit(1)
  }

  await writeOgImagePng()

  const episodes = loadEpisodesJson()
  const gameNames = uniqueFeaturedGameNamesSorted(episodes)

  const staticPaths = ['/', '/about', '/favorites', '/games']
  const episodePaths = episodes.map((e) => `/episode/${e.ref}`)
  const gamePaths = gameNames.map((g) => `/games/${encodeURIComponent(g)}`)
  const allPaths = [...staticPaths, ...episodePaths, ...gamePaths]

  writeFileSync(join(distDir, 'sitemap.xml'), buildSitemap(allPaths, base), 'utf8')
  writeFileSync(
    join(distDir, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`,
    'utf8',
  )

  // --- Prerender: inject head into HTML shells ---
  const homeMeta: HeadMeta = {
    title: SEO.home.title,
    description: SEO.home.description,
    canonicalPath: '/',
    jsonLd: webSiteJsonLd(),
  }
  writeFileSync(join(distDir, 'index.html'), injectHead(indexHtml, base, homeMeta), 'utf8')

  const aboutMeta: HeadMeta = {
    title: SEO.about.title,
    description: SEO.about.description,
    canonicalPath: '/about',
  }
  writeHtmlDir('about', injectHead(indexHtml, base, aboutMeta))

  const favMeta: HeadMeta = {
    title: SEO.favorites.title,
    description: SEO.favorites.description,
    canonicalPath: '/favorites',
  }
  writeHtmlDir('favorites', injectHead(indexHtml, base, favMeta))

  const gamesMeta: HeadMeta = {
    title: SEO.gamesIndex.title,
    description: SEO.gamesIndex.description,
    canonicalPath: '/games',
  }
  writeHtmlDir('games', injectHead(indexHtml, base, gamesMeta))

  for (const ep of episodes) {
    const label = ep.episode_label ?? `Episode ${ep.ref}`
    const displayTitle = ep.subtitle ?? label
    const meta: HeadMeta = {
      title: episodeSeoTitle(ep),
      description: episodeSeoDescription(ep),
      canonicalPath: `/episode/${ep.ref}`,
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Catalog', path: '/' },
          { name: displayTitle, path: `/episode/${ep.ref}` },
        ]),
        podcastEpisodeJsonLd(ep),
      ],
    }
    writeHtmlDir(`episode/${ep.ref}`, injectHead(indexHtml, base, meta))
  }

  for (const name of gameNames) {
    const eps = episodes.filter((e) =>
      (e.featured_games ?? []).some((g) => g.toLowerCase() === name.toLowerCase()),
    )
    const { title, description } = gamePageCopy(name, eps.length)
    const enc = encodeURIComponent(name)
    const meta: HeadMeta = {
      title,
      description,
      canonicalPath: `/games/${enc}`,
      jsonLd: breadcrumbJsonLd([
        { name: 'Catalog', path: '/' },
        { name: 'Games', path: '/games' },
        { name, path: `/games/${enc}` },
      ]),
    }
    writeHtmlDir(`games/${enc}`, injectHead(indexHtml, base, meta))
  }

  // Edge case: game name with no episodes still listed — skipped (only names from uniqueFeaturedGameNamesSorted)

  console.log(
    `generate-seo-artifacts: wrote sitemap (${allPaths.length} URLs), robots.txt, og-default.png, and prerendered HTML shells.`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
