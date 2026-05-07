import { useMemo, useState } from 'react'
import { featuredSeries, moreWorlds } from './data/homepageSeries'
import SeriesPage from './components/SeriesPage'
import './styles.css'
import './mobile-overrides.css'

const navLinks = ['Home', 'Series', 'Issues', 'Soundtracks', 'Extras', 'About']

function ImageWithFallback({ src, alt, className = '', fallbackText = 'ART INBOUND' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`image-fallback ${className}`.trim()} role="img" aria-label={alt || fallbackText}>
        <span>{fallbackText}</span>
      </div>
    )
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
}

function App() {
  const [route, setRoute] = useState('home')
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const vikingsPages = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) =>
        `/images/pages/vikings-2026/issue-01/page-${String(index + 1).padStart(3, '0')}.jpg`
      ),
    []
  )

  const openReader = (pageNumber = 1) => {
    const safePage = Math.min(Math.max(pageNumber, 1), vikingsPages.length)
    setCurrentPage(safePage - 1)
    setIsReaderOpen(true)
  }

  const openSeries = (slug) => {
    setIsReaderOpen(false)
    setRoute(`series:${slug}`)
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
      openSeries('vikings-2026')
    }
  }

  const handleSeriesCardKeyDown = (event, slug) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSeries(slug)
    }
  }

  if (isReaderOpen) {
    return (
      <div className="site-shell">
        <main className="reader hud-frame">
          <header className="reader-header">
            <h2>Vikings 2026 — Issue 01</h2>
            <p>Page {currentPage + 1} of {vikingsPages.length}</p>
          </header>

          <ImageWithFallback
            src={vikingsPages[currentPage]}
            alt={`Vikings 2026 issue 1 page ${currentPage + 1}`}
            fallbackText={`PAGE ${String(currentPage + 1).padStart(3, '0')} INBOUND`}
          />

          <div className="reader-controls">
            <button onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))} disabled={currentPage === 0}>
              Previous
            </button>

            <button
              onClick={() => setCurrentPage((page) => Math.min(page + 1, vikingsPages.length - 1))}
              disabled={currentPage === vikingsPages.length - 1}
            >
              Next
            </button>

            <button onClick={() => setIsReaderOpen(false)}>Back to Series</button>
          </div>
        </main>
      </div>
    )
  }

  if (route === 'series:vikings-2026') {
    return (
      <div className="site-shell">
        <header className="top-nav hud-frame">
          <button className="brand brand-button" onClick={goHome} type="button">
            <ImageWithFallback className="brand-logo" src="/images/brand/logo.png" alt="Star Splitter Visions" fallbackText="STAR SPLITTER VISIONS" />
            <ImageWithFallback className="brand-icon" src="/images/brand/icon.png" alt="Star Splitter Visions mark" fallbackText="✦" />
          </button>

          <nav>
            {navLinks.map((link) => (
              <a
                key={link}
                className={link === 'Series' ? 'active' : ''}
                href="#"
                onClick={(event) => handleNavClick(event, link)}
              >
                {link}
              </a>
            ))}
          </nav>
        </header>

        <SeriesPage slug="vikings-2026" onReadIssue={openReader} />
      </div>
    )
  }

  return (
    <div className="site-shell">
      <header className="top-nav hud-frame">
        <button className="brand brand-button" onClick={goHome} type="button">
          <ImageWithFallback className="brand-logo" src="/images/brand/logo.png" alt="Star Splitter Visions" fallbackText="STAR SPLITTER VISIONS" />
          <ImageWithFallback className="brand-icon" src="/images/brand/icon.png" alt="Star Splitter Visions mark" fallbackText="✦" />
        </button>

        <nav>
          {navLinks.map((link) => (
            <a
              key={link}
              className={link === 'Home' ? 'active' : ''}
              href="#"
              onClick={(event) => handleNavClick(event, link)}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="icon-row">
          <button>⌕</button>
          <button>▶</button>
          <button>☰</button>
        </div>
      </header>

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
            <button className="primary" onClick={() => openSeries('vikings-2026')}>
              Explore Series
            </button>

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
                  onClick={isVikings ? () => openSeries('vikings-2026') : undefined}
                  onKeyDown={isVikings ? (event) => handleSeriesCardKeyDown(event, 'vikings-2026') : undefined}
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
                            openSeries('vikings-2026')
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

            <article className="mini-card view-all">View All Series →</article>
          </div>
        </section>

        <aside className="sidebar">
          <article className="panel hud-frame">
            <h3>Latest Release</h3>
            <p>Vikings 2026 — Issue 01</p>

            <ImageWithFallback
              src="/images/series/vikings-2026/card.png"
              alt="Vikings 2026 issue 1"
              fallbackText="VIKINGS 2026"
            />
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
