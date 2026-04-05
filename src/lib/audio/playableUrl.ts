/** Extensions Howler / browser audio can usually decode. */
const PLAYABLE = /\.(mp3|ogg|oga|opus|wav|m4a|aac|flac)(\?|#|$)/i

export function isProbablyPlayableUrl(url: string): boolean {
  const t = url.trim()
  if (!t) return false
  try {
    const path = new URL(t).pathname
    return PLAYABLE.test(path)
  } catch {
    return PLAYABLE.test(t)
  }
}
