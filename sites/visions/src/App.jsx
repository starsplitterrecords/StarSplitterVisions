import { useEffect, useMemo, useState } from 'react'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import HomePage from './components/HomePage'
import PressPage from './components/PressPage'
import Reader from './components/Reader'
import SeriesIndex from './components/SeriesIndex'
import SeriesPage from './components/SeriesPage'
import ForcesOfDarknessPage from './components/ForcesOfDarknessPage'
import DailyStripReader from './components/DailyStripReader'
import { getEasternDateString, getReleasedPages } from './utils/dailyPages'
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
import './brand-presentation.css'
import './cosmic-atmosphere.css'

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
  const [today, setToday] = useState(getEasternDateString())

  useEffect(() => {
    const refreshToday = () => setToday(getEasternDateString())
    window.addEventListener('focus', refreshToday)
    document.addEventListener('visibilitychange', refreshToday)
    const interval = window.setInterval(refreshToday, 60000)
    return () => {
      window.removeEventListener('focus', refreshToday)
      document.removeEventListener('visibilitychange', refreshToday)
      window.clearInterval(interval)
    }
  }, [])

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

  const releasedReaderPages = useMemo(() => getReleasedPages(activeReaderSeries?.dailyPages || [], today), [activeReaderSeries, today])
  const readerPages = useMemo(() => releasedReaderPages.map((page) => page.image), [releasedReaderPages])

  // Apply the same release gate to direct /read links, not only the series preview.
  useEffect(() => {
    if (!isReaderOpen) return
    const requested = parseReaderPath(route)
    if (!requested || requested.seriesSlug !== activeReaderSeriesSlug) return
    if (releasedReaderPages.length === 0) {
      const seriesPath = buildSeriesPath(activeReaderSeriesSlug)
      window.history.replaceState({}, '', seriesPath)
      setRoute(seriesPath)
      setIsReaderOpen(false)
      return
    }
    const exactIndex = releasedReaderPages.findIndex((page) => page.pageNumber === requested.pageNumber)
    const safeIndex = exactIndex >= 0 ? exactIndex : Math.min(Math.max(requested.pageNumber - 1, 0), releasedReaderPages.length - 1)
    const safePageNumber = releasedReaderPages[safeIndex].pageNumber
    if (safePageNumber !== requested.pageNumber) {
      const safePath = buildReaderPath(activeReaderSeriesSlug, safePageNumber)
      window.history.replaceState({}, '', safePath)
      setRoute(safePath)
    }
    setCurrentPage((previous) => previous === safeIndex ? previous : safeIndex)
  }, [route, activeReaderSeriesSlug, isReaderOpen, releasedReaderPages])

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

    const available = getReleasedPages(series?.dailyPages || [], getEasternDateString())
    if (!series || available.length === 0) return

    const exactIndex = available.findIndex((page) => page.pageNumber === pageNumber)
    const safeIndex = exactIndex >= 0 ? exactIndex : clampPageNumber(pageNumber, available.length) - 1
    const safePage = available[safeIndex].pageNumber

    setActiveReaderSeriesSlug(series.slug)
    setCurrentPage(safeIndex)
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
    const pageNumber = releasedReaderPages[safePageIndex]?.pageNumber
    if (!pageNumber) return

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

  if (isReaderOpen && activeReaderSeries && readerPages.length > 0) {
    if (activeReaderSeries.slug === 'forces-of-darkness-llc') {
      return renderShellPage('Series', (
        <DailyStripReader
          title={activeReaderSeries.title}
          strips={releasedReaderPages}
          currentIndex={Math.min(currentPage, releasedReaderPages.length - 1)}
          onStripChange={updateReaderPage}
          onClose={() => openSeries(activeReaderSeries.slug)}
        />
      ))
    }
    return renderShellPage('Series', (
      <Reader
        title={activeReaderSeries.title + ' — ' + activeReaderSeries.currentRelease}
        pages={readerPages}
        currentPage={Math.min(currentPage, readerPages.length - 1)}
        onPageChange={updateReaderPage}
        onClose={() => openSeries(activeReaderSeries.slug)}
      />
    ))
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
    return renderShellPage('Series', activeSeriesSlug === 'forces-of-darkness-llc'
      ? <ForcesOfDarknessPage series={seriesPages[activeSeriesSlug]} onReadIssue={(pageNumber) => openReader(pageNumber, activeSeriesSlug)} />
      : <SeriesPage slug={activeSeriesSlug} onReadIssue={(pageNumber) => openReader(pageNumber, activeSeriesSlug)} />)
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
