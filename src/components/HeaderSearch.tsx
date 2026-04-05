import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { fetchAllPlaylistTracks, fetchEpisodes } from '@/lib/api/episodes'
import {
  buildEpisodeSearchIndex,
  filterEpisodeSearch,
  formatMatchZones,
  type EpisodeSearchRow,
} from '@/lib/search/episodeSearch'

function shortcutLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl+K'
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? '⌘K' : 'Ctrl+K'
}

const SEARCH_PLACEHOLDER = 'Titles, games, playlist, transcript…'

export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<EpisodeSearchRow[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const navigate = useNavigate()
  const kbdHint = useMemo(() => shortcutLabel(), [])

  const filtered = useMemo(() => {
    if (!rows) return []
    return filterEpisodeSearch(rows, query)
  }, [rows, query])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const loading = open && rows === null && loadError === null

  useEffect(() => {
    if (!open) return
    if (rows !== null) return

    let cancelled = false

    Promise.all([fetchEpisodes(), fetchAllPlaylistTracks()])
      .then(([episodes, tracks]) => {
        if (cancelled) return
        setRows(buildEpisodeSearchIndex(episodes, tracks))
        setLoadError(null)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setLoadError(
            e instanceof Error ? e.message : 'Failed to load search index',
          )
      })

    return () => {
      cancelled = true
    }
  }, [open, rows])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && rows === null) setLoadError(null)
    if (!next) setQuery('')
  }

  const goToEpisode = (ref: number) => {
    navigate(`/episode/${ref}`)
    handleOpenChange(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="relative h-11 min-h-11 w-full justify-start gap-2.5 px-4 font-body text-base text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={SEARCH_PLACEHOLDER}
      >
        <Search className="size-5 shrink-0 opacity-70" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left">{SEARCH_PLACEHOLDER}</span>
        <kbd className="pointer-events-none ml-auto hidden shrink-0 font-mono text-[11px] text-muted-foreground opacity-80 sm:inline">
          {kbdHint}
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search episodes"
        description="Search by title, playlist, or transcript"
        showCloseButton
        className="sm:max-w-xl"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={SEARCH_PLACEHOLDER}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading ? (
              <div className="py-8 text-center font-body text-muted-foreground text-sm">
                Loading catalog…
              </div>
            ) : null}
            {loadError ? (
              <div className="px-2 py-6 text-center font-body text-destructive text-sm">
                {loadError}
              </div>
            ) : null}
            {!loading && !loadError && rows && !query.trim() ? (
              <div className="py-6 text-center font-body text-muted-foreground text-sm">
                Type to search episode titles, playlist tracks, or transcript
                text.
              </div>
            ) : null}
            {!loading &&
            !loadError &&
            rows &&
            query.trim() &&
            filtered.length === 0 ? (
              <CommandEmpty className="font-body">
                No episodes match.
              </CommandEmpty>
            ) : null}
            {!loading && !loadError && query.trim() && filtered.length > 0 ? (
              <CommandGroup heading="Episodes">
                {filtered.map((row) => (
                  <CommandItem
                    key={row.ref}
                    value={`${row.ref} ${row.label} ${row.subtitle ?? ''} ${formatMatchZones(row.matchZones)}`}
                    onSelect={() => goToEpisode(row.ref)}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-display text-foreground text-xs leading-snug">
                        {row.label}
                      </span>
                      {row.subtitle ? (
                        <span className="truncate font-body text-[13px] text-muted-foreground">
                          {row.subtitle}
                        </span>
                      ) : null}
                      <span className="font-body text-[11px] text-muted-foreground/90 leading-snug">
                        Found in:{' '}
                        {formatMatchZones(row.matchZones) || '—'}
                      </span>
                      {row.playlistSnippet ? (
                        <span className="line-clamp-2 font-body text-[11px] text-primary/85 leading-snug">
                          <span className="text-muted-foreground">Playlist:</span>{' '}
                          {row.playlistSnippet}
                        </span>
                      ) : null}
                      {row.transcriptSnippet ? (
                        <span className="line-clamp-2 font-body text-[11px] text-primary/85 leading-snug">
                          <span className="text-muted-foreground">Transcript:</span>{' '}
                          {row.transcriptSnippet}
                        </span>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
