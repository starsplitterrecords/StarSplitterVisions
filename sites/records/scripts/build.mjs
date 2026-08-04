import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { orderArtists, publicArtistsAt, publicReleaseKeys, releaseVisibility, rosterArtists } from './publishing.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const recordsRoot = path.resolve(__dirname, '..')
const contentRoot = path.join(recordsRoot, 'content')
const sourceRoot = path.join(recordsRoot, 'source')
const distRoot = path.join(recordsRoot, 'dist')
const recordsImages = path.join(recordsRoot, 'public', 'images', 'records')
const recordsMedia = path.join(recordsRoot, 'public', 'media', 'records')
const contentOnly = process.argv.includes('--content-only')
const buildNow = new Date(process.env.RECORDS_BUILD_NOW || Date.now())

if (Number.isNaN(buildNow.getTime())) throw new Error('RECORDS_BUILD_NOW must be a valid ISO 8601 timestamp')

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const isExternal = (url = '') => /^https?:\/\//i.test(url)
const linkAttrs = (url = '') => isExternal(url) ? ' target="_blank" rel="noopener"' : ''
const renderLink = ({ label, url }, className = 'text-link') => {
  if (!label || !url) return ''
  return `<a${className ? ` class="${className}"` : ''} href="${escapeHtml(url)}"${linkAttrs(url)}>${escapeHtml(label)}</a>`
}

const releaseUrl = (artistSlug, releaseSlug) => `/releases/${artistSlug}/${releaseSlug}.html`

const assetDiskPath = (publicPath) => {
  if (!publicPath) return null
  if (publicPath.startsWith('/images/records/')) {
    return path.join(recordsImages, publicPath.slice('/images/records/'.length))
  }
  if (publicPath.startsWith('/media/records/')) {
    return path.join(recordsMedia, publicPath.slice('/media/records/'.length))
  }
  return null
}

const assertFile = async (publicPath, context) => {
  if (contentOnly) return
  const diskPath = assetDiskPath(publicPath)
  if (!diskPath) return
  try {
    const result = await stat(diskPath)
    if (!result.isFile()) throw new Error('not a file')
  } catch {
    throw new Error(`Missing asset for ${context}: ${publicPath}`)
  }
}

const ensureAssetTree = async () => {
  if (contentOnly) return
  try {
    const result = await stat(recordsImages)
    if (result.isDirectory()) return
  } catch {
    // Continue to the one-time bootstrap archive below.
  }

  throw new Error('Records artwork is missing from sites/records/public/images/records')
}

const loadArtists = async () => {
  const dir = path.join(contentRoot, 'artists')
  const files = (await readdir(dir)).filter((file) => file.endsWith('.json')).sort()
  const artists = await Promise.all(files.map((file) => readJson(path.join(dir, file))))
  return orderArtists(artists)
}

const header = (site) => `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href="/"><span class="star">✦</span> ${escapeHtml(site.brand.wordmark)} <small>${escapeHtml(site.brand.submark)}</small></a>
  <button aria-expanded="false" aria-label="Open menu" class="menu-button">Menu</button>
  <nav class="site-nav">
    ${site.navigation.map((item) => `<a href="${escapeHtml(item.path)}">${escapeHtml(item.label)}</a>`).join('')}
  </nav>
</header>`

const footer = (site) => `
<footer class="footer">
  <span>${escapeHtml(site.footer.copyright)}</span>
  <span>${escapeHtml(site.footer.tagline)}</span>
</footer>
<script src="/assets/site.js"></script>`

