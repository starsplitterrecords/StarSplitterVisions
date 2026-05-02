export function isPublishedSoundtrack(soundtrack) {
  return soundtrack?.isPublished !== false;
}

export function getPlayableTracks(soundtrack) {
  if (!soundtrack || !Array.isArray(soundtrack.tracks)) return [];
  return soundtrack.tracks.filter((track) => typeof track?.audioSrc === 'string' && track.audioSrc.trim().length > 0);
}

export function getPlaylistLinks(soundtrack) {
  if (!soundtrack || !Array.isArray(soundtrack.playlistLinks)) return [];
  return soundtrack.playlistLinks.filter((link) =>
    typeof link?.label === 'string' && link.label.trim().length > 0 && typeof link?.url === 'string' && link.url.trim().length > 0
  );
}

export function findSoundtrackForRelease({ soundtracks, seriesSlug, releaseSlug, pageSlug }) {
  if (!Array.isArray(soundtracks) || !seriesSlug) return null;

  const scoped = soundtracks.filter((soundtrack) => soundtrack?.seriesSlug === seriesSlug && isPublishedSoundtrack(soundtrack));

  if (pageSlug) {
    const pageMatch = scoped.find((soundtrack) => soundtrack?.pageSlug === pageSlug && (!releaseSlug || soundtrack?.releaseSlug === releaseSlug));
    if (pageMatch) return pageMatch;
  }

  if (releaseSlug) {
    const releaseMatch = scoped.find((soundtrack) => soundtrack?.releaseSlug === releaseSlug && !soundtrack?.pageSlug);
    if (releaseMatch) return releaseMatch;
  }

  return scoped.find((soundtrack) => !soundtrack?.releaseSlug && !soundtrack?.pageSlug) || null;
}
