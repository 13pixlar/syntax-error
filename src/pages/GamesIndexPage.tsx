import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { fetchEpisodes, type Episode } from '@/lib/api/episodes'

type GameRow = { name: string; count: number }

function buildGameRows(episodes: Episode[]): GameRow[] {
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
  const rows: GameRow[] = []
  for (const [k, count] of counts) {
    const name = canonical.get(k)
    if (name) rows.push({ name, count })
  }
  rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  return rows
}

export function GamesIndexPage() {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchEpisodes()
      .then((data) => {
        if (!cancelled) setEpisodes(data)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : 'Failed to load episodes')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(
    () => (episodes ? buildGameRows(episodes) : []),
    [episodes],
  )

  if (err) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        {err}
      </div>
    )
  }

  if (!episodes) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <nav className="font-body text-muted-foreground text-sm">
        <Link to="/" className="hover:text-primary hover:underline">
          Catalog
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground">Games</span>
      </nav>

      <section className="rounded-xl border border-border/80 bg-card/50 p-6 shadow-[inset_0_0_40px_rgba(255,255,0,0.04)]">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-lg border border-border/80 bg-primary/10 text-primary">
            <Gamepad2 className="size-8" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg text-primary md:text-xl">
              Browse by game
            </h1>
            <p className="mt-2 max-w-2xl font-body text-muted-foreground text-lg leading-relaxed">
              {rows.length} game titles inferred from episode playlists. Select a
              title to see all episodes that feature it.
            </p>
          </div>
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="font-body text-muted-foreground">
          No featured games in the catalog yet.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li key={row.name}>
              <Link
                to={`/games/${encodeURIComponent(row.name)}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-card/60 px-4 py-3 font-body transition-colors hover:border-border hover:bg-card"
              >
                <span className="min-w-0 truncate text-foreground">{row.name}</span>
                <span className="shrink-0 font-mono text-muted-foreground text-sm tabular-nums">
                  {row.count} ep{row.count === 1 ? '' : 's'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
