import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { EpisodeCatalogCard } from '@/components/EpisodeCatalogCard'
import { EpisodeSortSelect } from '@/components/EpisodeSortSelect'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchEpisodesByFeaturedGame,
  type Episode,
} from '@/lib/api/episodes'
import {
  fetchEpisodeRatingStats,
  type EpisodeRatingStat,
} from '@/lib/api/ratings'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { gamePageCopy, gamePageLoadingCopy } from '@/lib/seo/staticCopy'
import { sortEpisodes, type EpisodeSortMode } from '@/lib/episodeSort'

export function GameEpisodesPage() {
  const { gameName: gameNameParam } = useParams<{ gameName: string }>()
  const gameName = gameNameParam ? decodeURIComponent(gameNameParam) : ''

  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [ratingStats, setRatingStats] = useState<Map<
    number,
    EpisodeRatingStat
  > | null>(null)
  const [sortMode, setSortMode] = useState<EpisodeSortMode>('ref-asc')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!gameName) return
    let cancelled = false
    Promise.all([
      fetchEpisodesByFeaturedGame(gameName),
      fetchEpisodeRatingStats(),
    ])
      .then(([data, stats]) => {
        if (!cancelled) {
          setErr(null)
          setEpisodes(data)
          setRatingStats(stats)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : 'Failed to load episodes')
      })
    return () => {
      cancelled = true
    }
  }, [gameName])

  const sortedEpisodes = useMemo(() => {
    if (!episodes || !ratingStats) return null
    return sortEpisodes(episodes, ratingStats, sortMode)
  }, [episodes, ratingStats, sortMode])

  const canonicalPath = gameNameParam ? `/games/${gameNameParam}` : '/games'

  if (!gameNameParam) {
    return (
      <>
        <Seo
          title="Games — Syntax Error"
          description="Browse Syntax Error episodes by featured game title."
          canonicalPath="/games"
        />
        <p className="text-destructive">
          Missing game.{' '}
          <Link to="/games" className="text-primary underline">
            Browse games
          </Link>
        </p>
      </>
    )
  }

  const loadingCopy = gamePageLoadingCopy(gameName)
  const crumbs = breadcrumbJsonLd([
    { name: 'Catalog', path: '/' },
    { name: 'Games', path: '/games' },
    { name: gameName, path: canonicalPath },
  ])

  if (err) {
    return (
      <>
        <Seo
          title={loadingCopy.title}
          description={loadingCopy.description}
          canonicalPath={canonicalPath}
          jsonLd={crumbs}
        />
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          {err}
        </div>
      </>
    )
  }

  if (episodes === null || ratingStats === null || sortedEpisodes === null) {
    return (
      <>
        <Seo
          title={loadingCopy.title}
          description={loadingCopy.description}
          canonicalPath={canonicalPath}
          jsonLd={crumbs}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </>
    )
  }

  const { title: gameTitle, description: gameDesc } = gamePageCopy(
    gameName,
    episodes.length,
  )

  return (
    <div className="flex flex-col gap-8">
      <Seo
        title={gameTitle}
        description={gameDesc}
        canonicalPath={canonicalPath}
        jsonLd={crumbs}
      />
      <nav className="font-body text-muted-foreground text-sm">
        <Link to="/" className="hover:text-primary hover:underline">
          Catalog
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <Link to="/games" className="hover:text-primary hover:underline">
          Games
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground">{gameName}</span>
      </nav>

      <h1 className="font-display text-xl text-primary md:text-2xl">{gameName}</h1>
      <p className="font-body text-muted-foreground">
        {episodes.length} episode{episodes.length === 1 ? '' : 's'} with this
        title in the featured list.
      </p>

      {episodes.length === 0 ? (
        <p className="font-body text-muted-foreground">
          No episodes found.{' '}
          <Link to="/games" className="text-primary underline">
            Back to games
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <EpisodeSortSelect
            id="game-episodes-sort"
            value={sortMode}
            onChange={setSortMode}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEpisodes.map((ep) => (
              <EpisodeCatalogCard
                key={ep.ref}
                episode={ep}
                ratingStat={ratingStats.get(ep.ref)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
