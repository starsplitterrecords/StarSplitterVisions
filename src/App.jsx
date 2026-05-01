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
      <a href={`/releases/${release.id}`}>
        <img src={release.image} alt="" className="release-image" />
        <div className="release-meta">
          <p className="release-date">{formatDate(release.releaseDate)}</p>
          <h3>{release.title}</h3>
        </div>
      </a>
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

function ReleasePage({ release, series }) {
  return (
    <main className="page">
      <p className="eyebrow">
        <a href={`/series/${series.slug}`}>← Back to {series.title}</a>
      </p>
      <h1>{release.title}</h1>
      <p>Issue #{release.issueNumber}</p>
      <p>{formatDate(release.releaseDate)}</p>
      <img src={release.coverImage || release.image} alt="" className="release-image" />
      <p>{release.description}</p>
      <p>
        <a href={`/read/${release.id}`}>Read</a>
      </p>
      <p>{release.ctaLabel}</p>
    </main>
  );
}

function ReaderPage({ release, pages }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [release.id]);

  const releasePages = useMemo(
    () =>
      pages
        .filter((page) => page.releaseSlug === release.id)
        .sort((a, b) => a.pageNumber - b.pageNumber),
    [pages, release.id]
  );

  const currentPage = releasePages[index];

  if (releasePages.length === 0) {
    return (
      <main className="page">
        <p className="eyebrow">
          <a href={`/releases/${release.id}`}>← Back to release</a>
        </p>
        <h1>{release.title}</h1>
        <p>No pages available yet.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="eyebrow">
        <a href={`/releases/${release.id}`}>← Back to release</a>
      </p>
      <h1>{release.title}</h1>
      <h2>
        Page {currentPage.pageNumber}: {currentPage.title}
      </h2>
      <p>{currentPage.caption}</p>
      <img src={currentPage.image} alt={currentPage.title} className="release-image" />
      <p>
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          Previous
        </button>{' '}
        <button
          type="button"
          onClick={() => setIndex(index + 1)}
          disabled={index === releasePages.length - 1}
        >
          Next
        </button>
      </p>
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
  const [pages, setPages] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/content/series.json').then((response) => response.json()),
      fetch('/content/releases.json').then((response) => response.json()),
      fetch('/content/pages.json').then((response) => response.json())
    ])
      .then(([seriesData, releasesData, pagesData]) => {
        setSeries(seriesData.series ?? []);
        setReleases(releasesData.releases ?? []);
        setPages(pagesData.pages ?? []);
      })
      .catch(() => {
        setSeries([]);
        setReleases([]);
        setPages([]);
        setHasError(true);
      });
  }, []);

  const path = window.location.pathname;
  const seriesMatch = path.match(/^\/series\/([^/]+)$/);
  const releaseMatch = path.match(/^\/releases\/([^/]+)$/);
  const readMatch = path.match(/^\/read\/([^/]+)$/);

  if (hasError) {
    return <NotFound />;
  }

  if (path === '/') {
    return <HomePage series={series} />;
  }

  if (seriesMatch) {
    const selectedSeries = series.find((item) => item.slug === seriesMatch[1]);

    if (!selectedSeries) {
      return <NotFound />;
    }

    return <SeriesPage series={selectedSeries} releases={releases} />;
  }

  if (releaseMatch) {
    const selectedRelease = releases.find((item) => item.id === releaseMatch[1]);

    if (!selectedRelease) {
      return <NotFound />;
    }

    const parentSeries = series.find((item) => item.slug === selectedRelease.seriesSlug);

    if (!parentSeries) {
      return <NotFound />;
    }

    return <ReleasePage release={selectedRelease} series={parentSeries} />;
  }

  if (readMatch) {
    const selectedRelease = releases.find((item) => item.id === readMatch[1]);

    if (!selectedRelease) {
      return <NotFound />;
    }

    return <ReaderPage release={selectedRelease} pages={pages} />;
  }

  return <NotFound />;
}
