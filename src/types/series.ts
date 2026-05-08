export type SeriesStatus = 'active' | 'coming-soon'
export type ReleaseStatus = 'Now Reading' | 'Coming Soon'
export type ReleaseCadence = 'daily' | 'weekly'

export interface FeaturedSeriesItem {
  slug: string
  title: string
  issue: string
  hook: string
  cover: string
}

export interface MoreWorldItem {
  slug: string
  title: string
  cover: string
}

export interface ReleaseConfig {
  seriesSlug: string
  releaseSlug: string
  pageCount: number
  startDate: string
  cadence: ReleaseCadence
  imagePathBase: string
}

export interface DailyPage {
  pageNumber: number
  releaseDate: string
  image: string
}

export interface SeriesRelease {
  slug: string
  title: string
  status: ReleaseStatus
  description: string
  pageCount: number
  cover?: string
}

export interface SeriesPageData {
  slug: string
  title: string
  worldLabel: string
  tagline: string
  description: string
  hero: string
  accent: string
  atmosphere: string
  currentRelease: string
  releaseConfigs: ReleaseConfig[]
  dailyPages: DailyPage[]
  releases: SeriesRelease[]
  purchaseLinks: string[]
  status: SeriesStatus
}

export type SeriesPagesBySlug = Record<string, SeriesPageData>
