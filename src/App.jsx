import { useEffect, useMemo, useState } from 'react'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import PressPage from './components/PressPage'
import Reader from './components/Reader'
import SeriesIndex from './components/SeriesIndex'
import SeriesPage from './components/SeriesPage'
import ImageWithFallback from './components/shared/ImageWithFallback'
import { brandAssets, coverAssets } from './data/assets'
import { featuredSeries, moreWorlds } from './data/homepageSeries'
import { seriesPages } from './data/seriesPages'
import {
  buildReaderPath,
  buildSeriesPath,
  clampPageNumber,
  parseReaderPath,
} from './utils/routes'
import './styles.css'
import './mobile-overrides.css'
import './public-shell.css'

const navLinks = ['Home', 'Series', 'About', 'Contact', 'Press']
const defaultSeriesSlug = 'vikings-2026'

function App() {
  const initialReaderPath = parseReaderPath(window.location.pathname || '/')
  const initialReaderSeries = initialReaderPath?.seriesSlug || defaultSeriesSlug
  const initialReaderPage = initialReaderPath?.pageNumber || 1

  const [route, setRoute] = useState(window.location.pathname || '/')
  const [isReaderOpen, setIsReaderOpen] = useState(Boolean(initialReaderPath))
  const [currentPage, setCurrentPage] = useState(Math.max(initialReaderPage - 1, 0))
  const [activeReaderSeriesSlug, setActiveReaderSeriesSlug] = useState(initialReaderSeries)

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname || '/'
      const readerPath = parseReaderPath(pathname)

      setRoute(pathname)
      setIsReaderOpen(Boolean(readerPath))

      if (readerPath) {
        setActiveReaderSeriesSlug(readerPath.seriesSlug)
        setCurrentPage(Math.max(readerPath.pageNumber - 1, 0))
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const activeSeriesSlug = route.startsWith('/series/')
    ? route.replace('/series/', '')
    : defaultSeriesSlug

  const activeReaderSeries = seriesPages[activeReaderSeriesSlug] || seriesPages[defaultSeriesSlug]

  const readerPages = useMemo(() => {
    return activeReaderSeries.dailyPages.map((page) => page.image)
  }, [activeReaderSeries])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setRoute(path)
  }

  const replaceRoute = (path) => {
    window.history.replaceState({}, '', path)
    setRoute(path)
  }

  const openReader = (pageNumber = 1, seriesSlug = defaultSeriesSlug) => {
    const series = seriesPages[seriesSlug] || seriesPages[defaultSeriesSlug]
    const safePage = clampPageNumber(pageNumber, series.dailyPages.length)

    setActiveReaderSeriesSlug(series.slug)
    setCurrentPage(safePage - 1)
    setIsReaderOpen(true)

    navigate(buildReaderPath(series.slug, safePage))
  }

  const openSeries = (slug) => {
    setIsReaderOpen(false)
    navigate(buildSeriesPath(slug))
  }

  const openSeriesIndex = () => {
    setIsReaderOpen(false)
    navigate('/series')
  }

  const goHome = () => {
    setIsReaderOpen(false)
    navigate('/')
  }

  const updateReaderPage = (nextPageIndex) => {
    const safePageIndex = Math.min(Math.max(nextPageIndex, 0), Math.max(readerPages.length - 1, 0))
    const pageNumber = safePageIndex + 1

    setCurrentPage(safePageIndex)
    replaceRoute(buildReaderPath(activeReaderSeries.slug, pageNumber))
  }

  const navigateToPage = (path) => {
    setIsReaderOpen(false)
    navigate(path)
  }

  const handleNavClick = (event, link) => {
    event.preventDefault()

    if (link === 'Home') {
      goHome()
      return
    }

    if (link === 'Series') {
      openSeriesIndex()
      return
    }

    navigateToPage(`/${link.toLowerCase()}`)
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
        <ImageWithFallback className="brand-logo" src={brandAssets.logo} alt="Star Splitter Visions" fallbackText="STAR SPLITTER VISIONS" />
        <ImageWithFallback className="brand-icon" src={brandAssets.icon} alt="Star Splitter Visions mark" fallbackText="✦" />
      </button>

      <nav>
        {navLinks.map((link) => (
          <a key={link} className={link === activeNav ? 'active' : ''} href={`/${link === 'Home' ? '' : link.toLowerCase()}`} onClick={(event) => handleNavClick(event, link)}>
            {link}
          </a>
        ))}
      </nav>
    </header>
  )

  const renderFooter = () => (
    <footer className="footer hud-frame">
      <strong>
        <ImageWithFallback className="footer-logo" src={brandAssets.logo} alt="Star Splitter Visions" fallbackText="STAR SPLITTER VISIONS" />
      </strong>

      <div>
        <button className="footer-link-button" onClick={openSeriesIndex} type="button">Series</button>
        <button className="footer-link-button" onClick={() => navigateToPage('/about')} type="button">About</button>
        <button className="footer-link-button" onClick={() => navigateToPage('/contact')} type="button">Contact</button>
        <button className="footer-link-button" onClick={() => navigateToPage('/press')} type="button">Press</button>
      </div>

      <small>Independent comics, graphic stories, and companion music from strange worlds with human stakes.</small>
    </footer>
  )

  const renderShellPage = (activeNav, page) => (
    <div className="site-shell">
      {renderHeader(activeNav)}
      {page}
      {renderFooter()}
    </div>
  )

  if (isReaderOpen) {
    return (
      <div className="site-shell">
        <Reader
          title={`${activeReaderSeries.title} — ${activeReaderSeries.currentRelease}`}
          pages={readerPages}
          currentPage={currentPage}
          onPageChange={updateReaderPage}
          onClose={() => openSeries(activeReaderSeries.slug)}
        />
      </div>
    )
  }

  if (route === '/about') {
    return renderShellPage('About', <AboutPage />)
  }

  if (route === '/contact') {
    return renderShellPage('Contact', <ContactPage />)
  }

  if (route === '/press') {
    return renderShellPage('Press', <PressPage />)
  }

  if (route === '/series') {
    return renderShellPage('Series', <SeriesIndex onOpenSeries={openSeries} />)
  }

  if (route.startsWith('/series/')) {
    return renderShellPage('Series', <SeriesPage slug={activeSeriesSlug} onReadIssue={(pageNumber) => openReader(pageNumber, activeSeriesSlug)} />)
  }

  return (
    <div className="site-shell">
      {renderHeader('Home')}

      <section className="hero hud-frame">
        <div className="hero-main">
          <p className="eyebrow">STAR SPLITTER VISIONS</p>
          <h1>
            COMICS AND MUSIC.
            <br />
            STRANGE WORLDS.
          </h1>
          <p>Independent speculative comics, graphic stories, and companion music from strange worlds with human stakes.</p>

          <div className="cta-row">
            <button className="primary" onClick={() => openReader(1, defaultSeriesSlug)}>Start Reading</button>
            <button onClick={openSeriesIndex}>Explore Series</button>
          </div>
        </div>

        <aside className="status-panel">
          <h3>Current Shelf</h3>
          <ul>
            <li><span>Flagship Release</span><strong>VIKINGS 2026</strong></li>
            <li><span>Active Catalog</span><strong>3 SERIES</strong></li>
            <li><span>Developing Worlds</span><strong>AZURE / STARDUST</strong></li>
            <li><span>Companion Music</span><strong>IN PROGRESS</strong></li>
          </ul>
        </aside>
      </section>

      <main className="content-grid">
        <section>
          <h2>Featured Series</h2>

          <div className="rail large-rail">
            {featuredSeries.map((series) => (
              <article
                className="series-card clickable-card"
                key={series.title}
                onClick={() => openSeries(series.slug)}
                onKeyDown={(event) => handleSeriesCardKeyDown(event, series.slug)}
                role="button"
                tabIndex={0}
              >
                <ImageWithFallback src={series.cover} alt={series.title} fallbackText="ART INBOUND" />

                <div className="card-copy">
                  <p>{series.issue}</p>
                  <h3>{series.title}</h3>
                  <span>{series.hook}</span>

                  <div>
                    <button
                      className="inline-link"
                      onClick={(event) => {
                        event.stopPropagation()
                        openSeries(series.slug)
                      }}
                    >
                      View Series
                    </button>

                    <span className="disabled-link">Soundtrack Soon</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <h2>More Worlds</h2>

          <div className="rail small-rail">
            {moreWorlds.map((world) => (
              <article
                key={world.title}
                className="mini-card clickable-card"
                onClick={() => openSeries(world.slug)}
                onKeyDown={(event) => handleSeriesCardKeyDown(event, world.slug)}
                role="button"
                tabIndex={0}
              >
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
            <ImageWithFallback src={coverAssets.vikingsIssue01} alt="Vikings 2026 issue 1" fallbackText="VIKINGS 2026" />
          </article>

          <article className="panel hud-frame soundtrack">
            <h3>Soundtrack Spotlight</h3>
            <p>Sequence Drive // Vol. 01</p>
            <div className="wave" />
          </article>
        </aside>
      </main>

      {renderFooter()}
    </div>
  )
}

export default App
