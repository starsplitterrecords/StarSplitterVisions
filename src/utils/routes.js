export function buildSeriesPath(seriesSlug) {
  return `/series/${seriesSlug}`
}

export function buildReaderPath(seriesSlug, pageNumber = 1) {
  const safePage = Math.max(Number(pageNumber) || 1, 1)
  return `/read/${seriesSlug}/${safePage}`
}

export function parseReaderPath(pathname) {
  const match = String(pathname || '').match(/^\/read\/([^/]+)\/(\d+)\/?$/)

  if (!match) {
    return null
  }

  return {
    seriesSlug: match[1],
    pageNumber: Math.max(Number(match[2]) || 1, 1),
  }
}

export function clampPageNumber(pageNumber, pageCount) {
  const maxPage = Math.max(Number(pageCount) || 1, 1)
  const requestedPage = Math.max(Number(pageNumber) || 1, 1)
  return Math.min(requestedPage, maxPage)
}
