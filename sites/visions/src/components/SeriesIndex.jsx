import { useMemo, useState } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'
import siteContent from '../content/site.json'
import { seriesPages } from '../data/seriesPages'

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'In Development', value: 'coming-soon' },
]

const statusLabels = {
  active: 'Active',
  'coming-soon': 'In Development',
  archived: 'Archived',
}

export default function SeriesIndex({ onOpenSeries }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const catalogContent = siteContent.seriesCatalog || {}

  const seriesList = useMemo(() => {
    return Object.values(seriesPages)
      .filter((series) => activeFilter === 'all' || series.status === activeFilter)
      .sort((a, b) => {
        const statusRank = { active: 0, 'coming-soon': 1, archived: 2 }
        const rankA = statusRank[a.status] ?? 3
        const rankB = statusRank[b.status] ?? 3

        if (rankA !== rankB) return rankA - rankB

        return a.title.localeCompare(b.title)
      })
  }, [activeFilter])

  return (
    <main className="series-index">
      <section className="series-index-hero hud-frame">
        <p className="eyebrow">{catalogContent.eyebrow}</p>
        <h1>{catalogContent.title}</h1>
        <p>{catalogContent.description}</p>
      </section>

      <section className="series-index-controls hud-frame" aria-label="Series filters">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            className={activeFilter === filter.value ? 'active' : ''}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </section>

      {seriesList.length === 0 ? (
        <section className="series-index-empty hud-frame">
          <p>{catalogContent.emptyMessage || 'No series match this filter.'}</p>
        </section>
      ) : (
        <section className="series-index-grid">
          {seriesList.map((series) => (
            <article
              key={series.slug}
              className="series-index-card hud-frame clickable-card"
              role="button"
              tabIndex={0}
              onClick={() => onOpenSeries?.(series.slug)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpenSeries?.(series.slug)
                }
              }}
            >
              <ImageWithFallback src={series.hero} alt={series.title} fallbackText="SERIES ART INBOUND" />

              <div className="series-index-card-copy">
                <div className="series-index-card-meta">
                  <span>{statusLabels[series.status] || series.status || 'In Development'}</span>
                  {series.format && <span>{series.format}</span>}
                </div>

                <h2>{series.title}</h2>
                <p>{series.description}</p>

                <button
                  className="inline-link"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpenSeries?.(series.slug)
                  }}
                >
                  {catalogContent.viewLabel || 'View Series →'}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
