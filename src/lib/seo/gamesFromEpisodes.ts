import type { Episode } from '@/lib/api/episodes'

/** Same canonical game names as GamesIndexPage (dedupe by lowercase, sort A–Z). */
export function uniqueFeaturedGameNamesSorted(episodes: Episode[]): string[] {
  const counts = new Map<string, number>()
  for (const ep of episodes) {
    const games = ep.featured_games ?? []
    for (const g of games) {
      const key = g.toLowerCase()
      const prev = counts.get(key)
      if (prev === undefined) counts.set(key, 1)
      else counts.set(key, prev + 1)
    }
  }
  const canonical = new Map<string, string>()
  for (const ep of episodes) {
    for (const g of ep.featured_games ?? []) {
      const k = g.toLowerCase()
      if (!canonical.has(k)) canonical.set(k, g)
    }
  }
  const names: string[] = []
  for (const k of counts.keys()) {
    const name = canonical.get(k)
    if (name) names.push(name)
  }
  names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  return names
}
