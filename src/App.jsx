import { useEffect, useMemo, useState } from 'react';
import ContentRail from './components/ContentRail';
import MediaCard from './components/MediaCard';
import ReleaseCard from './components/ReleaseCard';
import SeriesHero from './components/SeriesHero';
import ReaderShell from './components/ReaderShell';
import AdminShell from './components/AdminShell';
import { clearContinueReading, getContinueReading, setContinueReading } from './lib/continueReading';
import { validateExtraList, validatePageList, validateReleaseList, validateSeriesList, validateSoundtrackList } from './lib/contentValidation';

const LATEST_ISSUES_LIMIT = 4;
const DEFAULT_SERIES_IDENTITY = {
  accent: '#7f8cff',
  secondary: '#3a4d80',
  background: '#0a0d17',
};

const warnedInvalidDates = new Set();

function parseDate(value, context = 'date') { if (!value) return null; const parsed = new Date(value); if (Number.isNaN(parsed.getTime())) { const key = `${context}:${value}`; if (!warnedInvalidDates.has(key)) { warnedInvalidDates.add(key); console.warn(`[content] Invalid ${context}:`, value); } return null; } return parsed; }
function formatDate(value) { const parsed = parseDate(value); if (!parsed) return null; return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
function isVisibleRelease(release) { if (release.status === 'draft') return false; if (release.status === 'scheduled') { const releaseDate = parseDate(release.releaseDate); if (releaseDate && releaseDate > new Date()) return false; } return true; }
function sortReleasesByNewest(a, b, aIndex, bIndex) { const aDate = parseDate(a.releaseDate); const bDate = parseDate(b.releaseDate); if (aDate && bDate) return bDate - aDate; if (aDate && !bDate) return -1; if (!aDate && bDate) return 1; const aIssue = Number(a.issueNumber); const bIssue = Number(b.issueNumber); if (Number.isFinite(aIssue) && Number.isFinite(bIssue)) return bIssue - aIssue; return aIndex - bIndex; }
const COLOR_PATTERN = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|rgb\(|rgba\(|hsl\(|hsla\()/;
const safeColor = (value, fallback) => (typeof value === 'string' && COLOR_PATTERN.test(value.trim()) ? value.trim() : fallback);
const toneClass = (tone) => ['dark', 'deep', 'ocean', 'cosmic', 'bureaucratic', 'sunforge', 'neutral'].includes(tone) ? `series-tone-${tone}` : 'series-tone-dark';

function ContinueReadingModule({ item, onClear }) {
  const title = item.releaseTitle || 'Continue Reading';

  return <section className="continue-module" aria-label="Continue reading"><div className="continue-module-art">{item.image ? <img src={item.image} alt={`${title} cover`} className="release-image" /> : <div className="visual-fallback">Continue Reading</div>}</div><div className="continue-module-content"><p className="release-date">Continue Reading</p>{item.seriesTitle ? <p className="release-eyebrow">{item.seriesTitle}</p> : null}<h2>{title}</h2>{item.issueNumber ? <p className="release-detail">Issue {item.issueNumber}</p> : null}{item.pageNumber && item.totalPages ? <p className="release-detail">Page {item.pageNumber} of {item.totalPages}</p> : null}<div className="continue-module-actions"><a className="primary-button" href={`/read/${item.releaseSlug}`}>Continue Reading</a><button type="button" className="text-button" onClick={onClear}>Clear</button></div></div></section>;
}


const SEARCH_FILTERS = ['all', 'series', 'releases', 'extras', 'soundtracks'];

function createSearchText(fields) {
  return fields.filter((value) => typeof value === 'string' && value.trim()).join(' ').toLowerCase();
}

function SearchModule({ series, releases }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const seriesBySlug = useMemo(() => new Map(series.map((item) => [item.slug, item])), [series]);

  const seriesItems = useMemo(() => series.map((item) => ({
    id: `series:${item.slug || item.title}`,
    type: 'series',
    title: item.title,
    description: item.shortDescription || item.tagline || item.longDescription,
    href: item.slug ? `/series/${item.slug}` : null,
    image: item.thumbnailImage || item.heroImage || item.image,
    eyebrow: 'Series',
    context: item.genre || item.tone,
    searchable: createSearchText([item.title, item.logoText, item.tagline, item.shortDescription, item.longDescription, item.genre, item.tone])
  })), [series]);

  const visibleReleases = useMemo(() => releases.filter((item) => isVisibleRelease(item)), [releases]);

  const releaseItems = useMemo(() => visibleReleases.map((item) => ({
    id: `release:${item.id || item.title}`,
    type: 'releases',
    title: item.title,
    description: item.description,
    href: item.id ? `/releases/${item.id}` : null,
    image: item.coverImage || item.image,
    seriesTitle: seriesBySlug.get(item.seriesSlug)?.title,
    issueNumber: item.issueNumber,
    searchable: createSearchText([item.title, String(item.issueNumber ?? ''), item.description, item.seriesSlug, item.releaseDate])
  })), [visibleReleases, seriesBySlug]);

  const extrasItems = useMemo(() => series.flatMap((item) => (item.extras || item.relatedLinks || item.links || []).map((extra, idx) => ({
    id: `extra:${item.slug || idx}:${extra.title || idx}`,
    type: 'extras',
    title: extra.title,
    description: extra.description,
    href: extra.url || extra.href || null,
    image: extra.image,
    eyebrow: extra.type || extra.label || 'Extra',
    seriesTitle: item.title,
    searchable: createSearchText([extra.title, extra.type, extra.label, extra.description, item.slug])
  }))), [series]);

  const soundtrackItems = useMemo(() => series.flatMap((item) => (item.soundtracks || item.soundtrack || []).map((track, idx) => ({
    id: `soundtrack:${item.slug || idx}:${track.title || track.trackTitle || idx}`,
    type: 'soundtracks',
    title: track.title || track.trackTitle,
    description: track.description,
    href: track.url || track.href || null,
    image: track.image,
    eyebrow: 'Soundtrack',
    seriesTitle: item.title,
    searchable: createSearchText([track.title, track.trackTitle, track.artist, track.description, track.mood, item.slug])
  }))), [series]);

  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 0;

  const groupedResults = useMemo(() => {
    if (!hasQuery) return { series: [], releases: [], extras: [], soundtracks: [] };
    const matcher = (item) => item.searchable.includes(normalizedQuery) && item.title;
    const filtered = {
      series: seriesItems.filter(matcher),
      releases: releaseItems.filter(matcher),
      extras: extrasItems.filter(matcher),
      soundtracks: soundtrackItems.filter(matcher),
    };

    if (filter === 'all') return filtered;
    return {
      series: filter === 'series' ? filtered.series : [],
      releases: filter === 'releases' ? filtered.releases : [],
      extras: filter === 'extras' ? filtered.extras : [],
      soundtracks: filter === 'soundtracks' ? filtered.soundtracks : [],
    };
  }, [extrasItems, filter, hasQuery, normalizedQuery, releaseItems, seriesItems, soundtrackItems]);

  const hasResults = Object.values(groupedResults).some((items) => items.length > 0);

  return <section className="search-module" aria-label="Search content"><label className="search-field" htmlFor="home-search-input"><span>Search the archive</span><input id="home-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search series, releases, extras, and soundtracks." /></label><div className="search-filters" role="tablist" aria-label="Content type filter">{SEARCH_FILTERS.map((value) => <button key={value} type="button" className={`search-filter ${filter === value ? 'is-active' : ''}`} onClick={() => setFilter(value)} aria-pressed={filter === value}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>{!hasQuery ? <p className="search-hint">Search series, releases, extras, and soundtracks.</p> : null}{hasQuery && !hasResults ? <p className="search-hint">No matching content found.</p> : null}{hasQuery && hasResults ? <div className="search-results">{groupedResults.series.length > 0 ? <ContentRail title="Series" emptyMessage=""><ul className="rail-row">{groupedResults.series.map((item) => <MediaCard key={item.id} className="series-card" href={item.href || undefined} image={item.image} title={item.title} description={item.description} eyebrow={item.eyebrow} subtitle={item.context} fallbackText={item.title} />)}</ul></ContentRail> : null}{groupedResults.releases.length > 0 ? <ContentRail title="Releases" emptyMessage=""><ul className="rail-row">{groupedResults.releases.map((item) => <ReleaseCard key={item.id} release={{ title: item.title, description: item.description, issueNumber: item.issueNumber, releaseDate: null, coverImage: item.image }} seriesTitle={item.seriesTitle} href={item.href || undefined} showDate={false} />)}</ul></ContentRail> : null}{groupedResults.extras.length > 0 ? <ContentRail title="Extras" emptyMessage=""><ul className="rail-row">{groupedResults.extras.map((item) => <MediaCard key={item.id} href={item.href || undefined} image={item.image} eyebrow={item.eyebrow} title={item.title} subtitle={item.seriesTitle} description={item.description} fallbackText={item.title} />)}</ul></ContentRail> : null}{groupedResults.soundtracks.length > 0 ? <ContentRail title="Soundtracks" emptyMessage=""><ul className="rail-row">{groupedResults.soundtracks.map((item) => <MediaCard key={item.id} href={item.href || undefined} image={item.image} eyebrow={item.eyebrow} title={item.title} subtitle={item.seriesTitle} description={item.description} fallbackText={item.title} />)}</ul></ContentRail> : null}</div> : null}</section>;
}

function HomePage({ series, releases, continueReading, onClearContinueReading }) {
  const seriesBySlug = useMemo(() => new Map(series.map((item) => [item.slug, item])), [series]);
  const visibleReleases = useMemo(() => releases.map((item, index) => ({ item, index })).filter(({ item }) => isVisibleRelease(item)).sort((a, b) => sortReleasesByNewest(a.item, b.item, a.index, b.index)).map(({ item }) => item), [releases]);

  return <main className="page page-home"><header className="home-header"><h1>Star Splitter Visions</h1><p>Browse new releases and cinematic worlds across the Star Splitter slate.</p></header>{continueReading ? <ContinueReadingModule item={continueReading} onClear={onClearContinueReading} /> : null}<SearchModule series={series} releases={releases} /><ContentRail title="Latest Releases" emptyMessage="No releases available yet."><ul className="rail-row">{visibleReleases.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} />)}</ul></ContentRail><ContentRail title="Series" emptyMessage="No series available yet."><ul className="rail-row">{series.map((item) => <MediaCard key={item.slug} className="series-card" href={item.slug ? `/series/${item.slug}` : undefined} image={item.thumbnailImage || item.heroImage || item.image} alt={`${item.title} series art`} title={item.title} description={item.tagline || item.shortDescription || item.longDescription} fallbackText={item.logoText || item.title} />)}</ul></ContentRail></main>;
}

function SeriesPage({ series, releases, allSeries }) {
  const seriesBySlug = useMemo(() => new Map(allSeries.map((item) => [item.slug, item])), [allSeries]);
  const visibleSeriesReleases = useMemo(() => releases.map((item, index) => ({ item, index })).filter(({ item }) => item.seriesSlug === series.slug && isVisibleRelease(item)).sort((a, b) => sortReleasesByNewest(a.item, b.item, a.index, b.index)).map(({ item }) => item), [releases, series.slug]);
  const latestIssues = visibleSeriesReleases.slice(0, LATEST_ISSUES_LIMIT);
  const archiveIssues = visibleSeriesReleases.slice(LATEST_ISSUES_LIMIT);
  const worldDetails = [series.worldTitle || series.worldName, series.worldPremise, series.longDescription, series.genre, series.tone, series.audiencePromise, series.coreConflict, series.seriesEngine].filter(Boolean);
  const relatedSeries = allSeries.filter((item) => item.slug !== series.slug && series.worldSlug && item.worldSlug === series.worldSlug);
  const extraItems = validateExtraList(series.extras || series.relatedLinks || series.links);
  const soundtrackItems = validateSoundtrackList(series.soundtracks);
  const accent = safeColor(series.accentColor, DEFAULT_SERIES_IDENTITY.accent);
  const secondary = safeColor(series.secondaryColor, DEFAULT_SERIES_IDENTITY.secondary);
  const background = safeColor(series.backgroundColor, DEFAULT_SERIES_IDENTITY.background);

  return <main className={`page page-series ${toneClass(series.backgroundTone)}`} style={{ '--series-accent': accent, '--series-secondary': secondary, '--series-background': background }}><SeriesHero series={series} /><ContentRail title="Latest Issues" emptyMessage="No released issues are available yet."><ul className="rail-row">{latestIssues.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} />)}</ul></ContentRail><ContentRail title="Archive" emptyMessage="The archive will appear here as releases are added."><ul className="release-grid release-grid-compact">{archiveIssues.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} variant="compact" />)}</ul></ContentRail><ContentRail title="World" emptyMessage="World details are coming soon.">{worldDetails.length === 0 && relatedSeries.length === 0 ? null : <div className="world-card"><ul className="world-meta">{worldDetails.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}</ul>{relatedSeries.length > 0 ? <div><h3>Related Series</h3><ul className="related-series">{relatedSeries.map((item) => <li key={item.slug}><a href={`/series/${item.slug}`}>{item.title}</a></li>)}</ul></div> : null}</div>}</ContentRail><ContentRail title="Extras" emptyMessage="Extras will appear here as they are added."><ul className="rail-row">{extraItems.map((extra, idx) => <MediaCard key={`${extra.title || 'extra'}-${idx}`} href={extra.url || extra.href} eyebrow={extra.type || extra.label || 'Extra'} title={extra.title || `Extra ${idx + 1}`} description={extra.description} fallbackText={extra.title || `Extra ${idx + 1}`} />)}</ul></ContentRail><ContentRail title="Soundtracks" emptyMessage="Soundtracks will appear here as they are added."><ul className="rail-row">{soundtrackItems.map((soundtrack, idx) => <MediaCard key={`${soundtrack.title}-${idx}`} href={soundtrack.playlistUrl || soundtrack.url || soundtrack.href} eyebrow={soundtrack.artist || 'Soundtrack'} title={soundtrack.title || `Soundtrack ${idx + 1}`} description={soundtrack.description || soundtrack.mood} fallbackText={soundtrack.title || `Soundtrack ${idx + 1}`} />)}</ul></ContentRail></main>;
}

