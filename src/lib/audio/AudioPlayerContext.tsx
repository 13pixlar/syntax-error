import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  getHowlConstructor,
  type Howl,
} from '@/lib/audio/howlerClient'

const HowlCtor = getHowlConstructor()

export type NowPlaying = {
  url: string
  title: string
  subtitle?: string
  ref: number
  source: 'main' | 'playlist'
  /** When set, playback starts at this offset once the sound has loaded. */
  startAtSeconds?: number
}

/** Active episode queue (e.g. favorites “Play all”); index is 0-based. */
export type QueueState = {
  length: number
  index: number
}

type AudioPlayerContextValue = {
  nowPlaying: NowPlaying | null
  playing: boolean
  duration: number
  currentTime: number
  volume: number
  error: string | null
  /** Single track; clears any active queue. */
  play: (track: NowPlaying) => void
  /** Play ordered tracks; when one ends, advances until the list is done. */
  playQueue: (tracks: NowPlaying[]) => void
  queue: QueueState | null
  skipNext: () => void
  toggle: () => void
  pause: () => void
  seek: (seconds: number) => void
  setVolume: (v: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)

type QueueRef = { tracks: NowPlaying[] | null; index: number }

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const howlRef = useRef<Howl | null>(null)
  const queueRef = useRef<QueueRef>({ tracks: null, index: 0 })
  const volumeRef = useRef(0.9)

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
  const [queue, setQueue] = useState<QueueState | null>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolumeState] = useState(0.9)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  const disposeHowl = useCallback(() => {
    const h = howlRef.current
    if (h) {
      h.stop()
      h.unload()
      howlRef.current = null
    }
  }, [])

  const loadTrackRef = useRef<(track: NowPlaying) => void>(() => {})

  const loadTrack = useCallback(
    (track: NowPlaying) => {
      setError(null)
      disposeHowl()

      const vol = volumeRef.current
      const startAt = track.startAtSeconds
      const deferPlay =
        typeof startAt === 'number' && Number.isFinite(startAt) && startAt >= 0

      const h = new HowlCtor({
        src: [track.url],
        html5: true,
        volume: vol,
        onload: () => {
          const d = h.duration()
          if (typeof d === 'number' && !Number.isNaN(d)) setDuration(d)
          if (deferPlay && typeof startAt === 'number') {
            let pos = startAt
            if (typeof d === 'number' && !Number.isNaN(d) && d > 0) {
              pos = Math.min(Math.max(0, startAt), d)
            }
            h.seek(pos)
            setCurrentTime(pos)
          }
          if (deferPlay) {
            h.play()
          }
        },
        onloaderror: (_id, err) => {
          console.error(err)
          setError('Could not load audio (check URL or CORS).')
          setPlaying(false)
        },
        onplay: () => setPlaying(true),
        onpause: () => setPlaying(false),
        onstop: () => setPlaying(false),
        onend: () => {
          setPlaying(false)
          setCurrentTime(0)
          const qs = queueRef.current
          if (qs.tracks && qs.index < qs.tracks.length - 1) {
            const nextIdx = qs.index + 1
            queueRef.current = { tracks: qs.tracks, index: nextIdx }
            setQueue({
              length: qs.tracks.length,
              index: nextIdx,
            })
            loadTrackRef.current(qs.tracks[nextIdx])
          } else if (qs.tracks) {
            queueRef.current = { tracks: null, index: 0 }
            setQueue(null)
          }
        },
        onplayerror: (_id, err) => {
          console.error(err)
          setError('Playback was blocked or failed.')
          setPlaying(false)
        },
      })

      howlRef.current = h
      setNowPlaying(track)
      setDuration(0)
      setCurrentTime(0)
      if (!deferPlay) {
        h.play()
      }
    },
    [disposeHowl],
  )

  useLayoutEffect(() => {
    loadTrackRef.current = loadTrack
  }, [loadTrack])

  const play = useCallback(
    (track: NowPlaying) => {
      queueRef.current = { tracks: null, index: 0 }
      setQueue(null)
      loadTrack(track)
    },
    [loadTrack],
  )

  const playQueue = useCallback(
    (tracks: NowPlaying[]) => {
      if (tracks.length === 0) return
      queueRef.current = { tracks, index: 0 }
      setQueue({ length: tracks.length, index: 0 })
      loadTrack(tracks[0])
    },
    [loadTrack],
  )

  const skipNext = useCallback(() => {
    const qs = queueRef.current
    if (!qs.tracks || qs.index >= qs.tracks.length - 1) return
    const nextIdx = qs.index + 1
    queueRef.current = { tracks: qs.tracks, index: nextIdx }
    setQueue({ length: qs.tracks.length, index: nextIdx })
    loadTrack(qs.tracks[nextIdx])
  }, [loadTrack])

  useEffect(() => {
    const h = howlRef.current
    if (h) h.volume(volume)
  }, [volume])

  useEffect(() => {
    if (!playing) return
    let id = 0
    const tick = () => {
      const h = howlRef.current
      if (h?.playing()) {
        const pos = h.seek() as number
        setCurrentTime(pos)
        const d = h.duration()
        if (typeof d === 'number' && !Number.isNaN(d) && d > 0) setDuration(d)
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [playing])

  useEffect(() => () => disposeHowl(), [disposeHowl])

  const pause = useCallback(() => {
    howlRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    const h = howlRef.current
    if (!h) return
    if (h.playing()) h.pause()
    else h.play()
  }, [])

  const seek = useCallback((seconds: number) => {
    const h = howlRef.current
    if (!h) return
    h.seek(seconds)
    setCurrentTime(seconds)
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)))
  }, [])

  const value = useMemo(
    () =>
      ({
        nowPlaying,
        playing,
        duration,
        currentTime,
        volume,
        error,
        play,
        playQueue,
        queue,
        skipNext,
        toggle,
        pause,
        seek,
        setVolume,
      }) satisfies AudioPlayerContextValue,
    [
      nowPlaying,
      playing,
      duration,
      currentTime,
      volume,
      error,
      play,
      playQueue,
      queue,
      skipNext,
      toggle,
      pause,
      seek,
      setVolume,
    ],
  )

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider')
  }
  return ctx
}
