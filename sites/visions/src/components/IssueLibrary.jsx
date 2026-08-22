import { useEffect, useMemo, useState } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'
import { ISSUE_STATE_STORAGE_KEY, loadIssueStates, toggleIssueState } from '../utils/issueState'

const COLLAPSED_ISSUE_COUNT = 3

function getCatalogSequence(release) {
  if (Number.isInteger(release.catalogSequence)) return release.catalogSequence

  const match = release.catalogId?.match(/-(\d{3})$/)
  return match ? Number(match[1]) : 0
}

function compareByPublicationOrder(a, b) {
  const dateOrder = (a.releaseDate || '').localeCompare(b.releaseDate || '')
  if (dateOrder !== 0) return dateOrder

  return getCatalogSequence(a) - getCatalogSequence(b)
}

function isTrackableRelease(release) {
  return release.publicationType !== 'P'
}

export default function IssueLibrary({ releases = [] }) {
  const [newestFirst, setNewestFirst] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [issueStates, setIssueStates] = useState(loadIssueStates)

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === ISSUE_STATE_STORAGE_KEY || event.key === null) {
        setIssueStates(loadIssueStates())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const sortedReleases = useMemo(() => {
    const ordered = [...releases].sort(compareByPublicationOrder)
    return newestFirst ? ordered.reverse() : ordered
  }, [newestFirst, releases])

  if (!releases.length) return null

  const visibleReleases = expanded
    ? sortedReleases
    : sortedReleases.slice(0, COLLAPSED_ISSUE_COUNT)
  const canExpand = releases.length > COLLAPSED_ISSUE_COUNT

  const handleIssueState = (catalogId, requestedState) => {
    setIssueStates(toggleIssueState(catalogId, requestedState))
  }

  return (
    <section className="issue-library series-release-section hud-frame">
      <div className="issue-library-header series-section-header">
        <div>
          <h2>Issue Library</h2>
          <span>{releases.length} available</span>
        </div>
        {releases.length > 1 && (
          <button
            className="issue-sort-toggle"
            type="button"
            onClick={() => setNewestFirst((current) => !current)}
            aria-label={newestFirst ? 'Show oldest issues first' : 'Show newest issues first'}
          >
            {newestFirst ? 'Start from Issue 1' : 'Newest first'}
          </button>
        )}
      </div>

      <div className="issue-library-grid">
        {visibleReleases.map((release) => {
          const catalogId = release.catalogId || `${release.title}-${release.releaseDate || 'undated'}`
          const issueState = issueStates[catalogId]
          const trackable = isTrackableRelease(release)
          const cover = release.cover ? (
            <ImageWithFallback src={release.cover} alt={`${release.title} cover`} fallbackText="COVER" />
          ) : (
            <div className="series-release-placeholder">RELEASE</div>
          )

          return (
            <article className="issue-library-card" key={catalogId} data-catalog-id={catalogId}>
              {release.externalLink ? (
                <a
                  className="issue-cover-link"
                  href={release.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${release.title}`}
                >
                  {cover}
                </a>
              ) : (
                <div className="issue-cover-link issue-cover-link-disabled">{cover}</div>
              )}

              <div className="issue-library-copy">
                <p>{release.releaseType || 'Release'}</p>
                <h3>{release.title}</h3>
                <span className="issue-release-date">{release.releaseDate || 'Available now'}</span>
                {release.description && <span className="issue-description">{release.description}</span>}

                <div className="issue-library-actions">
                  {release.externalLink && (
                    <a className="text-link" href={release.externalLink} target="_blank" rel="noreferrer">
                      Read
                    </a>
                  )}

                  {trackable && release.catalogId && (
                    <div className="issue-state-controls" aria-label={`Reading state for ${release.title}`}>
                      <button
                        type="button"
                        className={issueState === 'read' ? 'active' : ''}
                        aria-pressed={issueState === 'read'}
                        onClick={() => handleIssueState(release.catalogId, 'read')}
                      >
                        ✓ Read
                      </button>
                      <button
                        type="button"
                        className={issueState === 'want' ? 'active' : ''}
                        aria-pressed={issueState === 'want'}
                        onClick={() => handleIssueState(release.catalogId, 'want')}
                      >
                        + Want to read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {canExpand && (
        <button className="issue-library-expand" type="button" onClick={() => setExpanded((current) => !current)}>
          {expanded ? 'Show fewer' : `Show all ${releases.length} issues`}
        </button>
      )}
    </section>
  )
}
