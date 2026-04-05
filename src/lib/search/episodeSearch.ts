import type { Episode, PlaylistTrack } from '@/lib/api/episodes'
import type { Json } from '@/lib/database.types'

/** Where query tokens matched for this episode (used for result hints). */
export type SearchMatchZone = 'details' | 'transcript' | 'playlist'

export type EpisodeSearchRow = {
  ref: number
  label: string
  subtitle: string | null
  haystack: string
  detailsHaystack: string
  transcriptHaystack: string
  playlistHaystack: string
  /** Original transcript lines (for snippets). */
  transcriptLines: string[]
  /** Playlist rows as shown on the episode page (for snippets). */
  playlistLines: string[]
}

export type EpisodeSearchMatch = EpisodeSearchRow & {
  matchZones: SearchMatchZone[]
  /** First transcript line that matched a query token, when Transcript is among zones. */
  transcriptSnippet: string | null
  /** First playlist row that matched a query token, when Playlist is among zones. */
  playlistSnippet: string | null
}

export function transcriptTextLines(transcript: Json | null): string[] {
  if (!transcript || !Array.isArray(transcript)) return []
  const parts: string[] = []
  for (const line of transcript) {
    if (line && typeof line === 'object' && line !== null && 'text' in line) {
      const t = (line as { text?: unknown }).text
      if (typeof t === 'string' && t.length > 0) parts.push(t)
    }
  }
  return parts
}

export function transcriptPlainText(transcript: Json | null): string {
  return transcriptTextLines(transcript).join(' ')
}

export function buildEpisodeSearchIndex(
  episodes: Episode[],
  tracks: PlaylistTrack[],
): EpisodeSearchRow[] {
  const playlistTextByRef = new Map<number, string[]>()
  const playlistDisplayByRef = new Map<number, string[]>()
  for (const t of tracks) {
    const parts = [t.track_title, t.artist, t.year].filter(
      (s): s is string => typeof s === 'string' && s.length > 0,
    )
    if (parts.length === 0) continue
    const chunk = parts.join(' ')
    const display = parts.join(' · ')
    const list = playlistTextByRef.get(t.ref) ?? []
    list.push(chunk)
    playlistTextByRef.set(t.ref, list)
    const dlist = playlistDisplayByRef.get(t.ref) ?? []
    dlist.push(display)
    playlistDisplayByRef.set(t.ref, dlist)
  }

  return episodes.map((ep) => {
    const tLines = transcriptTextLines(ep.transcript)
    const detailsHaystack = [
      ep.episode_label ?? '',
      ep.subtitle ?? '',
      ep.notes ?? '',
    ]
      .join(' ')
      .toLowerCase()
    const transcriptHaystack = tLines.join(' ').toLowerCase()
    const playlistHaystack = (playlistTextByRef.get(ep.ref) ?? [])
      .join(' ')
      .toLowerCase()
    const haystack = [detailsHaystack, transcriptHaystack, playlistHaystack].join(
      ' ',
    )
    return {
      ref: ep.ref,
      label: ep.episode_label ?? `Episode ${ep.ref}`,
      subtitle: ep.subtitle,
      haystack,
      detailsHaystack,
      transcriptHaystack,
      playlistHaystack,
      transcriptLines: tLines,
      playlistLines: playlistDisplayByRef.get(ep.ref) ?? [],
    }
  })
}

function matchZonesForTokens(
  tokens: string[],
  row: EpisodeSearchRow,
): SearchMatchZone[] {
  const zones: SearchMatchZone[] = []
  if (tokens.some((t) => row.detailsHaystack.includes(t))) zones.push('details')
  if (tokens.some((t) => row.transcriptHaystack.includes(t)))
    zones.push('transcript')
  if (tokens.some((t) => row.playlistHaystack.includes(t))) zones.push('playlist')
  return zones
}

const ZONE_LABEL: Record<SearchMatchZone, string> = {
  details: 'Episode',
  transcript: 'Transcript',
  playlist: 'Playlist',
}

export function formatMatchZones(zones: SearchMatchZone[]): string {
  if (zones.length === 0) return ''
  return zones.map((z) => ZONE_LABEL[z]).join(' · ')
}

const SNIPPET_MAX = 140

function truncateSnippet(s: string): string {
  const t = s.trim()
  if (t.length <= SNIPPET_MAX) return t
  return `${t.slice(0, SNIPPET_MAX - 1).trimEnd()}…`
}

/** First line where any query token appears (case-insensitive). */
function firstMatchingLine(lines: string[], tokens: string[]): string | null {
  for (const line of lines) {
    const low = line.toLowerCase()
    if (tokens.some((tok) => low.includes(tok)))
      return truncateSnippet(line)
  }
  return null
}

export function filterEpisodeSearch(
  rows: EpisodeSearchRow[],
  query: string,
): EpisodeSearchMatch[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length === 0) return []
  return rows
    .filter((row) => tokens.every((t) => row.haystack.includes(t)))
    .map((row) => {
      const matchZones = matchZonesForTokens(tokens, row)
      return {
        ...row,
        matchZones,
        transcriptSnippet: matchZones.includes('transcript')
          ? firstMatchingLine(row.transcriptLines, tokens)
          : null,
        playlistSnippet: matchZones.includes('playlist')
          ? firstMatchingLine(row.playlistLines, tokens)
          : null,
      }
    })
}
