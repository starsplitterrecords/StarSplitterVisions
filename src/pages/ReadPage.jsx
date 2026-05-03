import { useMemo, useState, useEffect } from 'react';
import ReleaseCard from '../components/ReleaseCard';
import { isVisibleRelease } from '../lib/releaseVisibility';
import { parseDate } from '../lib/dateUtils';

function compareReleases(a, b) {
  const aDate = parseDate(a.releaseDate);
  const bDate = parseDate(b.releaseDate);
  if (aDate && bDate && aDate.getTime() !== bDate.getTime()) return bDate - aDate;
  if (aDate && !bDate) return -1;
  if (!aDate && bDate) return 1;
  const bySeries = (a.seriesTitle || '').localeCompare(b.seriesTitle || '');
  if (bySeries !== 0) return bySeries;
  return (a.title || '').localeCompare(b.title || '');
}

export default function ReadPage({ series, releases }) {
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    document.title = 'Read | Star Splitter Visions';
    const existing = document.querySelector('meta[name="description"]');
    const description = 'Read the latest comics and illustrated releases from Star Splitter Visions.';
    if (existing) existing.setAttribute('content', description);
  }, []);

  const seriesBySlug = useMemo(() => new Map(series.map((item) => [item.slug, item])), [series]);

  const allReleases = useMemo(() => releases
    .filter((item) => isVisibleRelease(item))
    .map((item) => ({ ...item, seriesTitle: seriesBySlug.get(item.seriesSlug)?.title || item.seriesSlug || 'Series' }))
    .sort(compareReleases), [releases, seriesBySlug]);

  const filtered = useMemo(() => {
    const base = seriesFilter === 'all' ? allReleases : allReleases.filter((item) => item.seriesSlug === seriesFilter);
    return sortOrder === 'oldest' ? [...base].reverse() : base;
  }, [allReleases, seriesFilter, sortOrder]);

  return <main className="page page-read"><header className="home-header"><h1>Read</h1><p>Start with the latest releases from Star Splitter Visions.</p><p>Browse everything currently available, across every series.</p></header><section className="read-controls" aria-label="Release filters"><label>Series<select value={seriesFilter} onChange={(event) => setSeriesFilter(event.target.value)}><option value="all">All</option>{series.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label><label>Sort<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label></section>{allReleases.length === 0 ? <section className="empty-rail"><p>No releases are available yet.</p><a className="primary-button" href="/">Browse Series</a></section> : filtered.length === 0 ? <section className="empty-rail"><p>No releases match this filter.</p></section> : <ul className="release-grid">{filtered.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={release.seriesTitle} href={release.id ? `/read/${release.id}` : null} seriesHref={release.seriesSlug ? `/series/${release.seriesSlug}` : null} showCta className="release-card-read" />)}</ul>}</main>;
}
