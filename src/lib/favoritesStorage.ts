const STORAGE_KEY = 'syntax-error-favorite-refs'

function isPositiveInt(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n > 0
}

function parseStored(raw: string | null): number[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const nums = parsed.filter(isPositiveInt)
    const seen = new Set<number>()
    const deduped: number[] = []
    for (const ref of nums) {
      if (seen.has(ref)) continue
      seen.add(ref)
      deduped.push(ref)
    }
    return deduped
  } catch {
    return []
  }
}

export function readFavoriteRefs(): number[] {
  if (typeof window === 'undefined') return []
  try {
    return parseStored(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

export function writeFavoriteRefs(refs: number[]): void {
  if (typeof window === 'undefined') return
  const valid = refs.filter(isPositiveInt)
  const seen = new Set<number>()
  const deduped: number[] = []
  for (const ref of valid) {
    if (seen.has(ref)) continue
    seen.add(ref)
    deduped.push(ref)
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped))
}

export function getFavoritesStorageKey(): string {
  return STORAGE_KEY
}
