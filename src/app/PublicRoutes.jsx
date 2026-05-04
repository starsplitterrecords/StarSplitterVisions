import { useMemo } from 'react';
import HomePage from '../pages/HomePage';
import SeriesPage from '../pages/SeriesPage';
import ReleasePage from '../pages/ReleasePage';
import ReaderPage from '../pages/ReaderPage';
import NotFoundRoute from './NotFoundRoute';
import {
  getContinueReadingViewModel,
  getParentSeriesForRelease,
  getReaderPagesForRelease,
  getReleaseById,
  getSeriesBySlug,
  getSoundtracksBySeries,
} from './selectors';

export default function PublicRoutes({ route, data, continueRecord, onClearContinueReading }) {
  const soundtracksBySeries = useMemo(() => getSoundtracksBySeries(data.soundtracks), [data.soundtracks]);

  const continueReading = useMemo(() => getContinueReadingViewModel({
    continueRecord,
    releases: data.releases,
    pages: data.pages,
    series: data.series,
  }), [continueRecord, data.pages, data.releases, data.series]);

  if (route.type === 'seriesDetail') {
    const series = getSeriesBySlug(data.series, route.seriesSlug);
    if (series) {
      return (
        <SeriesPage
          series={series}
          releases={data.releases}
          extras={data.extras}
          allSeries={data.series}
          soundtracksBySeries={soundtracksBySeries}
        />
      );
    }
  }

  if (route.type === 'releaseDetail') {
    const release = getReleaseById(data.releases, route.releaseId);
    if (release) {
      const parentSeries = getParentSeriesForRelease(data.series, release) || { slug: '', title: 'Series' };
      return <ReleasePage release={release} series={parentSeries} pages={data.pages} />;
    }
  }

  if (route.type === 'reader') {
    const release = getReleaseById(data.releases, route.releaseId);
    if (!release) return <NotFoundRoute message="Release not found." />;

    const releasePages = getReaderPagesForRelease(data.pages, release.id);
    const parentSeries = getParentSeriesForRelease(data.series, release);
    return <ReaderPage release={release} pages={releasePages} series={parentSeries} soundtracks={data.soundtracks} />;
  }

  return (
    <HomePage
      series={data.series}
      releases={data.releases}
      extras={data.extras}
      soundtracksBySeries={soundtracksBySeries}
      continueReading={continueReading}
      onClearContinueReading={onClearContinueReading}
    />
  );
}
