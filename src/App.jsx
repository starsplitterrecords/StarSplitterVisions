import { useEffect, useMemo, useState } from 'react';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function HomePage({ series }) {
  return (
    <main className="page">
      <h1>Star Splitter Visions</h1>
      <p>Original series lineup</p>
      <ul className="series-list">
        {series.map((item) => (
          <li key={item.slug}>
            <a href={`/series/${item.slug}`}>{item.title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

function SeriesHero({ series }) {
  return (
    <header className="series-hero">
      <img src={series.heroImage} alt="" className="series-hero-image" />
      <div className="series-hero-content">
        <p className="eyebrow">
          <a href="/">← All series</a>
        </p>
        <h1>{series.title}</h1>
        <p className="tagline">{series.tagline}</p>
        <p>{series.shortDescription}</p>
      </div>
    </header>
  );
}

function ReleaseCard({ release }) {
  return (
    <li className="release-card">
      <img src={release.image} alt="" className="release-image" />
      <div className="release-meta">
        <p className="release-date">{formatDate(release.releaseDate)}</p>
        <h3>{release.title}</h3>
      </div>
    </li>
  );
}

function SeriesPage({ series, releases }) {
  const visibleReleases = useMemo(
    () =>
      releases
        .filter(
          (release) =>
            release.seriesSlug === series.slug &&
            new Date(release.releaseDate) <= new Date()
        )
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)),
    [releases, series.slug]
  );

  return (
    <main className="page page-series">
      <SeriesHero series={series} />

      <section>
        <h2>Releases</h2>
        {visibleReleases.length === 0 ? (
          <p>No releases yet.</p>
        ) : (
          <ul className="release-grid">
            {visibleReleases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page">
      <h1>Not found</h1>
      <p>We couldn't find that page.</p>
      <p>
        <a href="/">Return home</a>
      </p>
    </main>
  );
}

export default function App() {
  const [series, setSeries] = useState([]);
  const [releases, setReleases] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/content/series.json').then((response) => response.json()),
      fetch('/content/releases.json').then((response) => response.json())
    ])
      .then(([seriesData, releasesData]) => {
        setSeries(seriesData.series ?? []);
        setReleases(releasesData.releases ?? []);
      })
      .catch(() => {
        setSeries([]);
        setReleases([]);
        setHasError(true);
      });
  }, []);

  const path = window.location.pathname;
  const match = path.match(/^\/series\/([^/]+)$/);

  if (hasError) {
    return <NotFound />;
  }

  if (!match) {
    return <HomePage series={series} />;
  }

  const selectedSeries = series.find((item) => item.slug === match[1]);

  if (!selectedSeries) {
    return <NotFound />;
  }

  return <SeriesPage series={selectedSeries} releases={releases} />;
}
