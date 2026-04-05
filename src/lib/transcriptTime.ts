import type { Json } from '@/lib/database.types'

export type TranscriptLine = { time_label: string; text: string }

/** Parse site-style labels like `0:23`, `2:56`, or `1:05:30` into seconds. */
export function parseTimeLabelToSeconds(label: string): number | null {
  const s = label.trim()
  if (!s) return null
  const parts = s.split(':').map((p) => p.trim())
  if (parts.length < 2 || parts.length > 3) return null
  const nums = parts.map((p) => Number.parseInt(p, 10))
  if (nums.some((n) => Number.isNaN(n) || n < 0)) return null
  if (parts.length === 2) {
    const [a, b] = nums
    return a * 60 + b
  }
  const [h, m, sec] = nums
  return h * 3600 + m * 60 + sec
}

export function normalizeTranscriptLines(transcript: Json | null): TranscriptLine[] {
  if (!transcript || !Array.isArray(transcript)) return []
  const out: TranscriptLine[] = []
  for (const line of transcript) {
    if (!line || typeof line !== 'object') continue
    const rec = line as { time_label?: unknown; text?: unknown }
    if (typeof rec.time_label !== 'string' || typeof rec.text !== 'string') continue
    out.push({ time_label: rec.time_label, text: rec.text })
  }
  return out
}
