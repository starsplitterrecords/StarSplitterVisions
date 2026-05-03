import { getVisibleReleasePages as getVisibleReleasePagesSelector } from '../../../content/contentSelectors';

export function getVisibleReleasePages(pages, releaseId) {
  return getVisibleReleasePagesSelector(pages, releaseId);
}
