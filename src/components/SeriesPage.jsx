import { useMemo, useState } from 'react'
import { seriesPages } from '../data/seriesPages'

export default function SeriesPage({ slug, onReadIssue }) {
  const series = seriesPages[slug]
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1)
  const [previewFailed, setPreviewFailed] = useState(false)

  const previewPages = useMemo(() => {
    if (!series) {
      return []
    }

    return Array.from({ length: series.currentPageCount }, (_, index) => {
      return `${series.pagePathBase}/page-${String(index + 1).padStart(3, '0')}.jpg`
    })
  }, [series])

  if (!series) {
    return (
      <main className="series-page hud-frame">
        <div className="series-page-copy">
          <p className="eyebrow">SERIES NOT FOUND</p>
          <h1>Unknown Signal</h1>
        </div>
      </main>
    )
  }

  const updatePreviewPage = (nextPage) => {
    setPreviewFailed(false)
    setCurrentPreviewPage(nextPage)
  }

  const goPrevious = () => {
    updatePreviewPage(currentPreviewPage <= 1 ? previewPages.length : currentPreviewPage - 1)
  }

  const goNext = () => {
    updatePreviewPage(currentPreviewPage >= previewPages.length ? 1 : currentPreviewPage + 1)
  }

  const goRandom = () => {
    updatePreviewPage(Math.floor(Math.random() * previewPages.length) + 1)
  }

  return (
    <main className="series-page">
      <section className="series-world-header hud-frame">
        <div>
          <p className="eyebrow">NOW ENTERING //</p>
          <h1>{series.title}</h1>
          <p className="series-tagline">{series.tagline}</p>
        </div>

        <div className="series-world-meta">
          <span>{series.worldLabel}</span>
          <span>{series.currentRelease}</span>
        </div>
      </section>

      <section className="series-current-page hud-frame">
        <div className="series-current-copy">
          <p className="eyebrow">CURRENT DAILY PAGE //</p>
          <h2>{series.currentRelease}</h2>
          <p className="series-description">{series.description}</p>

          <div className="series-page-controls">
            <button onClick={goPrevious}>Prev</button>
            <button onClick={goRandom}>Random</button>
            <button onClick={goNext}>Next</button>
          </div>

          <div className="series-page-actions">
            <button className="primary-action" onClick={() => onReadIssue?.(1)}>
              Start Reading
            </button>

            <button onClick={() => onReadIssue?.(currentPreviewPage)}>
              Open Reader
            </button>
          </div>

          <p className="series-page-counter">
            Preview Page {currentPreviewPage} / {previewPages.length}
          </p>
        </div>

        <div className="series-reader-preview">
          {previewFailed ? (
            <div className="image-fallback series-preview-fallback">
              <span>PREVIEW PAGE UNAVAILABLE</span>
            </div>
          ) : (
            <img
              src={previewPages[currentPreviewPage - 1]}
              alt={`${series.title} preview page ${currentPreviewPage}`}
              onError={() => setPreviewFailed(true)}
            />
          )}
        </div>
      </section>

      <section className="series-release-section hud-frame">
        <div className="series-section-header">
          <h2>Issues</h2>
          <span>Current and archived releases</span>
        </div>

        <div className="series-release-list">
          {series.releases.map((release) => {
            const isActiveRelease = Boolean(release.cover)

            return (
              <article className={`series-release-row${isActiveRelease ? ' active-release' : ''}`} key={release.slug}>
                <div className="series-release-cover">
                  {release.cover ? (
                    <img src={release.cover} alt={release.title} />
                  ) : (
                    <div className="series-release-placeholder">SOON</div>
                  )}
                </div>

                <div className="series-release-copy">
                  <p>{release.status}</p>
                  <h3>{release.title}</h3>
                  <span>{release.description}</span>
                </div>

                <div className="series-release-meta">
                  <strong>{release.pageCount || '—'}</strong>
                  <small>{release.pageCount ? 'Pages' : 'Pending'}</small>
                </div>

                <div className="series-release-actions">
                  {isActiveRelease ? (
                    <button onClick={() => onReadIssue?.(1)}>Read Issue</button>
                  ) : (
                    <button disabled>Coming Soon</button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="purchase-links hud-frame">
        <div className="series-section-header">
          <h2>Purchase & Platforms</h2>
          <span>Additional storefront integrations coming later</span>
        </div>

        <div className="purchase-link-grid">
          {series.purchaseLinks.map((platform) => (
            <article className="purchase-link-card" key={platform}>
              <span>{platform}</span>
              <small>Coming Soon</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
