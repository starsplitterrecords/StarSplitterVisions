import { parseDate } from '../lib/dateUtils';
import { isVisibleRelease } from '../lib/releaseVisibility';
import { sortPagesByPageNumber, sortReleasesByNewest, stripOriginalIndex, withOriginalIndex } from './contentOrdering';

const LATEST_ISSUES_LIMIT = 4;

export function getVisibleReleases(releases) {
  return stripOriginalIndex(
    withOriginalIndex(releases)
      .filter(({ item }) => isVisibleRelease(item))
      .sort((a, b) => sortReleasesByNewest(a.item, b.item, a.originalIndex, b.originalIndex))
  );
}

export function getVisibleSeriesReleases(releases, seriesSlug) {
  return getVisibleReleases(releases).filter((item) => item.seriesSlug === seriesSlug);
}

export function getLatestSeriesIssues(releases, seriesSlug) {
  return getVisibleSeriesReleases(releases, seriesSlug).slice(0, LATEST_ISSUES_LIMIT);
}

export function getArchiveSeriesIssues(releases, seriesSlug) {
  return getVisibleSeriesReleases(releases, seriesSlug).slice(LATEST_ISSUES_LIMIT);
}

export function getVisibleReleasePages(pages, releaseId) {
  return stripOriginalIndex(
    withOriginalIndex(pages)
      .filter((page) => page.item.releaseSlug === releaseId && (!parseDate(page.item.releaseDate) || parseDate(page.item.releaseDate) <= new Date()))
      .sort((a, b) => sortPagesByPageNumber(a.item, b.item) || a.originalIndex - b.originalIndex)
  );
}

export function getContinueReadingViewModel({ continueRecord, releases, pages, series }) {
  if (!continueRecord) return null;
  const matchedRelease = releases.find((item) => item.id === continueRecord.releaseSlug && isVisibleRelease(item));
  if (!matchedRelease) return null;

  const releasePages = getVisibleReleasePages(pages, matchedRelease.id);
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
    totalPages: releasePages.length
  };
}
