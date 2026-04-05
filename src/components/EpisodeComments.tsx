import { useEffect, useRef, useState } from 'react'
import { MessageSquare, CornerDownRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type Comment, createComment, fetchCommentsForEpisode } from '@/lib/api/comments'

const STORAGE_KEY = 'syntax-error-comment-username'
const MAX_DEPTH = 4

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function getSavedName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveName(name: string) {
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch { /* ignore */ }
}

// ── comment form ─────────────────────────────────────────────────────────────

type CommentFormProps = {
  episodeRef: number
  parentId: string | null
  onSubmitted: (comment: Comment) => void
  onCancel?: () => void
  compact?: boolean
}

function CommentForm({ episodeRef, parentId, onSubmitted, onCancel, compact }: CommentFormProps) {
  const [name, setName] = useState(getSavedName)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (compact) bodyRef.current?.focus()
  }, [compact])

  const canSubmit = name.trim().length > 0 && body.trim().length > 0 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const saved = await createComment({
        episodeRef,
        parentId,
        authorDisplayName: name.trim(),
        body: body.trim(),
      })
      saveName(name.trim())
      setBody('')
      onSubmitted(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        type="text"
        placeholder="Display name"
        value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)}
        maxLength={64}
        required
        className="font-body"
        aria-label="Display name"
      />
      <Textarea
        ref={bodyRef}
        placeholder={compact ? 'Write a reply…' : 'Write a comment…'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={4000}
        required
        className="font-body min-h-20"
        aria-label="Comment body"
      />
      {error ? (
        <p className="font-body text-destructive text-xs">{error}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {submitting ? 'Posting…' : compact ? 'Reply' : 'Post comment'}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

// ── single comment node ───────────────────────────────────────────────────────

type CommentNodeProps = {
  comment: Comment
  episodeRef: number
  depth: number
  onNewComment: (comment: Comment) => void
}

function CommentNode({ comment, episodeRef, depth, onNewComment }: CommentNodeProps) {
  const [replying, setReplying] = useState(false)

  function handleReplySubmitted(newComment: Comment) {
    onNewComment(newComment)
    setReplying(false)
  }

  return (
    <div className={depth > 0 ? 'border-l border-border/50 pl-4' : ''}>
      <div className="flex flex-col gap-1 py-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-body font-semibold text-primary text-sm">
            {comment.author_display_name}
          </span>
          <span className="font-mono text-muted-foreground text-xs">
            {formatDate(comment.created_at)}
          </span>
        </div>
        <p className="font-body text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {comment.body}
        </p>
        {depth < MAX_DEPTH ? (
          <div>
            {replying ? null : (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="mt-1 h-auto gap-1 px-1 py-0.5 font-body text-muted-foreground text-xs hover:text-primary"
                onClick={() => setReplying(true)}
              >
                <CornerDownRight className="size-3" aria-hidden />
                Reply
              </Button>
            )}
            {replying ? (
              <div className="mt-2">
                <CommentForm
                  episodeRef={episodeRef}
                  parentId={comment.id}
                  onSubmitted={handleReplySubmitted}
                  onCancel={() => setReplying(false)}
                  compact
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {comment.replies.length > 0 ? (
        <div className="flex flex-col">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              episodeRef={episodeRef}
              depth={depth + 1}
              onNewComment={onNewComment}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ── public component ──────────────────────────────────────────────────────────

type EpisodeCommentsProps = {
  episodeRef: number
}

export function EpisodeComments({ episodeRef }: EpisodeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    fetchCommentsForEpisode(episodeRef)
      .then((tree) => { if (!cancelled) { setComments(tree); setLoading(false) } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Failed to load comments.')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [episodeRef])

  function insertComment(newComment: Comment) {
    setComments((prev) => {
      if (!newComment.parent_id) return [...prev, newComment]

      function insertInto(list: Comment[]): Comment[] {
        return list.map((c) => {
          if (c.id === newComment.parent_id) {
            return { ...c, replies: [...c.replies, newComment] }
          }
          if (c.replies.length > 0) {
            return { ...c, replies: insertInto(c.replies) }
          }
          return c
        })
      }

      return insertInto(prev)
    })
  }

  const totalCount = countComments(comments)

  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <MessageSquare className="size-4 text-primary" aria-hidden />
          Comments
          {!loading && totalCount > 0 ? (
            <span className="font-mono text-muted-foreground text-sm font-normal">
              ({totalCount})
            </span>
          ) : null}
        </CardTitle>
        <CardDescription className="font-body text-base">
          Leave a comment — no account needed. Be kind.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <CommentForm
          episodeRef={episodeRef}
          parentId={null}
          onSubmitted={insertComment}
        />

        <div className="border-t border-border/40 pt-2">
          {loading ? (
            <div className="flex flex-col gap-4 py-2">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="ml-4 h-12 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          ) : fetchError ? (
            <p className="font-body text-destructive text-sm">{fetchError}</p>
          ) : comments.length === 0 ? (
            <p className="font-body text-muted-foreground text-sm">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {comments.map((comment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  episodeRef={episodeRef}
                  depth={0}
                  onNewComment={insertComment}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function countComments(list: Comment[]): number {
  return list.reduce((acc, c) => acc + 1 + countComments(c.replies), 0)
}
