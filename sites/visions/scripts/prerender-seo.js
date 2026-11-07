#!/usr/bin/env node
/**
 * Pre-render public Visions routes from their approved release metadata.
 * The React shell is rendered as HTML for crawlers and hydrated in the browser.
 * All routes and release details come from the existing series JSON files.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const origin = 'https://star-splitter-visions.vercel.app'
const publishedOn = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/New_York',
}).format(new Date())
const readJSON = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'))
const site = await readJSON('src/content/site.json')
const homepage = await readJSON('src/content/homepage.json')
const about = await readJSON('src/content/pages/about.json')
const press = await readJSON('src/content/pages/press.json')
const contact = await readJSON('src/content/pages/contact.json')
const filenames = (await fs.readdir(path.join(root, 'src/content/series'))).filter((name) => name.endsWith('.json')).sort()
const series = await Promise.all(filenames.map((name) => readJSON('src/content/series/' + name)))
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character])
const escapeXML = escapeHTML
const absolute = (pathname) => new URL(pathname || '/', origin).href
const trimmed = (value, max = 180) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  return text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : text
}
const publisher = { '@type': 'Organization', name: site.brand.name, url: origin + '/' }
const published = (item) => !item.releaseDate || item.releaseDate <= publishedOn
const routes = [{
  pathname: '/',
  title: 'Star Splitter Visions | Independent Comics & Graphic Stories',
  description: site.hero.description,
  image: homepage.latestRelease?.image || site.brand.logo,
  schema: { '@type': 'WebSite', name: site.brand.name, url: origin + '/', publisher },
}, {
  pathname: '/series',
  title: 'Read Comics & Explore Series | Star Splitter Visions',
  description: site.seriesCatalog?.description,
  image: homepage.latestRelease?.image || site.brand.logo,
  schema: { '@type': 'CollectionPage', name: 'Star Splitter Visions Series', url: absolute('/series'), isPartOf: { '@type': 'WebSite', url: origin + '/' } },
}, ...[
  ['/about', 'About', about.intro],
  ['/contact', 'Contact', contact.intro],
  ['/press', 'Press', press.intro],
].map(([pathname, name, description]) => ({
  pathname,
  title: name + ' | Star Splitter Visions',
  description,
  image: site.brand.logo,
  schema: { '@type': 'WebPage', name, url: absolute(pathname) },
}))]

for (const item of series) {
  const pathname = '/series/' + item.slug
  const description = item.description || item.worldPremise || item.tagline
  const releasedIssues = (item.releases || []).filter((release) => published(release) && release.externalLink)
  const pageImage = item.hero || item.homepage?.cover || site.brand.logo
  routes.push({
    pathname,
    title: item.title + ' | Comics | Star Splitter Visions',
    description,
    image: pageImage,
    schema: {
      '@type': 'CreativeWorkSeries',
      name: item.title,
      url: absolute(pathname),
      description,
      genre: item.worldLabel,
      image: absolute(pageImage),
      publisher,
      hasPart: releasedIssues.map((release) => ({
        '@type': 'Book',
        name: release.title,
        url: absolute(release.externalLink),
        description: release.description,
        image: absolute(release.cover || pageImage),
        ...(release.releaseDate ? { datePublished: release.releaseDate } : {}),
        bookFormat: 'https://schema.org/EBook',
        inLanguage: 'en',
      })),
    },
  })

  // Materialize released reader URLs for social previews and direct deep links.
  // Only the first reader page is a search landing page; the rest are thin image pages.
  if (item.status === 'active') {
    const pages = (item.dailyPages || []).filter(published).sort((a, b) => a.pageNumber - b.pageNumber)
    for (const page of pages) {
      const pageNumber = Number(page.pageNumber)
      if (!Number.isSafeInteger(pageNumber) || pageNumber < 1 || !page.image) continue
      const readerPath = '/read/' + item.slug + '/' + pageNumber
      routes.push({
        pathname: readerPath,
        title: item.title + ' — Page ' + String(pageNumber).padStart(3, '0') + ' | Star Splitter Visions',
        description: trimmed(item.title + ', ' + item.currentRelease + ', page ' + pageNumber + '. ' + description),
        image: page.image,
        indexable: pageNumber === pages[0].pageNumber,
        schema: {
          '@type': 'VisualArtwork',
          name: item.title + ' — Page ' + pageNumber,
          url: absolute(readerPath),
          image: absolute(page.image),
          isPartOf: { '@type': 'CreativeWorkSeries', name: item.title, url: absolute(pathname) },
          publisher,
        },
      })
    }
  }
}

const server = await createServer({
  root,
  configFile: path.join(root, 'vite.config.js'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})
try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')
  if (!template.includes('<div id="root"></div>') || !template.includes('</head>')) {
    throw new Error('Vite HTML template lacks expected root/head markers')
  }

  for (const route of routes) {
    const { pathname, title, description, image, schema, indexable = true } = route
    const canonical = absolute(pathname)
    const metadata = [
      '<meta name="description" content="' + escapeHTML(trimmed(description)) + '">',
      '<meta name="robots" content="' + (indexable ? 'index, follow' : 'noindex, follow') + '">',
      '<link rel="canonical" href="' + escapeHTML(canonical) + '">',
      '<meta property="og:site_name" content="' + escapeHTML(site.brand.name) + '">',
      '<meta property="og:type" content="' + (pathname.startsWith('/series/') || pathname.startsWith('/read/') ? 'article' : 'website') + '">',
      '<meta property="og:title" content="' + escapeHTML(title) + '">',
      '<meta property="og:description" content="' + escapeHTML(trimmed(description)) + '">',
      '<meta property="og:url" content="' + escapeHTML(canonical) + '">',
      '<meta property="og:image" content="' + escapeHTML(absolute(image)) + '">',
      '<meta name="twitter:card" content="summary_large_image">',
      '<meta name="twitter:title" content="' + escapeHTML(title) + '">',
      '<meta name="twitter:description" content="' + escapeHTML(trimmed(description)) + '">',
      '<meta name="twitter:image" content="' + escapeHTML(absolute(image)) + '">',
      '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', ...schema }).replace(/</g, '\\u003c') + '</script>',
    ].join('\n    ')
    const markup = renderToString(createElement(App, { initialPath: pathname }))
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHTML(title) + '</title>')
      .replace('</head>', '    ' + metadata + '\n  </head>')
      .replace('<div id="root"></div>', '<div id="root">' + markup + '</div>')
    const output = pathname === '/'
      ? path.join(dist, 'index.html')
      : path.join(dist, pathname.slice(1) + '.html')
    await fs.mkdir(path.dirname(output), { recursive: true })
    await fs.writeFile(output, html, 'utf8')
    if (!html.includes('<main') || !html.includes('rel="canonical"') || !html.includes('application/ld+json')) {
      throw new Error('Pre-rendered content missing from ' + pathname)
    }
  }
  const sitemap = routes.filter((route) => route.indexable !== false).map((route) =>
    '  <url><loc>' + escapeXML(absolute(route.pathname)) + '</loc></url>',
  ).join('\n')
  await fs.writeFile(path.join(dist, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + sitemap + '\n</urlset>\n',
    'utf8')
  console.log('Prerendered ' + routes.length + ' canonical routes (' + routes.filter((r) => r.indexable !== false).length + ' in sitemap).')
} finally {
  await server.close()
}
