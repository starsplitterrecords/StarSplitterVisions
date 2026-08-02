import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')
const contentRoot = path.join(repoRoot, 'src', 'content')
const seriesRoot = path.join(contentRoot, 'series')

const errors = []
const warnings = []
const referencedRuntimeImages = new Set()
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])

function repoPath(...segments) {
  return path.join(repoRoot, ...segments)
}

function assertFileExists(relativePath, message = `${relativePath} is missing`) {
  if (!fs.existsSync(repoPath(relativePath))) {
    errors.push(message)
  }
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath]
  })
}

function readJson(relativePath) {
  const absolutePath = repoPath(relativePath)

  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`)
    return null
  }
}

function assertRuntimeImagePath(value, context) {
  if (!value) return

  if (typeof value !== 'string') {
    errors.push(`${context} must be a string image path`)
    return
  }

  if (value.startsWith('/public/')) {
    errors.push(`${context} uses invalid public runtime prefix: ${value}`)
    return
  }

  if (!value.startsWith('/images/')) {
    errors.push(`${context} must use /images/... runtime path: ${value}`)
    return
  }

  referencedRuntimeImages.add(value)

  const publicPath = repoPath('public', value.replace(/^\//, ''))
  if (!fs.existsSync(publicPath)) {
    warnings.push(`${context} references missing image asset: ${value}`)
  }
}

function assertDate(value, context, { optional = false } = {}) {
  if (!value && optional) return

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`${context} must use YYYY-MM-DD format`)
  }
}

function assertKnownSeries(slug, knownSeries, context) {
  if (!knownSeries.has(slug)) {
    errors.push(`${context} references unknown series slug: ${slug}`)
  }
}

assertFileExists('.pages.yml')
assertFileExists('src/App.jsx')
assertFileExists('src/data/homepageSeries.js')
assertFileExists('src/data/seriesPages.js')
assertFileExists('src/content/site.json')
assertFileExists('src/content/homepage.json')
assertFileExists('src/content/pages/about.json')
assertFileExists('src/content/pages/contact.json')
assertFileExists('src/content/pages/press.json')
assertFileExists('src/components/SeriesIndex.jsx')
assertFileExists('src/components/SeriesPage.jsx')
assertFileExists('src/components/Reader.jsx')
assertFileExists('src/components/shared/ImageWithFallback.jsx')
assertFileExists('src/utils/routes.js')
assertFileExists('src/utils/dailyPages.js')

const pagesConfig = fs.existsSync(repoPath('.pages.yml'))
  ? fs.readFileSync(repoPath('.pages.yml'), 'utf8')
  : ''

if (pagesConfig && !pagesConfig.includes('path: src/content/series')) {
  errors.push('.pages.yml must expose src/content/series as an editable collection')
}

if (pagesConfig && !pagesConfig.includes('input: public/images')) {
  errors.push('.pages.yml must store uploaded media in public/images')
}

const site = readJson('src/content/site.json') || {}
const homepage = readJson('src/content/homepage.json') || {}
readJson('src/content/pages/about.json')
readJson('src/content/pages/contact.json')
readJson('src/content/pages/press.json')

assertRuntimeImagePath(site.brand?.logo, 'site.brand.logo')
assertRuntimeImagePath(site.brand?.icon, 'site.brand.icon')
assertRuntimeImagePath(homepage.latestRelease?.image, 'homepage.latestRelease.image')

const seriesFiles = walkFiles(seriesRoot)
  .filter((filePath) => path.extname(filePath).toLowerCase() === '.json')
  .sort()

if (seriesFiles.length === 0) {
  errors.push('src/content/series must contain at least one JSON file')
}

const seriesCatalog = {}
const slugSources = new Map()

seriesFiles.forEach((filePath) => {
  const relativePath = path.relative(repoRoot, filePath).replaceAll(path.sep, '/')
  const series = readJson(relativePath)

  if (!series) return

  if (!series.slug || typeof series.slug !== 'string') {
    errors.push(`${relativePath}.slug is required`)
    return
  }

  if (!/^[a-z0-9-]+$/.test(series.slug)) {
    errors.push(`${relativePath}.slug must contain lowercase letters, numbers, and hyphens only`)
  }

  if (slugSources.has(series.slug)) {
    errors.push(`${relativePath}.slug duplicates ${slugSources.get(series.slug)}`)
  }

  slugSources.set(series.slug, relativePath)
  seriesCatalog[series.slug] = series

  if (!series.title) {
    errors.push(`${relativePath}.title is required`)
  }

  if (!['active', 'coming-soon', 'archived'].includes(series.status)) {
    errors.push(`${relativePath}.status must be active, coming-soon, or archived`)
  }

  assertRuntimeImagePath(series.hero, `${relativePath}.hero`)
  assertRuntimeImagePath(series.homepage?.cover, `${relativePath}.homepage.cover`)

  ;(series.releases || []).forEach((release, index) => {
    if (!release.title) {
      errors.push(`${relativePath}.releases[${index}].title is required`)
    }
    assertRuntimeImagePath(release.cover, `${relativePath}.releases[${index}].cover`)
    assertDate(release.releaseDate, `${relativePath}.releases[${index}].releaseDate`, { optional: true })
  })

  const pageNumbers = new Set()
  ;(series.dailyPages || []).forEach((page, index) => {
    if (!Number.isInteger(page.pageNumber) || page.pageNumber < 1) {
      errors.push(`${relativePath}.dailyPages[${index}].pageNumber must be a positive integer`)
    }

    if (pageNumbers.has(page.pageNumber)) {
      errors.push(`${relativePath}.dailyPages contains duplicate page number ${page.pageNumber}`)
    }

    pageNumbers.add(page.pageNumber)
    assertDate(page.releaseDate, `${relativePath}.dailyPages[${index}].releaseDate`)
    assertRuntimeImagePath(page.image, `${relativePath}.dailyPages[${index}].image`)
  })

  ;(series.extras || []).forEach((artifact, index) => {
    assertRuntimeImagePath(artifact.image, `${relativePath}.extras[${index}].image`)
  })

  ;(series.audio || []).forEach((track, index) => {
    assertRuntimeImagePath(track.coverImage, `${relativePath}.audio[${index}].coverImage`)
  })
})

const knownSeries = new Set(Object.keys(seriesCatalog))

assertKnownSeries(site.defaultSeriesSlug, knownSeries, 'site.defaultSeriesSlug')

;(homepage.featuredSeries || []).forEach((slug, index) => {
  assertKnownSeries(slug, knownSeries, `homepage.featuredSeries[${index}]`)
})

;(homepage.moreWorlds || []).forEach((slug, index) => {
  assertKnownSeries(slug, knownSeries, `homepage.moreWorlds[${index}]`)
})

if (homepage.latestRelease?.series) {
  assertKnownSeries(homepage.latestRelease.series, knownSeries, 'homepage.latestRelease.series')
}

const duplicateHomepageSlugs = (homepage.featuredSeries || [])
  .filter((slug) => (homepage.moreWorlds || []).includes(slug))

duplicateHomepageSlugs.forEach((slug) => {
  warnings.push(`homepage repeats ${slug} in Featured Series and More Worlds`)
})

const publicImageFiles = walkFiles(repoPath('public', 'images'))
  .filter((filePath) => imageExtensions.has(path.extname(filePath).toLowerCase()))
  .map((filePath) => `/${path.relative(repoPath('public'), filePath).replaceAll(path.sep, '/')}`)

publicImageFiles.forEach((runtimePath) => {
  if (!referencedRuntimeImages.has(runtimePath)) {
    warnings.push(`public image is not referenced by managed content: ${runtimePath}`)
  }
})

warnings.forEach((warning) => console.warn(`Runtime data warning: ${warning}`))

if (errors.length > 0) {
  errors.forEach((error) => console.error(`Runtime data error: ${error}`))
  process.exit(1)
}

console.log(`Runtime data audit passed for ${seriesFiles.length} managed series.`)
