import { Helmet } from 'react-helmet-async'

import { absoluteUrl, getPublicSiteUrl } from '@/lib/seo/siteUrl'

type JsonLd = Record<string, unknown>

export type SeoProps = {
  title: string
  description: string
  /** Pathname starting with / (e.g. /episode/42). */
  canonicalPath: string
  /** Absolute URL or path under site root for og:image. */
  ogImage?: string
  jsonLd?: JsonLd | JsonLd[]
  noIndex?: boolean
}

function toOgImageUrl(ogImage: string | undefined): string {
  if (!ogImage) return absoluteUrl('/og-default.png')
  if (ogImage.startsWith('http://') || ogImage.startsWith('https://'))
    return ogImage
  const path = ogImage.startsWith('/') ? ogImage : `/${ogImage}`
  return absoluteUrl(path)
}

export function Seo({
  title,
  description,
  canonicalPath,
  ogImage,
  jsonLd,
  noIndex,
}: SeoProps) {
  const base = getPublicSiteUrl()
  const canonical =
    base && canonicalPath
      ? `${base}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
      : undefined
  const imageUrl = toOgImageUrl(ogImage)
  const jsonBlocks = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : []

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {jsonBlocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  )
}
