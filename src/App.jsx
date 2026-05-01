import { useEffect, useMemo, useState } from 'react';
import ContentRail from './components/ContentRail';
import MediaCard from './components/MediaCard';
import ReleaseCard from './components/ReleaseCard';
import SeriesHero from './components/SeriesHero';
import ReaderShell from './components/ReaderShell';

const LATEST_ISSUES_LIMIT = 4;
const DEFAULT_SERIES_IDENTITY = {
  accent: '#7f8cff',
  secondary: '#3a4d80',
  background: '#0a0d17',
};

function parseDate(value) { if (!value) return null; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? null : parsed; }
function formatDate(value) { const parsed = parseDate(value); if (!parsed) return null; return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
function isVisibleRelease(release) { if (release.status === 'draft') return false; if (release.status === 'scheduled') { const releaseDate = parseDate(release.releaseDate); if (releaseDate && releaseDate > new Date()) return false; } return true; }
function sortReleasesByNewest(a, b, aIndex, bIndex) { const aDate = parseDate(a.releaseDate); const bDate = parseDate(b.releaseDate); if (aDate && bDate) return bDate - aDate; if (aDate && !bDate) return -1; if (!aDate && bDate) return 1; const aIssue = Number(a.issueNumber); const bIssue = Number(b.issueNumber); if (Number.isFinite(aIssue) && Number.isFinite(bIssue)) return bIssue - aIssue; return aIndex - bIndex; }
const COLOR_PATTERN = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|rgb\(|rgba\(|hsl\(|hsla\()/;
const safeColor = (value, fallback) => (typeof value === 'string' && COLOR_PATTERN.test(value.trim()) ? value.trim() : fallback);
const toneClass = (tone) => ['dark', 'deep', 'ocean', 'cosmic', 'bureaucratic', 'sunforge', 'neutral'].includes(tone) ? `series-tone-${tone}` : 'series-tone-dark';

function HomePage({ series, releases, continueRelease }) {
  const seriesBySlug = useMemo(() => new Map(series.map((item) => [item.slug, item])), [series]);
  const visibleReleases = useMemo(() => releases.map((item, index) => ({ item, index })).filter(({ item }) => isVisibleRelease(item)).sort((a, b) => sortReleasesByNewest(a.item, b.item, a.index, b.index)).map(({ item }) => item), [releases]);

  return <main className="page page-home"><header className="home-header"><h1>Star Splitter Visions</h1><p>Browse new releases and cinematic worlds across the Star Splitter slate.</p></header>{continueRelease && <section className="continue-module"><p className="release-date">Continue Reading</p><a href={`/read/${continueRelease.id}`}><img src={continueRelease.coverImage || continueRelease.image} alt={`${continueRelease.title} cover`} className="release-image" /><h2>{continueRelease.title}</h2>{formatDate(continueRelease.releaseDate) ? <p>{formatDate(continueRelease.releaseDate)}</p> : null}</a></section>}<ContentRail title="Latest Releases" emptyMessage="No releases available yet."><ul className="rail-row">{visibleReleases.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} />)}</ul></ContentRail><ContentRail title="Series" emptyMessage="No series available yet."><ul className="rail-row">{series.map((item) => <MediaCard key={item.slug} className="series-card" href={item.slug ? `/series/${item.slug}` : undefined} image={item.thumbnailImage || item.heroImage || item.image} alt={`${item.title} series art`} title={item.title} description={item.tagline || item.shortDescription || item.longDescription} fallbackText={item.logoText || item.title} />)}</ul></ContentRail></main>;
}

function SeriesPage({ series, releases, allSeries }) {
  const seriesBySlug = useMemo(() => new Map(allSeries.map((item) => [item.slug, item])), [allSeries]);
  const visibleSeriesReleases = useMemo(() => releases.map((item, index) => ({ item, index })).filter(({ item }) => item.seriesSlug === series.slug && isVisibleRelease(item)).sort((a, b) => sortReleasesByNewest(a.item, b.item, a.index, b.index)).map(({ item }) => item), [releases, series.slug]);
  const latestIssues = visibleSeriesReleases.slice(0, LATEST_ISSUES_LIMIT);
  const archiveIssues = visibleSeriesReleases.slice(LATEST_ISSUES_LIMIT);
  const worldDetails = [series.worldTitle || series.worldName, series.worldPremise, series.longDescription, series.genre, series.tone, series.audiencePromise, series.coreConflict, series.seriesEngine].filter(Boolean);
  const relatedSeries = allSeries.filter((item) => item.slug !== series.slug && series.worldSlug && item.worldSlug === series.worldSlug);
  const extraItems = (series.extras || series.relatedLinks || series.links || []).filter(Boolean);
  const accent = safeColor(series.accentColor, DEFAULT_SERIES_IDENTITY.accent);
  const secondary = safeColor(series.secondaryColor, DEFAULT_SERIES_IDENTITY.secondary);
  const background = safeColor(series.backgroundColor, DEFAULT_SERIES_IDENTITY.background);

  return <main className={`page page-series ${toneClass(series.backgroundTone)}`} style={{ '--series-accent': accent, '--series-secondary': secondary, '--series-background': background }}><SeriesHero series={series} /><ContentRail title="Latest Issues" emptyMessage="No released issues are available yet."><ul className="rail-row">{latestIssues.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} />)}</ul></ContentRail><ContentRail title="Archive" emptyMessage="The archive will appear here as releases are added."><ul className="release-grid release-grid-compact">{archiveIssues.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} variant="compact" />)}</ul></ContentRail><ContentRail title="World" emptyMessage="World details are coming soon.">{worldDetails.length === 0 && relatedSeries.length === 0 ? null : <div className="world-card"><ul className="world-meta">{worldDetails.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}</ul>{relatedSeries.length > 0 ? <div><h3>Related Series</h3><ul className="related-series">{relatedSeries.map((item) => <li key={item.slug}><a href={`/series/${item.slug}`}>{item.title}</a></li>)}</ul></div> : null}</div>}</ContentRail><ContentRail title="Extras" emptyMessage="Extras will appear here as they are added."><ul className="rail-row">{extraItems.map((extra, idx) => <MediaCard key={`${extra.title || 'extra'}-${idx}`} href={extra.url || extra.href} eyebrow={extra.type || extra.label || 'Extra'} title={extra.title || `Extra ${idx + 1}`} description={extra.description} fallbackText={extra.title || `Extra ${idx + 1}`} />)}</ul></ContentRail></main>;
}

