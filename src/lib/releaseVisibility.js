import { parseDate } from './dateUtils';

export function isVisibleRelease(release) {
  if (release.status === 'draft') return false;
  if (release.status === 'scheduled') {
    const releaseDate = parseDate(release.releaseDate);
    if (releaseDate && releaseDate > new Date()) return false;
  }
  return true;
}

export function sortReleasesByNewest(a, b, aIndex, bIndex) {
  const aDate = parseDate(a.releaseDate);
  const bDate = parseDate(b.releaseDate);
  if (aDate && bDate) return bDate - aDate;
  if (aDate && !bDate) return -1;
  if (!aDate && bDate) return 1;
  const aIssue = Number(a.issueNumber);
  const bIssue = Number(b.issueNumber);
  if (Number.isFinite(aIssue) && Number.isFinite(bIssue)) return bIssue - aIssue;
  return aIndex - bIndex;
}

export function getReleasedPagesForRelease(pages, releaseId) {
  return pages
    .filter((page) => page.releaseSlug === releaseId && (!parseDate(page.releaseDate) || parseDate(page.releaseDate) <= new Date()))
    .sort((a, b) => (Number.isFinite(a.pageNumber) ? a.pageNumber : Number.MAX_SAFE_INTEGER) - (Number.isFinite(b.pageNumber) ? b.pageNumber : Number.MAX_SAFE_INTEGER));
}
