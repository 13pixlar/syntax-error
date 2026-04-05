import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, Play, Download, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  fetchEpisodeByRef,
  fetchPlaylistForRef,
  type Episode,
  type PlaylistTrack,
} from '@/lib/api/episodes'
import {
  fetchMyRatingForRef,
  fetchRatingStatForRef,
  upsertEpisodeRating,
  type EpisodeRatingStat,
} from '@/lib/api/ratings'
import { EpisodeTitleRatingStars } from '@/components/EpisodeStarRating'
import { getOrCreateRaterClientId } from '@/lib/raterId'
import { useAudioPlayer } from '@/lib/audio/AudioPlayerContext'
import { isProbablyPlayableUrl } from '@/lib/audio/playableUrl'
import {
  normalizeTranscriptLines,
  parseTimeLabelToSeconds,
} from '@/lib/transcriptTime'
import { useFavoriteRefs } from '@/lib/hooks/useFavoriteRefs'
import { EpisodeComments } from '@/components/EpisodeComments'

export function EpisodePage() {
  const { ref: refParam } = useParams<{ ref: string }>()
  const ref = refParam ? Number.parseInt(refParam, 10) : NaN
  const isInvalidRef = Number.isNaN(ref)
  const { play, seek, nowPlaying, playing } = useAudioPlayer()
  const { isFavorite, toggle } = useFavoriteRefs()

  const [episode, setEpisode] = useState<Episode | null | undefined>(undefined)
  const [tracks, setTracks] = useState<PlaylistTrack[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [ratingStat, setRatingStat] = useState<EpisodeRatingStat | null>(null)
  const [myRating, setMyRating] = useState<number | null>(null)
  const [ratingBusy, setRatingBusy] = useState(false)

  useEffect(() => {
    if (isInvalidRef) return
    let cancelled = false
    Promise.all([fetchEpisodeByRef(ref), fetchPlaylistForRef(ref)])
      .then(([ep, tr]) => {
        if (!cancelled) {
          setErr(null)
          setEpisode(ep)
          setTracks(tr)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : 'Failed to load episode')
      })
    return () => {
      cancelled = true
    }
  }, [ref, isInvalidRef])

  useEffect(() => {
    if (isInvalidRef) return
    let cancelled = false
    const clientId = getOrCreateRaterClientId()
    Promise.all([fetchMyRatingForRef(ref, clientId), fetchRatingStatForRef(ref)])
      .then(([mine, stat]) => {
        if (!cancelled) {
          setMyRating(mine)
          setRatingStat(stat)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMyRating(null)
          setRatingStat(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [ref, isInvalidRef])

  const handleRate = useCallback(
    async (n: number) => {
      if (isInvalidRef) return
      const clientId = getOrCreateRaterClientId()
      setRatingBusy(true)
      try {
        await upsertEpisodeRating(ref, n, clientId)
        setMyRating(n)
        const stat = await fetchRatingStatForRef(ref)
        setRatingStat(stat)
      } finally {
        setRatingBusy(false)
      }
    },
    [ref, isInvalidRef],
  )

  if (isInvalidRef) {
    return (
      <p className="text-destructive">
        Invalid episode id.{' '}
        <Link to="/" className="text-primary underline">
          Back to catalog
        </Link>
      </p>
    )
  }

  if (err) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        {err}
      </div>
    )
  }

  if (episode === undefined || tracks === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!episode) {
    return (
      <p className="text-muted-foreground">
        Episode not found.{' '}
        <Link to="/" className="text-primary underline">
          Back to catalog
        </Link>
      </p>
    )
  }

  const label = episode.episode_label ?? `Episode ${episode.ref}`
  const displayTitle = episode.subtitle ?? label
  const mainUrl = episode.main_mp3_url

  const playMain = () => {
    if (!mainUrl) return
    play({
      url: mainUrl,
      title: displayTitle,
      subtitle: label,
      ref: episode.ref,
      source: 'main',
    })
  }

  const playTrack = (t: PlaylistTrack) => {
    const url = t.file_url?.trim()
    if (!url) return
    play({
      url,
      title: t.track_title ?? 'Track',
      subtitle: label,
      ref: episode.ref,
      source: 'playlist',
    })
  }

  const isCurrent = (url: string | null | undefined, source: 'main' | 'playlist') => {
    if (!nowPlaying || !url) return false
    return (
      nowPlaying.url === url.trim() &&
      nowPlaying.ref === episode.ref &&
      nowPlaying.source === source
    )
  }

  const transcriptLines = normalizeTranscriptLines(episode.transcript)
  const mainUrlTrimmed = mainUrl?.trim() ?? ''
  const mainIsActive =
    !!mainUrlTrimmed &&
    nowPlaying?.ref === episode.ref &&
    nowPlaying.source === 'main' &&
    nowPlaying.url === mainUrlTrimmed

  const seekTranscriptTimestamp = (seconds: number) => {
    if (!mainUrl) return
    if (mainIsActive) {
      seek(seconds)
      return
    }
    play({
      url: mainUrlTrimmed,
      title: displayTitle,
      subtitle: label,
      ref: episode.ref,
      source: 'main',
      startAtSeconds: seconds,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <nav className="font-body text-muted-foreground text-sm">
        <Link to="/" className="hover:text-primary hover:underline">
          Catalog
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground">{displayTitle}</span>
      </nav>

      <Card className="overflow-hidden border-border/80 bg-card/90 shadow-[inset_0_0_60px_rgba(255,255,0,0.05)]">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display text-xl text-primary md:text-2xl">
                {displayTitle}
              </CardTitle>
              {episode.subtitle ? (
                <CardDescription className="mt-1 font-body text-base text-muted-foreground">
                  {label}
                </CardDescription>
              ) : null}
              <EpisodeTitleRatingStars
                episodeRef={episode.ref}
                stat={ratingStat}
                myRating={myRating}
                onRate={handleRate}
                disabled={ratingBusy}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-border/80 text-primary hover:bg-primary/10 hover:text-primary/85"
                aria-label={
                  isFavorite(episode.ref) ? 'Remove from favorites' : 'Add to favorites'
                }
                aria-pressed={isFavorite(episode.ref)}
                onClick={() => toggle(episode.ref)}
              >
                <Star
                  className={cn(
                    'size-5',
                    isFavorite(episode.ref) ? 'fill-current' : '',
                  )}
                  aria-hidden
                />
              </Button>
              {episode.air_date ? (
                <Badge variant="secondary" className="font-mono">
                  {episode.air_date}
                </Badge>
              ) : null}
              {episode.youtube_url ? (
                <a
                  href={episode.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'gap-1.5',
                  )}
                >
                  <ExternalLink className="size-3.5" />
                  YouTube
                </a>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 border-t border-border/60 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-body text-muted-foreground">Full episode</span>
            {mainUrl ? (
              <>
                <Button
                  size="sm"
                  onClick={playMain}
                  className="gap-1.5"
                >
                  <Play className="size-3.5" />
                  {isCurrent(mainUrl, 'main') && playing ? 'Playing' : 'Play'}
                </Button>
                <a
                  href={mainUrl}
                  download
                  className="inline-flex items-center gap-1 text-muted-foreground text-sm underline-offset-4 hover:text-primary hover:underline"
                >
                  <Download className="size-3.5" />
                  Download
                </a>
              </>
            ) : (
              <Badge variant="outline">No MP3 on file</Badge>
            )}
          </div>
          {episode.page_url ? (
            <a
              href={episode.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 font-body text-muted-foreground text-sm hover:text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Original episode page
            </a>
          ) : null}
        </CardContent>
      </Card>

      {episode.featured_games && episode.featured_games.length > 0 ? (
        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-lg">Featured games</CardTitle>
            <CardDescription className="font-body text-base">
              Titles inferred from this episode&apos;s playlist. Open a title to
              see other episodes that feature it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {episode.featured_games.map((g) => (
              <Link
                key={g}
                to={`/games/${encodeURIComponent(g)}`}
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'sm' }),
                  'font-body',
                )}
              >
                {g}
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-lg">Playlist</CardTitle>
          <CardDescription className="font-body text-base">
            Track list from the episode page. Browser playback works for common
            web formats (MP3, OGG, WAV…). Chiptune files may need a download.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-12 font-mono text-muted-foreground">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Artist</TableHead>
                <TableHead className="hidden md:table-cell">Year</TableHead>
                <TableHead className="text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No playlist rows for this episode.
                  </TableCell>
                </TableRow>
              ) : (
                tracks.map((t) => {
                  const url = t.file_url?.trim() ?? ''
                  const playable = url && isProbablyPlayableUrl(url)
                  const active =
                    url && isCurrent(url, 'playlist') && playing

                  return (
                    <TableRow key={t.id} className="border-border/50">
                      <TableCell className="font-mono text-muted-foreground">
                        {t.sort_order}
                      </TableCell>
                      <TableCell className="max-w-[min(40vw,14rem)] truncate font-body sm:max-w-none">
                        {t.track_title ?? '—'}
                      </TableCell>
                      <TableCell className="hidden max-w-xs truncate font-body text-muted-foreground sm:table-cell">
                        {t.artist ?? '—'}
                      </TableCell>
                      <TableCell className="hidden font-mono text-muted-foreground md:table-cell">
                        {t.year ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {url ? (
                            <>
                              {playable ? (
                                <Button
                                  size="xs"
                                  variant="secondary"
                                  onClick={() => playTrack(t)}
                                >
                                  {active ? 'Playing' : 'Play'}
                                </Button>
                              ) : (
                                <Badge variant="outline" className="font-mono text-[10px]">
                                  file
                                </Badge>
                              )}
                              <a
                                href={url}
                                download
                                className="inline-flex items-center rounded-md border border-border px-2 py-1 font-body text-muted-foreground text-xs hover:bg-muted/40 hover:text-primary"
                              >
                                <Download className="size-3" />
                              </a>
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {transcriptLines.length > 0 ? (
        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-lg">Transcript</CardTitle>
            <CardDescription className="font-body text-base">
              Spoken narration from the episode page. Timestamps seek the full-episode
              MP3 when available.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="max-h-[min(40rem,72vh)] overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
              <ul className="space-y-3 font-body text-sm leading-relaxed">
                {transcriptLines.map((line, i) => {
                  const seconds = parseTimeLabelToSeconds(line.time_label)
                  const canSeek = Boolean(mainUrl && seconds !== null)

                  return (
                    <li key={`${line.time_label}-${i}`} className="flex gap-3">
                      {canSeek && seconds !== null ? (
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto shrink-0 py-0 font-mono text-primary"
                          aria-label={`Seek to ${line.time_label}`}
                          onClick={() => seekTranscriptTimestamp(seconds)}
                        >
                          {line.time_label}
                        </Button>
                      ) : (
                        <span className="w-[4.5rem] shrink-0 font-mono text-muted-foreground">
                          {line.time_label}
                        </span>
                      )}
                      <span className="min-w-0 text-foreground">{line.text}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <EpisodeComments episodeRef={episode.ref} />
    </div>
  )
}
