import { supabase } from '@/lib/supabaseClient'

export type Comment = {
  id: string
  episode_ref: number
  parent_id: string | null
  author_display_name: string
  body: string
  created_at: string
  replies: Comment[]
}

type RawComment = Omit<Comment, 'replies'>

function buildTree(rows: RawComment[]): Comment[] {
  const byId = new Map<string, Comment>()
  for (const row of rows) byId.set(row.id, { ...row, replies: [] })

  const roots: Comment[] = []
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

export async function fetchCommentsForEpisode(episodeRef: number): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('episode_comments')
    .select('id, episode_ref, parent_id, author_display_name, body, created_at')
    .eq('episode_ref', episodeRef)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return buildTree((data ?? []) as RawComment[])
}

export async function createComment(params: {
  episodeRef: number
  parentId: string | null
  authorDisplayName: string
  body: string
}): Promise<Comment> {
  const { data, error } = await supabase
    .from('episode_comments')
    .insert({
      episode_ref: params.episodeRef,
      parent_id: params.parentId ?? undefined,
      author_display_name: params.authorDisplayName.trim(),
      body: params.body.trim(),
    })
    .select('id, episode_ref, parent_id, author_display_name, body, created_at')
    .single()

  if (error) throw new Error(error.message)
  return { ...(data as RawComment), replies: [] }
}
