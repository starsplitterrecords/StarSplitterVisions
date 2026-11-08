import homepageContent from '../content/homepage.json'
import siteContent from '../content/site.json'
import { seriesPages } from '../data/seriesPages'
import { getEasternDateString, getReleasedItems, getReleasedPages } from '../utils/dailyPages'
import { buildReaderPath, buildSeriesPath } from '../utils/routes'
import ImageWithFallback from './shared/ImageWithFallback'
import './HomePage.css'

function followInternalLink(event, action) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }

  event.preventDefault()
  action()
}

function readingOptions(series, today) {
  const firstPage = getReleasedPages(series.dailyPages, today)[0]
  const latestIssue = getReleasedItems(series.releases, today)
    .filter((release) => release.externalLink)
    .at(-1)

  return {
    firstPage,
    latestIssue,
    readHref: firstPage
      ? buildReaderPath(series.slug, firstPage.pageNumber)
      : latestIssue?.externalLink,
  }
}

function SeriesLink({ series, onOpenSeries, children, className }) {
  return (
    <a
      className={className}
      href={buildSeriesPath(series.slug)}
      onClick={(event) => followInternalLink(event, () => onOpenSeries(series.slug))}
    >
      {children}
    </a>
  )
}

function ReadLink({ series, options, onRead, children, className }) {
  if (!options.readHref) return null

  return (
    <a
      className={className}
      href={options.readHref}
      onClick={options.firstPage
        ? (event) => followInternalLink(event, () => onRead(options.firstPage.pageNumber, series.slug))
        : undefined}
    >
      {children}
    </a>
  )
}

function PublishedStory({ slug, onOpenSeries, onRead, today }) {
  const series = seriesPages[slug]
  if (!series || series.status !== 'active') return null

  const options = readingOptions(series, today)
  if (!options.readHref) return null

  const cover = options.latestIssue?.cover || series.homepage?.cover || series.hero

  return (
    <article className="home-story-card hud-frame" style={{ '--home-world-accent': series.accent || '#BAFF00' }}>
      <ReadLink series={series} options={options} onRead={onRead} className="home-story-cover">
        <ImageWithFallback src={cover} alt={series.title + ' comic cover'} fallbackText="COVER UNAVAILABLE" />
      </ReadLink>

      <div className="home-story-copy">
        <p className="home-story-kind">{series.worldLabel || 'Comic series'}</p>
        <h3>
          <SeriesLink series={series} onOpenSeries={onOpenSeries}>{series.title}</SeriesLink>
        </h3>
        <p className="home-story-hook">{series.homepage?.hook || series.description}</p>
        <p className="home-story-release">{options.latestIssue?.title || series.currentRelease}</p>

        <div className="home-story-actions">
          <ReadLink series={series} options={options} onRead={onRead} className="home-link-primary">
            Start reading
          </ReadLink>
          <SeriesLink series={series} onOpenSeries={onOpenSeries} className="home-link-secondary">
            Series & issues
          </SeriesLink>
        </div>
      </div>
    </article>
  )
}

function UpcomingStory({ slug, onOpenSeries, onRead, today }) {
  const series = seriesPages[slug]
  if (!series) return null

  const options = readingOptions(series, today)
  const isReadable = series.status === 'active' && Boolean(options.readHref)
  const cover = series.homepage?.cover || series.hero

  return (
    <article className="home-upcoming-card hud-frame" style={{ '--home-world-accent': series.accent || '#BAFF00' }}>
      <SeriesLink series={series} onOpenSeries={onOpenSeries} className="home-upcoming-cover">
        <ImageWithFallback src={cover} alt={series.title + ' cover preview'} fallbackText="COVER PREVIEW" />
      </SeriesLink>

      <div className="home-upcoming-copy">
        <p className="home-story-kind">{isReadable ? 'Now available' : 'In development'} · {series.worldLabel}</p>
        <h3>
          <SeriesLink series={series} onOpenSeries={onOpenSeries}>{series.title}</SeriesLink>
        </h3>
        <p>{series.homepage?.hook || series.description}</p>
        <div className="home-story-actions">
          {isReadable ? (
            <ReadLink series={series} options={options} onRead={onRead} className="home-link-primary">
              Start reading
            </ReadLink>
          ) : (
            <SeriesLink series={series} onOpenSeries={onOpenSeries} className="home-link-primary">
              Explore this world
            </SeriesLink>
          )}
        </div>
      </div>
    </article>
  )
}

