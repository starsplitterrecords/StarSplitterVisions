import { sortReleasesByNewest } from '../content/contentOrdering';
import { getVisibleReleasePages } from '../features/reader/lib/getVisibleReleasePages';
import { parseDate } from './dateUtils';

export function isVisibleRelease(release) {
  if (release.status === 'draft') return false;
  if (release.status === 'scheduled') {
    const releaseDate = parseDate(release.releaseDate);
    if (releaseDate && releaseDate > new Date()) return false;
  }
  return true;
}

export { sortReleasesByNewest };

export function getReleasedPagesForRelease(pages, releaseId) {
  return getVisibleReleasePages(pages, releaseId);
}
