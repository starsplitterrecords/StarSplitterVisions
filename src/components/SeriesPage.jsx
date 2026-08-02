import { useEffect, useMemo, useState } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'
import ExtrasRail from './media/ExtrasRail'
import AudioRail from './media/AudioRail'
import { seriesPages } from '../data/seriesPages'
import { getLatestReleasedPage, getReleasedPages } from '../utils/dailyPages'

function EditorialSection({ title, children }) {
  if (!children) return null

  return (
    <section className="series-editorial-section hud-frame">
      <div className="series-section-header">
        <h2>{title}</h2>
      </div>

      <div className="series-editorial-copy">
        <p>{children}</p>
      </div>
    </section>
  )
}

export default function SeriesPage({ slug, onReadIssue }) {
  const series = seriesPages[slug]
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1)
  const [previewFailed, setPreviewFailed] = useState(false)
  const todayString = new Date().toISOString().slice(0, 10)

  const availablePages = useMemo(() => {
    if (!series?.dailyPages?.length) {
      return []
    }

    return getReleasedPages(series.dailyPages, todayString)
  }, [series, todayString])

  const latestPage = useMemo(() => {
    if (!series?.dailyPages?.length) {
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

  const worldStyle = {
    '--world-accent': series.accent || '#BAFF00',
  }
  const narrativeForms = series.narrativeForms || []
  const themes = series.themes || []
  const seriesExtras = series.extras || []
  const seriesAudio = series.audio || []

  if (series.status !== 'active') {
    const statusLabel = series.status === 'archived' ? 'Archived' : 'Coming Soon'

    return (
      <main className={`series-page world-themed ${slug === 'vikings-2026' ? 'series-page-vikings' : ''}`.trim()} style={worldStyle}>
        <section className="series-world-header hud-frame">
          <div>
            <p className="eyebrow">SIGNAL DETECTED //</p>
            <h1>{series.title}</h1>
            <p className="series-tagline">{series.tagline}</p>
            <p className="series-atmosphere">{series.atmosphere}</p>
          </div>

          <div className="series-world-meta">
            <span>{series.worldLabel}</span>
            <span>{statusLabel}</span>
          </div>
        </section>

        <section className="series-current-page hud-frame">
          <div className="series-current-copy">
            <p className="eyebrow">WORLD PREVIEW //</p>
            <h2>{series.currentRelease || 'Transmission Inbound'}</h2>
            <p className="series-description">{series.description}</p>
          </div>

          <div className="series-reader-preview">
            <ImageWithFallback src={series.hero} alt={series.title} fallbackText="WORLD ART INBOUND" />
          </div>
        </section>

        <EditorialSection title="About This World">
          {series.worldPremise || series.description}
        </EditorialSection>

        <ExtrasRail title={series.extrasTitle || 'Recovered Artifacts'} artifacts={seriesExtras} />
        <AudioRail title={series.audioTitle || 'Signal Audio'} tracks={seriesAudio} />
      </main>
    )
  }

  const currentPageData = availablePages.find((page) => page.pageNumber === currentPreviewPage)
  const firstRelease = series.releases.find((release) => release.cover)
  const totalPages = series.dailyPages.length
  const releasedPageCount = availablePages.length
  const nextUnreleasedPage = series.dailyPages.find((page) => page.releaseDate > todayString)
  const hasAvailablePages = availablePages.length > 0

  const updatePreviewPage = (nextPage) => {
    if (!hasAvailablePages) return

    setPreviewFailed(false)
    setCurrentPreviewPage(nextPage)
  }

  const goFirst = () => updatePreviewPage(availablePages[0]?.pageNumber || 1)
  const goPrevious = () => {
    const currentIndex = availablePages.findIndex((page) => page.pageNumber === currentPreviewPage)
    const previousIndex = currentIndex <= 0 ? availablePages.length - 1 : currentIndex - 1
    updatePreviewPage(availablePages[previousIndex]?.pageNumber || 1)
  }
  const goNext = () => {
    const currentIndex = availablePages.findIndex((page) => page.pageNumber === currentPreviewPage)
    const nextIndex = currentIndex >= availablePages.length - 1 ? 0 : currentIndex + 1
    updatePreviewPage(availablePages[nextIndex]?.pageNumber || 1)
  }
  const goLatest = () => latestPage && updatePreviewPage(latestPage.pageNumber)

  const goRandom = () => {
    const randomPage = availablePages[Math.floor(Math.random() * availablePages.length)]
    if (randomPage) updatePreviewPage(randomPage.pageNumber)
  }

  return (
    <main className={`series-page world-themed ${slug === 'vikings-2026' ? 'series-page-vikings' : ''}`.trim()} style={worldStyle}>
      <section className="series-world-header series-world-header-featured hud-frame">
        <div>
          <p className="eyebrow">FLAGSHIP SERIES //</p>
          <h1>{series.title}</h1>
          <p className="series-tagline">{series.tagline}</p>
          <p className="series-atmosphere">{series.atmosphere}</p>

          {narrativeForms.length > 0 && (
            <div className="series-tag-rail">
              {narrativeForms.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          )}
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
          <button className="primary-action" disabled={!hasAvailablePages} onClick={() => onReadIssue?.(availablePages[0]?.pageNumber || 1)}>
            Read From Page 001
          </button>
          <button disabled={!latestPage} onClick={() => latestPage && onReadIssue?.(latestPage.pageNumber)}>
            Open Latest Daily
          </button>
        </div>
      </section>

      <section className="series-editorial-grid">
        <EditorialSection title="About This World">
          {series.worldPremise || series.description}
        </EditorialSection>

        <section className="series-dna-panel hud-frame">
          <div className="series-section-header">
            <h2>Narrative DNA</h2>
          </div>

          <div className="series-dna-grid">
            {series.format && (
              <div>
                <span>Format</span>
                <strong>{series.format}</strong>
              </div>
            )}

            {series.seriesEngine && (
              <div>
                <span>Series Engine</span>
                <strong>{series.seriesEngine}</strong>
              </div>
            )}

            {series.coreConflict && (
              <div>
                <span>Core Conflict</span>
                <strong>{series.coreConflict}</strong>
              </div>
            )}

            {series.developmentStatus && (
              <div>
                <span>Status</span>
                <strong>{series.developmentStatus}</strong>
              </div>
            )}
          </div>
        </section>
      </section>

      {themes.length > 0 && (
        <section className="series-theme-section hud-frame">
          <div className="series-section-header">
            <h2>Themes & Concerns</h2>
          </div>

          <div className="series-theme-grid">
            {themes.map((theme) => (
              <article key={theme}>
                <span>{theme}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      <EditorialSection title="Reader Orientation">
        {series.readerEntry || series.audiencePromise}
      </EditorialSection>

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
            <button disabled={!hasAvailablePages} onClick={goFirst}>First</button>
            <button disabled={!hasAvailablePages} onClick={goPrevious}>Prev</button>
            <button disabled={!hasAvailablePages} onClick={goRandom}>Random</button>
            <button disabled={!hasAvailablePages} onClick={goNext}>Next</button>
            <button disabled={!latestPage} onClick={goLatest}>Latest</button>
          </div>

          <div className="series-page-actions">
            <button
              className="primary-action"
              disabled={!hasAvailablePages}
              onClick={() => onReadIssue?.(availablePages[0]?.pageNumber || 1)}
            >
              Start From Beginning
            </button>

            <button disabled={!currentPageData} onClick={() => onReadIssue?.(currentPreviewPage)}>
              Open This Page
            </button>
          </div>
        </div>
      </section>

      <ExtrasRail title={series.extrasTitle || 'Recovered Artifacts'} artifacts={seriesExtras} />
      <AudioRail title={series.audioTitle || 'Signal Audio'} tracks={seriesAudio} />
    </main>
  )
}
