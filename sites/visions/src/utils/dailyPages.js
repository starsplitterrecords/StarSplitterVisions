export function getEasternDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return value.year + '-' + value.month + '-' + value.day
}

function isVisible(item, todayString) {
  if (!item || ['draft', 'hidden'].includes(item.publicationState)) return false
  // For daily comics a release date is mandatory. Missing dates never go live by accident.
  return typeof item.releaseDate === 'string' && item.releaseDate.length === 10 && item.releaseDate <= todayString
}

export function getReleasedPages(pages = [], todayString = getEasternDateString()) {
  return pages
    .filter((page) => isVisible(page, todayString) && typeof page.image === 'string' && page.image.length > 0)
    .sort((a, b) => a.pageNumber - b.pageNumber)
}

export function getReleasedItems(items = [], todayString = getEasternDateString()) {
  return items
    .filter((item) => item && !['draft', 'hidden'].includes(item.publicationState) && (!item.releaseDate || item.releaseDate <= todayString))
    .sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''))
}

export function getLatestReleasedPage(pages = [], todayString = getEasternDateString()) {
  const releasedPages = getReleasedPages(pages, todayString)
  return releasedPages[releasedPages.length - 1] || null
}
