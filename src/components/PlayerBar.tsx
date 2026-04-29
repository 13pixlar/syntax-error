import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Play, SkipForward, Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAudioPlayer } from '@/lib/audio/AudioPlayerContext'

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PlayerBar() {
  const {
    nowPlaying,
    playing,
    duration,
    currentTime,
    volume,
    error,
    queue,
    skipNext,
    toggle,
    seek,
    setVolume,
  } = useAudioPlayer()

  const queuePos =
    queue && queue.length > 0
      ? `${queue.index + 1} / ${queue.length}`
      : null
  const canSkipNext =
    queue !== null &&
    queue.length > 1 &&
    queue.index < queue.length - 1

  // Local drag state: set while the user is scrubbing so the thumb moves
  // smoothly without triggering seek() on every pointer-move event.
  const [dragValue, setDragValue] = useState<number | null>(null)

  const max = duration > 0 ? duration : 1
  const progress = Math.min(currentTime, max)
  // During a drag show the speculative position; otherwise show real playback time.
  const displayTime = dragValue ?? progress

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 shadow-[0_-4px_24px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,170,0.03)_2px,rgba(0,255,170,0.03)_4px)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 border-border/80 text-primary hover:bg-primary/10"
            onClick={() => toggle()}
            disabled={!nowPlaying}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 border-border/80 text-primary hover:bg-primary/10"
            disabled={!canSkipNext}
            onClick={() => skipNext()}
            aria-label="Skip to next in playlist"
          >
            <SkipForward className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            {nowPlaying ? (
              <>
                <p className="truncate font-body text-foreground text-sm md:text-base">
                  {nowPlaying.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-muted-foreground text-xs">
                  <Link
                    to={`/episode/${nowPlaying.ref}`}
                    className="truncate hover:text-primary hover:underline"
                  >
                    {nowPlaying.subtitle ?? `Episode ${nowPlaying.ref}`}
                  </Link>
                  <span className="shrink-0 opacity-60">
                    {nowPlaying.source === 'main' ? '· full show' : '· track'}
                  </span>
                  {queuePos ? (
                    <span className="shrink-0 font-mono opacity-80">· playlist {queuePos}</span>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="font-body text-muted-foreground text-sm">
                Select an episode and press play
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 md:max-w-xl">
          <div className="flex items-center gap-2 text-muted-foreground text-xs tabular-nums">
            <span>{formatTime(displayTime)}</span>
            <Slider
              className="flex-1"
              min={0}
              max={max}
              value={[displayTime]}
              disabled={!nowPlaying || duration <= 0}
              onValueChange={(v) => {
                // Update the visual thumb position only — no seek() here.
                // Calling howl.seek() on every pointer-move causes repeated
                // buffering stalls on mobile (iOS/Android).
                const next = Array.isArray(v) ? v[0] : v
                if (typeof next === 'number') setDragValue(next)
              }}
              onValueCommitted={(v) => {
                // Fires once on pointerup / drag-end: safe to seek now.
                const next = Array.isArray(v) ? v[0] : v
                if (typeof next === 'number') seek(next)
                setDragValue(null)
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
          {error ? (
            <p className="text-destructive text-xs">{error}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:w-40">
          <Volume2 className="size-4 shrink-0 text-muted-foreground" />
          <Slider
            className="flex-1"
            min={0}
            max={1}
            step={0.02}
            value={[volume]}
            onValueChange={(v) => {
              const next = Array.isArray(v) ? v[0] : v
              if (typeof next === 'number') setVolume(next)
            }}
          />
        </div>
      </div>
    </div>
  )
}
