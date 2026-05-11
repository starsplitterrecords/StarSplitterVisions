import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')

const errors = []
const warnings = []
const referencedRuntimeImages = new Set()
const referencedAssetKeys = new Set()

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])

function repoPath(...segments) {
  return path.join(repoRoot, ...segments)
}

function assertFileExists(relativePath, message = `${relativePath} is missing`) {
  if (!fs.existsSync(repoPath(relativePath))) {
    errors.push(message)
  }
}

function assertFileMissing(relativePath, message = `${relativePath} should not exist`) {
  if (fs.existsSync(repoPath(relativePath))) {
    errors.push(message)
  }
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return walkFiles(fullPath)
    }

    return [fullPath]
  })
}

function toRuntimePath(publicFilePath) {
  const relativePublicPath = path.relative(repoPath('public'), publicFilePath).replaceAll(path.sep, '/')
  return `/${relativePublicPath}`
}

function assertNoPublicPrefix(value, context) {
  if (typeof value === 'string' && value.startsWith('/public/')) {
    errors.push(`${context} uses invalid public runtime prefix: ${value}`)
  }
}

function assertRuntimeImagePath(value, context) {
  if (!value) return

  if (typeof value !== 'string') {
    errors.push(`${context} must be a string image path`)
    return
  }

  assertNoPublicPrefix(value, context)

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

function markAssetKey(key) {
  if (key) referencedAssetKeys.add(key)
}

async function loadModule(relativePath) {
  const moduleUrl = new URL(`../${relativePath}`, import.meta.url)
  return import(moduleUrl.href)
}

assertFileExists('src/App.jsx')
assertFileExists('src/data/assets.js')
assertFileExists('src/data/homepageSeries.js')
assertFileExists('src/data/seriesPages.js')
assertFileExists('src/components/SeriesIndex.jsx')
assertFileExists('src/components/SeriesPage.jsx')
assertFileExists('src/components/Reader.jsx')
assertFileExists('src/components/shared/ImageWithFallback.jsx')
assertFileExists('src/utils/routes.js')
assertFileExists('src/utils/dailyPages.js')

assertFileMissing('src/data/assets.ts', 'Remove stale parallel src/data/assets.ts; runtime asset registry is src/data/assets.js')
assertFileMissing('tsconfig.json', 'Remove stale tsconfig.json unless TypeScript migration is active')

const { brandAssets, coverAssets, pageImageBases } = await loadModule('src/data/assets.js')
const { featuredSeries, moreWorlds } = await loadModule('src/data/homepageSeries.js')
const { seriesPages } = await loadModule('src/data/seriesPages.js')

Object.entries(brandAssets || {}).forEach(([key, value]) => {
  assertRuntimeImagePath(value, `brandAssets.${key}`)
})

Object.entries(coverAssets || {}).forEach(([key, value]) => {
  assertRuntimeImagePath(value, `coverAssets.${key}`)
})

Object.entries(pageImageBases || {}).forEach(([key, value]) => {
  if (typeof value !== 'string' || !value.startsWith('/images/')) {
    errors.push(`pageImageBases.${key} must use /images/... runtime path`)
  }
})

const knownSeries = new Set(Object.keys(seriesPages || {}))

function assertKnownSeriesLink(slug, context) {
  if (!knownSeries.has(slug)) {
    errors.push(`${context} references unknown series slug: ${slug}`)
  }
}

function findAssetKeyByPath(registry, runtimePath) {
  return Object.entries(registry || {}).find(([, value]) => value === runtimePath)?.[0]
}

;(featuredSeries || []).forEach((series, index) => {
  assertKnownSeriesLink(series.slug, `featuredSeries[${index}]`)
  assertRuntimeImagePath(series.cover, `featuredSeries[${index}].cover`)
  markAssetKey(findAssetKeyByPath(coverAssets, series.cover))
})

;(moreWorlds || []).forEach((series, index) => {
  assertKnownSeriesLink(series.slug, `moreWorlds[${index}]`)
  assertRuntimeImagePath(series.cover, `moreWorlds[${index}].cover`)
  markAssetKey(findAssetKeyByPath(coverAssets, series.cover))
})

Object.entries(seriesPages || {}).forEach(([slug, series]) => {
  if (series.slug !== slug) {
    errors.push(`seriesPages.${slug}.slug must match object key`)
  }

  if (!series.title) {
    errors.push(`seriesPages.${slug}.title is required`)
  }

  assertRuntimeImagePath(series.hero, `seriesPages.${slug}.hero`)
  markAssetKey(findAssetKeyByPath(coverAssets, series.hero))

  ;(series.releases || []).forEach((release, index) => {
    assertRuntimeImagePath(release.cover, `seriesPages.${slug}.releases[${index}].cover`)
    markAssetKey(findAssetKeyByPath(coverAssets, release.cover))
  })

  ;(series.dailyPages || []).forEach((page, index) => {
    assertRuntimeImagePath(page.image, `seriesPages.${slug}.dailyPages[${index}].image`)
  })
})

Object.keys(brandAssets || {}).forEach(markAssetKey)

Object.keys(coverAssets || {}).forEach((key) => {
  if (!referencedAssetKeys.has(key)) {
    warnings.push(`coverAssets.${key} is registered but not used by current homepage/series runtime data`)
  }
})

const publicImageFiles = walkFiles(repoPath('public', 'images'))
  .filter((filePath) => imageExtensions.has(path.extname(filePath).toLowerCase()))
  .map(toRuntimePath)

publicImageFiles.forEach((runtimePath) => {
  if (!referencedRuntimeImages.has(runtimePath)) {
    warnings.push(`public image appears orphaned by current runtime data: ${runtimePath}`)
  }
})

warnings.forEach((warning) => console.warn(`Runtime data warning: ${warning}`))

if (errors.length > 0) {
  errors.forEach((error) => console.error(`Runtime data error: ${error}`))
  process.exit(1)
}

console.log('Runtime data audit passed.')
