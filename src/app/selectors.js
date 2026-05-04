import { getReleasedPagesForRelease, isVisibleRelease } from '../lib/releaseVisibility';
import { sortReleasesByNewest } from '../lib/releaseVisibility';

export function getSeriesBySlug(seriesList, slug) {
  return seriesList.find((item) => item.slug === slug);
}

export function getReleaseById(releases, releaseId) {
  return releases.find((item) => item.id === releaseId);
}

export function getParentSeriesForRelease(seriesList, release) {
  if (!release) return null;
  return seriesList.find((item) => item.slug === release.seriesSlug) || null;
}

export function getSoundtracksBySeries(soundtracks) {
  return (Array.isArray(soundtracks) ? soundtracks : []).reduce((map, item) => {
    const seriesSlug = typeof item?.seriesSlug === 'string' ? item.seriesSlug.trim() : '';
    if (!seriesSlug) return map;
    const current = map.get(seriesSlug) || [];
    current.push(item);
    map.set(seriesSlug, current);
    return map;
  }, new Map());
}

export function getContinueReadingViewModel({ continueRecord, releases, pages, series }) {
  if (!continueRecord) return null;
  const matchedRelease = releases.find((item) => item.id === continueRecord.releaseSlug && isVisibleRelease(item));
  if (!matchedRelease) return null;

  const releasePages = getReleasedPagesForRelease(pages, matchedRelease.id);
  if (releasePages.length === 0) return null;

  const safeIndex = Math.max(0, Math.min(continueRecord.pageIndex, releasePages.length - 1));
  const page = releasePages[safeIndex];
  if (!page) return null;

  const parentSeries = series.find((item) => item.slug === matchedRelease.seriesSlug);
  return {
    releaseSlug: matchedRelease.id,
    releaseTitle: matchedRelease.title,
    seriesTitle: parentSeries?.title || null,
    issueNumber: matchedRelease.issueNumber,
    image: matchedRelease.coverImage || matchedRelease.image || page.image || null,
    pageNumber: Number(page.pageNumber) || safeIndex + 1,
    totalPages: releasePages.length,
  };
}

export function getReaderPagesForRelease(pages, releaseId) {
  return getReleasedPagesForRelease(pages, releaseId);
}

export function getVisibleReleases(releases) {
  return (Array.isArray(releases) ? releases : [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isVisibleRelease(item))
    .sort((a, b) => sortReleasesByNewest(a.item, b.item, a.index, b.index))
    .map(({ item }) => item);
}

export function getVisibleSeriesReleases(releases, seriesSlug) {
  return getVisibleReleases(releases).filter((item) => item.seriesSlug === seriesSlug);
}

export function getLatestSeriesIssues(releases, seriesSlug, limit = 4) {
  const safeLimit = Math.max(0, Number(limit) || 0);
  return getVisibleSeriesReleases(releases, seriesSlug).slice(0, safeLimit);
}

export function getArchiveSeriesIssues(releases, seriesSlug, limit = 4) {
  const safeLimit = Math.max(0, Number(limit) || 0);
  return getVisibleSeriesReleases(releases, seriesSlug).slice(safeLimit);
}

function clampReaderIndex(index, totalPages) {
  if (totalPages <= 0) return 0;
  return Math.max(0, Math.min(index, totalPages - 1));
}

export function getInitialReaderPageIndex({ totalPages, continueRecord, releaseId, requestedPageNumber }) {
  if (totalPages <= 0) return 0;

  // Explicit URL page hints take precedence over continue-reading local storage.
  if (Number.isInteger(requestedPageNumber) && requestedPageNumber > 0) {
    return clampReaderIndex(requestedPageNumber - 1, totalPages);
  }

  if (continueRecord?.releaseSlug === releaseId && Number.isInteger(continueRecord.pageIndex)) {
    return clampReaderIndex(continueRecord.pageIndex, totalPages);
  }

  return 0;
}
