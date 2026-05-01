export default function ReaderShell({
  releaseHref,
  overlayText,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  children,
}) {
  return (
    <main className="page page-reader" tabIndex={-1}>
      <header className="reader-overlay" aria-live="polite">
        <a className="reader-back-link" href={releaseHref}>← Back to release</a>
        {overlayText ? <p className="reader-overlay-text">{overlayText}</p> : null}
        {totalPages > 0 ? <p className="reader-count">Page {currentPage} of {totalPages}</p> : null}
      </header>

      <section className="reader-stage">{children}</section>

      {totalPages > 0 ? (
        <nav className="reader-controls" aria-label="Reader page navigation">
          <button type="button" onClick={onPrevious} disabled={!canPrevious} aria-label="Go to previous page">
            {previousLabel}
          </button>
          <button type="button" onClick={onNext} disabled={!canNext} aria-label="Go to next page">
            {nextLabel}
          </button>
        </nav>
      ) : null}
    </main>
  );
}
