import { supabase } from '@/lib/supabaseClient'
import type { Tables } from '@/lib/database.types'

export type Episode = Tables<'episodes'>
export type PlaylistTrack = Tables<'playlist_tracks'>

export async function fetchEpisodes(): Promise<Episode[]> {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .order('ref', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchEpisodeByRef(ref: number): Promise<Episode | null> {
  const { data, error } = await supabase
    .from('episodes')
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
    .from('episodes')
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
    .from('playlist_tracks')
    .select('*')
    .eq('ref', ref)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchAllPlaylistTracks(): Promise<PlaylistTrack[]> {
  const { data, error } = await supabase
    .from('playlist_tracks')
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
    .from('episodes')
    .select('*')
    .contains('featured_games', [gameName])
    .order('ref', { ascending: true })

  if (error) throw error
  return data ?? []
}
