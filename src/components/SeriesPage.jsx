import { useEffect, useMemo, useState } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'
import ExtrasRail from './media/ExtrasRail'
import AudioRail from './media/AudioRail'
import { seriesPages } from '../data/seriesPages'
import { vikingsExtras } from '../data/vikingsExtras'
import { vikingsAudio } from '../data/vikingsAudio'
import { getLatestReleasedPage, getReleasedPages } from '../utils/dailyPages'

export default function SeriesPage({ slug, onReadIssue }) {
  const series = seriesPages[slug]
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1)
  const [previewFailed, setPreviewFailed] = useState(false)

  const todayString = new Date().toISOString().slice(0, 10)

  const worldStyle = {
    '--world-accent': series?.accent || '#BAFF00',
  }

  const seriesExtras = slug === 'vikings-2026' ? vikingsExtras : []
  const seriesAudio = slug === 'vikings-2026' ? vikingsAudio : []

  const availablePages = useMemo(() => {
    if (!series || series.dailyPages.length === 0) {
      return []
    }

    return getReleasedPages(series.dailyPages, todayString)
  }, [series, todayString])

  const latestPage = useMemo(() => {
    if (!series || series.dailyPages.length === 0) {
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

  if (series.status === 'coming-soon') {
    return (
      <main className="series-page world-themed" style={worldStyle}>
        <section className="series-world-header hud-frame">
          <div>
            <p className="eyebrow">SIGNAL DETECTED //</p>
            <h1>{series.title}</h1>
            <p className="series-tagline">{series.tagline}</p>
            <p className="series-atmosphere">{series.atmosphere}</p>
          </div>

          <div className="series-world-meta">
            <span>{series.worldLabel}</span>
            <span>Coming Soon</span>
          </div>
        </section>

        <section className="series-current-page hud-frame">
          <div className="series-current-copy">
            <p className="eyebrow">WORLD PREVIEW //</p>
            <h2>Transmission Inbound</h2>
            <p className="series-description">{series.description}</p>
          </div>

          <div className="series-reader-preview">
            <ImageWithFallback src={series.hero} alt={series.title} fallbackText="WORLD ART INBOUND" />
          </div>

          <div className="series-temporal-nav">
            <p className="series-page-counter">
              Publishing pipeline active • No released pages yet
            </p>

            <div className="series-page-actions">
              <button disabled>Issue 01 Coming Soon</button>
              <button disabled>Daily Pages Pending</button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const currentPageData = availablePages.find((page) => page.pageNumber === currentPreviewPage)
  const firstRelease = series.releases.find((release) => release.cover)
  const totalPages = series.dailyPages.length
  const releasedPageCount = availablePages.length
  const nextUnreleasedPage = series.dailyPages.find((page) => page.releaseDate > todayString)

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
    <main className="series-page world-themed" style={worldStyle}>
      <section className="series-world-header series-world-header-featured hud-frame">
        <div>
          <p className="eyebrow">FLAGSHIP SERIES //</p>
          <h1>{series.title}</h1>
          <p className="series-tagline">{series.tagline}</p>
          <p className="series-atmosphere">{series.atmosphere}</p>
        </div>

        <div className="series-world-meta series-world-stats">
          <span>{series.worldLabel}</span>
          <span>{series.currentRelease}</span>
          <span>{releasedPageCount} of {totalPages} daily pages released</span>
          {nextUnreleasedPage ? <span>Next page: {nextUnreleasedPage.releaseDate}</span> : <span>Issue fully released</span>}
        </div>
      </section>

      <section className="series-launch-strip hud-frame">
        <div className="series-cover-lockup">
          <ImageWithFallback src={firstRelease?.cover || series.hero} alt={`${series.title} ${series.currentRelease} cover`} fallbackText="ISSUE COVER" />
        </div>

        <div className="series-launch-copy">
          <p className="eyebrow">CURRENT ISSUE //</p>
          <h2>{series.currentRelease}</h2>
          <p>{firstRelease?.description || series.description}</p>
        </div>

        <div className="series-launch-actions">
          <button className="primary-action" onClick={() => onReadIssue?.(1)}>Read From Page 001</button>
          <button onClick={() => latestPage && onReadIssue?.(latestPage.pageNumber)}>Open Latest Daily</button>
        </div>
      </section>

      <section className="series-current-page hud-frame">
        <div className="series-current-copy">
          <p className="eyebrow">LATEST DAILY PAGE //</p>
          <h2>Page {String(currentPreviewPage).padStart(3, '0')}</h2>
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
            Page {String(currentPreviewPage).padStart(3, '0')} • Released {currentPageData?.releaseDate || 'Pending'} • {releasedPageCount} available
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
              Open This Page
            </button>
          </div>
        </div>
      </section>

      <ExtrasRail title="Recovered Artifacts" artifacts={seriesExtras} />

      <AudioRail title="Signal Audio" tracks={seriesAudio} />

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
          <span>{releasedPageCount} released • {Math.max(totalPages - releasedPageCount, 0)} scheduled</span>
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
                <span>{isReleased ? page.releaseDate : `Scheduled ${page.releaseDate}`}</span>
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
