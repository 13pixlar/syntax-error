import type { Episode } from '@/lib/api/episodes'
import type { EpisodeRatingStat } from '@/lib/api/ratings'

export type EpisodeSortMode =
  | 'ref-asc'
  | 'air-date-desc'
  | 'air-date-asc'
  | 'rating-desc'
  | 'rating-asc'

/** Unrated episodes sort after rated when ordering by rating (highest/lowest lists). */
export function sortEpisodes(
  episodes: Episode[],
  stats: Map<number, EpisodeRatingStat>,
  mode: EpisodeSortMode,
): Episode[] {
  const out = [...episodes]
  if (mode === 'ref-asc') {
    out.sort((a, b) => a.ref - b.ref)
    return out
  }
  if (mode === 'air-date-desc' || mode === 'air-date-asc') {
    const desc = mode === 'air-date-desc'
    out.sort((a, b) => {
      const da = a.air_date ? Date.parse(a.air_date) : NaN
      const db = b.air_date ? Date.parse(b.air_date) : NaN
      const validA = !Number.isNaN(da)
      const validB = !Number.isNaN(db)
      if (!validA && !validB) return a.ref - b.ref
      if (!validA) return 1
      if (!validB) return -1
      const cmp = desc ? db - da : da - db
      if (cmp !== 0) return cmp
      return a.ref - b.ref
    })
    return out
  }
  if (mode === 'rating-desc') {
    out.sort((a, b) => {
      const sa = stats.get(a.ref)
      const sb = stats.get(b.ref)
      const hasA = sa != null && sa.rating_count > 0
      const hasB = sb != null && sb.rating_count > 0
      if (!hasA && !hasB) return a.ref - b.ref
      if (!hasA) return 1
      if (!hasB) return -1
      const cmp = sb.avg_rating - sa.avg_rating
      if (cmp !== 0) return cmp
      return a.ref - b.ref
    })
    return out
  }
  out.sort((a, b) => {
    const sa = stats.get(a.ref)
    const sb = stats.get(b.ref)
    const hasA = sa != null && sa.rating_count > 0
    const hasB = sb != null && sb.rating_count > 0
    if (!hasA && !hasB) return a.ref - b.ref
    if (!hasA) return 1
    if (!hasB) return -1
    const cmp = sa.avg_rating - sb.avg_rating
    if (cmp !== 0) return cmp
    return a.ref - b.ref
  })
  return out
}
