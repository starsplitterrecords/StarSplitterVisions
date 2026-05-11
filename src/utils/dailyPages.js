export function getReleasedPages(pages = [], todayString = new Date().toISOString().slice(0, 10)) {
  return pages
    .filter((page) => !page.releaseDate || page.releaseDate <= todayString)
    .sort((a, b) => a.pageNumber - b.pageNumber)
}

export function getLatestReleasedPage(pages = [], todayString = new Date().toISOString().slice(0, 10)) {
  const releasedPages = getReleasedPages(pages, todayString)
  return releasedPages[releasedPages.length - 1] || null
}