function ReaderPage({ release, pages }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [release.id]);
  const page = pages[index];
  return <ReaderShell releaseTitle={release.title} releaseHref={`/releases/${release.id}`} currentPage={index + 1} totalPages={pages.length} onPrevious={() => setIndex((value) => Math.max(0, value - 1))} onNext={() => setIndex((value) => Math.min(pages.length - 1, value + 1))} canPrevious={index > 0} canNext={index < pages.length - 1}><div className="reader-image-frame">{page?.image ? <img src={page.image} alt={`${release.title} page ${index + 1}`} className="reader-image" /> : <div className="reader-image-fallback">No page image available yet.</div>}</div></ReaderShell>;
}

function ReleasePage({ release, series, pages }) { const releasePages = pages.filter((page) => page.releaseId === release.id); return <main className="page page-release"><p className="eyebrow"><a href={`/series/${series.slug}`}>← Back to {series.title}</a></p><header className="series-hero"><img src={release.coverImage || release.image} alt="" className="series-hero-image" /><div className="series-hero-content"><p className="release-date">{formatDate(release.releaseDate)}</p><h1>{release.title}</h1><p>{release.description}</p>{releasePages.length > 0 ? <a className="primary-button" href={`/read/${release.id}`}>{release.ctaLabel || 'Read now'}</a> : null}</div></header></main>; }

export default function App() {
  const [data, setData] = useState({ series: [], releases: [], pages: [] });
  useEffect(() => { Promise.all([fetch('/content/series.json').then((res) => res.json()), fetch('/content/releases.json').then((res) => res.json()), fetch('/content/pages.json').then((res) => res.json())]).then(([seriesData, releasesData, pagesData]) => setData({ series: seriesData.series || [], releases: releasesData.releases || [], pages: pagesData.pages || [] })); }, []);
  const path = window.location.pathname;
  const releaseId = path.startsWith('/releases/') ? path.replace('/releases/', '') : null;
  const seriesSlug = path.startsWith('/series/') ? path.replace('/series/', '') : null;
  const readReleaseId = path.startsWith('/read/') ? path.replace('/read/', '') : null;
  const series = data.series.find((item) => item.slug === seriesSlug);
  const release = data.releases.find((item) => item.id === releaseId || item.id === readReleaseId);
  const continueRelease = data.releases.filter((item) => parseDate(item.releaseDate) && parseDate(item.releaseDate) <= new Date()).sort((a, b) => sortReleasesByNewest(a, b, 0, 0))[0];

  if (series && !release && !readReleaseId) return <SeriesPage series={series} releases={data.releases} allSeries={data.series} />;
  if (releaseId && release) { const parentSeries = data.series.find((item) => item.slug === release.seriesSlug) || { slug: '', title: 'Series' }; return <ReleasePage release={release} series={parentSeries} pages={data.pages} />; }
  if (readReleaseId && release) { const releasePages = data.pages.filter((page) => page.releaseId === release.id); return <ReaderPage release={release} pages={releasePages} />; }
  return <HomePage series={data.series} releases={data.releases} continueRelease={continueRelease} />;
}
