export function buildDailyPages({ count, startDate, imagePathBase, cadence = 'daily' }) {
  const cadenceDays = cadence === 'weekly' ? 7 : 1

  return Array.from({ length: count }, (_, index) => {
    const pageNumber = index + 1
    const releaseDate = new Date(`${startDate}T00:00:00.000Z`)
    releaseDate.setUTCDate(releaseDate.getUTCDate() + index * cadenceDays)

    return {
      pageNumber,
      releaseDate: releaseDate.toISOString().slice(0, 10),
      image: `${imagePathBase}/page-${String(pageNumber).padStart(3, '0')}.jpg`,
    }
  })
}

export function buildDailyPagesFromReleaseConfig(releaseConfig) {
  return buildDailyPages({
    count: releaseConfig.pageCount,
    startDate: releaseConfig.startDate,
    cadence: releaseConfig.cadence,
    imagePathBase: releaseConfig.imagePathBase,
  })
}

export function getReleasedPages(pages, todayString = new Date().toISOString().slice(0, 10)) {
  return pages.filter((page) => page.releaseDate <= todayString)
}

export function getLatestReleasedPage(pages, todayString) {
  const releasedPages = getReleasedPages(pages, todayString)
  return releasedPages[releasedPages.length - 1]
}
