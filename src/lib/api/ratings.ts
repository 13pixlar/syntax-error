import { supabase } from '@/lib/supabaseClient'

export type EpisodeRatingStat = {
  ref: number
  avg_rating: number
  rating_count: number
}

/** Aggregates from `episode_rating_stats` view (one row per ref that has at least one rating). */
export async function fetchEpisodeRatingStats(): Promise<
  Map<number, EpisodeRatingStat>
> {
  const { data, error } = await supabase
    .from('episode_rating_stats')
    .select('ref, avg_rating, rating_count')

  if (error) throw error
  const map = new Map<number, EpisodeRatingStat>()
  for (const row of data ?? []) {
    const ref = row.ref
    const avg = row.avg_rating
    const count = row.rating_count
    if (
      ref == null ||
      avg == null ||
      count == null ||
      !Number.isFinite(ref)
    ) {
      continue
    }
    map.set(ref, {
      ref,
      avg_rating: avg,
      rating_count: Number(count),
    })
  }
  return map
}

export async function upsertEpisodeRating(
  ref: number,
  rating: number,
  clientId: string,
): Promise<void> {
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error('Rating must be an integer from 1 to 5')
  }
  const { error } = await supabase.from('episode_ratings').upsert(
    {
      ref,
      client_id: clientId,
      rating,
    },
    { onConflict: 'ref,client_id' },
  )

  if (error) throw error
}

export async function fetchMyRatingForRef(
  ref: number,
  clientId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('episode_ratings')
    .select('rating')
    .eq('ref', ref)
    .eq('client_id', clientId)
    .maybeSingle()

  if (error) throw error
  const r = data?.rating
  if (r == null) return null
  return typeof r === 'number' ? r : null
}

/** Stats for a single ref after submit (view is cheap). */
export async function fetchRatingStatForRef(
  ref: number,
): Promise<EpisodeRatingStat | null> {
  const { data, error } = await supabase
    .from('episode_rating_stats')
    .select('ref, avg_rating, rating_count')
    .eq('ref', ref)
    .maybeSingle()

  if (error) throw error
  if (
    !data ||
    data.ref == null ||
    data.avg_rating == null ||
    data.rating_count == null
  ) {
    return null
  }
  return {
    ref: data.ref,
    avg_rating: data.avg_rating,
    rating_count: Number(data.rating_count),
  }
}
