import { useEffect, useMemo, useState } from 'react';
import AdminShell from './components/AdminShell';
import { clearContinueReading, getContinueReading } from './lib/continueReading';
import { validateExtraList, validatePageList, validateReaderSoundtrackList, validateReleaseList, validateSeriesList } from './lib/contentValidation';
import { getContinueReadingViewModel, getVisibleReleasePages } from './content/contentSelectors';
import HomePage from './pages/HomePage';
import SeriesPage from './pages/SeriesPage';
import ReleasePage from './pages/ReleasePage';
import ReaderPage from './pages/ReaderPage';

export default function App() {
  const [data, setData] = useState({ series: [], releases: [], pages: [], extras: [], soundtracks: [] });
  const [continueRecord, setContinueRecord] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/content/series.json').then((res) => res.json()),
      fetch('/content/releases.json').then((res) => res.json()),
      fetch('/content/pages.json').then((res) => res.json()),
      fetch('/content/extras.json').then((res) => res.json()).catch(() => ({ extras: [] })),
      fetch('/content/soundtracks.json').then((res) => res.json()).catch(() => ({ soundtracks: [] }))
    ]).then(([seriesData, releasesData, pagesData, extrasData, soundtracksData]) => {
      setData({
        series: validateSeriesList(seriesData?.series),
        releases: validateReleaseList(releasesData?.releases),
        pages: validatePageList(pagesData?.pages),
        extras: validateExtraList(extrasData?.extras),
        soundtracks: validateReaderSoundtrackList(soundtracksData?.soundtracks)
      });
    });
  }, []);

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
    return getContinueReadingViewModel({ continueRecord, releases: data.releases, pages: data.pages, series: data.series });
  }, [continueRecord, data.pages, data.releases, data.series]);

  if (path === '/admin') return <AdminShell />;

  if (series && !release && !readReleaseId) return <SeriesPage series={series} releases={data.releases} extras={data.extras} allSeries={data.series} soundtracksBySeries={soundtracksBySeries} />;
  if (releaseId && release) {
    const parentSeries = data.series.find((item) => item.slug === release.seriesSlug) || { slug: '', title: 'Series' };
    return <ReleasePage release={release} series={parentSeries} pages={data.pages} />;
  }
  if (readReleaseId && release) {
    const releasePages = getVisibleReleasePages(data.pages, release.id);
    const parentSeries = data.series.find((item) => item.slug === release.seriesSlug);
    return <ReaderPage release={release} pages={releasePages} series={parentSeries} soundtracks={data.soundtracks} />;
  }
  if (readReleaseId && !release) return <main className="page page-reader page-reader-empty"><h1>Release not found.</h1><p><a href="/">Return home</a></p></main>;

  return <HomePage series={data.series} releases={data.releases} extras={data.extras} soundtracksBySeries={soundtracksBySeries} continueReading={continueReading} onClearContinueReading={() => { clearContinueReading(); setContinueRecord(null); }} />;
}
