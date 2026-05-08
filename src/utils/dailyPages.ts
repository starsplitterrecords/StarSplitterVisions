import type { DailyPage, ReleaseCadence, ReleaseConfig } from '../types/series'

interface BuildDailyPagesOptions {
  count: number
  startDate: string
  imagePathBase: string
  cadence?: ReleaseCadence
}

export function buildDailyPages({
  count,
  startDate,
  imagePathBase,
  cadence = 'daily',
}: BuildDailyPagesOptions): DailyPage[] {
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

export function buildDailyPagesFromReleaseConfig(
  releaseConfig: ReleaseConfig
): DailyPage[] {
  return buildDailyPages({
    count: releaseConfig.pageCount,
    startDate: releaseConfig.startDate,
    cadence: releaseConfig.cadence,
    imagePathBase: releaseConfig.imagePathBase,
  })
}

export function getReleasedPages(
  pages: DailyPage[],
  todayString = new Date().toISOString().slice(0, 10)
): DailyPage[] {
  return pages.filter((page) => page.releaseDate <= todayString)
}

export function getLatestReleasedPage(
  pages: DailyPage[],
  todayString?: string
): DailyPage | undefined {
  const releasedPages = getReleasedPages(pages, todayString)

  return releasedPages[releasedPages.length - 1]
}
