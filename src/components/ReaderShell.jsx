export default function ReaderShell({ releaseTitle, releaseHref, currentPage, totalPages, onPrevious, onNext, canPrevious, canNext, previousLabel = 'Previous', nextLabel = 'Next', children }) {
  return (
    <main className="page page-reader">
      <p className="eyebrow"><a href={releaseHref}>← Back to release</a></p>
      <h1>{releaseTitle}</h1>
      <p className="reader-count">Page {currentPage} of {totalPages}</p>
      {children}
      <div className="reader-controls">
        <button type="button" onClick={onPrevious} disabled={!canPrevious}>{previousLabel}</button>
        <button type="button" onClick={onNext} disabled={!canNext}>{nextLabel}</button>
      </div>
    </main>
  );
}