const documentShell = ({ site, title, description, bodyClass = '', content, accent = '' }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <link rel="icon" type="image/svg+xml" href="/images/records/worlds/favicon.svg" />
  <link rel="stylesheet" href="/assets/site.css" />
  ${accent ? `<style>:root{--artist-accent:${escapeHtml(accent)}}</style>` : ''}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${header(site)}
${content}
${footer(site)}
</body>
</html>`

const lineageLabels = {
  compositionOrigin: {
    'human-composed': 'Human-composed',
    'co-written': 'Co-written',
    'generative-starting-point': 'Generative starting point',
    'adapted-from-existing-work': 'Adapted from an existing work',
    'public-domain-or-traditional': 'Public-domain or traditional source',
    other: 'Other composition origin',
  },
  realizationMethod: {
    'performed-and-produced': 'Performed and produced',
    'ai-assisted-realization': 'AI-assisted realization',
    'hybrid-realization': 'Hybrid realization',
    'restored-source-recording': 'Restored source recording',
    'generative-production': 'Generative production',
    other: 'Other realization method',
  },
  versionRelationship: {
    'original-release': 'Original release',
    'new-interpretation': 'New interpretation',
    'legacy-recording': 'Legacy recording',
    remix: 'Remix',
    'remaster-or-restoration': 'Remaster or restoration',
    'alternate-version': 'Alternate version',
    adaptation: 'Adaptation',
    other: 'Other version relationship',
  },
}

const lineageValue = (group, value) => lineageLabels[group]?.[value] || ''
const visibleLineage = (release) => release.lineage && release.lineage.display !== 'hidden'
const releaseLabel = (release) => {
  if (!visibleLineage(release)) return ''
  return release.lineage.publicLabel || lineageValue('versionRelationship', release.lineage.versionRelationship)
}

const releaseCard = (artist, release) => {
  const visual = release.image
    ? `<a class="release-card__image" href="${releaseUrl(artist.slug, release.slug)}"><img alt="${escapeHtml(release.title)} artwork" loading="lazy" src="${escapeHtml(release.image)}" /></a>`
    : ''
  const externalLinks = (release.links || []).map((link) => renderLink(link)).filter(Boolean)
  const links = [renderLink({ label: 'Release details', url: releaseUrl(artist.slug, release.slug) }), ...externalLinks].join(' &nbsp; ')
  const label = releaseLabel(release)
  return `<article class="release-card${release.image ? '' : ' release-card--text'}">
    ${visual}
    <div class="release-card__body">
      <p class="release-meta">${escapeHtml(release.meta)}</p>
      ${label ? `<p class="release-relationship">${escapeHtml(label)}</p>` : ''}
      <h3><a href="${releaseUrl(artist.slug, release.slug)}">${escapeHtml(release.title)}</a></h3>
      ${links ? `<div>${links}</div>` : ''}
    </div>
  </article>`
}

const homepageReleaseCard = (release) => {
  const detailUrl = releaseUrl(release.artistSlug, release.releaseSlug)
  const image = release.image
    ? `<a class="release-card__image" href="${detailUrl}"><img alt="${escapeHtml(release.titleLines.join(' '))} artwork" loading="lazy" src="${escapeHtml(release.image)}" /></a>`
    : ''
  const externalLinks = (release.links || []).map((link) => renderLink(link)).filter(Boolean)
  const links = [renderLink({ label: 'Release details', url: detailUrl }), ...externalLinks].join(' &nbsp; ')
  return `<article class="release-card${release.image ? '' : ' release-card--text'}" style="--artist-accent:${escapeHtml(release.accent || '#ffffff')}">
    ${image}
    <div class="release-card__body">
      <p class="release-meta">${escapeHtml(release.meta)}</p>
      <h3><a href="${detailUrl}">${release.titleLines.map(escapeHtml).join('<br />')}</a></h3>
      ${links ? `<div>${links}</div>` : ''}
    </div>
  </article>`
}

const artistCard = (artist) => `
<article class="artist-card" data-categories="${escapeHtml((artist.categories || []).join(' '))}" style="--accent:${escapeHtml(artist.accent)}">
  <a class="artist-image" href="/artists/${escapeHtml(artist.slug)}.html">
    <img alt="${escapeHtml(artist.name)}" loading="lazy" src="${escapeHtml(artist.identityImage)}" />
  </a>
  <div class="artist-body">
    <span class="field">${escapeHtml(artist.field)}</span>
    <h3>${escapeHtml(artist.name)}</h3>
    <p class="mission">${escapeHtml(artist.tagline)}</p>
    <p class="artist-card__role">${escapeHtml(artist.catalogRole)}</p>
    <div class="card-links">
      <a href="/artists/${escapeHtml(artist.slug)}.html">View artist</a>
      ${artist.listenUrl ? `<a href="${escapeHtml(artist.listenUrl)}"${linkAttrs(artist.listenUrl)}>Listen</a>` : ''}
    </div>
  </div>
</article>`

const renderHomepage = (site, artists, publicReleaseKeys) => {
  const heroHeading = site.hero.headingLines.map((line, index) =>
    index === site.hero.italicLine ? `<em>${escapeHtml(line)}</em>` : escapeHtml(line)
  ).join('<br />')

  const activeArtistSlugs = new Set(artists.map((artist) => artist.slug))
  const worlds = site.worlds.filter((world) => activeArtistSlugs.has(world.slug)).map((world) => `
    <a class="world" href="/artists/${escapeHtml(world.slug)}.html" style="background-image:url('${escapeHtml(world.image)}')">
      <div>
        <p class="eyebrow">${escapeHtml(world.artist)}</p>
        <h2>${escapeHtml(world.title)}</h2>
        <span class="text-link">${escapeHtml(world.linkLabel)}</span>
      </div>
    </a>`).join('')

  const authorshipCards = site.authorship.principles.map((principle) => `
    <article class="authorship-card">
      <h3>${escapeHtml(principle.title)}</h3>
      <p>${escapeHtml(principle.body)}</p>
    </article>`).join('')

  const content = `<main id="main">
    <section class="hero">
      <img alt="Star Splitter Records visual world" src="${escapeHtml(site.hero.image)}" />
      <div class="hero-shade"></div>
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(site.hero.eyebrow)}</p>
        <h1>${heroHeading}</h1>
        <p class="hero-deck">${escapeHtml(site.hero.description)}</p>
        <div class="actions">
          <a class="button light" href="${escapeHtml(site.hero.primaryAction.path)}">${escapeHtml(site.hero.primaryAction.label)}</a>
          <a class="button ghost" href="${escapeHtml(site.hero.secondaryAction.path)}">${escapeHtml(site.hero.secondaryAction.label)}</a>
        </div>
      </div>
    </section>

    <section class="section paper" id="releases">
      <div class="section-head">
        <p class="eyebrow">${escapeHtml(site.releaseSection.eyebrow)}</p>
        <div><h2 class="section-title">${escapeHtml(site.releaseSection.title)}</h2><p class="section-intro">${escapeHtml(site.releaseSection.intro)}</p></div>
      </div>
      <div class="release-grid">${site.releaseSection.featured.filter((release) => publicReleaseKeys.has(`${release.artistSlug}/${release.releaseSlug}`)).map(homepageReleaseCard).join('')}</div>
    </section>

    <section class="credit-note">
      <div><p class="eyebrow">${escapeHtml(site.creditNote.eyebrow)}</p><h2>${escapeHtml(site.creditNote.title)}</h2></div>
      <div><p>${escapeHtml(site.creditNote.body)}</p><a class="text-link" href="${escapeHtml(site.creditNote.path)}">${escapeHtml(site.creditNote.linkLabel)}</a></div>
    </section>

    <section class="artist-section" id="artists">
      <div class="artist-head">
        <div><p class="eyebrow">${escapeHtml(site.artistSection.eyebrow)}</p><h2 class="section-title">${escapeHtml(site.artistSection.title)}</h2></div>
        <p>${escapeHtml(site.artistSection.intro)}</p>
      </div>
      <div class="filters" aria-label="Filter artists">
        ${site.artistSection.filters.map((filter, index) => `<button class="${index === 0 ? 'active' : ''}" data-filter="${escapeHtml(filter.value)}">${escapeHtml(filter.label)}</button>`).join('')}
      </div>
      <div class="artist-grid">${artists.map(artistCard).join('')}</div>
    </section>

    <section class="worlds">${worlds}</section>

    <section class="label-slate" aria-label="Star Splitter Records">
      <div class="label-slate__visual" aria-hidden="true">
        <div class="label-slate__orbit"></div>
        <div class="label-slate__mark"><span class="label-slate__star">✦</span><span>STAR</span><span>SPLITTER</span><span>RECORDS</span></div>
        <div class="label-slate__rail">SSR / CATALOG / 001—∞</div>
      </div>
      <div class="motion-copy">
        <p class="eyebrow">${escapeHtml(site.labelSlate.eyebrow)}</p>
        <h2 class="section-title">${site.labelSlate.titleLines.map(escapeHtml).join('<br />')}</h2>
        <p>${escapeHtml(site.labelSlate.body)}</p>
      </div>
    </section>

    <section class="section" id="story"><div class="story">
      <div><p class="eyebrow">${escapeHtml(site.story.eyebrow)}</p><h2 class="section-title">${escapeHtml(site.story.title)}</h2></div>
      <div>${site.story.paragraphs.map((paragraph, index) => `<p>${index === 0 ? `<strong>${escapeHtml(paragraph.split('. ')[0] + '.')}</strong> ${escapeHtml(paragraph.split('. ').slice(1).join('. '))}` : escapeHtml(paragraph)}</p>`).join('')}</div>
    </div></section>

    <section class="section paper authorship" id="authorship">
      <div class="authorship-head"><p class="eyebrow">${escapeHtml(site.authorship.eyebrow)}</p><div><h2 class="section-title">${escapeHtml(site.authorship.title)}</h2><p class="section-intro">${escapeHtml(site.authorship.intro)}</p></div></div>
      <div class="authorship-grid">${authorshipCards}</div>
      <p class="authorship-closing">${escapeHtml(site.authorship.closing)}</p>
    </section>

    <section class="section paper" id="licensing">
      <div class="section-head"><p class="eyebrow">${escapeHtml(site.licensing.eyebrow)}</p><div><h2 class="section-title">${escapeHtml(site.licensing.title)}</h2><p class="section-intro">${escapeHtml(site.licensing.intro)}</p></div></div>
    </section>
  </main>`

  return documentShell({ site, title: site.seo.title, description: site.seo.description, content })
}

const renderArtistPage = (site, artist) => {
  const platforms = (artist.platformLinks || []).length
    ? `<div class="listen-list">${artist.platformLinks.map((link) => renderLink(link, '')).join('')}</div>`
    : ''
  const motion = artist.motion?.video
    ? `<section class="artist-motion"><video aria-label="${escapeHtml(artist.name)} motion identity" autoplay loop muted playsinline poster="${escapeHtml(artist.motion.poster)}"><source src="${escapeHtml(artist.motion.video)}" type="video/mp4" /></video><div class="artist-motion__copy"><p class="eyebrow">${escapeHtml(artist.name)}</p><h2>${escapeHtml(artist.motion.title)}</h2></div></section>`
    : ''
  const world = artist.worldImage
    ? `<section class="artist-world" style="background-image:url('${escapeHtml(artist.worldImage)}')"><div class="artist-world__copy"><p class="eyebrow">${escapeHtml(artist.name)}</p><h2>${escapeHtml(artist.tagline)}</h2></div></section>`
    : ''
  const releases = artist.releases?.length
    ? `<section class="section paper" id="releases"><div class="section-head"><p class="eyebrow">Selected catalog</p><div><h2 class="section-title">Music from ${escapeHtml(artist.name)}.</h2><p class="section-intro">Selected releases, collaborations, and forthcoming work from this project.</p></div></div><div class="release-grid">${artist.releases.map((release) => releaseCard(artist, release)).join('')}</div></section>`
    : ''
  const content = `<main id="main">
    <section class="artist-hero">
      <img alt="${escapeHtml(artist.name)}" src="${escapeHtml(artist.identityImage)}" />
      <div class="artist-hero__copy"><p class="eyebrow">Star Splitter Records artist</p><h1>${escapeHtml(artist.name)}</h1><p class="tagline">${escapeHtml(artist.tagline)}</p>${platforms}</div>
    </section>
    <section class="catalog-role"><div><p class="eyebrow">Role in the catalog</p><h2>${escapeHtml(artist.catalogRole)}</h2></div><p>${escapeHtml(artist.roleStatement)}</p></section>
    <section class="section"><div class="artist-layout"><div><p class="artist-label">${escapeHtml(artist.field)}</p><a class="back-link" href="/#artists">Back to all artists</a></div><div class="artist-copy"><p class="lead">${escapeHtml(artist.oneSentenceBio)}</p><p>${escapeHtml(artist.threeSentenceBio)}</p><p>${escapeHtml(artist.paragraphBio)}</p><p class="riyl"><strong>Recommended if you like:</strong><br />${escapeHtml(artist.riyl)}</p></div></div></section>
    ${motion}${world}${releases}
  </main>`
  return documentShell({ site, title: artist.seoTitle, description: artist.seoDescription, bodyClass: 'artist-page', content, accent: artist.accent })
}

const renderCredits = (lineage) => {
  const creditLabels = {
    composition: 'Composition',
    lyrics: 'Lyrics',
    arrangement: 'Arrangement',
    performance: 'Performance',
    production: 'Production',
    finalEditingAndCuration: 'Final editing and curation',
  }
  const entries = Object.entries(creditLabels)
    .filter(([key]) => lineage.credits?.[key])
    .map(([key, label]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(lineage.credits[key])}</dd></div>`)
    .join('')
  return entries ? `<dl class="credits-list">${entries}</dl>` : ''
}

