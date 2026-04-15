import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Radio } from 'lucide-react'

import { EpisodeCatalogCard } from '@/components/EpisodeCatalogCard'
import { EpisodeSortSelect } from '@/components/EpisodeSortSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { Seo } from '@/components/Seo'
import { fetchEpisodes, type Episode } from '@/lib/api/episodes'
import {
  fetchEpisodeRatingStats,
  type EpisodeRatingStat,
} from '@/lib/api/ratings'
import { sortEpisodes, type EpisodeSortMode } from '@/lib/episodeSort'
import { webSiteJsonLd } from '@/lib/seo/jsonLd'
import { SEO } from '@/lib/seo/staticCopy'

export function HomePage() {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [ratingStats, setRatingStats] = useState<Map<
    number,
    EpisodeRatingStat
  > | null>(null)
  const [sortMode, setSortMode] = useState<EpisodeSortMode>('ref-asc')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchEpisodes(), fetchEpisodeRatingStats()])
      .then(([eps, stats]) => {
        if (!cancelled) {
          setEpisodes(eps)
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
  }, [])

  const sortedEpisodes = useMemo(() => {
    if (!episodes || !ratingStats) return null
    return sortEpisodes(episodes, ratingStats, sortMode)
  }, [episodes, ratingStats, sortMode])

  if (err) {
    return (
      <>
        <Seo
          title={SEO.home.title}
          description={SEO.home.description}
          canonicalPath="/"
          jsonLd={webSiteJsonLd()}
        />
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          {err}
        </div>
      </>
    )
  }

  if (!episodes || !ratingStats || !sortedEpisodes) {
    return (
      <>
        <Seo
          title={SEO.home.title}
          description={SEO.home.description}
          canonicalPath="/"
          jsonLd={webSiteJsonLd()}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Seo
        title={SEO.home.title}
        description={SEO.home.description}
        canonicalPath="/"
        jsonLd={webSiteJsonLd()}
      />
      <h1 className="font-display text-lg text-primary md:hidden">Episode catalog</h1>
      <section className="hidden rounded-xl border border-border/80 bg-card/50 p-6 shadow-[inset_0_0_40px_rgba(255,255,0,0.04)] md:block">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-lg border border-border/80 bg-primary/10 text-primary">
            <Radio className="size-8" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg text-primary md:text-xl" role="presentation">
              Episode catalog
            </p>
            <p className="mt-2 max-w-2xl font-body text-muted-foreground text-lg leading-relaxed">
              Browse {sortedEpisodes.length} episodes from the Syntax Error radio show.
              Stream the full MP3 or open individual tracks on the episode page.{' '}
              <Link
                to="/games"
                className="text-primary underline-offset-4 hover:underline"
              >
                Browse by game
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <EpisodeSortSelect
          id="catalog-sort"
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
    </div>
  )
}
