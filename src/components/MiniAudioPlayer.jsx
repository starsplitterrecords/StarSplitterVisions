import { useEffect, useMemo, useRef, useState } from 'react';
import { getPlayableTracks, getPlaylistLinks } from '../lib/soundtracks';

export default function MiniAudioPlayer({ soundtrack }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const playableTracks = useMemo(() => getPlayableTracks(soundtrack), [soundtrack]);
  const playlistLinks = useMemo(() => getPlaylistLinks(soundtrack), [soundtrack]);
  const hasPlayableAudio = playableTracks.length > 0;
  const currentTrack = hasPlayableAudio ? playableTracks[currentTrackIndex] : null;

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

  if (!soundtrack || isDismissed) return null;
  const hasLinks = playlistLinks.length > 0;
  const hasMetadata = Boolean(soundtrack.title || soundtrack.subtitle || soundtrack.description);
  if (!hasPlayableAudio && !hasLinks && !hasMetadata) return null;

  async function togglePlayback() {
    if (!audioRef.current || !currentTrack?.audioSrc) return;
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
    if (playableTracks.length <= 1) return;
    setCurrentTrackIndex((value) => (value === 0 ? playableTracks.length - 1 : value - 1));
  }

  function goToNextTrack() {
    if (playableTracks.length <= 1) return;
    setCurrentTrackIndex((value) => (value + 1) % playableTracks.length);
  }

  return <aside className="mini-player" aria-label="Soundtrack companion player"><div className="mini-player-header"><p className="mini-player-icon" aria-hidden="true">♪</p><div className="mini-player-meta"><p className="mini-player-title">{soundtrack.title || 'Soundtrack companion'}</p><p className="mini-player-subtitle">{currentTrack ? [currentTrack.title, currentTrack.artist].filter(Boolean).join(' — ') : soundtrack.subtitle || 'Audio companion'}</p></div><div className="mini-player-actions">{hasPlayableAudio ? <button type="button" className="mini-player-btn" onClick={togglePlayback} aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}>{isPlaying ? 'Pause' : 'Play'}</button> : null}<button type="button" className="mini-player-btn" onClick={() => setIsExpanded((value) => !value)} aria-label={isExpanded ? 'Collapse soundtrack details' : 'Expand soundtrack details'}>{isExpanded ? 'Hide' : 'More'}</button><button type="button" className="mini-player-btn" onClick={() => setIsDismissed(true)} aria-label="Hide soundtrack player">×</button></div></div>{hasPlayableAudio ? <audio ref={audioRef} src={currentTrack?.audioSrc} preload="metadata" onEnded={goToNextTrack} /> : null}{isExpanded ? <div className="mini-player-expanded">{soundtrack.description ? <p className="mini-player-description">{soundtrack.description}</p> : null}{hasPlayableAudio ? <div className="mini-player-track-controls"><button type="button" className="mini-player-btn" onClick={goToPreviousTrack} disabled={playableTracks.length <= 1} aria-label="Previous playable track">Prev</button><button type="button" className="mini-player-btn" onClick={togglePlayback} aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}>{isPlaying ? 'Pause' : 'Play'}</button><button type="button" className="mini-player-btn" onClick={goToNextTrack} disabled={playableTracks.length <= 1} aria-label="Next playable track">Next</button></div> : null}{Array.isArray(soundtrack.moodNotes) && soundtrack.moodNotes.length > 0 ? <div><p className="mini-player-section-title">Mood Notes</p><ul className="mini-player-list">{soundtrack.moodNotes.map((note, idx) => <li key={`${note}-${idx}`}>{note}</li>)}</ul></div> : null}{Array.isArray(soundtrack.tracks) && soundtrack.tracks.length > 0 ? <div><p className="mini-player-section-title">Tracks</p><ol className="mini-player-list">{soundtrack.tracks.map((track) => <li key={track.id || track.title}>{[track.title || 'Untitled track', track.artist, track.duration].filter(Boolean).join(' — ')}</li>)}</ol></div> : null}{hasLinks ? <div><p className="mini-player-section-title">Links</p><div className="mini-player-links">{playlistLinks.map((link) => <a key={`${link.label}-${link.url}`} className="mini-player-link" href={link.url} target="_blank" rel="noopener noreferrer">{link.platform || link.label}</a>)}</div></div> : null}</div> : null}</aside>;
}
