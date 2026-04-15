import { config } from 'dotenv'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  config({ path: join(webRoot, name), override: true })
}

await import('./generate-seo-artifacts.ts')
