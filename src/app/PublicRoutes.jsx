import { useMemo } from 'react';
import HomePage from '../pages/HomePage';
import SeriesPage from '../pages/SeriesPage';
import ReleasePage from '../pages/ReleasePage';
import ReaderPage from '../pages/ReaderPage';
import NotFoundRoute from './NotFoundRoute';
import { ROUTE_TYPES } from './routes';
import {
  getContinueReadingViewModel,
  getInitialReaderPageIndex,
  getParentSeriesForRelease,
  getReaderPagesForRelease,
  getReleaseById,
  getSeriesBySlug,
  getSoundtracksBySeries,
} from './selectors';

// Add new public route rendering branches here, keyed by ROUTE_TYPES.
export default function PublicRoutes({ route, data, continueRecord, onClearContinueReading }) {
  const soundtracksBySeries = useMemo(() => getSoundtracksBySeries(data.soundtracks), [data.soundtracks]);

  const continueReading = useMemo(() => getContinueReadingViewModel({
    continueRecord,
    releases: data.releases,
    pages: data.pages,
    series: data.series,
  }), [continueRecord, data.pages, data.releases, data.series]);

  if (route.type === ROUTE_TYPES.SERIES_DETAIL) {
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

  if (route.type === ROUTE_TYPES.RELEASE_DETAIL) {
    const release = getReleaseById(data.releases, route.releaseId);
    if (release) {
      const parentSeries = getParentSeriesForRelease(data.series, release) || { slug: '', title: 'Series' };
      return <ReleasePage release={release} series={parentSeries} pages={data.pages} />;
    }
  }

  if (route.type === ROUTE_TYPES.READER) {
    const release = getReleaseById(data.releases, route.releaseId);
    if (!release) return <NotFoundRoute message="Release not found." />;

    const releasePages = getReaderPagesForRelease(data.pages, release.id);
    const parentSeries = getParentSeriesForRelease(data.series, release);
    const initialPageIndex = getInitialReaderPageIndex({
      totalPages: releasePages.length,
      continueRecord,
      releaseId: release.id,
      requestedPageNumber: route.requestedPageNumber,
    });

    return <ReaderPage release={release} pages={releasePages} series={parentSeries} soundtracks={data.soundtracks} initialPageIndex={initialPageIndex} />;
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
