import { useEffect, useMemo, useState } from 'react'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import HomePage from './components/HomePage'
import PressPage from './components/PressPage'
import Reader from './components/Reader'
import SeriesIndex from './components/SeriesIndex'
import SeriesPage from './components/SeriesPage'
import ImageWithFallback from './components/shared/ImageWithFallback'
import siteContent from './content/site.json'
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

function App({ initialPath } = {}) {
  const initialRoute = initialPath || (typeof window !== 'undefined' ? window.location.pathname || '/' : '/')
  const initialReaderPath = parseReaderPath(initialRoute)
  const initialReaderSeries = initialReaderPath?.seriesSlug || defaultSeriesSlug
  const initialReaderPage = initialReaderPath?.pageNumber || 1

  const [route, setRoute] = useState(initialRoute)
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
      <HomePage
        onOpenSeries={openSeries}
        onOpenSeriesIndex={openSeriesIndex}
        onRead={openReader}
      />
      {renderFooter()}
    </div>
  )
}

export default App
