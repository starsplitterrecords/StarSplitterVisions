const AUDIO_SOURCE_FIELDS = ['audioSrc', 'audioUrl', 'url'];
const EXTERNAL_LINK_FIELDS = ['externalUrl', 'url', 'href'];

export function isPublishedSoundtrack(soundtrack) {
  return soundtrack?.isPublished !== false;
}

function getTrackAudioSrc(track) {
  const source = AUDIO_SOURCE_FIELDS.find((field) => typeof track?.[field] === 'string' && track[field].trim().length > 0);
  return source ? track[source].trim() : '';
}

function getTrackExternalUrl(track) {
  const source = EXTERNAL_LINK_FIELDS.find((field) => typeof track?.[field] === 'string' && track[field].trim().length > 0);
  return source ? track[source].trim() : '';
}

export function normalizeTracks(soundtrack) {
  if (!soundtrack || !Array.isArray(soundtrack.tracks)) return [];
  return soundtrack.tracks.map((track, index) => {
    const title = typeof track?.title === 'string' && track.title.trim().length > 0 ? track.title.trim() : 'Untitled Track';
    return {
      ...track,
      id: track?.id || `track-${index}`,
      title,
      artist: typeof track?.artist === 'string' ? track.artist.trim() : '',
      duration: typeof track?.duration === 'string' ? track.duration.trim() : '',
      audioSrc: getTrackAudioSrc(track),
      externalUrl: getTrackExternalUrl(track),
      platform: typeof track?.platform === 'string' ? track.platform.trim() : ''
    };
  });
}

export function getPlayableTracks(soundtrack) {
  return normalizeTracks(soundtrack).filter((track) => track.audioSrc);
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
