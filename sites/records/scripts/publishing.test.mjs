import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isReleasePublic,
  orderArtists,
  publicArtistsAt,
  publicReleaseKeys,
  releaseVisibility,
  rosterArtists,
  scheduledReleaseKey,
} from './publishing.mjs'

const scheduled = { slug: 'scheduled', visibility: 'scheduled', publishAt: '2026-08-15T09:00:00-04:00' }

test('legacy releases default to published', () => {
  assert.equal(releaseVisibility({}), 'published')
  assert.equal(isReleasePublic({}), true)
})

test('hidden and scheduled releases remain private until allowed', () => {
  assert.equal(isReleasePublic({ visibility: 'hidden' }), false)
  assert.equal(isReleasePublic(scheduled, new Date('2026-08-15T12:59:59Z')), false)
  assert.equal(isReleasePublic(scheduled, new Date('2026-08-15T13:00:00Z')), true)
})

test('public catalog omits private releases without leaking their paths', () => {
  const artists = publicArtistsAt([{ slug: 'artist', releases: [{ slug: 'live' }, { slug: 'hidden', visibility: 'hidden' }, scheduled] }], new Date('2026-08-15T12:00:00Z'))
  assert.deepEqual(artists[0].releases.map((release) => release.slug), ['live'])
  assert.deepEqual([...publicReleaseKeys(artists)], ['artist/live'])
})

test('roster keeps Jeff first, then featured A-Z, then active A-Z, without archived artists', () => {
  const ordered = orderArtists([
    { name: 'Zulu', slug: 'zulu', status: 'active', featured: false },
    { name: 'Beta', slug: 'beta', status: 'active', featured: true },
    { name: 'Jeff Hines', slug: 'jeff-hines', status: 'active', featured: false },
    { name: 'Alpha', slug: 'alpha', status: 'active', featured: true },
    { name: 'Archived', slug: 'archived', status: 'archived', featured: true },
    { name: 'Able', slug: 'able', status: 'active', featured: false },
  ])
  assert.deepEqual(rosterArtists(ordered).map((artist) => artist.slug), ['jeff-hines', 'alpha', 'beta', 'able', 'zulu'])
})

test('scheduled release keys include the publication time', () => {
  assert.equal(scheduledReleaseKey('artist', scheduled), 'artist/scheduled@2026-08-15T09:00:00-04:00')
})
