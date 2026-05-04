import { useEffect, useMemo, useState } from 'react';
import ReaderShell from '../components/ReaderShell';
import MiniAudioPlayer from '../components/reader/MiniAudioPlayer';
import { setContinueReading } from '../lib/continueReading';
import { findSoundtrackForRelease } from '../lib/soundtracks';

export default function ReaderPage({ release, pages, series, soundtracks, initialPageIndex = 0 }) {
  const [index, setIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (pages.length === 0) {
      setIndex(0);
      return;
    }

    const boundedIndex = Math.max(0, Math.min(Number(initialPageIndex) || 0, pages.length - 1));
    setIndex(pages[boundedIndex] ? boundedIndex : 0);
  }, [initialPageIndex, pages]);

  const totalPages = pages.length;
  const page = pages[index];
  const canPrevious = index > 0;
  const canNext = index < totalPages - 1;

  const soundtrack = useMemo(() => findSoundtrackForRelease({ soundtracks, seriesSlug: release.seriesSlug, releaseSlug: release.id, pageSlug: page?.slug }), [page?.slug, release.id, release.seriesSlug, soundtracks]);
  useEffect(() => { setImageFailed(false); }, [index, release.id]);
  useEffect(() => {
    if (totalPages === 0) return;
    [pages[index - 1]?.image, pages[index + 1]?.image].filter((image) => typeof image === 'string' && image.trim().length > 0).forEach((src) => { const img = new Image(); img.src = src; });
  }, [index, pages, totalPages]);
  useEffect(() => {
    if (totalPages === 0) return;
    const onKeyDown = (event) => {
      const element = event.target;
      if (element instanceof HTMLElement && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName))) return;
      if ((event.key === 'ArrowRight' || event.key.toLowerCase() === 'd' || event.key.toLowerCase() === 'j') && canNext) { event.preventDefault(); setIndex((value) => Math.min(totalPages - 1, value + 1)); }
      if ((event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'k') && canPrevious) { event.preventDefault(); setIndex((value) => Math.max(0, value - 1)); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canNext, canPrevious, totalPages]);

  useEffect(() => {
    if (!release?.id || totalPages === 0 || !pages[index]) return;
    setContinueReading({ releaseSlug: release.id, pageNumber: Number(pages[index].pageNumber) || index + 1, pageIndex: index, updatedAt: new Date().toISOString() });
  }, [index, pages, release?.id, totalPages]);

  const identityParts = [series?.title, release.title || release.id, totalPages > 0 ? `Page ${index + 1} of ${totalPages}` : null].filter(Boolean);
  return <ReaderShell releaseHref={`/releases/${release.id}`} overlayText={identityParts.join(' · ')} currentPage={index + 1} totalPages={totalPages} onPrevious={() => setIndex((value) => Math.max(0, value - 1))} onNext={() => setIndex((value) => Math.min(totalPages - 1, value + 1))} canPrevious={canPrevious} canNext={canNext}>{totalPages === 0 ? <div className="reader-empty-state"><p>No released pages are available for this release yet.</p><a href={`/releases/${release.id}`}>Back to release</a></div> : <div className="reader-image-frame">{page?.image && !imageFailed ? <img src={page.image} alt={`${release.title || 'Release'} page ${index + 1}`} className="reader-image" onError={() => setImageFailed(true)} /> : <div className="reader-image-fallback" role="status">Page image unavailable.</div>}</div>}{soundtrack ? <MiniAudioPlayer soundtrack={soundtrack} /> : null}</ReaderShell>;
}
