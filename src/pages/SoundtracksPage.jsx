import { useEffect, useMemo } from 'react';

function SoundtrackCard({ soundtrack, seriesTitle }) {
  const releaseLabel = soundtrack.releaseSlug ? `Release: ${soundtrack.releaseSlug}` : null;
  return (
    <li className="soundtrack-card-item">
      <a className="soundtrack-card" href={`/soundtracks/${soundtrack.slug}`}>
        {soundtrack.coverImage ? (
          <img src={soundtrack.coverImage} alt={`${soundtrack.title} cover`} className="release-image" />
        ) : (
          <div className="visual-fallback">{soundtrack.title}</div>
        )}
        <div className="release-meta">
          <p className="release-eyebrow">{seriesTitle || soundtrack.seriesSlug}</p>
          <h3>{soundtrack.title}</h3>
          {releaseLabel ? <p className="release-detail">{releaseLabel}</p> : null}
          {soundtrack.shortDescription ? <p className="release-detail">{soundtrack.shortDescription}</p> : null}
          <p><span className="primary-button">View</span></p>
        </div>
      </a>
    </li>
  );
}

export default function SoundtracksPage({ soundtracks, seriesBySlug }) {
  useEffect(() => {
    document.title = 'Soundtracks | Star Splitter Visions';
  }, []);

  const published = useMemo(() => soundtracks.filter((item) => item.isPublished !== false), [soundtracks]);

  return <main className="page page-soundtracks"><header className="home-header"><h1>Soundtracks</h1><p>Music and audio companions for Star Splitter Visions series</p></header>{published.length === 0 ? <section className="empty-rail"><p>No soundtracks available yet.</p></section> : <ul className="soundtrack-grid">{published.map((soundtrack) => <SoundtrackCard key={soundtrack.id} soundtrack={soundtrack} seriesTitle={seriesBySlug.get(soundtrack.seriesSlug)?.title} />)}</ul>}</main>;
}
