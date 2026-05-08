import ImageWithFallback from './shared/ImageWithFallback'
import { coverAssets } from '../data/assets'

const seriesIndexItems = [
  {
    slug: 'vikings-2026',
    title: 'Vikings 2026',
    status: 'Active',
    hook: 'Municipal satire where Viking logistics meets city hall absurdity.',
    cover: coverAssets.vikingsIssue01,
    isActive: true,
  },
  {
    slug: 'glass-hour',
    title: 'Glass Hour',
    status: 'Coming Soon',
    hook: 'Neon magenta conspiracies unfold through fractured time markets.',
    cover: coverAssets.glassHourIssue01,
  },
  {
    slug: 'rex-of-the-splitters',
    title: 'Rex of the Splitters',
    status: 'Coming Soon',
    hook: 'Cyan frontier raids across unstable jump corridors.',
    cover: coverAssets.rexOfTheSplittersIssue01,
  },
  {
    slug: 'sunforge-outlaw',
    title: 'Sunforge Outlaw',
    status: 'Coming Soon',
    hook: 'Dust-choked worlds, hot steel, and outlaw dynasties.',
    cover: coverAssets.sunforgeOutlawIssue01,
  },
  {
    slug: 'signal-atlas',
    title: 'Signal Atlas',
    status: 'Coming Soon',
    hook: 'Cartographers decode impossible maps hidden in starlight noise.',
    cover: coverAssets.signalAtlasIssue01,
  },
  {
    slug: 'stardust-station',
    title: 'Stardust Station',
    status: 'Coming Soon',
    hook: 'A workplace sci-fi comedy from the edges of the Visions signal.',
    cover: coverAssets.stardustStationIssue01,
  },
  {
    slug: 'hollow-creek',
    title: 'Hollow Creek',
    status: 'Coming Soon',
    hook: 'A quiet signal from somewhere darker, stranger, and older.',
    cover: coverAssets.hollowCreekIssue01,
  },
  {
    slug: 'the-choir-array',
    title: 'The Choir Array',
    status: 'Coming Soon',
    hook: 'A cosmic transmission assembled from impossible voices.',
    cover: coverAssets.theChoirArrayIssue01,
  },
  {
    slug: 'supersonic-being',
    title: 'Supersonic Being',
    status: 'Coming Soon',
    hook: 'Velocity, identity, and myth under pressure.',
    cover: coverAssets.supersonicBeingIssue01,
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
