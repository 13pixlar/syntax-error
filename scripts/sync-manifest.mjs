/**
 * Post-build: copy dist/audio/manifest.json to the persistent audio directory
 * (../audio/ relative to the project root) so it survives future rebuilds.
 * Runs silently if the persistent audio directory does not exist yet.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(projectRoot, 'dist', 'audio', 'manifest.json')
const destDir = join(projectRoot, 'audio')
const dest = join(destDir, 'manifest.json')

if (!existsSync(src)) {
  console.log('sync-manifest: dist/audio/manifest.json not found, skipping.')
  process.exit(0)
}

if (!existsSync(destDir)) {
  console.log(`sync-manifest: ${destDir} does not exist, skipping.`)
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
cpSync(src, dest)
console.log(`sync-manifest: copied manifest.json → ${dest}`)
