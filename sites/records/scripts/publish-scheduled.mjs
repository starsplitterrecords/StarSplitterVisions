import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isReleasePublic, releaseVisibility, scheduledReleaseKey } from './publishing.mjs'

const recordsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const artistsRoot = path.join(recordsRoot, 'content', 'artists')
const statePath = path.join(recordsRoot, '.published-schedule.json')
const now = new Date()
const state = JSON.parse(await readFile(statePath, 'utf8'))
const completed = new Set(state.completed || [])
const files = (await readdir(artistsRoot)).filter((file) => file.endsWith('.json')).sort()

for (const file of files) {
  const artist = JSON.parse(await readFile(path.join(artistsRoot, file), 'utf8'))
  for (const release of artist.releases || []) {
    if (releaseVisibility(release) !== 'scheduled' || !isReleasePublic(release, now)) continue
    completed.add(scheduledReleaseKey(artist.slug, release))
  }
}

const next = `${JSON.stringify({ completed: [...completed].sort() }, null, 2)}\n`
const current = `${JSON.stringify(state, null, 2)}\n`
if (next !== current) {
  await writeFile(statePath, next)
  console.log('Recorded newly due scheduled releases.')
} else {
  console.log('No newly due scheduled releases.')
}
