import AppLoadingState from './AppLoadingState';
import AppErrorState from './AppErrorState';
import AppEmptyState from './AppEmptyState';
import useContentData from './useContentData';
import { matchRoute } from './routeMatching';
import { ROUTE_TYPES } from './routes';
import useContinueReadingState from './useContinueReadingState';
import AdminRoutes from './AdminRoutes';
import PublicRoutes from './PublicRoutes';

export default function AppRouter() {
  const route = matchRoute();
  const { data, isLoading, error } = useContentData();
  const { continueRecord, clearContinueRecord } = useContinueReadingState();

  if (route.type === ROUTE_TYPES.ADMIN) return <AdminRoutes />;

  if (isLoading) return <AppLoadingState />;
  if (error) return <AppErrorState />;
  if (data.series.length === 0 && data.releases.length === 0) return <AppEmptyState />;

  return (
    <PublicRoutes
      route={route}
      data={data}
      continueRecord={continueRecord}
      onClearContinueReading={clearContinueRecord}
    />
  );
}
