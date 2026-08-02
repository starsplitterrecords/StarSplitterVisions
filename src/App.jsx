import { Fragment, useEffect, useMemo, useState } from 'react'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import PressPage from './components/PressPage'
import Reader from './components/Reader'
import SeriesIndex from './components/SeriesIndex'
import SeriesPage from './components/SeriesPage'
import ImageWithFallback from './components/shared/ImageWithFallback'
import homepageContent from './content/homepage.json'
import siteContent from './content/site.json'
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

const navigationItems = siteContent.navigation || [
  { label: 'Home', path: '/' },
  { label: 'Series', path: '/series' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Press', path: '/press' },
]
const defaultSeriesSlug = siteContent.defaultSeriesSlug || Object.keys(seriesPages)[0]
const footerLinks = siteContent.footer?.links || navigationItems.filter((item) => item.path !== '/')

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
    return activeReaderSeries?.dailyPages?.map((page) => page.image) || []
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

    if (!series || series.dailyPages.length === 0) {
      return
    }

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

  const navigateToConfiguredPath = (path) => {
    if (path === '/') {
      goHome()
      return
    }

    if (path === '/series') {
      openSeriesIndex()
      return
    }

    navigateToPage(path)
  }

  const handleNavClick = (event, item) => {
    event.preventDefault()
    navigateToConfiguredPath(item.path)
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
        <ImageWithFallback
          className="brand-logo"
          src={siteContent.brand?.logo}
          alt={siteContent.brand?.name || 'Star Splitter Visions'}
          fallbackText="STAR SPLITTER VISIONS"
        />
        <ImageWithFallback
          className="brand-icon"
          src={siteContent.brand?.icon}
          alt={`${siteContent.brand?.name || 'Star Splitter Visions'} mark`}
          fallbackText="✦"
        />
      </button>

      <nav>
        {navigationItems.map((item) => (
          <a
            key={item.path}
            className={item.label === activeNav ? 'active' : ''}
            href={item.path}
            onClick={(event) => handleNavClick(event, item)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )

  const renderFooter = () => (
    <footer className="footer hud-frame">
      <strong>
        <ImageWithFallback
          className="footer-logo"
          src={siteContent.brand?.logo}
          alt={siteContent.brand?.name || 'Star Splitter Visions'}
          fallbackText="STAR SPLITTER VISIONS"
        />
      </strong>

      <div>
        {footerLinks.map((item) => (
          <button
            className="footer-link-button"
            key={item.path}
            onClick={() => navigateToConfiguredPath(item.path)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <small>{siteContent.footer?.description}</small>
    </footer>
  )

  const renderShellPage = (activeNav, page) => (
    <div className="site-shell">
      {renderHeader(activeNav)}
      {page}
      {renderFooter()}
    </div>
  )

  if (isReaderOpen && activeReaderSeries) {
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
          <p className="eyebrow">{siteContent.hero?.eyebrow}</p>
          <h1>
            {(siteContent.hero?.headingLines || []).map((line, index, lines) => (
              <Fragment key={line}>
                {line}
                {index < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </h1>
          <p>{siteContent.hero?.description}</p>

          <div className="cta-row">
            <button className="primary" onClick={() => openReader(1, defaultSeriesSlug)}>
              {siteContent.hero?.primaryAction}
            </button>
            <button onClick={openSeriesIndex}>{siteContent.hero?.secondaryAction}</button>
          </div>
        </div>

        <aside className="status-panel">
          <h3>{siteContent.statusPanel?.title}</h3>
          <ul>
            {(siteContent.statusPanel?.items || []).map((item) => (
              <li key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <main className="content-grid">
        <section>
          <h2>{homepageContent.featuredHeading}</h2>

          <div className="rail large-rail">
            {featuredSeries.map((series) => (
              <article
                className="series-card clickable-card"
                key={series.slug}
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

          <h2>{homepageContent.moreWorldsHeading}</h2>

          <div className="rail small-rail">
            {moreWorlds.map((world) => (
              <article
                key={world.slug}
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

            <button className="mini-card view-all" onClick={openSeriesIndex}>
              {homepageContent.viewAllLabel}
            </button>
          </div>
        </section>

        <aside className="sidebar">
          {homepageContent.latestRelease && (
            <article className="panel hud-frame">
              <h3>{homepageContent.latestRelease.heading}</h3>
              <p>{homepageContent.latestRelease.title}</p>
              <ImageWithFallback
                src={homepageContent.latestRelease.image}
                alt={homepageContent.latestRelease.title}
                fallbackText="LATEST RELEASE"
              />
            </article>
          )}

          {homepageContent.soundtrackSpotlight?.enabled && (
            <article className="panel hud-frame soundtrack">
              <h3>{homepageContent.soundtrackSpotlight.heading}</h3>
              <p>{homepageContent.soundtrackSpotlight.title}</p>
              <div className="wave" />
            </article>
          )}
        </aside>
      </main>

      {renderFooter()}
    </div>
  )
}

export default App
