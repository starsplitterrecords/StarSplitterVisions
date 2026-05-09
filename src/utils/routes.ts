export interface ReaderRoute {
  seriesSlug: string
  pageNumber: number
}

export function buildSeriesPath(seriesSlug: string): string {
  return `/series/${seriesSlug}`
}

export function buildReaderPath(
  seriesSlug: string,
  pageNumber: number
): string {
  return `/read/${seriesSlug}/page/${String(pageNumber).padStart(3, '0')}`
}

export function parseReaderPath(pathname: string): ReaderRoute | null {
  const match = pathname.match(/^\/read\/([^/]+)\/page\/(\d+)$/)

  if (!match) {
    return null
  }

  return {
    seriesSlug: match[1],
    pageNumber: Number(match[2]),
  }
}

export function clampPageNumber(
  pageNumber: number,
  maxPage: number
): number {
  return Math.min(Math.max(pageNumber, 1), Math.max(maxPage, 1))
}
