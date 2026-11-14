import assert from 'node:assert/strict'
import test from 'node:test'
import { getEasternDateString, getLatestReleasedPage, getReleasedItems, getReleasedPages } from '../src/utils/dailyPages.js'

const pages = [
  { pageNumber: 1, releaseDate: '2026-11-14', image: '/images/pages/fod/strip-001.jpg', publicationState: 'published' },
  { pageNumber: 2, releaseDate: '2026-11-15', image: '/images/pages/fod/strip-002.jpg', publicationState: 'scheduled' },
  { pageNumber: 3, releaseDate: '2026-11-13', image: '/images/pages/fod/strip-003.jpg', publicationState: 'draft' },
  { pageNumber: 4, releaseDate: '2026-11-12', image: '/images/pages/fod/strip-004.jpg', publicationState: 'hidden' },
  { pageNumber: 5, releaseDate: '2026-11-14', image: '/images/pages/fod/strip-005.jpg' },
  { pageNumber: 6, image: '/images/pages/fod/strip-006.jpg' },
  { pageNumber: 7, releaseDate: '2026-11-12', publicationState: 'published' },
]

test('only due and non-draft daily strips are visible', () => {
  assert.deepEqual(getReleasedPages(pages, '2026-11-14').map((page) => page.pageNumber), [1, 5])
})

test('scheduled strip becomes visible on its Eastern release date', () => {
  assert.deepEqual(getReleasedPages(pages, '2026-11-15').map((page) => page.pageNumber), [1, 2, 5])
})

test('draft and hidden never become visible just because their date passed', () => {
  assert.deepEqual(getReleasedPages(pages, '2027-01-01').map((page) => page.pageNumber), [1, 2, 5])
})

test('the latest strip is the latest released sequence number', () => {
  assert.equal(getLatestReleasedPage(pages, '2026-11-14').pageNumber, 5)
})

test('missing date and missing artwork do not publish', () => {
  assert.equal(getReleasedPages(pages, '2027-01-01').some((page) => page.pageNumber >= 6), false)
})

test('general released items filter drafts and future items', () => {
  const items = [
    { title: 'draft', publicationState: 'draft', releaseDate: '2026-01-01' },
    { title: 'future', publicationState: 'scheduled', releaseDate: '2026-12-01' },
    { title: 'visible', releaseDate: '2026-11-14' },
  ]
  assert.deepEqual(getReleasedItems(items, '2026-11-14').map((item) => item.title), ['visible'])
})

test('New York release day changes after midnight, not UTC midnight', () => {
  assert.equal(getEasternDateString(new Date('2026-11-15T02:00:00Z')), '2026-11-14')
  assert.equal(getEasternDateString(new Date('2026-11-15T05:01:00Z')), '2026-11-15')
})
