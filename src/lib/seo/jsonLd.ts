import type { Episode } from '@/lib/api/episodes'

import { absoluteUrl } from '@/lib/seo/siteUrl'

const SHOW_NAME = 'Syntax Error'

export function webSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${SHOW_NAME} — episode archive`,
    description:
      'Browse and stream episodes of the Syntax Error radio show: 8-bit and 16-bit SID, chiptune, and related game music.',
    url: absoluteUrl('/'),
  }
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  }
}

/** Podcast-style episode markup; omits audio when missing. */
export function podcastEpisodeJsonLd(ep: Episode): Record<string, unknown> {
  const label = ep.episode_label ?? `Episode ${ep.ref}`
  const pageUrl = absoluteUrl(`/episode/${ep.ref}`)
  const series: Record<string, unknown> = {
    '@type': 'PodcastSeries',
    name: SHOW_NAME,
    url: absoluteUrl('/'),
  }
  const obj: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: ep.subtitle?.trim() ? `${label}: ${ep.subtitle.trim()}` : label,
    url: pageUrl,
    partOfSeries: series,
    episodeNumber: ep.ref,
  }
  if (ep.air_date) obj.datePublished = ep.air_date
  const main = ep.main_mp3_url?.trim()
  if (main) {
    obj.associatedMedia = {
      '@type': 'MediaObject',
      contentUrl: main,
      encodingFormat: 'audio/mpeg',
    }
  }
  return obj
}
