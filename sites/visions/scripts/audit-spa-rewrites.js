#!/usr/bin/env node
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { buildSeriesPath, buildReaderPath, parseReaderPath } from '../src/utils/routes.js'

const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
assert.equal(config.version, 2, 'Expected Vercel config schema')
assert.equal(config.cleanUrls, true, 'Published pre-rendered .html pages need canonical clean URLs')
assert.equal(config.trailingSlash, false, 'Canonical route format must not add slashes')
assert(!config.rewrites?.length, 'Rewrites can mask pre-rendered public pages with the SPA homepage')
const packageInfo = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
assert(packageInfo.scripts.build.includes('prerender-seo.js'), 'Build must generate per-route SEO pages')
const seriesSlug = 'rex-fleet'
assert.equal(buildSeriesPath(seriesSlug), '/series/rex-fleet')
assert.equal(buildReaderPath(seriesSlug, 3), '/read/rex-fleet/3')
assert.deepEqual(parseReaderPath('/read/rex-fleet/3'), { seriesSlug: 'rex-fleet', pageNumber: 3 })
console.log('PASS canonical clean URLs; static SEO pages are not masked by rewrites')
