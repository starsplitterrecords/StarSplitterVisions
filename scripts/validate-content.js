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
  soundtracks: 'public/content/soundtracks.json',
};

const errors = [];

function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
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

function validateImagePaths(value, context) {
  if (typeof value === 'string') {
    if (value.startsWith('/public/images/')) {
      errors.push(`${context}: image path must not start with /public/images/ (found: ${value})`);
    }
    if (value.startsWith('/')) {
      if (!value.startsWith('/images/')) {
        errors.push(`${context}: image path must start with /images/ when using root-relative paths (found: ${value})`);
      }
    } else if (value.includes('/images/')) {
      errors.push(`${context}: image path should be root-relative and start with /images/ (found: ${value})`);
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => validateImagePaths(item, `${context}[${index}]`));
  } else if (isObject(value)) {
    Object.entries(value).forEach(([key, nested]) => {
      if (/image|thumbnail|cover|hero/i.test(key)) {
        validateImagePaths(nested, `${context}.${key}`);
      }
    });
  }
}

const seriesData = readJson(FILES.series);
const releasesData = readJson(FILES.releases);
const pagesData = readJson(FILES.pages);
const soundtracksData = readJson(FILES.soundtracks);

const series = Array.isArray(seriesData?.series) ? seriesData.series : [];
const releases = Array.isArray(releasesData?.releases) ? releasesData.releases : [];
const pages = Array.isArray(pagesData?.pages) ? pagesData.pages : [];
const soundtracks = Array.isArray(soundtracksData?.soundtracks) ? soundtracksData.soundtracks : [];

if (!Array.isArray(seriesData?.series)) errors.push(`${FILES.series}: missing "series" array`);
if (!Array.isArray(releasesData?.releases)) errors.push(`${FILES.releases}: missing "releases" array`);
if (!Array.isArray(pagesData?.pages)) errors.push(`${FILES.pages}: missing "pages" array`);
if (!Array.isArray(soundtracksData?.soundtracks)) errors.push(`${FILES.soundtracks}: missing "soundtracks" array`);

const seriesSlugs = new Set();
for (const [index, item] of series.entries()) {
  const context = `series[${index}]`;
  if (!isObject(item)) {
    errors.push(`${context}: must be an object`);
    continue;
  }
  hasRequiredFields(item, ['slug', 'title'], context);
  validateImagePaths(item, context);

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
  validateImagePaths(item, context);

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
  validateImagePaths(item, context);

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

for (const [index, item] of soundtracks.entries()) {
  const context = `soundtracks[${index}]`;
  if (!isObject(item)) {
    errors.push(`${context}: must be an object`);
    continue;
  }
  hasRequiredFields(item, ['id', 'seriesSlug', 'title', 'description', 'coverImage', 'tracks'], context);
  validateImagePaths(item, context);

  if (typeof item.seriesSlug === 'string' && !seriesSlugs.has(item.seriesSlug)) {
    errors.push(`${context}: seriesSlug "${item.seriesSlug}" does not match any series.slug`);
  }

  if (item.playlistUrl && typeof item.playlistUrl !== 'string') {
    errors.push(`${context}: playlistUrl must be a string when provided`);
  }

  if (item.playlistLinks !== undefined && !Array.isArray(item.playlistLinks)) {
    errors.push(`${context}: playlistLinks must be an array when provided`);
  }

  if (!item.playlistUrl && !Array.isArray(item.playlistLinks)) {
    errors.push(`${context}: include playlistUrl or playlistLinks`);
  }

  if (!Array.isArray(item.tracks)) {
    errors.push(`${context}: tracks must be an array`);
    continue;
  }

  for (const [trackIndex, track] of item.tracks.entries()) {
    const trackContext = `${context}.tracks[${trackIndex}]`;
    if (!isObject(track)) {
      errors.push(`${trackContext}: must be an object`);
      continue;
    }
    hasRequiredFields(track, ['title', 'artist', 'duration'], trackContext);
    if (track.url !== undefined && typeof track.url !== 'string') {
      errors.push(`${trackContext}: url must be a string when provided`);
    }
  }
}

if (errors.length > 0) {
  console.error('Content validation failed:\n');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Content validation passed.');
