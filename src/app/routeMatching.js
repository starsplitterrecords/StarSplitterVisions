import { ROUTE_PREFIXES, ROUTE_TYPES } from './routes';

function parseRequestedPageNumber(search = window.location.search) {
  const query = typeof search === 'string' ? search : '';

  try {
    const params = new URLSearchParams(query);
    const pageValue = params.get('page');
    if (pageValue === null) return null;

    const parsed = Number(pageValue);
    if (!Number.isFinite(parsed)) return null;
    return Math.trunc(parsed);
  } catch {
    return null;
  }
}

export function matchRoute(pathname = window.location.pathname, search = window.location.search) {
  if (pathname === ROUTE_PREFIXES.ADMIN) return { type: ROUTE_TYPES.ADMIN };
  if (pathname === ROUTE_PREFIXES.HOME) return { type: ROUTE_TYPES.HOME };

  if (pathname.startsWith(ROUTE_PREFIXES.SERIES)) {
    return {
      type: ROUTE_TYPES.SERIES_DETAIL,
      seriesSlug: pathname.replace(ROUTE_PREFIXES.SERIES, ''),
    };
  }

  if (pathname.startsWith(ROUTE_PREFIXES.RELEASES)) {
    return {
      type: ROUTE_TYPES.RELEASE_DETAIL,
      releaseId: pathname.replace(ROUTE_PREFIXES.RELEASES, ''),
    };
  }

  if (pathname.startsWith(ROUTE_PREFIXES.READ)) {
    return {
      type: ROUTE_TYPES.READER,
      releaseId: pathname.replace(ROUTE_PREFIXES.READ, ''),
      requestedPageNumber: parseRequestedPageNumber(search),
    };
  }

  return { type: ROUTE_TYPES.UNKNOWN, path: pathname };
}
