import { parseDate } from '../lib/dateUtils';

export function withOriginalIndex(items) {
  return items.map((item, index) => ({ item, originalIndex: index }));
}

export function stripOriginalIndex(items) {
  return items.map(({ item }) => item);
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

export function sortPagesByPageNumber(a, b) {
  const aPage = Number(a.pageNumber);
  const bPage = Number(b.pageNumber);
  const aValid = Number.isFinite(aPage);
  const bValid = Number.isFinite(bPage);

  if (aValid && bValid) return aPage - bPage;
  if (aValid && !bValid) return -1;
  if (!aValid && bValid) return 1;
  return 0;
}
