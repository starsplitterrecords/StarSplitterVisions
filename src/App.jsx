import { useEffect, useMemo, useState } from 'react';
import AdminShell from './components/AdminShell';
import SiteShell from './components/SiteShell';
import { clearContinueReading, getContinueReading } from './lib/continueReading';
import { validateExtraList, validatePageList, validateReaderSoundtrackList, validateReleaseList, validateSeriesList } from './lib/contentValidation';
import { isVisibleRelease, getReleasedPagesForRelease } from './lib/releaseVisibility';
import HomePage from './pages/HomePage';
import SeriesPage from './pages/SeriesPage';
import ReleasePage from './pages/ReleasePage';
import ReaderPage from './pages/ReaderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PressPage from './pages/PressPage';
import CollectionPage from './pages/CollectionPage';

const DEFAULT_META = { title: 'Star Splitter Visions', description: 'Independent comics and illustrated worlds from Star Splitter Visions.' };

function applyMeta(meta) {
  document.title = meta.title;
  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement('meta');
    description.setAttribute('name', 'description');
    document.head.appendChild(description);
  }
  description.setAttribute('content', meta.description);
}

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

  const hasExtras = data.extras.length > 0;
  let pageContent = <HomePage series={data.series} releases={data.releases} extras={data.extras} soundtracksBySeries={soundtracksBySeries} continueReading={continueReading} onClearContinueReading={() => { clearContinueReading(); setContinueRecord(null); }} />;
  let meta = DEFAULT_META;

  if (path === '/about') {
    pageContent = <AboutPage series={data.series} />;
    meta = { title: 'About | Star Splitter Visions', description: 'Learn about Star Splitter Visions, our creative mission, and featured comic worlds.' };
  } else if (path === '/contact') {
    pageContent = <ContactPage />;
    meta = { title: 'Contact | Star Splitter Visions', description: 'Contact Star Splitter Visions for general, press, and collaboration inquiries.' };
  } else if (path === '/press') {
    pageContent = <PressPage series={data.series} />;
    meta = { title: 'Press | Star Splitter Visions', description: 'Press-ready information, publisher blurb, and featured series from Star Splitter Visions.' };
  } else if (path === '/privacy' || path === '/terms') {
    const title = path === '/privacy' ? 'Privacy' : 'Terms';
    pageContent = <main className="page info-page"><header className="home-header"><h1>{title}</h1><p>This policy page is coming soon.</p></header></main>;
    meta = { title: `${title} | Star Splitter Visions`, description: `${title} information for Star Splitter Visions.` };
  } else if (path === '/series') {
    pageContent = <CollectionPage title="Series" items={data.series} type="series" />;
    meta = { title: 'Series | Star Splitter Visions', description: 'Explore all comic series published by Star Splitter Visions.' };
  } else if (path === '/releases') {
    pageContent = <CollectionPage title="Releases" items={data.releases.filter((item) => isVisibleRelease(item))} type="releases" />;
    meta = { title: 'Releases | Star Splitter Visions', description: 'Browse released issues and chapters from Star Splitter Visions.' };
  } else if (path === '/extras') {
    pageContent = <CollectionPage title="Extras" items={data.extras} type="extras" />;
    meta = { title: 'Extras | Star Splitter Visions', description: 'Explore extras, companion content, and bonus media.' };
  } else if (series && !release && !readReleaseId) {
    pageContent = <SeriesPage series={series} releases={data.releases} extras={data.extras} allSeries={data.series} soundtracksBySeries={soundtracksBySeries} />;
    meta = { title: `${series.title} | Star Splitter Visions`, description: series.shortDescription || series.tagline || DEFAULT_META.description };
  } else if (releaseId && release) {
    const parentSeries = data.series.find((item) => item.slug === release.seriesSlug) || { slug: '', title: 'Series' };
    pageContent = <ReleasePage release={release} series={parentSeries} pages={data.pages} />;
    meta = { title: `${release.title} | Star Splitter Visions`, description: release.description || DEFAULT_META.description };
  } else if (readReleaseId && release) {
    const releasePages = getReleasedPagesForRelease(data.pages, release.id);
    const parentSeries = data.series.find((item) => item.slug === release.seriesSlug);
    pageContent = <ReaderPage release={release} pages={releasePages} series={parentSeries} soundtracks={data.soundtracks} />;
    meta = { title: `Read ${release.title} | Star Splitter Visions`, description: `Read ${release.title} from Star Splitter Visions.` };
  } else if (readReleaseId && !release) {
    pageContent = <main className="page page-reader page-reader-empty"><h1>Release not found.</h1><p><a href="/">Return home</a></p></main>;
  }

  useEffect(() => { applyMeta(meta); }, [meta]);

  return <SiteShell path={path} hasExtras={hasExtras}>{pageContent}</SiteShell>;
}
