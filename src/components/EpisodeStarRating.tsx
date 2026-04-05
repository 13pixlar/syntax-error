import { Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EpisodeRatingStat } from '@/lib/api/ratings'

const STAR_IDS = [1, 2, 3, 4, 5] as const

function StarsRow({
  value,
  max = 5,
  size = 'md',
  className,
}: {
  /** Display level 0–5 (e.g. rounded average or selected rating). */
  value: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}) {
  const iconClass =
    size === 'sm' ? 'size-3.5' : 'size-4'
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-hidden
    >
      {STAR_IDS.slice(0, max).map((i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            'shrink-0',
            i <= value ? 'fill-primary/90 text-primary' : 'text-muted-foreground/50',
          )}
        />
      ))}
    </span>
  )
}

/** Catalog card: community average + count; nothing when unrated. */
export function EpisodeRatingCardLine({
  stat,
}: {
  stat: EpisodeRatingStat | null | undefined
}) {
  if (!stat || stat.rating_count <= 0) {
    return null
  }
  const rounded = Math.min(5, Math.max(0, Math.round(stat.avg_rating)))
  return (
    <div className="flex flex-wrap items-center gap-1.5 font-body text-xs tabular-nums">
      <StarsRow value={rounded} size="sm" />
      <span className="text-muted-foreground">
        {stat.avg_rating.toFixed(1)}
        <span className="text-muted-foreground/70"> ({stat.rating_count})</span>
      </span>
    </div>
  )
}

type TitleRatingProps = {
  episodeRef: number
  stat: EpisodeRatingStat | null
  myRating: number | null
  onRate: (rating: number) => void
  disabled?: boolean
}

/** Inline in episode header: #ref + clickable stars + optional community avg. */
export function EpisodeTitleRatingStars({
  episodeRef,
  stat,
  myRating,
  onRate,
  disabled,
}: TitleRatingProps) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-mono text-muted-foreground text-sm tabular-nums">
        #{episodeRef}
      </span>
      <span
        className="inline-flex items-center gap-0.5"
        role="group"
        aria-label="Your rating"
      >
        {STAR_IDS.map((n) => (
          <Button
            key={n}
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="size-7 shrink-0 text-primary hover:bg-primary/10"
            aria-label={`Rate ${n} out of 5`}
            aria-pressed={myRating === n}
            onClick={() => onRate(n)}
          >
            <Star
              className={cn(
                'size-4',
                myRating != null && n <= myRating ? 'fill-current' : '',
              )}
              aria-hidden
            />
          </Button>
        ))}
      </span>
      {stat && stat.rating_count > 0 ? (
        <span className="font-body text-muted-foreground text-xs tabular-nums">
          {stat.avg_rating.toFixed(1)} ({stat.rating_count})
        </span>
      ) : null}
    </div>
  )
}
