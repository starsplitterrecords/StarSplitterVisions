import { useEffect, useMemo, useState } from 'react';

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatDate(value) {
  const parsed = parseDate(value);
  if (!parsed) {
    return null;
  }

  return parsed.toLocaleDateString(undefined, {
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

function ReleaseCard({ release, seriesBySlug }) {
  const imageSrc = release.coverImage || release.heroImage || release.image;
  const releaseDate = formatDate(release.releaseDate);
  const seriesTitle = seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug;

  return (
    <li className="release-card">
      {release.id ? (
        <a href={`/releases/${release.id}`}>
          {imageSrc ? (
            <img src={imageSrc} alt={`${release.title} cover`} className="release-image" />
          ) : (
            <div className="visual-fallback" aria-hidden="true">
              <span>{release.title}</span>
            </div>
          )}
          <div className="release-meta">
            {seriesTitle ? <p className="release-eyebrow">{seriesTitle}</p> : null}
            <h3>{release.title}</h3>
            {release.issueNumber !== undefined ? <p className="release-detail">Issue #{release.issueNumber}</p> : null}
            {release.description ? <p className="release-detail">{release.description}</p> : null}
            {releaseDate ? <p className="release-date">{releaseDate}</p> : null}
          </div>
        </a>
      ) : (
        <div>
          <div className="visual-fallback" aria-hidden="true"><span>{release.title}</span></div>
          <div className="release-meta"><h3>{release.title}</h3></div>
        </div>
      )}
    </li>
  );
}

function SeriesCard({ item }) {
  const imageSrc = item.heroImage || item.image;
  const supportText = item.tagline || item.shortDescription || item.longDescription;

  return (
    <li className="series-card">
      {item.slug ? (
        <a href={`/series/${item.slug}`}>
          {imageSrc ? (
            <img src={imageSrc} alt={`${item.title} series art`} className="release-image" />
          ) : (
            <div className="visual-fallback" aria-hidden="true">
              <span>{item.logoText || item.title}</span>
            </div>
          )}
          <div className="release-meta">
            <h3>{item.title}</h3>
            {supportText ? <p className="release-detail">{supportText}</p> : null}
          </div>
        </a>
      ) : null}
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
  const seriesBySlug = useMemo(() => new Map(series.map((item) => [item.slug, item])), [series]);

  const visibleReleases = useMemo(() => {
    const now = new Date();

    return releases
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (item.status === 'draft') {
          return false;
        }

        if (item.status === 'scheduled') {
          const releaseDate = parseDate(item.releaseDate);
          if (releaseDate && releaseDate > now) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const aDate = parseDate(a.item.releaseDate);
        const bDate = parseDate(b.item.releaseDate);

        if (aDate && bDate) {
          return bDate - aDate;
        }

        if (aDate && !bDate) {
          return -1;
        }

        if (!aDate && bDate) {
          return 1;
        }

        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [releases]);

  return (
    <main className="page page-home">
      <header className="home-header">
        <h1>Star Splitter Visions</h1>
        <p>Browse new releases and cinematic worlds across the Star Splitter slate.</p>
      </header>

      {continueRelease && (
        <section className="continue-module">
          <p className="release-date">Continue Reading</p>
          <a href={`/read/${continueRelease.id}`}>
            <img src={continueRelease.coverImage || continueRelease.image} alt={`${continueRelease.title} cover`} className="release-image" />
            <h2>{continueRelease.title}</h2>
            {formatDate(continueRelease.releaseDate) ? <p>{formatDate(continueRelease.releaseDate)}</p> : null}
          </a>
        </section>
      )}

      <Rail title="Latest Releases">
        {visibleReleases.length === 0 ? (
          <div className="empty-rail">
            <p>No releases available yet.</p>
          </div>
        ) : (
          <ul className="rail-row">
            {visibleReleases.map((release) => (
              <ReleaseCard key={release.id} release={release} seriesBySlug={seriesBySlug} />
            ))}
          </ul>
        )}
      </Rail>

      <Rail title="Series">
        {series.length === 0 ? (
          <div className="empty-rail">
            <p>No series available yet.</p>
          </div>
        ) : (
          <ul className="rail-row">
            {series.map((item) => (
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
          <ul className="release-grid">{latestIssues.map((release) => <ReleaseCard key={release.id} release={release} seriesBySlug={new Map()} />)}</ul>
        )}
      </Rail>

      <Rail title="Archive">
        {archive.length === 0 ? (
          <div className="empty-rail"><p>Archive expands as new issues arrive.</p></div>
        ) : (
          <ul className="release-grid">{archive.map((release) => <ReleaseCard key={release.id} release={release} seriesBySlug={new Map()} />)}</ul>
        )}
      </Rail>

      <EmptyRail title="World" message="Lore drops, factions, and maps will appear here." />
      <EmptyRail title="Extras" message="Interviews, concept decks, and behind-the-scenes extras are coming." />
    </main>
  );
}

function ReaderPage({ release, pages }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [release.id]);

  const page = pages[index];

  return (
    <main className="page page-reader">
      <p className="eyebrow"><a href={`/releases/${release.id}`}>← Back to release</a></p>
      <h1>{release.title}</h1>
      <p className="reader-count">Page {index + 1} of {pages.length}</p>
      <div className="reader-image-frame">
        {page?.image ? (
          <img src={page.image} alt={`${release.title} page ${index + 1}`} className="reader-image" />
        ) : (
          <div className="reader-image-fallback">No page image available yet.</div>
        )}
      </div>
      <div className="reader-controls">
        <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>Previous</button>
        <button type="button" onClick={() => setIndex((value) => Math.min(pages.length - 1, value + 1))} disabled={index >= pages.length - 1}>Next</button>
      </div>
    </main>
  );
}

function ReleasePage({ release, series, pages }) {
  const releasePages = pages.filter((page) => page.releaseId === release.id);
  return (
    <main className="page page-release">
      <p className="eyebrow"><a href={`/series/${series.slug}`}>← Back to {series.title}</a></p>
      <header className="series-hero">
        <img src={release.coverImage || release.image} alt="" className="series-hero-image" />
        <div className="series-hero-content">
          <p className="release-date">{formatDate(release.releaseDate)}</p>
          <h1>{release.title}</h1>
          <p>{release.description}</p>
          {releasePages.length > 0 ? (
            <a className="primary-button" href={`/read/${release.id}`}>{release.ctaLabel || 'Read now'}</a>
          ) : null}
        </div>
      </header>
    </main>
  );
}

export default function App() {
  const [data, setData] = useState({ series: [], releases: [], pages: [] });

  useEffect(() => {
    Promise.all([
      fetch('/content/series.json').then((res) => res.json()),
      fetch('/content/releases.json').then((res) => res.json()),
      fetch('/content/pages.json').then((res) => res.json())
    ]).then(([seriesData, releasesData, pagesData]) => {
      setData({
        series: seriesData.series || [],
        releases: releasesData.releases || [],
        pages: pagesData.pages || []
      });
    });
  }, []);

  const path = window.location.pathname;
  const releaseId = path.startsWith('/releases/') ? path.replace('/releases/', '') : null;
  const seriesSlug = path.startsWith('/series/') ? path.replace('/series/', '') : null;
  const readReleaseId = path.startsWith('/read/') ? path.replace('/read/', '') : null;

  const series = data.series.find((item) => item.slug === seriesSlug);
  const release = data.releases.find((item) => item.id === releaseId || item.id === readReleaseId);
  const continueRelease = data.releases
    .filter((item) => new Date(item.releaseDate) <= new Date())
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))[0];

  if (series && !release && !readReleaseId) {
    return <SeriesPage series={series} releases={data.releases} />;
  }

  if (releaseId && release) {
    const parentSeries = data.series.find((item) => item.slug === release.seriesSlug) || { slug: '', title: 'Series' };
    return <ReleasePage release={release} series={parentSeries} pages={data.pages} />;
  }

  if (readReleaseId && release) {
    const releasePages = data.pages.filter((page) => page.releaseId === release.id);
    return <ReaderPage release={release} pages={releasePages} />;
  }

  return <HomePage series={data.series} releases={data.releases} continueRelease={continueRelease} />;
}
