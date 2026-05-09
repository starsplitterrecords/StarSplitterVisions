import { useEffect } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'

export default function Reader({
  title,
  pages,
  currentPage,
  onPageChange,
  onClose,
}) {
  const currentPageNumber = currentPage + 1
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage === pages.length - 1

  const goToPage = (pageNumber) => {
    const safePage = Math.min(Math.max(pageNumber, 1), pages.length)
    onPageChange(safePage - 1)
  }

  const goPrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1)
    }
  }

  const goNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        goPrevious()
      }

      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        goNext()
      }

      if (event.key === 'Home') {
        goToPage(1)
      }

      if (event.key === 'End') {
        goToPage(pages.length)
      }

      if (event.key.toLowerCase() === 'escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <main className="reader hud-frame">
      <header className="reader-header">
        <div className="reader-heading">
          <p className="eyebrow">READING //</p>
          <h2>{title}</h2>
          <p>
            Page {String(currentPageNumber).padStart(3, '0')} of {String(pages.length).padStart(3, '0')}
          </p>
        </div>

        <div className="reader-header-actions">
          <span className="reader-shortcuts">
            ← → navigate • space next • esc close
          </span>

          <button onClick={onClose}>Back to Series</button>
        </div>
      </header>

      <div className="reader-progress-track" aria-hidden="true">
        <div
          className="reader-progress-fill"
          style={{ width: `${(currentPageNumber / pages.length) * 100}%` }}
        />
      </div>

      <div className="reader-stage">
        <button
          className="reader-tap-zone reader-tap-zone-left"
          aria-label="Previous page"
          onClick={goPrevious}
          disabled={isFirstPage}
        />

        <ImageWithFallback
          src={pages[currentPage]}
          alt={`${title} page ${currentPageNumber}`}
          fallbackText={`PAGE ${String(currentPageNumber).padStart(3, '0')} INBOUND`}
        />

        <button
          className="reader-tap-zone reader-tap-zone-right"
          aria-label="Next page"
          onClick={goNext}
          disabled={isLastPage}
        />
      </div>

      <div className="reader-controls">
        <button onClick={() => goToPage(1)} disabled={isFirstPage}>First</button>
        <button onClick={goPrevious} disabled={isFirstPage}>Prev</button>
        <button onClick={goNext} disabled={isLastPage}>Next</button>
        <button onClick={() => goToPage(pages.length)} disabled={isLastPage}>Latest</button>
      </div>

      <div className="reader-page-jump" aria-label="Page jump">
        {pages.map((_, index) => {
          const pageNumber = index + 1

          return (
            <button
              key={pageNumber}
              className={currentPage === index ? 'active' : ''}
              onClick={() => goToPage(pageNumber)}
            >
              {String(pageNumber).padStart(2, '0')}
            </button>
          )
        })}
      </div>
    </main>
  )
}
