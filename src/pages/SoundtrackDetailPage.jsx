import { useEffect } from 'react';

export default function SoundtrackDetailPage({ soundtrack, series, release }) {
  useEffect(() => {
    document.title = `${soundtrack.title} | Star Splitter Visions`;
  }, [soundtrack.title]);

  return <main className="page page-release"><p className="eyebrow"><a href="/soundtracks">← Back to Soundtracks</a></p><header className="series-hero">{soundtrack.coverImage ? <img src={soundtrack.coverImage} alt={`${soundtrack.title} cover`} className="series-hero-image" /> : null}<div className="series-hero-content"><h1>{soundtrack.title}</h1>{series ? <p><a href={`/series/${series.slug}`}>{series.title}</a></p> : null}{release ? <p><a href={`/releases/${release.id}`}>Linked release: {release.title}</a></p> : null}<p>{soundtrack.longDescription || soundtrack.shortDescription || soundtrack.description}</p>{soundtrack.mood ? <p className="release-detail">Mood: {soundtrack.mood}</p> : null}</div></header><section className="rail"><div className="rail-header"><h2>Tracks</h2></div>{Array.isArray(soundtrack.tracks) && soundtrack.tracks.length > 0 ? <ol className="world-meta">{soundtrack.tracks.map((track, idx) => <li key={track.id || `${track.title}-${idx}`}><a href={track.externalUrl || track.url || track.audioSrc} target="_blank" rel="noopener noreferrer" aria-label={`Open ${track.title} in external source`}>{track.title || `Track ${idx + 1}`}</a>{track.artist ? ` — ${track.artist}` : ''}</li>)}</ol> : <div className="empty-rail"><p>No tracks listed yet.</p></div>}</section></main>;
}
