import { useEffect, useMemo, useState } from 'react';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function EmptyRail({ title, message }) {
  return (
    <section className="rail">
      <div className="rail-header">
        <h2>{title}</h2>
      </div>
      <div className="empty-rail">
        <p>{message}</p>
      </div>
    </section>
  );
}

function SearchField({ query, onChange }) {
  return (
    <label className="search-field">
      <span>Search</span>
      <input
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Find series or releases"
      />
    </label>
  );
}

function ReleaseCard({ release }) {
  return (
    <li className="release-card">
      <a href={`/releases/${release.id}`}>
        <img src={release.coverImage || release.image} alt="" className="release-image" />
        <div className="release-meta">
          <p className="release-date">{formatDate(release.releaseDate)}</p>
          <h3>{release.title}</h3>
        </div>
      </a>
    </li>
  );
}

function SeriesCard({ item }) {
  return (
    <li className="series-card">
      <a href={`/series/${item.slug}`}>
        <img src={item.heroImage} alt="" className="release-image" />
        <div className="release-meta">
          <h3>{item.title}</h3>
          <p>{item.tagline}</p>
        </div>
      </a>
    </li>
  );
}

function Rail({ title, children }) {
  return (
    <section className="rail">
      <div className="rail-header">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function HomePage({ series, releases, continueRelease }) {
  const [query, setQuery] = useState('');

  const now = new Date();
  const publishedReleases = useMemo(
    () => releases.filter((item) => new Date(item.releaseDate) <= now),
    [releases, now]
  );

  const latestReleases = useMemo(
    () => [...publishedReleases].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).slice(0, 6),
    [publishedReleases]
  );

  const filteredSeries = useMemo(() => {
    if (!query.trim()) {
      return series;
    }
    return series.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, series]);

  const filteredReleases = useMemo(() => {
    if (!query.trim()) {
      return latestReleases;
    }
    return latestReleases.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  }, [latestReleases, query]);

  return (
    <main className="page page-home">
      <header>
        <h1>Star Splitter Visions</h1>
        <p>Original series lineup</p>
      </header>

      <SearchField query={query} onChange={setQuery} />

      {continueRelease && (
        <section className="continue-module">
          <p className="release-date">Continue Reading</p>
          <a href={`/read/${continueRelease.id}`}>
            <img src={continueRelease.coverImage || continueRelease.image} alt="" className="release-image" />
            <h2>{continueRelease.title}</h2>
            <p>{formatDate(continueRelease.releaseDate)}</p>
          </a>
        </section>
      )}

      <Rail title="Latest Releases">
        {filteredReleases.length === 0 ? (
          <div className="empty-rail">
            <p>No matching releases yet.</p>
          </div>
        ) : (
          <ul className="release-grid">
            {filteredReleases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </ul>
        )}
      </Rail>

      <Rail title="Series">
        {filteredSeries.length === 0 ? (
          <div className="empty-rail">
            <p>No matching series found.</p>
          </div>
        ) : (
          <ul className="release-grid">
            {filteredSeries.map((item) => (
              <SeriesCard key={item.slug} item={item} />
            ))}
          </ul>
        )}
      </Rail>
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

function SeriesPage({ series, releases }) {
  const [query, setQuery] = useState('');
  const now = new Date();

  const visibleReleases = useMemo(
    () =>
      releases
        .filter(
          (release) =>
            release.seriesSlug === series.slug &&
            new Date(release.releaseDate) <= now
        )
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)),
    [releases, series.slug, now]
  );

  const searchedReleases = useMemo(() => {
    if (!query.trim()) {
      return visibleReleases;
    }
    return visibleReleases.filter((release) => release.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, visibleReleases]);

  const latestIssues = searchedReleases.slice(0, 4);
  const archive = searchedReleases.slice(4);

  return (
    <main className="page page-series">
      <SeriesHero series={series} />
      <SearchField query={query} onChange={setQuery} />

      <Rail title="Latest Issues">
        {latestIssues.length === 0 ? (
          <div className="empty-rail"><p>No released issues match yet.</p></div>
        ) : (
          <ul className="release-grid">{latestIssues.map((release) => <ReleaseCard key={release.id} release={release} />)}</ul>
        )}
      </Rail>

      <Rail title="Archive">
        {archive.length === 0 ? (
          <div className="empty-rail"><p>Archive expands as new issues arrive.</p></div>
        ) : (
          <ul className="release-grid">{archive.map((release) => <ReleaseCard key={release.id} release={release} />)}</ul>
        )}
      </Rail>

      <EmptyRail title="World" message="Lore drops, factions, and maps will appear here." />
      <EmptyRail title="Extras" message="Interviews, concept decks, and behind-the-scenes extras are coming." />
    </main>
  );
}

function ReleasePage({ release, series }) { return <main className="page"><p className="eyebrow"><a href={`/series/${series.slug}`}>← Back to {series.title}</a></p><h1>{release.title}</h1><p>Issue #{release.issueNumber}</p><p>{formatDate(release.releaseDate)}</p><img src={release.coverImage || release.image} alt="" className="release-image" /><p>{release.description}</p><p><a href={`/read/${release.id}`} className="primary-button">{release.ctaLabel || 'Read'}</a></p></main>; }

function ReaderPage({ release, pages }) {
  const [index, setIndex] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [release.id]);

  useEffect(() => {
    setHasImageError(false);
  }, [index, release.id]);

  useEffect(() => {
    localStorage.setItem('ssv:last-read-release', release.id);
  }, [release.id]);

  const releasePages = useMemo(
    () =>
      pages
        .filter((page) => {
          if (page.releaseSlug !== release.id) return false;
          if (!page.status || page.status === 'released') return true;
          if (page.status === 'draft') return false;
          if (page.status === 'scheduled') {
            if (!page.releaseDate) return false;
            return new Date(page.releaseDate) <= new Date();
          }
          return false;
        })
        .sort((a, b) => {
          const aNumber = Number.isFinite(a.pageNumber) ? a.pageNumber : Number.POSITIVE_INFINITY;
          const bNumber = Number.isFinite(b.pageNumber) ? b.pageNumber : Number.POSITIVE_INFINITY;
          return aNumber - bNumber;
        }),
    [pages, release.id]
  );

  const currentPage = releasePages[index];

  if (releasePages.length === 0) {
    return (
      <main className="page">
        <p className="eyebrow"><a href={`/releases/${release.id}`}>← Back to release</a></p>
        <h1>{release.title}</h1>
        <p>No released pages are available for this release yet.</p>
      </main>
    );
  }

  return (
    <main className="page page-reader">
      <p className="eyebrow"><a href={`/releases/${release.id}`}>← Back to release</a></p>
      <h1>{release.title}</h1>
      <p className="reader-count">Page {index + 1} of {releasePages.length}</p>
      <h2>{currentPage.title || `Page ${currentPage.pageNumber || index + 1}`}</h2>
      <p>{currentPage.caption}</p>
      <div className="reader-image-frame">
        {!currentPage.image || hasImageError ? (
          <div className="reader-image-fallback">Page image unavailable.</div>
        ) : (
          <img
            src={currentPage.image}
            alt={currentPage.title || `Page ${index + 1}`}
            className="reader-image"
            onError={() => setHasImageError(true)}
          />
        )}
      </div>
      <p><button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>Previous</button>{' '}<button type="button" onClick={() => setIndex(index + 1)} disabled={index === releasePages.length - 1}>Next</button></p>
    </main>
  );
}

function NotFound() { return <main className="page"><h1>Not found</h1><p>We couldn't find that page.</p><p><a href="/">Return home</a></p></main>; }

export default function App() {
  const [series, setSeries] = useState([]);
  const [releases, setReleases] = useState([]);
  const [pages, setPages] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [continueReleaseId, setContinueReleaseId] = useState('');

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
        setSeries([]); setReleases([]); setPages([]); setHasError(true);
      });

    setContinueReleaseId(localStorage.getItem('ssv:last-read-release') || '');
    const onFocus = () => setContinueReleaseId(localStorage.getItem('ssv:last-read-release') || '');
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const path = window.location.pathname;
  const seriesMatch = path.match(/^\/series\/([^/]+)$/);
  const releaseMatch = path.match(/^\/releases\/([^/]+)$/);
  const readMatch = path.match(/^\/read\/([^/]+)$/);

  if (hasError) return <NotFound />;
  if (path === '/') return <HomePage series={series} releases={releases} continueRelease={releases.find((r) => r.id === continueReleaseId)} />;
  if (seriesMatch) {
    const selectedSeries = series.find((item) => item.slug === seriesMatch[1]);
    if (!selectedSeries) return <NotFound />;
    return <SeriesPage series={selectedSeries} releases={releases} />;
  }
  if (releaseMatch) {
    const selectedRelease = releases.find((item) => item.id === releaseMatch[1]);
    if (!selectedRelease) return <NotFound />;
    const parentSeries = series.find((item) => item.slug === selectedRelease.seriesSlug);
    if (!parentSeries) return <NotFound />;
    return <ReleasePage release={selectedRelease} series={parentSeries} />;
  }
  if (readMatch) {
    const selectedRelease = releases.find((item) => item.id === readMatch[1]);
    if (!selectedRelease) {
      return (
        <main className="page">
          <h1>Release not found.</h1>
          <p><a href="/">Return home</a></p>
        </main>
      );
    }
    return <ReaderPage release={selectedRelease} pages={pages} />;
  }
  return <NotFound />;
}
