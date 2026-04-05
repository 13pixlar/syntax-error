import { Link } from 'react-router-dom'
import { Headphones, Play, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Episode } from '@/lib/api/episodes'
import type { EpisodeRatingStat } from '@/lib/api/ratings'
import { useAudioPlayer } from '@/lib/audio/AudioPlayerContext'
import { useFavoriteRefs } from '@/lib/hooks/useFavoriteRefs'
import { EpisodeRatingCardLine } from '@/components/EpisodeStarRating'

type Props = {
  episode: Episode
  ratingStat?: EpisodeRatingStat | null
}

export function EpisodeCatalogCard({ episode: ep, ratingStat }: Props) {
  const { play } = useAudioPlayer()
  const { isFavorite, toggle } = useFavoriteRefs()
  const label = ep.episode_label ?? `Episode ${ep.ref}`
  const displayTitle = ep.subtitle ?? label
  const mainUrl = ep.main_mp3_url

  const playMain = () => {
    if (!mainUrl) return
    play({
      url: mainUrl,
      title: displayTitle,
      subtitle: label,
      ref: ep.ref,
      source: 'main',
    })
  }

  return (
    <Card className="border-border/80 bg-card/80 transition-shadow hover:border-border hover:shadow-[0_0_20px_rgba(255,255,0,0.08)]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="font-display text-base leading-snug">
              <Link
                to={`/episode/${ep.ref}`}
                className="rounded-sm text-foreground transition-colors duration-200 ease-out hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {ep.subtitle ?? ep.episode_label ?? `Episode ${ep.ref}`}
              </Link>
            </CardTitle>
            {ep.subtitle ? (
              <p className="font-body text-muted-foreground text-xs leading-snug">
                {ep.episode_label ?? `Episode ${ep.ref}`}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-primary hover:text-primary/85"
              aria-label={
                isFavorite(ep.ref) ? 'Remove from favorites' : 'Add to favorites'
              }
              aria-pressed={isFavorite(ep.ref)}
              onClick={() => toggle(ep.ref)}
            >
              <Star
                className={cn(
                  'size-5',
                  isFavorite(ep.ref) ? 'fill-current' : '',
                )}
                aria-hidden
              />
            </Button>
            {ep.main_mp3_url ? (
              <Badge variant="secondary" className="font-mono text-[10px]">
                MP3
              </Badge>
            ) : (
              <Badge variant="outline" className="font-mono text-[10px]">
                no stream
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-body text-muted-foreground text-sm tabular-nums">
            {ep.air_date ?? '—'}
          </span>
          <EpisodeRatingCardLine stat={ratingStat} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {mainUrl ? (
            <Button
              type="button"
              size="sm"
              variant="default"
              className="gap-1.5"
              onClick={playMain}
            >
              <Play className="size-3.5" aria-hidden />
              Play
            </Button>
          ) : null}
          <Link
            to={`/episode/${ep.ref}`}
            className={cn(
              buttonVariants({
                variant: mainUrl ? 'outline' : 'default',
                size: 'sm',
              }),
              'gap-1.5',
            )}
          >
            <Headphones className="size-3.5" aria-hidden />
            Episode details
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
