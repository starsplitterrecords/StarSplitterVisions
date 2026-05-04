import { useEffect, useMemo, useRef, useState } from 'react';
import { getPlaylistLinks, normalizeTracks } from '../../lib/soundtracks';

function getExternalTrackLabel(track) {
  const platform = (track?.platform || '').toLowerCase();
  if (platform.includes('spotify')) return 'Open on Spotify';
  if (platform.includes('youtube')) return 'Open on YouTube';
  return 'Open Track';
}

export default function MiniAudioPlayer({ soundtrack }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const tracks = useMemo(() => normalizeTracks(soundtrack), [soundtrack]);
  const playlistLinks = useMemo(() => getPlaylistLinks(soundtrack), [soundtrack]);
  const currentTrack = tracks[currentTrackIndex] || null;
  const hasTracks = tracks.length > 0;
  const hasPlayableAudio = Boolean(currentTrack?.audioSrc);
  const hasExternalTrackLink = Boolean(currentTrack?.externalUrl);
  const hasFullSoundtrackLink = playlistLinks.length > 0;

  useEffect(() => {
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [soundtrack?.id]);

  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [currentTrackIndex]);

  if (!soundtrack) return null;
  if (!hasTracks && !hasFullSoundtrackLink) return null;

  async function togglePlayback() {
    if (!audioRef.current || !hasPlayableAudio) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function goToPreviousTrack() {
    if (tracks.length <= 1) return;
    setCurrentTrackIndex((value) => (value === 0 ? tracks.length - 1 : value - 1));
  }

  function goToNextTrack() {
    if (tracks.length <= 1) return;
    setCurrentTrackIndex((value) => (value + 1) % tracks.length);
  }

  return (
    <aside className="mini-player" aria-label="Soundtrack companion player">
      <div className="mini-player-header">
        <p className="mini-player-icon" aria-hidden="true">♪</p>
        <div className="mini-player-meta">
          <p className="mini-player-title">{soundtrack.title || 'Soundtrack Companion'}</p>
          <p className="mini-player-subtitle">{currentTrack ? [currentTrack.title, currentTrack.artist].filter(Boolean).join(' — ') : 'Untitled Track'}</p>
        </div>
        <div className="mini-player-actions">
          <button type="button" className="mini-player-btn" onClick={goToPreviousTrack} disabled={tracks.length <= 1} aria-label="Previous track">Prev</button>
          {hasPlayableAudio ? (
            <button type="button" className="mini-player-btn" onClick={togglePlayback} aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          ) : hasExternalTrackLink ? (
            <a className="mini-player-link" href={currentTrack.externalUrl} target="_blank" rel="noopener noreferrer" aria-label={getExternalTrackLabel(currentTrack)}>
              {getExternalTrackLabel(currentTrack)}
            </a>
          ) : null}
          <button type="button" className="mini-player-btn" onClick={goToNextTrack} disabled={tracks.length <= 1} aria-label="Next track">Next</button>
        </div>
      </div>

      {hasPlayableAudio ? <audio ref={audioRef} src={currentTrack.audioSrc} preload="metadata" onEnded={goToNextTrack} onError={() => setIsPlaying(false)} /> : null}

      <div className="mini-player-footer">
        {hasFullSoundtrackLink ? (
          <a className="mini-player-link" href={playlistLinks[0].url} target="_blank" rel="noopener noreferrer">
            Full Soundtrack
          </a>
        ) : null}
      </div>
    </aside>
  );
}
