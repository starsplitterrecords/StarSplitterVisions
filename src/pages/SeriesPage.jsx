import { useMemo } from 'react';
import ContentRail from '../components/ContentRail';
import MediaCard from '../components/MediaCard';
import ReleaseCard from '../components/ReleaseCard';
import SeriesHero from '../components/SeriesHero';
import { getArchiveSeriesIssues, getLatestSeriesIssues } from '../app/selectors';
import { validateExtraList, validateSoundtrackList } from '../lib/contentValidation';

const LATEST_ISSUES_LIMIT = 4;
const DEFAULT_SERIES_IDENTITY = { accent: '#7f8cff', secondary: '#3a4d80', background: '#0a0d17' };
const COLOR_PATTERN = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|rgb\(|rgba\(|hsl\(|hsla\()/;
const safeColor = (value, fallback) => (typeof value === 'string' && COLOR_PATTERN.test(value.trim()) ? value.trim() : fallback);
const toneClass = (tone) => ['dark', 'deep', 'ocean', 'cosmic', 'bureaucratic', 'sunforge', 'neutral'].includes(tone) ? `series-tone-${tone}` : 'series-tone-dark';

export default function SeriesPage({ series, releases, extras, allSeries, soundtracksBySeries }) {
  const seriesBySlug = useMemo(() => new Map(allSeries.map((item) => [item.slug, item])), [allSeries]);
  const latestIssues = useMemo(() => getLatestSeriesIssues(releases, series.slug, LATEST_ISSUES_LIMIT), [releases, series.slug]);
  const archiveIssues = useMemo(() => getArchiveSeriesIssues(releases, series.slug, LATEST_ISSUES_LIMIT), [releases, series.slug]);
  const worldDetails = [series.worldTitle || series.worldName, series.worldPremise, series.longDescription, series.genre, series.tone, series.audiencePromise, series.coreConflict, series.seriesEngine].filter(Boolean);
  const relatedSeries = allSeries.filter((item) => item.slug !== series.slug && series.worldSlug && item.worldSlug === series.worldSlug);
  const extraItems = validateExtraList(extras.filter((item) => item.seriesSlug === series.slug));
  const soundtrackItems = validateSoundtrackList(soundtracksBySeries.get(series.slug) || []);
  const accent = safeColor(series.accentColor, DEFAULT_SERIES_IDENTITY.accent);
  const secondary = safeColor(series.secondaryColor, DEFAULT_SERIES_IDENTITY.secondary);
  const background = safeColor(series.backgroundColor, DEFAULT_SERIES_IDENTITY.background);

  return <main className={`page page-series ${toneClass(series.backgroundTone)}`} style={{ '--series-accent': accent, '--series-secondary': secondary, '--series-background': background }}><SeriesHero series={series} /><ContentRail title="Latest Issues" emptyMessage="No released issues are available yet."><ul className="rail-row">{latestIssues.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} />)}</ul></ContentRail><ContentRail title="Archive" emptyMessage="The archive will appear here as releases are added."><ul className="release-grid release-grid-compact">{archiveIssues.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} variant="compact" />)}</ul></ContentRail><ContentRail title="World" emptyMessage="World details are coming soon.">{worldDetails.length === 0 && relatedSeries.length === 0 ? null : <div className="world-card"><ul className="world-meta">{worldDetails.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}</ul>{relatedSeries.length > 0 ? <div><h3>Related Series</h3><ul className="related-series">{relatedSeries.map((item) => <li key={item.slug}><a href={`/series/${item.slug}`}>{item.title}</a></li>)}</ul></div> : null}</div>}</ContentRail><ContentRail title="Extras" emptyMessage="Extras will appear here as they are added."><ul className="rail-row">{extraItems.map((extra, idx) => <MediaCard key={`${extra.title || 'extra'}-${idx}`} href={extra.url || extra.href} eyebrow={extra.type || extra.label || 'Extra'} title={extra.title || `Extra ${idx + 1}`} description={extra.description} fallbackText={extra.title || `Extra ${idx + 1}`} />)}</ul></ContentRail><ContentRail title="Soundtracks" emptyMessage="Soundtracks will appear here as they are added."><ul className="rail-row">{soundtrackItems.map((soundtrack, idx) => <MediaCard key={`${soundtrack.title}-${idx}`} href={soundtrack.playlistUrl || soundtrack.url || soundtrack.href} eyebrow={soundtrack.artist || 'Soundtrack'} title={soundtrack.title || `Soundtrack ${idx + 1}`} description={soundtrack.description || soundtrack.mood} fallbackText={soundtrack.title || `Soundtrack ${idx + 1}`} />)}</ul></ContentRail></main>;
}
