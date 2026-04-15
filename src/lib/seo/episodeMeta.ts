import type { Episode } from '@/lib/api/episodes'

export function episodeSeoTitle(ep: Episode): string {
  const label = ep.episode_label ?? `Episode ${ep.ref}`
  if (ep.subtitle?.trim()) return `${label}: ${ep.subtitle.trim()}`
  return `${label} — Syntax Error`
}

export function episodeSeoDescription(ep: Episode): string {
  const bits: string[] = []
  if (ep.subtitle?.trim()) bits.push(ep.subtitle.trim())
  if (ep.air_date) bits.push(`Aired ${ep.air_date}`)
  bits.push(
    'Stream the full episode and playlist in this Syntax Error archive — 8-bit and 16-bit SID and chiptune radio.',
  )
  return bits.join(' · ')
}
