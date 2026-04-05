import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Headphones, ListMusic, Play, Star } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchEpisodesByRefs, type Episode } from '@/lib/api/episodes'
import { useAudioPlayer, type NowPlaying } from '@/lib/audio/AudioPlayerContext'
import { useFavoriteRefs } from '@/lib/hooks/useFavoriteRefs'
import { cn } from '@/lib/utils'

function episodeToMainNowPlaying(ep: Episode): NowPlaying | null {
  const mainUrl = ep.main_mp3_url
  if (!mainUrl?.trim()) return null
  const label = ep.episode_label ?? `Episode ${ep.ref}`
  const displayTitle = ep.subtitle ?? label
  return {
    url: mainUrl.trim(),
    title: displayTitle,
    subtitle: label,
    ref: ep.ref,
    source: 'main',
  }
}

export function FavoritesPage() {
  const { refs, remove, move } = useFavoriteRefs()
  const { playQueue } = useAudioPlayer()
  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (refs.length === 0) return
    let cancelled = false
    fetchEpisodesByRefs(refs)
      .then((data) => {
        if (!cancelled) {
          setErr(null)
          setEpisodes(data)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : 'Failed to load episodes')
      })
    return () => {
      cancelled = true
    }
  }, [refs])

  const playable = useMemo(() => {
    if (!episodes) return { tracks: [] as NowPlaying[], skipped: 0 }
    const tracks: NowPlaying[] = []
    let skipped = 0
    for (const ep of episodes) {
      const np = episodeToMainNowPlaying(ep)
      if (np) tracks.push(np)
      else skipped += 1
    }
    return { tracks, skipped }
  }, [episodes])

  const playAll = () => {
    if (playable.tracks.length === 0) return
    playQueue(playable.tracks)
  }

  if (err) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        {err}
      </div>
    )
  }

  const list = refs.length === 0 ? [] : (episodes ?? [])

  if (refs.length > 0 && episodes === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-border/80 bg-card/50 p-6 shadow-[inset_0_0_40px_rgba(255,255,0,0.04)]">
        <div className="flex flex-wrap items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg border border-border/80 bg-primary/10 text-primary">
            <Star className="size-8 fill-primary/30" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg text-primary md:text-xl">
              Favorites
            </h1>
            <p className="mt-2 max-w-2xl font-body text-muted-foreground text-lg leading-relaxed">
              Episodes you have starred. Play them in order as a full-show playlist, or open an
              episode for tracks and details.
            </p>
            {playable.skipped > 0 ? (
              <p className="mt-2 font-body text-primary/90 text-sm">
                {playable.skipped} favorite
                {playable.skipped === 1 ? ' has' : 's have'} no main MP3 and will be skipped in
                Play all.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="gap-1.5"
              disabled={playable.tracks.length === 0}
              onClick={playAll}
            >
              <Play className="size-3.5" aria-hidden />
              Play all
            </Button>
            <Link to="/" className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'gap-1.5')}>
              <ListMusic className="size-3.5" aria-hidden />
              Catalog
            </Link>
          </div>
        </div>
      </section>

      {refs.length === 0 ? (
        <p className="font-body text-muted-foreground">
          No favorites yet. Star episodes from the{' '}
          <Link to="/" className="text-primary underline">
            catalog
          </Link>{' '}
          or an episode page.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((ep, i) => {
            const label = ep.episode_label ?? `Episode ${ep.ref}`
            const displayTitle = ep.subtitle ?? label
            const atTop = i === 0
            const atBottom = i === list.length - 1
            const canPlay = Boolean(ep.main_mp3_url?.trim())

            return (
              <Card
                key={ep.ref}
                className="border-border/80 bg-card/80 transition-shadow hover:border-border hover:shadow-[0_0_20px_rgba(255,255,0,0.08)]"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="font-display text-base leading-snug">
                        {displayTitle}
                      </CardTitle>
                      {ep.subtitle ? (
                        <p className="font-body text-muted-foreground text-xs leading-snug">
                          {label}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-primary hover:text-primary/85"
                      aria-label="Remove from favorites"
                      onClick={() => remove(ep.ref)}
                    >
                      <Star className="size-5 fill-current" aria-hidden />
                    </Button>
                  </div>
                </CardHeader>
                {!canPlay ? (
                  <CardContent className="pb-2 pt-0">
                    <p className="font-body text-muted-foreground text-xs">
                      No main MP3 — skipped in Play all.
                    </p>
                  </CardContent>
                ) : null}
                <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
                  <span className="font-body text-muted-foreground text-sm tabular-nums">
                    {ep.air_date ?? '—'}
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={atTop}
                      aria-label="Move up"
                      onClick={() => move(ep.ref, 'up')}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={atBottom}
                      aria-label="Move down"
                      onClick={() => move(ep.ref, 'down')}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Link
                      to={`/episode/${ep.ref}`}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'gap-1.5',
                      )}
                    >
                      <Headphones className="size-3.5" aria-hidden />
                      Details
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
