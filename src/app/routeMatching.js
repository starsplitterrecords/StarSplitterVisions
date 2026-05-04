export function matchRoute(pathname = window.location.pathname) {
  if (pathname === '/admin') return { type: 'admin' };
  if (pathname === '/') return { type: 'home' };

  if (pathname.startsWith('/series/')) {
    return { type: 'seriesDetail', seriesSlug: pathname.replace('/series/', '') };
  }

  if (pathname.startsWith('/releases/')) {
    return { type: 'releaseDetail', releaseId: pathname.replace('/releases/', '') };
  }

  if (pathname.startsWith('/read/')) {
    return { type: 'reader', releaseId: pathname.replace('/read/', '') };
  }

  return { type: 'unknown', path: pathname };
}
