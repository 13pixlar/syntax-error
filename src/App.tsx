import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { Layout } from '@/components/Layout'
import { AudioPlayerProvider } from '@/lib/audio/AudioPlayerContext'
import { EpisodePage } from '@/pages/EpisodePage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { GameEpisodesPage } from '@/pages/GameEpisodesPage'
import { GamesIndexPage } from '@/pages/GamesIndexPage'
import { AboutPage } from '@/pages/AboutPage'
import { HomePage } from '@/pages/HomePage'

/** Remount when `:ref` changes so episode state resets without effect setState. */
function EpisodeRoute() {
  const { ref } = useParams()
  return <EpisodePage key={ref} />
}

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <AudioPlayerProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/games" element={<GamesIndexPage />} />
            <Route path="/games/:gameName" element={<GameEpisodesPage />} />
            <Route path="/episode/:ref" element={<EpisodeRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AudioPlayerProvider>
    </BrowserRouter>
  )
}
