import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  getFavoritesStorageKey,
  readFavoriteRefs,
  writeFavoriteRefs,
} from '@/lib/favoritesStorage'

export function useFavoriteRefs() {
  const [refs, setRefs] = useState<number[]>(() => readFavoriteRefs())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== getFavoritesStorageKey()) return
      setRefs(readFavoriteRefs())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: number[]) => {
    writeFavoriteRefs(next)
    setRefs(readFavoriteRefs())
  }, [])

  const setOrder = useCallback(
    (ordered: number[]) => {
      persist(ordered)
    },
    [persist],
  )

  const toggle = useCallback(
    (ref: number) => {
      if (!Number.isInteger(ref) || ref <= 0) return
      const next = refs.includes(ref)
        ? refs.filter((r) => r !== ref)
        : [...refs, ref]
      persist(next)
    },
    [refs, persist],
  )

  const remove = useCallback(
    (ref: number) => {
      persist(refs.filter((r) => r !== ref))
    },
    [refs, persist],
  )

  const isFavorite = useCallback(
    (ref: number) => refs.includes(ref),
    [refs],
  )

  const move = useCallback(
    (ref: number, direction: 'up' | 'down') => {
      const i = refs.indexOf(ref)
      if (i < 0) return
      const j = direction === 'up' ? i - 1 : i + 1
      if (j < 0 || j >= refs.length) return
      const next = [...refs]
      ;[next[i], next[j]] = [next[j], next[i]]
      persist(next)
    },
    [refs, persist],
  )

  const value = useMemo(
    () => ({
      refs,
      setOrder,
      toggle,
      remove,
      isFavorite,
      move,
    }),
    [refs, setOrder, toggle, remove, isFavorite, move],
  )

  return value
}
