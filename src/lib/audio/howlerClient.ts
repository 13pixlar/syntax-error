/**
 * howler's published bundle is IIFE; side-effect import registers `Howl` on `globalThis`.
 * We read the constructor after load (same pattern as with a vendored copy).
 */
import 'howler'
import type { Howl as HowlInstance, HowlOptions } from 'howler'

type HowlConstructor = new (options: HowlOptions) => HowlInstance

export function getHowlConstructor(): HowlConstructor {
  const H = (globalThis as unknown as { Howl?: HowlConstructor }).Howl
  if (!H) {
    throw new Error('howler.js did not expose Howl on globalThis')
  }
  return H
}

export type { HowlInstance as Howl }
