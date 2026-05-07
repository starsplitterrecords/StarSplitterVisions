import { useMemo, useState } from 'react'
import Reader from './components/Reader'
import SeriesIndex from './components/SeriesIndex'
import SeriesPage from './components/SeriesPage'
import ImageWithFallback from './components/shared/ImageWithFallback'
import { featuredSeries, moreWorlds } from './data/homepageSeries'
import { seriesPages } from './data/seriesPages'
import './styles.css'
import './mobile-overrides.css'

const navLinks = ['Home', 'Series', 'Issues', 'Soundtracks', 'Extras', 'About']
const defaultSeriesSlug = 'vikings-2026'

function App() {
  const [route, setRoute] = useState('home')
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [activeReaderSeriesSlug, setActiveReaderSeriesSlug] = useState(defaultSeriesSlug)

  const activeReaderSeries = seriesPages[activeReaderSeriesSlug] || seriesPages[defaultSeriesSlug]

  const readerPages = useMemo(() => {
    return activeReaderSeries.dailyPages.map((page) => page.image)
  }, [activeReaderSeries])

  const openReader = (pageNumber = 1, seriesSlug = defaultSeriesSlug) => {
    const series = seriesPages[seriesSlug] || seriesPages[defaultSeriesSlug]
    const safePage = Math.min(Math.max(pageNumber, 1), series.dailyPages.length)

    setActiveReaderSeriesSlug(series.slug)
    setCurrentPage(safePage - 1)
    setIsReaderOpen(true)
  }

  const openSeries = (slug) => {
    setIsReaderOpen(false)
    setRoute(`series:${slug}`)
  }

  const openSeriesIndex = () => {
    setIsReaderOpen(false)
    setRoute('series-index')
  }

  const goHome = () => {
    setIsReaderOpen(false)
    setRoute('home')
  }

  const handleNavClick = (event, link) => {
    event.preventDefault()

    if (link === 'Home') {
      goHome()
      return
    }

    if (link === 'Series') {
      openSeriesIndex()
    }
  }

  const handleSeriesCardKeyDown = (event, slug) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSeries(slug)
    }
  }

  const renderHeader = (activeNav) => (
    <header className="top-nav hud-frame">
      <button className="brand brand-button" onClick={goHome} type="button">
        <ImageWithFallback className="brand-logo" src="/images/brand/logo.png" alt="Star Splitter Visions" fallbackText="STAR SPLITTER VISIONS" />
        <ImageWithFallback className="brand-icon" src="/images/brand/icon.png" alt="Star Splitter Visions mark" fallbackText="✦" />
      </button>

      <nav>
        {navLinks.map((link) => (
          <a key={link} className={link === activeNav ? 'active' : ''} href="#" onClick={(event) => handleNavClick(event, link)}>
            {link}
          </a>
        ))}
      </nav>
    </header>
  )

  if (isReaderOpen) {
    return (
      <div className="site-shell">
        <Reader
          title={`${activeReaderSeries.title} — ${activeReaderSeries.currentRelease}`}
          pages={readerPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onClose={() => setIsReaderOpen(false)}
        />
      </div>
    )
  }

  if (route === 'series-index') {
    return (
      <div className="site-shell">
        {renderHeader('Series')}
        <SeriesIndex onOpenSeries={openSeries} />
      </div>
    )
  }

  if (route === 'series:vikings-2026') {
    return (
      <div className="site-shell">
        {renderHeader('Series')}

        <SeriesPage slug="vikings-2026" onReadIssue={(pageNumber) => openReader(pageNumber, 'vikings-2026')} />
      </div>
    )
  }

  return (
    <div className="site-shell">
      {renderHeader('Home')}

      <section className="hero hud-frame">
        <div className="hero-main">
          <p className="eyebrow">PUBLISHER SHELL // ONLINE</p>
          <h1>
            DAILY PAGES.
            <br />
            BOUNDLESS VISIONS.
          </h1>
          <p>Comics and soundtracks from the edges of time, space, and imagination.</p>

          <div className="cta-row">
            <button className="primary" onClick={() => openSeries(defaultSeriesSlug)}>Explore Series</button>
            <button disabled>Learn More</button>
          </div>
        </div>

        <aside className="status-panel">
          <h3>Signal Status</h3>
          <ul>
            <li><span>Online</span><strong>YES</strong></li>
            <li><span>Signal Strength</span><strong>97%</strong></li>
            <li><span>Orbital Node</span><strong>N-06</strong></li>
            <li><span>Tune In</span><strong>ACTIVE</strong></li>
          </ul>
        </aside>
      </section>

      <main className="content-grid">
        <section>
          <h2>Featured Series</h2>

          <div className="rail large-rail">
            {featuredSeries.map((series) => {
              const isVikings = series.title === 'Vikings 2026'

              return (
                <article
                  className={`series-card${isVikings ? ' clickable-card' : ''}`}
                  key={series.title}
                  onClick={isVikings ? () => openSeries(defaultSeriesSlug) : undefined}
                  onKeyDown={isVikings ? (event) => handleSeriesCardKeyDown(event, defaultSeriesSlug) : undefined}
                  role={isVikings ? 'button' : undefined}
                  tabIndex={isVikings ? 0 : undefined}
                >
                  <ImageWithFallback src={series.cover} alt={series.title} fallbackText="ART INBOUND" />

                  <div className="card-copy">
                    <p>{series.issue}</p>
                    <h3>{series.title}</h3>
                    <span>{series.hook}</span>

                    <div>
                      {isVikings ? (
                        <button
                          className="inline-link"
                          onClick={(event) => {
                            event.stopPropagation()
                            openSeries(defaultSeriesSlug)
                          }}
                        >
                          View Series
                        </button>
                      ) : (
                        <span className="disabled-link">Series Coming Soon</span>
                      )}

                      <span className="disabled-link">Soundtrack Soon</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <h2>More Worlds</h2>

          <div className="rail small-rail">
            {moreWorlds.map((world) => (
              <article key={world.title} className="mini-card">
                <ImageWithFallback src={world.cover} alt={world.title} fallbackText="ART INBOUND" />
                <p>{world.title}</p>
              </article>
            ))}

            <button className="mini-card view-all" onClick={openSeriesIndex}>View All Series →</button>
          </div>
        </section>

        <aside className="sidebar">
          <article className="panel hud-frame">
            <h3>Latest Release</h3>
            <p>Vikings 2026 — Issue 01</p>
            <ImageWithFallback src="/images/series/vikings-2026/card.png" alt="Vikings 2026 issue 1" fallbackText="VIKINGS 2026" />
          </article>

          <article className="panel hud-frame soundtrack">
            <h3>Soundtrack Spotlight</h3>
            <p>Sequence Drive // Vol. 01</p>
            <div className="wave" />
          </article>
        </aside>
      </main>

      <footer className="footer hud-frame">
        <strong>
          <ImageWithFallback className="footer-logo" src="/images/brand/logo.png" alt="Star Splitter Visions" fallbackText="STAR SPLITTER VISIONS" />
        </strong>

        <div>
          <a href="#">Subscribe</a>
          <a href="#">Join Discord</a>
          <a href="#">Follow Signal</a>
        </div>

        <small>Story worlds. Daily pages. Boundless visions.</small>
      </footer>
    </div>
  )
}

export default App
