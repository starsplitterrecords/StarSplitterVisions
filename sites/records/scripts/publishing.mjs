export const releaseVisibility = (release) => release.visibility || 'published'

export const isReleasePublic = (release, now = new Date()) => {
  const visibility = releaseVisibility(release)
  if (visibility === 'hidden') return false
  if (visibility === 'published') return true
  if (visibility !== 'scheduled' || !release.publishAt) return false
  return Date.parse(release.publishAt) <= now.getTime()
}

export const scheduledReleaseKey = (artistSlug, release) =>
  `${artistSlug}/${release.slug}@${release.publishAt}`

const initialRosterCategories = new Map([
  ['jeff-hines', 1],
  ['ion-drive-orchestra', 2],
  ['minor-collapse', 2],
  ['phase-redux', 2],
  ['pulse-width-codex', 2],
  ['star-splitter-rex', 2],
])

export const rosterCategory = (artist) => {
  const explicitCategory = Number(artist.category)
  if (Number.isInteger(explicitCategory) && explicitCategory > 0) return explicitCategory
  return initialRosterCategories.get(artist.slug) || 3
}

export const orderArtists = (artists) => [...artists].sort((left, right) => {
  const categoryDifference = rosterCategory(left) - rosterCategory(right)
  if (categoryDifference !== 0) return categoryDifference
  return left.name.localeCompare(right.name, 'en', { sensitivity: 'base' })
})

export const publicArtistsAt = (artists, now = new Date()) => artists.map((artist) => ({
  ...artist,
  releases: (artist.releases || []).filter((release) => isReleasePublic(release, now)),
}))

export const rosterArtists = (artists) => artists.filter((artist) => artist.status !== 'archived')

export const publicReleaseKeys = (artists) => new Set(artists.flatMap((artist) =>
  (artist.releases || []).map((release) => `${artist.slug}/${release.slug}`)))
