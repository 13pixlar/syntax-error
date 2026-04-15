let publicSiteUrlOverride: string | null = null

/** Used by the post-build SEO script so JSON-LD URLs match the configured origin. */
export function setPublicSiteUrlOverride(origin: string | null): void {
  publicSiteUrlOverride = origin?.replace(/\/$/, '') ?? null
}

function envPublicSiteUrl(): string | undefined {
  const fromImport = import.meta.env.VITE_PUBLIC_SITE_URL?.trim()
  if (fromImport) return fromImport.replace(/\/$/, '')
  return undefined
}

/** Public site origin with no trailing slash (e.g. https://example.com). */
export function getPublicSiteUrl(): string {
  if (publicSiteUrlOverride) return publicSiteUrlOverride
  const fromEnv = envPublicSiteUrl()
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function absoluteUrl(path: string): string {
  const base = getPublicSiteUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}
