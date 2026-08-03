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

export const orderArtists = (artists) => [...artists].sort((left, right) => {
  if (left.slug === 'jeff-hines') return -1
  if (right.slug === 'jeff-hines') return 1
  if (left.featured !== right.featured) return left.featured ? -1 : 1
  return left.name.localeCompare(right.name, 'en', { sensitivity: 'base' })
})

export const publicArtistsAt = (artists, now = new Date()) => artists.map((artist) => ({
  ...artist,
  releases: (artist.releases || []).filter((release) => isReleasePublic(release, now)),
}))

export const rosterArtists = (artists) => artists.filter((artist) => artist.status !== 'archived')

export const publicReleaseKeys = (artists) => new Set(artists.flatMap((artist) =>
  (artist.releases || []).map((release) => `${artist.slug}/${release.slug}`)))
