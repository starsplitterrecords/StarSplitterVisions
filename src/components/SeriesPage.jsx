import { seriesPages } from '../data/seriesPages'

export default function SeriesPage({ slug, onReadIssue }) {
  const series = seriesPages[slug]

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

  return (
    <main className="series-page hud-frame">
      <div className="series-page-hero">
        <img src={series.hero} alt={series.title} />
      </div>

      <div className="series-page-copy">
        <p className="eyebrow">SERIES //</p>
        <h1>{series.title}</h1>
        <p className="series-tagline">{series.tagline}</p>
        <p className="series-description">{series.description}</p>

        <section className="series-release-section">
          <h2>Releases</h2>

          <div className="rail large-rail">
            {series.releases.map((release) => (
              <article className="series-card" key={release.slug}>
                <img src={release.cover} alt={release.title} />

                <div className="card-copy">
                  <p>Release</p>
                  <h3>{release.title}</h3>

                  <div>
                    <button className="inline-link" onClick={() => onReadIssue?.()}>
                      Read Issue
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
