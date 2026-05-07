import ImageWithFallback from './shared/ImageWithFallback'

export default function Reader({
  title,
  pages,
  currentPage,
  onPageChange,
  onClose,
}) {
  const goToPage = (pageNumber) => {
    const safePage = Math.min(Math.max(pageNumber, 1), pages.length)
    onPageChange(safePage - 1)
  }

  return (
    <main className="reader hud-frame">
      <header className="reader-header">
        <div>
          <p className="eyebrow">READING //</p>
          <h2>{title}</h2>
          <p>Page {currentPage + 1} of {pages.length}</p>
        </div>

        <button onClick={onClose}>Back to Series</button>
      </header>

      <div className="reader-stage">
        <button
          className="reader-tap-zone reader-tap-zone-left"
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
        />

        <ImageWithFallback
          src={pages[currentPage]}
          alt={`${title} page ${currentPage + 1}`}
          fallbackText={`PAGE ${String(currentPage + 1).padStart(3, '0')} INBOUND`}
        />

        <button
          className="reader-tap-zone reader-tap-zone-right"
          aria-label="Next page"
          onClick={() => onPageChange(Math.min(currentPage + 1, pages.length - 1))}
          disabled={currentPage === pages.length - 1}
        />
      </div>

      <div className="reader-controls">
        <button onClick={() => goToPage(1)} disabled={currentPage === 0}>First</button>
        <button onClick={() => onPageChange(Math.max(currentPage - 1, 0))} disabled={currentPage === 0}>Prev</button>
        <button onClick={() => onPageChange(Math.min(currentPage + 1, pages.length - 1))} disabled={currentPage === pages.length - 1}>Next</button>
        <button onClick={() => goToPage(pages.length)} disabled={currentPage === pages.length - 1}>Latest</button>
      </div>

      <div className="reader-page-jump" aria-label="Page jump">
        {pages.map((_, index) => (
          <button
            key={index + 1}
            className={currentPage === index ? 'active' : ''}
            onClick={() => goToPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </main>
  )
}
