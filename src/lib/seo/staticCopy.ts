/** Shared SEO titles and descriptions (also imported by the post-build prerender script). */
export const SEO = {
  home: {
    title: 'Syntax Error — episode archive & player',
    description:
      'Browse every Syntax Error radio episode: 8-bit and 16-bit SID, chiptune, and game music from P3. Stream full-show MP3s, playlists, and explore by game.',
  },
  about: {
    title: 'About — Syntax Error archive',
    description:
      'What this unofficial Syntax Error episode archive is: retro-styled player, Supabase-backed catalog, external audio URLs, and credits.',
  },
  favorites: {
    title: 'Favorites — Syntax Error',
    description:
      'Your starred Syntax Error episodes in one place. Queue full-show MP3s as a playlist from the browser.',
  },
  gamesIndex: {
    title: 'Browse by game — Syntax Error',
    description:
      'Find Syntax Error episodes by featured game title. Chiptune and SID radio playlist metadata from the archive.',
  },
} as const

export function gamePageCopy(
  gameName: string,
  episodeCount: number,
): { title: string; description: string } {
  const c = episodeCount === 1 ? '1 episode' : `${episodeCount} episodes`
  return {
    title: `${gameName} — Syntax Error episodes`,
    description: `${c} in the Syntax Error archive feature “${gameName}” in the playlist. Stream and browse chiptune radio episodes.`,
  }
}

/** Before episode count is known (loading / error states). */
export function gamePageLoadingCopy(gameName: string): {
  title: string
  description: string
} {
  return {
    title: `${gameName} — Syntax Error episodes`,
    description: `Episodes featuring “${gameName}” in the Syntax Error radio archive — chiptune and SID playlists.`,
  }
}