export default function HomePage({ onOpenSeries, onOpenSeriesIndex, onRead }) {
  const today = getEasternDateString()
  const hero = siteContent.hero || {}
  const catalogSeries = (homepageContent.catalogSeries || [])
    .map((slug) => seriesPages[slug])
    .filter(Boolean)

  return (
    <>
      <section className="home-hero hud-frame">
        <div className="home-hero-copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>
            {(hero.headingLines || []).map((line) => <span key={line}>{line}</span>)}
          </h1>
          <p>{hero.description}</p>
          <div className="home-hero-actions">
            <a className="home-link-primary" href="#start-reading">{hero.primaryAction || 'Find a comic'}</a>
            <a
              className="home-link-secondary"
              href="/series"
              onClick={(event) => followInternalLink(event, onOpenSeriesIndex)}
            >
              {hero.secondaryAction || 'All series'}
            </a>
          </div>
        </div>
      </section>

      <main className="home-content">
        <section id="start-reading" className="home-story-section" aria-labelledby="home-read-heading">
          <div className="home-section-heading">
            <div>
              <p className="eyebrow">PUBLISHED COMICS</p>
              <h2 id="home-read-heading">{homepageContent.readNowHeading}</h2>
              <p>{homepageContent.readNowDescription}</p>
            </div>
          </div>

          <div className="home-story-grid">
            {(homepageContent.leadSeries || []).map((slug) => (
              <PublishedStory
                key={slug}
                slug={slug}
                today={today}
                onOpenSeries={onOpenSeries}
                onRead={onRead}
              />
            ))}
          </div>
        </section>

        <section className="home-story-section" aria-labelledby="home-next-heading">
          <div className="home-section-heading">
            <div>
              <p className="eyebrow">ON THE HORIZON</p>
              <h2 id="home-next-heading">{homepageContent.comingNextHeading}</h2>
              <p>{homepageContent.comingNextDescription}</p>
            </div>
          </div>

          <div className="home-upcoming-grid">
            {(homepageContent.comingNext || []).map((slug) => (
              <UpcomingStory
                key={slug}
                slug={slug}
                today={today}
                onOpenSeries={onOpenSeries}
                onRead={onRead}
              />
            ))}
          </div>
        </section>

        <section className="home-story-section" aria-labelledby="home-more-heading">
          <div className="home-section-heading">
            <div>
              <p className="eyebrow">ALSO AVAILABLE</p>
              <h2 id="home-more-heading">{homepageContent.moreReadingHeading}</h2>
              <p>{homepageContent.moreReadingDescription}</p>
            </div>
          </div>

          <div className="home-story-grid">
            {(homepageContent.moreReading || []).map((slug) => (
              <PublishedStory
                key={slug}
                slug={slug}
                today={today}
                onOpenSeries={onOpenSeries}
                onRead={onRead}
              />
            ))}
          </div>
        </section>

        <section className="home-catalog-footer hud-frame" aria-labelledby="home-catalog-heading">
          <div>
            <p className="eyebrow">THE FULL CATALOG</p>
            <h2 id="home-catalog-heading">{homepageContent.catalogHeading}</h2>
            <p>{homepageContent.catalogDescription}</p>
            {catalogSeries.length > 0 && (
              <p className="home-catalog-extra">
                Also available:{' '}
                {catalogSeries.map((series, index) => (
                  <span key={series.slug}>
                    {index > 0 ? ' · ' : ''}
                    <SeriesLink series={series} onOpenSeries={onOpenSeries}>
                      {series.title}
                    </SeriesLink>
                  </span>
                ))}
              </p>
            )}
          </div>
          <a
            className="home-link-primary"
            href="/series"
            onClick={(event) => followInternalLink(event, onOpenSeriesIndex)}
          >
            {homepageContent.viewAllLabel}
          </a>
        </section>
      </main>
    </>
  )
}
