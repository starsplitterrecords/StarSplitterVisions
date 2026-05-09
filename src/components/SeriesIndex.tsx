import type { KeyboardEvent } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'
import { seriesPages } from '../data/seriesPages'
import type { SeriesPageData } from '../types/series'

interface SeriesIndexProps {
  onOpenSeries: (slug: string) => void
}

function getSeriesIndexItems(): SeriesPageData[] {
  return Object.values(seriesPages)
}

export default function SeriesIndex({ onOpenSeries }: SeriesIndexProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, slug: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenSeries(slug)
    }
  }

  return (
    <main className="series-index">
      <section className="series-index-hero hud-frame">
        <p className="eyebrow">VISIONS SERIES INDEX //</p>
        <h1>Browse Worlds</h1>
        <p>Active and upcoming series from the Star Splitter Visions signal.</p>
      </section>

      <section className="series-index-grid">
        {getSeriesIndexItems().map((series) => {
          const isActive = series.status === 'active'

          return (
            <article
              className={`series-index-card hud-frame clickable-card${isActive ? ' active' : ''}`}
              key={series.slug}
              onClick={() => onOpenSeries(series.slug)}
              onKeyDown={(event) => handleKeyDown(event, series.slug)}
              role="button"
              tabIndex={0}
            >
              <ImageWithFallback src={series.hero} alt={series.title} fallbackText="ART INBOUND" />

              <div>
                <p>{isActive ? 'Active' : 'Coming Soon'}</p>
                <h2>{series.title}</h2>
                <span>{series.tagline}</span>

                {isActive ? (
                  <button onClick={() => onOpenSeries(series.slug)}>Enter Series</button>
                ) : (
                  <button>View World</button>
                )}
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
