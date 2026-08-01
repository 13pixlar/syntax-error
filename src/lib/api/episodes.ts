import { supabase } from '@/lib/supabaseClient'
import { TABLES } from '@/lib/supabaseTables'
import type { Tables } from '@/lib/database.types'

export type Episode = Tables<'syntax_error_episodes'>
export type PlaylistTrack = Tables<'syntax_error_playlist_tracks'>

export async function fetchEpisodes(): Promise<Episode[]> {
  const { data, error } = await supabase
    .from(TABLES.episodes)
    .select('*')
    .order('ref', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchEpisodeByRef(ref: number): Promise<Episode | null> {
  const { data, error } = await supabase
    .from(TABLES.episodes)
    .select('*')
    .eq('ref', ref)
    .maybeSingle()

  if (error) throw error
  return data
}

/** Returns episodes for the given refs, sorted to match `refs` order (missing refs omitted). */
export async function fetchEpisodesByRefs(refs: number[]): Promise<Episode[]> {
  if (refs.length === 0) return []
  const { data, error } = await supabase
    .from(TABLES.episodes)
    .select('*')
    .in('ref', refs)

  if (error) throw error
  const rows = data ?? []
  const byRef = new Map(rows.map((e) => [e.ref, e]))
  const ordered: Episode[] = []
  for (const ref of refs) {
    const ep = byRef.get(ref)
    if (ep) ordered.push(ep)
  }
  return ordered
}

export async function fetchPlaylistForRef(
  ref: number,
): Promise<PlaylistTrack[]> {
  const { data, error } = await supabase
    .from(TABLES.playlistTracks)
    .select('*')
    .eq('ref', ref)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchAllPlaylistTracks(): Promise<PlaylistTrack[]> {
  const { data, error } = await supabase
    .from(TABLES.playlistTracks)
    .select('*')
    .order('ref', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

/** Episodes whose `featured_games` array contains this exact display string. */
export async function fetchEpisodesByFeaturedGame(
  gameName: string,
): Promise<Episode[]> {
  const { data, error } = await supabase
    .from(TABLES.episodes)
    .select('*')
    .contains('featured_games', [gameName])
    .order('ref', { ascending: true })

  if (error) throw error
  return data ?? []
}
