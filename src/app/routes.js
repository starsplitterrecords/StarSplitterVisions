// Central registry for public/admin route identifiers and path prefixes.
// Future route additions should be defined here, then wired in routeMatching.js
// and rendered in PublicRoutes.jsx.
export const ROUTE_TYPES = {
  ADMIN: 'admin',
  HOME: 'home',
  SERIES_DETAIL: 'seriesDetail',
  RELEASE_DETAIL: 'releaseDetail',
  READER: 'reader',
  UNKNOWN: 'unknown',
};

export const ROUTE_PREFIXES = {
  ADMIN: '/admin',
  HOME: '/',
  SERIES: '/series/',
  RELEASES: '/releases/',
  READ: '/read/',
};
