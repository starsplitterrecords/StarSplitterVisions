import homepageContent from '../content/homepage.json'
import { seriesPages } from './seriesPages'

function buildHomepageCard(slug) {
  const series = seriesPages[slug]

  if (!series) {
    return null
  }

  return {
    slug: series.slug,
    title: series.title,
    issue: series.homepage?.issue || series.currentRelease,
    hook: series.homepage?.hook || series.description,
    cover: series.homepage?.cover || series.hero,
  }
}

export const featuredSeries = (homepageContent.featuredSeries || [])
  .map(buildHomepageCard)
  .filter(Boolean)

export const moreWorlds = (homepageContent.moreWorlds || [])
  .map(buildHomepageCard)
  .filter(Boolean)
