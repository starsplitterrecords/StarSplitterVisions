#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const FILES = {
  series: 'public/content/series.json',
  releases: 'public/content/releases.json',
  pages: 'public/content/pages.json',
  extras: 'public/content/extras.json',
  soundtracks: 'public/content/soundtracks.json',
};

const errors = [];

function readJson(relativePath, { optional = false } = {}) {
  const filePath = path.join(repoRoot, relativePath);
  if (optional && !fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${relativePath}: failed to read/parse JSON (${error.message})`);
    return null;
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasRequiredFields(item, fields, context) {
  for (const field of fields) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      errors.push(`${context}: missing required field "${field}"`);
    }
  }
}

function isValidYYYYMMDD(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() + 1 === month
    && date.getUTCDate() === day
  );
}

function validateImageFieldPathAndExistence(value, context) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  if (typeof value !== 'string') {
    errors.push(`${context}: image path must be a string when present`);
    return;
  }

  if (value.startsWith('/public/images/')) {
    errors.push(`${context}: image path must not start with /public/images/ (found: ${value})`);
    return;
  }

  if (!value.startsWith('/images/')) {
    errors.push(`${context}: image path must start with /images/ (found: ${value})`);
    return;
  }

  const relativeImagePath = `public${value}`;
  const absoluteImagePath = path.join(repoRoot, relativeImagePath);
  if (!fs.existsSync(absoluteImagePath)) {
    errors.push(`${context}: referenced image file does not exist (${relativeImagePath})`);
  }
}

function validateImageFields(item, fields, context) {
  for (const field of fields) {
    validateImageFieldPathAndExistence(item[field], `${context}.${field}`);
  }
}

const seriesData = readJson(FILES.series);
const releasesData = readJson(FILES.releases);
const pagesData = readJson(FILES.pages);
const extrasData = readJson(FILES.extras, { optional: true });
const soundtracksData = readJson(FILES.soundtracks);

const series = Array.isArray(seriesData?.series) ? seriesData.series : [];
const releases = Array.isArray(releasesData?.releases) ? releasesData.releases : [];
const pages = Array.isArray(pagesData?.pages) ? pagesData.pages : [];
const extras = Array.isArray(extrasData?.extras) ? extrasData.extras : [];
const soundtracks = Array.isArray(soundtracksData?.soundtracks) ? soundtracksData.soundtracks : [];

if (!Array.isArray(seriesData?.series)) errors.push(`${FILES.series}: missing "series" array`);
if (!Array.isArray(releasesData?.releases)) errors.push(`${FILES.releases}: missing "releases" array`);
if (!Array.isArray(pagesData?.pages)) errors.push(`${FILES.pages}: missing "pages" array`);
if (extrasData !== null && !Array.isArray(extrasData?.extras)) errors.push(`${FILES.extras}: missing "extras" array`);
if (!Array.isArray(soundtracksData?.soundtracks)) errors.push(`${FILES.soundtracks}: missing "soundtracks" array`);

const commonImageFields = ['image', 'heroImage', 'coverImage', 'thumbnailImage', 'socialImage', 'mobileImage'];

const seriesSlugs = new Set();
for (const [index, item] of series.entries()) {
  const context = `series[${index}]`;
  if (!isObject(item)) {
    errors.push(`${context}: must be an object`);
    continue;
  }
  hasRequiredFields(item, ['slug', 'title'], context);
  validateImageFields(item, commonImageFields, context);

  if (typeof item.slug === 'string') {
    if (seriesSlugs.has(item.slug)) {
      errors.push(`${context}: duplicate series.slug "${item.slug}"`);
    }
    seriesSlugs.add(item.slug);
  }
}

const validStatuses = new Set(['draft', 'scheduled', 'published']);
const releaseIds = new Set();
const releasesById = new Map();
for (const [index, item] of releases.entries()) {
  const context = `releases[${index}]`;
  if (!isObject(item)) {
    errors.push(`${context}: must be an object`);
    continue;
  }

  hasRequiredFields(item, ['id', 'seriesSlug', 'title', 'status'], context);
  validateImageFields(item, commonImageFields, context);

  if (typeof item.id === 'string') {
    if (releaseIds.has(item.id)) {
      errors.push(`${context}: duplicate releases.id "${item.id}"`);
    }
    releaseIds.add(item.id);
    releasesById.set(item.id, item);
  }

  if (typeof item.seriesSlug === 'string' && !seriesSlugs.has(item.seriesSlug)) {
    errors.push(`${context}: seriesSlug "${item.seriesSlug}" does not match any series.slug`);
  }

  if (!validStatuses.has(item.status)) {
    errors.push(`${context}: invalid status "${item.status}" (allowed: draft, scheduled, published)`);
  }

  if (item.status === 'scheduled' && !item.releaseDate) {
    errors.push(`${context}: scheduled release must include releaseDate`);
  }

  if (item.releaseDate !== undefined && item.releaseDate !== null && item.releaseDate !== '' && !isValidYYYYMMDD(item.releaseDate)) {
    errors.push(`${context}: releaseDate must be a valid YYYY-MM-DD date (found: ${item.releaseDate})`);
  }
}

const pageNumberByRelease = new Map();
for (const [index, item] of pages.entries()) {
  const context = `pages[${index}]`;
  if (!isObject(item)) {
    errors.push(`${context}: must be an object`);
    continue;
  }

  hasRequiredFields(item, ['seriesSlug', 'releaseSlug', 'pageNumber', 'title', 'image'], context);
  validateImageFields(item, commonImageFields, context);

  if (item.releaseDate !== undefined && item.releaseDate !== null && item.releaseDate !== '' && !isValidYYYYMMDD(item.releaseDate)) {
    errors.push(`${context}: releaseDate must be a valid YYYY-MM-DD date (found: ${item.releaseDate})`);
  }

  const parentRelease = typeof item.releaseSlug === 'string' ? releasesById.get(item.releaseSlug) : undefined;
  if (!parentRelease) {
    errors.push(`${context}: releaseSlug "${item.releaseSlug}" does not match any releases.id`);
  } else if (item.seriesSlug !== parentRelease.seriesSlug) {
    errors.push(`${context}: seriesSlug "${item.seriesSlug}" does not match parent release seriesSlug "${parentRelease.seriesSlug}"`);
  }

  if (typeof item.releaseSlug === 'string' && Number.isInteger(item.pageNumber)) {
    const key = item.releaseSlug;
    if (!pageNumberByRelease.has(key)) {
      pageNumberByRelease.set(key, new Set());
    }
    const seenPages = pageNumberByRelease.get(key);
    if (seenPages.has(item.pageNumber)) {
      errors.push(`${context}: duplicate pageNumber ${item.pageNumber} for releaseSlug "${item.releaseSlug}"`);
    }
    seenPages.add(item.pageNumber);
  }
}

for (const [index, item] of extras.entries()) {
  const context = `extras[${index}]`;
  if (!isObject(item)) {
    errors.push(`${context}: must be an object`);
    continue;
  }
  validateImageFields(item, commonImageFields, context);
}

for (const [index, item] of soundtracks.entries()) {
  const context = `soundtracks[${index}]`;
  if (!isObject(item)) {
    errors.push(`${context}: must be an object`);
    continue;
  }
  hasRequiredFields(item, ['id', 'seriesSlug', 'title'], context);
  validateImageFields(item, commonImageFields, context);
}

if (errors.length > 0) {
  console.error('Content validation failed:\n');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Content validation passed.');