function ReaderPage({ release, pages, series }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const saved = getContinueReading();
    if (!saved || saved.releaseSlug !== release.id || pages.length === 0) {
      setIndex(0);
      return;
    }

    const boundedIndex = Math.max(0, Math.min(saved.pageIndex, pages.length - 1));
    const page = pages[boundedIndex];
    if (!page) {
      setIndex(0);
      return;
    }

    setIndex(boundedIndex);
  }, [release.id, pages]);

  const totalPages = pages.length;
  const page = pages[index];
  const canPrevious = index > 0;
  const canNext = index < totalPages - 1;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => { setImageFailed(false); }, [index, release.id]);

  useEffect(() => {
    if (totalPages === 0) return;
    const preloadTargets = [pages[index - 1]?.image, pages[index + 1]?.image].filter((image) => typeof image === 'string' && image.trim().length > 0);
    preloadTargets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [index, pages, totalPages]);

  useEffect(() => {
    if (totalPages === 0) return;
    const onKeyDown = (event) => {
      const element = event.target;
      if (element instanceof HTMLElement && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName))) return;
      if ((event.key === 'ArrowRight' || event.key.toLowerCase() === 'd' || event.key.toLowerCase() === 'j') && canNext) {
        event.preventDefault();
        setIndex((value) => Math.min(totalPages - 1, value + 1));
      }
      if ((event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'k') && canPrevious) {
        event.preventDefault();
        setIndex((value) => Math.max(0, value - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canNext, canPrevious, totalPages]);


  useEffect(() => {
    if (!release?.id || totalPages === 0 || !pages[index]) return;

    setContinueReading({
      releaseSlug: release.id,
      pageNumber: Number(pages[index].pageNumber) || index + 1,
      pageIndex: index,
      updatedAt: new Date().toISOString(),
    });
  }, [index, pages, release?.id, totalPages]);

  const identityParts = [series?.title, release.title || release.id, totalPages > 0 ? `Page ${index + 1} of ${totalPages}` : null].filter(Boolean);

  return (
    <ReaderShell
      releaseHref={`/releases/${release.id}`}
      overlayText={identityParts.join(' · ')}
      currentPage={index + 1}
      totalPages={totalPages}
      onPrevious={() => setIndex((value) => Math.max(0, value - 1))}
      onNext={() => setIndex((value) => Math.min(totalPages - 1, value + 1))}
      canPrevious={canPrevious}
      canNext={canNext}
    >
      {totalPages === 0 ? (
        <div className="reader-empty-state">
          <p>No released pages are available for this release yet.</p>
          <a href={`/releases/${release.id}`}>Back to release</a>
        </div>
      ) : (
        <div className="reader-image-frame">
          {page?.image && !imageFailed ? (
            <img src={page.image} alt={`${release.title || 'Release'} page ${index + 1}`} className="reader-image" onError={() => setImageFailed(true)} />
          ) : (
            <div className="reader-image-fallback" role="status">Page image unavailable.</div>
          )}
        </div>
      )}
    </ReaderShell>
  );
}

function ReleasePage({ release, series, pages }) { const releasePages = pages.filter((page) => page.releaseSlug === release.id); return <main className="page page-release"><p className="eyebrow"><a href={`/series/${series.slug}`}>← Back to {series.title}</a></p><header className="series-hero"><img src={release.coverImage || release.image} alt="" className="series-hero-image" /><div className="series-hero-content"><p className="release-date">{formatDate(release.releaseDate)}</p><h1>{release.title}</h1><p>{release.description}</p>{releasePages.length > 0 ? <a className="primary-button" href={`/read/${release.id}`}>{release.ctaLabel || 'Read now'}</a> : null}</div></header></main>; }

export default function App() {
  const [data, setData] = useState({ series: [], releases: [], pages: [] });
  const [continueRecord, setContinueRecord] = useState(null);
  useEffect(() => { Promise.all([fetch('/content/series.json').then((res) => res.json()), fetch('/content/releases.json').then((res) => res.json()), fetch('/content/pages.json').then((res) => res.json())]).then(([seriesData, releasesData, pagesData]) => setData({ series: validateSeriesList(seriesData?.series), releases: validateReleaseList(releasesData?.releases), pages: validatePageList(pagesData?.pages) })); }, []);
  useEffect(() => { setContinueRecord(getContinueReading()); }, []);
  const path = window.location.pathname;
  const releaseId = path.startsWith('/releases/') ? path.replace('/releases/', '') : null;
  const seriesSlug = path.startsWith('/series/') ? path.replace('/series/', '') : null;
  const readReleaseId = path.startsWith('/read/') ? path.replace('/read/', '') : null;
  if (path === '/admin') return <AdminShell />;
  const series = data.series.find((item) => item.slug === seriesSlug);
  const release = data.releases.find((item) => item.id === releaseId || item.id === readReleaseId);
  const continueReading = useMemo(() => {
    if (!continueRecord) return null;

    const matchedRelease = data.releases.find((item) => item.id === continueRecord.releaseSlug && isVisibleRelease(item));
    if (!matchedRelease) return null;

    const releasePages = data.pages
      .filter((page) => page.releaseSlug === matchedRelease.id && (!parseDate(page.releaseDate) || parseDate(page.releaseDate) <= new Date()))
      .sort((a, b) => (Number.isFinite(a.pageNumber) ? a.pageNumber : Number.MAX_SAFE_INTEGER) - (Number.isFinite(b.pageNumber) ? b.pageNumber : Number.MAX_SAFE_INTEGER));
    if (releasePages.length === 0) return null;

    const safeIndex = Math.max(0, Math.min(continueRecord.pageIndex, releasePages.length - 1));
    const page = releasePages[safeIndex];
    if (!page) return null;

    const parentSeries = data.series.find((item) => item.slug === matchedRelease.seriesSlug);
    return {
      releaseSlug: matchedRelease.id,
      releaseTitle: matchedRelease.title,
      seriesTitle: parentSeries?.title || null,
      issueNumber: matchedRelease.issueNumber,
      image: matchedRelease.coverImage || matchedRelease.image || page.image || null,
      pageNumber: Number(page.pageNumber) || safeIndex + 1,
      totalPages: releasePages.length,
    };
  }, [continueRecord, data.pages, data.releases, data.series]);

  if (series && !release && !readReleaseId) return <SeriesPage series={series} releases={data.releases} allSeries={data.series} />;
  if (releaseId && release) { const parentSeries = data.series.find((item) => item.slug === release.seriesSlug) || { slug: '', title: 'Series' }; return <ReleasePage release={release} series={parentSeries} pages={data.pages} />; }
  if (readReleaseId && release) { const releasePages = data.pages.filter((page) => page.releaseSlug === release.id && (!parseDate(page.releaseDate) || parseDate(page.releaseDate) <= new Date())).sort((a, b) => (Number.isFinite(a.pageNumber) ? a.pageNumber : Number.MAX_SAFE_INTEGER) - (Number.isFinite(b.pageNumber) ? b.pageNumber : Number.MAX_SAFE_INTEGER)); const parentSeries = data.series.find((item) => item.slug === release.seriesSlug); return <ReaderPage release={release} pages={releasePages} series={parentSeries} />; }
  if (readReleaseId && !release) return <main className="page page-reader page-reader-empty"><h1>Release not found.</h1><p><a href="/">Return home</a></p></main>;
  return <HomePage series={data.series} releases={data.releases} continueReading={continueReading} onClearContinueReading={() => { clearContinueReading(); setContinueRecord(null); }} />;
}
