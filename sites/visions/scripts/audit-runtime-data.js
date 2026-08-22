import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')
const monorepoRoot = path.resolve(repoRoot, '..', '..')
const contentRoot = path.join(repoRoot, 'src', 'content')
const seriesRoot = path.join(contentRoot, 'series')

const errors = []
const warnings = []
const referencedRuntimeImages = new Set()
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])
const publicationTypes = new Set(['E', 'A', 'C', 'S', 'P'])
const catalogIdPattern = /^([A-Z0-9]{3})-([A-Z])(\d{3})-(\d{4})-(\d{3})$/

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
assertFileExists('src/components/IssueLibrary.jsx')
assertFileExists('src/components/IssueLibrary.css')
assertFileExists('src/components/Reader.jsx')
assertFileExists('src/components/shared/ImageWithFallback.jsx')
assertFileExists('src/utils/routes.js')
assertFileExists('src/utils/dailyPages.js')
assertFileExists('src/utils/issueState.js')

const pagesConfigPath = path.join(monorepoRoot, '.pages.yml')
if (!fs.existsSync(pagesConfigPath)) errors.push('Root .pages.yml is missing')

const pagesConfig = fs.existsSync(pagesConfigPath)
  ? fs.readFileSync(pagesConfigPath, 'utf8')
  : ''

if (pagesConfig && !pagesConfig.includes('path: sites/visions/src/content/series')) {
  errors.push('.pages.yml must expose the Visions series as an editable collection')
}

if (pagesConfig && !pagesConfig.includes('input: sites/visions/public/images')) {
  errors.push('.pages.yml must store Visions uploads in sites/visions/public/images')
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
const seriesCodeSources = new Map()
const catalogIdSources = new Map()

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

  if (!/^[A-Z0-9]{3}$/.test(series.seriesCode || '')) {
    errors.push(`${relativePath}.seriesCode must be a stable three-character uppercase code`)
  } else if (seriesCodeSources.has(series.seriesCode)) {
    errors.push(`${relativePath}.seriesCode duplicates ${seriesCodeSources.get(series.seriesCode)}`)
  } else {
    seriesCodeSources.set(series.seriesCode, relativePath)
  }

  if (!['active', 'coming-soon', 'archived'].includes(series.status)) {
    errors.push(`${relativePath}.status must be active, coming-soon, or archived`)
  }

  assertRuntimeImagePath(series.hero, `${relativePath}.hero`)
  assertRuntimeImagePath(series.homepage?.cover, `${relativePath}.homepage.cover`)

  const catalogSequences = new Set()

  ;(series.releases || []).forEach((release, index) => {
    const context = `${relativePath}.releases[${index}]`

    if (!release.title) {
      errors.push(`${context}.title is required`)
    }

    if (!publicationTypes.has(release.publicationType)) {
      errors.push(`${context}.publicationType must be one of ${[...publicationTypes].join(', ')}`)
    }

    if (!Number.isInteger(release.publicationNumber) || release.publicationNumber < 1) {
      errors.push(`${context}.publicationNumber must be a positive integer`)
    }

    if (!Number.isInteger(release.catalogSequence) || release.catalogSequence < 1) {
      errors.push(`${context}.catalogSequence must be a positive integer`)
    } else if (catalogSequences.has(release.catalogSequence)) {
      errors.push(`${context}.catalogSequence duplicates ${release.catalogSequence} within ${series.slug}`)
    } else {
      catalogSequences.add(release.catalogSequence)
    }

    const catalogMatch = typeof release.catalogId === 'string'
      ? release.catalogId.match(catalogIdPattern)
      : null

    if (!catalogMatch) {
      errors.push(`${context}.catalogId must use SER-TNNN-YYYY-NNN format`)
    } else {
      const [, idSeriesCode, idPublicationType, idPublicationNumber, , idCatalogSequence] = catalogMatch

      if (idSeriesCode !== series.seriesCode) {
        errors.push(`${context}.catalogId must start with seriesCode ${series.seriesCode}`)
      }

      if (idPublicationType !== release.publicationType) {
        errors.push(`${context}.catalogId publication type must match publicationType`)
      }

      if (Number(idPublicationNumber) !== release.publicationNumber) {
        errors.push(`${context}.catalogId publication number must match publicationNumber`)
      }

      if (Number(idCatalogSequence) !== release.catalogSequence) {
        errors.push(`${context}.catalogId final sequence must match catalogSequence`)
      }

      if (catalogIdSources.has(release.catalogId)) {
        errors.push(`${context}.catalogId duplicates ${catalogIdSources.get(release.catalogId)}`)
      } else {
        catalogIdSources.set(release.catalogId, context)
      }
    }

    if (release.publicationType === 'E' && (!Number.isInteger(release.issueNumber) || release.issueNumber < 1)) {
      errors.push(`${context}.issueNumber is required for regular issues`)
    }

    assertRuntimeImagePath(release.cover, `${context}.cover`)
    assertDate(release.releaseDate, `${context}.releaseDate`, { optional: true })
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
