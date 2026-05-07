import { useEffect, useMemo, useState } from 'react'
import { seriesPages } from '../data/seriesPages'
import { getLatestReleasedPage, getReleasedPages } from '../utils/dailyPages'

export default function SeriesPage({ slug, onReadIssue }) {
  const series = seriesPages[slug]
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1)
  const [previewFailed, setPreviewFailed] = useState(false)

  const todayString = new Date().toISOString().slice(0, 10)

  const availablePages = useMemo(() => {
    if (!series) {
      return []
    }

    return getReleasedPages(series.dailyPages, todayString)
  }, [series, todayString])

  const latestPage = useMemo(() => {
    if (!series) {
      return null
    }

    return getLatestReleasedPage(series.dailyPages, todayString)
  }, [series, todayString])

  useEffect(() => {
    if (latestPage) {
      setCurrentPreviewPage(latestPage.pageNumber)
    }
  }, [latestPage])

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

  const currentPageData = availablePages.find((page) => page.pageNumber === currentPreviewPage)

  const updatePreviewPage = (nextPage) => {
    setPreviewFailed(false)
    setCurrentPreviewPage(nextPage)
  }

  const goFirst = () => updatePreviewPage(1)
  const goPrevious = () => updatePreviewPage(currentPreviewPage <= 1 ? availablePages.length : currentPreviewPage - 1)
  const goNext = () => updatePreviewPage(currentPreviewPage >= availablePages.length ? 1 : currentPreviewPage + 1)
  const goLatest = () => latestPage && updatePreviewPage(latestPage.pageNumber)

  const goRandom = () => {
    const randomPage = availablePages[Math.floor(Math.random() * availablePages.length)]
    if (randomPage) updatePreviewPage(randomPage.pageNumber)
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
          <h2>Page {currentPreviewPage}</h2>
          <p className="series-description">{series.description}</p>
        </div>

        <div className="series-reader-preview">
          {previewFailed || !currentPageData ? (
            <div className="image-fallback series-preview-fallback">
              <span>PREVIEW PAGE UNAVAILABLE</span>
            </div>
          ) : (
            <img
              src={currentPageData.image}
              alt={`${series.title} preview page ${currentPreviewPage}`}
              onError={() => setPreviewFailed(true)}
            />
          )}
        </div>

        <div className="series-temporal-nav">
          <p className="series-page-counter">
            Page {currentPreviewPage} • Released {currentPageData?.releaseDate || 'Pending'}
          </p>

          <div className="series-page-controls" aria-label="Daily page navigation">
            <button onClick={goFirst}>First</button>
            <button onClick={goPrevious}>Prev</button>
            <button onClick={goRandom}>Random</button>
            <button onClick={goNext}>Next</button>
            <button onClick={goLatest}>Latest</button>
          </div>

          <div className="series-page-actions">
            <button className="primary-action" onClick={() => onReadIssue?.(1)}>
              Start From Beginning
            </button>

            <button onClick={() => onReadIssue?.(currentPreviewPage)}>
              Open Current Page
            </button>
          </div>
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
                  {release.cover ? <img src={release.cover} alt={release.title} /> : <div className="series-release-placeholder">SOON</div>}
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
                  {isActiveRelease ? <button onClick={() => onReadIssue?.(1)}>Read Issue</button> : <button disabled>Coming Soon</button>}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="series-release-section hud-frame">
        <div className="series-section-header">
          <h2>Daily Archive</h2>
          <span>Chronological release timeline</span>
        </div>

        <div className="series-archive-grid">
          {series.dailyPages.map((page) => {
            const isReleased = page.releaseDate <= todayString

            return (
              <button
                key={page.pageNumber}
                className={`series-archive-item${isReleased ? ' released' : ' unreleased'}${currentPreviewPage === page.pageNumber ? ' active' : ''}`}
                disabled={!isReleased}
                onClick={() => updatePreviewPage(page.pageNumber)}
              >
                <strong>{String(page.pageNumber).padStart(3, '0')}</strong>
                <span>{page.releaseDate}</span>
              </button>
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
