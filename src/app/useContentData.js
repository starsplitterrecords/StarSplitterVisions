import { useEffect, useState } from 'react';
import {
  validateExtraList,
  validatePageList,
  validateReaderSoundtrackList,
  validateReleaseList,
  validateSeriesList
} from '../lib/contentValidation';

export const EMPTY_CONTENT = { series: [], releases: [], pages: [], extras: [], soundtracks: [] };

async function fetchJson(url, { optional = false, fallback } = {}) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (optional) return fallback;
    throw error;
  }
}

export default function useContentData() {
  const [data, setData] = useState(EMPTY_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      setIsLoading(true);
      setError(null);

      try {
        const [seriesData, releasesData, pagesData, extrasData, soundtracksData] = await Promise.all([
          fetchJson('/content/series.json'),
          fetchJson('/content/releases.json'),
          fetchJson('/content/pages.json'),
          fetchJson('/content/extras.json', { optional: true, fallback: { extras: [] } }),
          fetchJson('/content/soundtracks.json', { optional: true, fallback: { soundtracks: [] } })
        ]);

        const nextData = {
          series: validateSeriesList(seriesData?.series),
          releases: validateReleaseList(releasesData?.releases),
          pages: validatePageList(pagesData?.pages),
          extras: validateExtraList(extrasData?.extras),
          soundtracks: validateReaderSoundtrackList(soundtracksData?.soundtracks)
        };

        if (isMounted) {
          setData(nextData);
        }
      } catch (loadError) {
        if (isMounted) {
          setData(EMPTY_CONTENT);
          setError(loadError instanceof Error ? loadError : new Error('Unknown content loading error.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
