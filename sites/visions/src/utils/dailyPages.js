export function getReleasedPages(pages = [], todayString = new Date().toISOString().slice(0, 10)) {
  return pages
    .filter((page) => !page.releaseDate || page.releaseDate <= todayString)
    .sort((a, b) => a.pageNumber - b.pageNumber)
}

export function getEasternDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function getReleasedItems(items = [], todayString = getEasternDateString()) {
  return items
    .filter((item) => !item.releaseDate || item.releaseDate <= todayString)
    .sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''))
}

export function getLatestReleasedPage(pages = [], todayString = new Date().toISOString().slice(0, 10)) {
  const releasedPages = getReleasedPages(pages, todayString)
  return releasedPages[releasedPages.length - 1] || null
}
