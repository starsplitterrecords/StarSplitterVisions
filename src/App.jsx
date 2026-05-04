import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from './admin';
import { clearContinueReading, getContinueReading } from './features/continue-reading';
import { validateExtraList, validatePageList, validateReaderSoundtrackList, validateReleaseList, validateSeriesList } from './lib/contentValidation';
import { isVisibleRelease, getReleasedPagesForRelease } from './lib/releaseVisibility';
import { HomePage, SeriesPage, ReleasePage, ReaderPage } from './pages';
import AdminShell from './components/AdminShell';
import { clearContinueReading, getContinueReading } from './lib/continueReading';
import { isVisibleRelease, getReleasedPagesForRelease } from './lib/releaseVisibility';
import HomePage from './pages/HomePage';
import SeriesPage from './pages/SeriesPage';
import ReleasePage from './pages/ReleasePage';
import ReaderPage from './pages/ReaderPage';
import useContentData from './app/useContentData';
import AppLoadingState from './app/AppLoadingState';
import AppErrorState from './app/AppErrorState';
import AppEmptyState from './app/AppEmptyState';

export default function App() {
  const { data, isLoading, error } = useContentData();
  const [continueRecord, setContinueRecord] = useState(null);

  useEffect(() => { setContinueRecord(getContinueReading()); }, []);

  const path = window.location.pathname;
  const soundtracksBySeries = useMemo(() => (Array.isArray(data.soundtracks) ? data.soundtracks : []).reduce((map, item) => {
    const seriesSlug = typeof item?.seriesSlug === 'string' ? item.seriesSlug.trim() : '';
    if (!seriesSlug) return map;
    const current = map.get(seriesSlug) || [];
    current.push(item);
    map.set(seriesSlug, current);
    return map;
  }, new Map()), [data.soundtracks]);

  const releaseId = path.startsWith('/releases/') ? path.replace('/releases/', '') : null;
  const seriesSlug = path.startsWith('/series/') ? path.replace('/series/', '') : null;
  const readReleaseId = path.startsWith('/read/') ? path.replace('/read/', '') : null;

  const series = data.series.find((item) => item.slug === seriesSlug);
  const release = data.releases.find((item) => item.id === releaseId || item.id === readReleaseId);

  const continueReading = useMemo(() => {
    if (!continueRecord) return null;
    const matchedRelease = data.releases.find((item) => item.id === continueRecord.releaseSlug && isVisibleRelease(item));
    if (!matchedRelease) return null;
    const releasePages = getReleasedPagesForRelease(data.pages, matchedRelease.id);
    if (releasePages.length === 0) return null;
    const safeIndex = Math.max(0, Math.min(continueRecord.pageIndex, releasePages.length - 1));
    const page = releasePages[safeIndex];
    if (!page) return null;
    const parentSeries = data.series.find((item) => item.slug === matchedRelease.seriesSlug);
    return { releaseSlug: matchedRelease.id, releaseTitle: matchedRelease.title, seriesTitle: parentSeries?.title || null, issueNumber: matchedRelease.issueNumber, image: matchedRelease.coverImage || matchedRelease.image || page.image || null, pageNumber: Number(page.pageNumber) || safeIndex + 1, totalPages: releasePages.length };
  }, [continueRecord, data.pages, data.releases, data.series]);


  if (path === '/admin') return <AdminShell />;

  if (isLoading) return <AppLoadingState />;
  if (error) return <AppErrorState />;
  if (data.series.length === 0 && data.releases.length === 0) return <AppEmptyState />;

  if (series && !release && !readReleaseId) return <SeriesPage series={series} releases={data.releases} extras={data.extras} allSeries={data.series} soundtracksBySeries={soundtracksBySeries} />;
  if (releaseId && release) {
    const parentSeries = data.series.find((item) => item.slug === release.seriesSlug) || { slug: '', title: 'Series' };
    return <ReleasePage release={release} series={parentSeries} pages={data.pages} />;
  }
  if (readReleaseId && release) {
    const releasePages = getReleasedPagesForRelease(data.pages, release.id);
    const parentSeries = data.series.find((item) => item.slug === release.seriesSlug);
    return <ReaderPage release={release} pages={releasePages} series={parentSeries} soundtracks={data.soundtracks} />;
  }
  if (readReleaseId && !release) return <main className="page page-reader page-reader-empty"><h1>Release not found.</h1><p><a href="/">Return home</a></p></main>;

  return <HomePage series={data.series} releases={data.releases} extras={data.extras} soundtracksBySeries={soundtracksBySeries} continueReading={continueReading} onClearContinueReading={() => { clearContinueReading(); setContinueRecord(null); }} />;
}
