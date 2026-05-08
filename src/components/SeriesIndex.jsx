import ImageWithFallback from './shared/ImageWithFallback'

const seriesIndexItems = [
  {
    slug: 'vikings-2026',
    title: 'Vikings 2026',
    status: 'Active',
    hook: 'Municipal satire where Viking logistics meets city hall absurdity.',
    cover: '/images/series/vikings-2026/card.png',
    isActive: true,
  },
  {
    slug: 'glass-hour',
    title: 'Glass Hour',
    status: 'Coming Soon',
    hook: 'Neon magenta conspiracies unfold through fractured time markets.',
    cover: '/images/covers/glass-hour-issue-01.png',
  },
  {
    slug: 'rex-of-the-splitters',
    title: 'Rex of the Splitters',
    status: 'Coming Soon',
    hook: 'Cyan frontier raids across unstable jump corridors.',
    cover: '/images/covers/rex-of-the-splitters-issue-01.png',
  },
  {
    slug: 'sunforge-outlaw',
    title: 'Sunforge Outlaw',
    status: 'Coming Soon',
    hook: 'Dust-choked worlds, hot steel, and outlaw dynasties.',
    cover: '/images/covers/sunforge-outlaw-issue-01.png',
  },
  {
    slug: 'signal-atlas',
    title: 'Signal Atlas',
    status: 'Coming Soon',
    hook: 'Cartographers decode impossible maps hidden in starlight noise.',
    cover: '/images/covers/signal-atlas-issue-01.png',
  },
  {
    slug: 'stardust-station',
    title: 'Stardust Station',
    status: 'Coming Soon',
    hook: 'A workplace sci-fi comedy from the edges of the Visions signal.',
    cover: '/images/covers/stardust-station-issue-01.png',
  },
  {
    slug: 'hollow-creek',
    title: 'Hollow Creek',
    status: 'Coming Soon',
    hook: 'A quiet signal from somewhere darker, stranger, and older.',
    cover: '/images/covers/hollow-creek-issue-01.png',
  },
  {
    slug: 'the-choir-array',
    title: 'The Choir Array',
    status: 'Coming Soon',
    hook: 'A cosmic transmission assembled from impossible voices.',
    cover: '/images/covers/the-choir-array-issue-01.png',
  },
  {
    slug: 'supersonic-being',
    title: 'Supersonic Being',
    status: 'Coming Soon',
    hook: 'Velocity, identity, and myth under pressure.',
    cover: '/images/covers/supersonic-being-issue-01.png',
  },
]

export default function SeriesIndex({ onOpenSeries }) {
  const handleKeyDown = (event, slug) => {
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
        {seriesIndexItems.map((series) => (
          <article
            className={`series-index-card hud-frame clickable-card${series.isActive ? ' active' : ''}`}
            key={series.slug}
            onClick={() => onOpenSeries(series.slug)}
            onKeyDown={(event) => handleKeyDown(event, series.slug)}
            role="button"
            tabIndex={0}
          >
            <ImageWithFallback src={series.cover} alt={series.title} fallbackText="ART INBOUND" />

            <div>
              <p>{series.status}</p>
              <h2>{series.title}</h2>
              <span>{series.hook}</span>

              {series.isActive ? (
                <button onClick={() => onOpenSeries(series.slug)}>Enter Series</button>
              ) : (
                <button>View World</button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
