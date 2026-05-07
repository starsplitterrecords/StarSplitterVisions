export function buildDailyPages({ count, startDate, imagePathBase }) {
  return Array.from({ length: count }, (_, index) => {
    const pageNumber = index + 1
    const releaseDate = new Date(`${startDate}T00:00:00.000Z`)
    releaseDate.setUTCDate(releaseDate.getUTCDate() + index)

    return {
      pageNumber,
      releaseDate: releaseDate.toISOString().slice(0, 10),
      image: `${imagePathBase}/page-${String(pageNumber).padStart(3, '0')}.jpg`,
    }
  })
}

export function getReleasedPages(pages, todayString = new Date().toISOString().slice(0, 10)) {
  return pages.filter((page) => page.releaseDate <= todayString)
}

export function getLatestReleasedPage(pages, todayString) {
  const releasedPages = getReleasedPages(pages, todayString)
  return releasedPages[releasedPages.length - 1]
}