const renderLineageSection = (site, artist, release) => {
  if (!visibleLineage(release)) return ''
  const lineage = release.lineage
  const facts = [
    ['Composition origin', lineageValue('compositionOrigin', lineage.compositionOrigin)],
    ['Realization', lineageValue('realizationMethod', lineage.realizationMethod)],
    ['Version relationship', lineageValue('versionRelationship', lineage.versionRelationship)],
  ].filter(([, value]) => value)
  const sourceLink = lineage.sourceUrl
    ? `<a class="text-link" href="${escapeHtml(lineage.sourceUrl)}"${linkAttrs(lineage.sourceUrl)}>Open source work</a>`
    : ''
  const source = lineage.sourceTitle || lineage.sourceArtist
    ? `<article class="lineage-source"><p class="eyebrow">${escapeHtml(site.releasePage.sourceTitle)}</p><h3>${escapeHtml(lineage.sourceTitle || 'Source work')}</h3>${lineage.sourceArtist ? `<p>${escapeHtml(lineage.sourceArtist)}</p>` : ''}${sourceLink}</article>`
    : ''
  const credits = lineage.display === 'full' ? renderCredits(lineage) : ''
  const process = lineage.display === 'full' && lineage.methodNote
    ? `<article class="process-note"><p class="eyebrow">${escapeHtml(site.releasePage.processTitle)}</p><p>${escapeHtml(lineage.methodNote)}</p></article>`
    : ''
  const related = lineage.display === 'full' && lineage.relatedReleases?.length
    ? `<div class="related-releases"><h3>${escapeHtml(site.releasePage.relatedTitle)}</h3><div>${lineage.relatedReleases.map((item) => renderLink({ label: item.label || [item.artist, item.title].filter(Boolean).join(' — '), url: item.url }, 'related-link')).join('')}</div></div>`
    : ''
  return `<section class="section paper release-lineage" id="credits-lineage">
    <div class="lineage-intro"><p class="eyebrow">${escapeHtml(site.releasePage.lineageEyebrow)}</p><div><h2 class="section-title">${escapeHtml(site.releasePage.lineageTitle)}</h2><p class="section-intro">${escapeHtml(site.releasePage.lineageIntro)}</p></div></div>
    <div class="lineage-summary"><p>${escapeHtml(lineage.publicSummary)}</p></div>
    ${facts.length ? `<dl class="lineage-facts">${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>` : ''}
    ${source}
    ${credits ? `<div class="release-credits"><h3>${escapeHtml(site.releasePage.creditsTitle)}</h3>${credits}</div>` : ''}
    ${process}
    ${related}
  </section>`
}

const renderReleasePage = (site, artist, release) => {
  const artwork = release.image || artist.identityImage
  const label = releaseLabel(release)
  const links = (release.links || []).map((link) => renderLink(link, '')).filter(Boolean).join('')
  const about = release.description
    ? `<section class="section release-about"><div><p class="eyebrow">${escapeHtml(site.releasePage.aboutEyebrow)}</p></div><p>${escapeHtml(release.description)}</p></section>`
    : ''
  const content = `<main id="main">
    <section class="release-hero">
      <div class="release-hero__art"><img alt="${escapeHtml(release.title)} artwork" src="${escapeHtml(artwork)}" /></div>
      <div class="release-hero__copy">
        <p class="eyebrow">${escapeHtml(site.releasePage.detailsEyebrow)}</p>
        ${label ? `<p class="release-badge">${escapeHtml(label)}</p>` : ''}
        <h1>${escapeHtml(release.title)}</h1>
        <p class="release-artist"><a href="/artists/${escapeHtml(artist.slug)}.html">${escapeHtml(artist.name)}</a></p>
        <p class="release-page-meta">${escapeHtml(release.meta)}</p>
        ${links ? `<div class="listen-list">${links}</div>` : ''}
        <a class="back-link" href="/artists/${escapeHtml(artist.slug)}.html">${escapeHtml(site.releasePage.backLabel)}</a>
      </div>
    </section>
    ${about}
    ${renderLineageSection(site, artist, release)}
    <section class="release-artist-role"><div><p class="eyebrow">Role in the catalog</p><h2>${escapeHtml(artist.catalogRole)}</h2></div><div><p>${escapeHtml(artist.roleStatement)}</p><a class="text-link" href="/artists/${escapeHtml(artist.slug)}.html">Explore ${escapeHtml(artist.name)}</a></div></section>
  </main>`
  const description = release.description || `${release.title} by ${artist.name} on Star Splitter Records.`
  return documentShell({ site, title: `${release.title} — ${artist.name} — Star Splitter Records`, description, bodyClass: 'release-page', content, accent: artist.accent })
}

const allowed = {
  display: new Set(['hidden', 'summary', 'full']),
  compositionOrigin: new Set(['undocumented', 'human-composed', 'co-written', 'generative-starting-point', 'adapted-from-existing-work', 'public-domain-or-traditional', 'other']),
  realizationMethod: new Set(['undocumented', 'performed-and-produced', 'ai-assisted-realization', 'hybrid-realization', 'restored-source-recording', 'generative-production', 'other']),
  versionRelationship: new Set(['undocumented', 'original-release', 'new-interpretation', 'legacy-recording', 'remix', 'remaster-or-restoration', 'alternate-version', 'adaptation', 'other']),
}

const validate = async (site, artists) => {
  if (artists.length !== 23) throw new Error(`Expected 23 active artists, found ${artists.length}`)
  const slugs = new Set()
  const releasePaths = new Set()
  const releaseIndex = new Map()
  const publicText = [site.seo?.description, site.hero?.description, ...(site.story?.paragraphs || []), site.creditNote?.body, site.authorship?.intro, site.authorship?.closing].filter(Boolean).join(' ')
  const forbiddenProcessCopy = ['pending verified public url', 'exact artist and release destinations', 'link pending verification']
  for (const phrase of forbiddenProcessCopy) {
    if (publicText.toLowerCase().includes(phrase)) throw new Error(`Listener-facing process copy is not allowed: ${phrase}`)
  }

  for (const artist of artists) {
    if (!['active', 'archived'].includes(artist.status)) throw new Error(`${artist.name} has invalid status: ${artist.status}`)
    for (const field of ['name', 'slug', 'field', 'tagline', 'catalogRole', 'roleStatement', 'oneSentenceBio', 'threeSentenceBio', 'paragraphBio', 'identityImage']) {
      if (!artist[field]) throw new Error(`${artist.slug || artist.name || 'Artist'} is missing ${field}`)
    }
    if (slugs.has(artist.slug)) throw new Error(`Duplicate artist slug: ${artist.slug}`)
    slugs.add(artist.slug)
    await assertFile(artist.identityImage, `${artist.name} identity`)
    if (artist.worldImage) await assertFile(artist.worldImage, `${artist.name} world image`)
    if (artist.motion?.video) await assertFile(artist.motion.video, `${artist.name} motion video`)
    if (artist.motion?.poster) await assertFile(artist.motion.poster, `${artist.name} motion poster`)
    const artistReleaseSlugs = new Set()
    for (const release of artist.releases || []) {
      if (!release.title || !release.slug || !release.meta) throw new Error(`${artist.name} has an incomplete release record`)
      if (!/^[a-z0-9-]+$/.test(release.slug)) throw new Error(`${artist.name} / ${release.title} has an invalid release slug`)
      if (artistReleaseSlugs.has(release.slug)) throw new Error(`${artist.name} has duplicate release slug ${release.slug}`)
      artistReleaseSlugs.add(release.slug)
      const pathKey = releaseUrl(artist.slug, release.slug)
      if (releasePaths.has(pathKey)) throw new Error(`Duplicate release path: ${pathKey}`)
      releasePaths.add(pathKey)
      releaseIndex.set(`${artist.slug}/${release.slug}`, release)
      const visibility = releaseVisibility(release)
      if (!['published', 'scheduled', 'hidden'].includes(visibility)) throw new Error(`${artist.name} / ${release.title} has invalid visibility: ${visibility}`)
      if (visibility === 'scheduled') {
        if (!release.publishAt || Number.isNaN(Date.parse(release.publishAt))) throw new Error(`${artist.name} / ${release.title} needs a valid publishAt timestamp`)
        if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(release.publishAt)) throw new Error(`${artist.name} / ${release.title} publishAt must include a timezone offset`)
      }
      if (release.image) await assertFile(release.image, `${artist.name} / ${release.title}`)
      if (!release.lineage) throw new Error(`${artist.name} / ${release.title} is missing the lineage structure`)
      for (const key of Object.keys(allowed)) {
        if (!allowed[key].has(release.lineage[key])) throw new Error(`${artist.name} / ${release.title} has invalid ${key}: ${release.lineage[key]}`)
      }
      if (release.lineage.display !== 'hidden' && !release.lineage.publicSummary) throw new Error(`${artist.name} / ${release.title} needs publicSummary before lineage is shown`)
    }
  }

  for (const featured of site.releaseSection.featured) {
    const key = `${featured.artistSlug}/${featured.releaseSlug}`
    if (!releaseIndex.has(key)) throw new Error(`Homepage featured release does not match artist data: ${key}`)
  }
}

await ensureAssetTree()
const site = await readJson(path.join(contentRoot, 'site.json'))
const allArtists = await loadArtists()
await validate(site, allArtists)
const artists = rosterArtists(allArtists, buildNow)
const publicKeys = publicReleaseKeys(allArtists, buildNow)

if (contentOnly) {
  console.log(`Validated ${allArtists.length} artist/project records and ${[...publicKeys].length} public releases at ${buildNow.toISOString()}.`)
  process.exit(0)
}

await rm(distRoot, { recursive: true, force: true })
await mkdir(distRoot, { recursive: true })
await cp(sourceRoot, path.join(distRoot, 'assets'), { recursive: true })
await cp(recordsImages, path.join(distRoot, 'images', 'records'), { recursive: true })
try {
  await cp(recordsMedia, path.join(distRoot, 'media', 'records'), { recursive: true })
} catch {
  // Media is optional until the motion asset is available.
}

await writeFile(path.join(distRoot, 'index.html'), renderHomepage(site, artists, publicKeys))
for (const artist of artists) {
  await mkdir(path.join(distRoot, 'artists'), { recursive: true })
  await writeFile(path.join(distRoot, 'artists', `${artist.slug}.html`), renderArtistPage(site, artist))
  for (const release of artist.releases || []) {
    if (!publicKeys.has(`${artist.slug}/${release.slug}`)) continue
    const releaseDir = path.join(distRoot, 'releases', artist.slug)
    await mkdir(releaseDir, { recursive: true })
    await writeFile(path.join(releaseDir, `${release.slug}.html`), renderReleasePage(site, artist, release))
  }
}

console.log(`Built ${artists.length} artist/project pages and ${[...publicKeys].length} release pages at ${buildNow.toISOString()}.`)
