import { useEffect, useRef, useState } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'
import './DailyStripReader.css'

const positions = ['0%', '50%', '100%']

export default function DailyStripReader({ title, strips, currentIndex, onStripChange, onClose }) {
  const [panel, setPanel] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const startX = useRef(null)
  const strip = strips[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === strips.length - 1

  useEffect(() => { setPanel(0); setZoomed(false) }, [currentIndex])
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return
      if (event.key === 'ArrowLeft' && !isFirst) onStripChange(currentIndex - 1)
      if (event.key === 'ArrowRight' && !isLast) onStripChange(currentIndex + 1)
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentIndex, isFirst, isLast, onStripChange, onClose])

  if (!strip) return null

  const changePanel = (delta) => setPanel((old) => Math.min(2, Math.max(0, old + delta)))
  const individual = strip.panelImages?.[panel]

  return (
    <main className="fod-reader hud-frame">
      <header className="fod-reader-head">
        <div>
          <p className="fod-reader-kicker">THE FORCES OF DARKNESS, LLC. / DAILY READER</p>
          <h1>{strip.title || title}</h1>
          <p>Strip #{String(strip.pageNumber).padStart(3, '0')} · {strip.releaseDate} · {currentIndex + 1} of {strips.length} available</p>
        </div>
        <button type="button" onClick={onClose}>Back to series</button>
      </header>
      <div className="fod-reader-track"><div style={{ width: (100 * (currentIndex + 1) / strips.length) + '%' }} /></div>
      <div className={'fod-reader-master' + (zoomed ? ' zoomed' : '')}>
        <ImageWithFallback src={strip.image} alt={(strip.title || title) + ' — complete three-panel strip'} fallbackText="COMIC ART UNAVAILABLE" />
      </div>
      <div className="fod-reader-zoom"><button type="button" onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? 'Fit full strip' : 'Enlarge full strip'}</button></div>
      <section className="fod-reader-mobile" aria-label="Individual comic panels">
        <div className="fod-reader-mobile-caption"><strong>Panel {panel + 1} of 3</strong><span>Swipe between panels</span></div>
        <div className="fod-reader-panel-container"
          onTouchStart={(event) => { startX.current = event.touches[0]?.clientX ?? null }}
          onTouchEnd={(event) => {
            const endX = event.changedTouches[0]?.clientX
            if (startX.current !== null && typeof endX === 'number' && Math.abs(endX - startX.current) > 45) changePanel(endX < startX.current ? 1 : -1)
            startX.current = null
          }}>
          {individual
            ? <img src={individual} alt={'Panel ' + (panel + 1) + ' of ' + (strip.title || title)} />
            : <div className="fod-reader-panel-crop" role="img" aria-label={'Panel ' + (panel + 1) + ' of ' + (strip.title || title)} style={{ backgroundImage: 'url("' + strip.image + '")', backgroundPositionX: positions[panel] }} />}
        </div>
        <div className="fod-reader-panel-controls">
          <button type="button" onClick={() => changePanel(-1)} disabled={panel === 0}>Previous panel</button>
          <div className="fod-reader-panel-dots" aria-label="Select panel">
            {[0, 1, 2].map((index) => <button key={index} type="button" className={panel === index ? 'active' : ''} aria-label={'Panel ' + (index + 1)} aria-current={panel === index ? 'step' : undefined} onClick={() => setPanel(index)}>{index + 1}</button>)}
          </div>
          <button type="button" onClick={() => changePanel(1)} disabled={panel === 2}>Next panel</button>
        </div>
      </section>
      <nav className="fod-reader-nav" aria-label="Strip navigation">
        <button type="button" disabled={isFirst} onClick={() => onStripChange(0)}>First</button>
        <button type="button" disabled={isFirst} onClick={() => onStripChange(currentIndex - 1)}>Previous</button>
        <button type="button" onClick={() => onStripChange(Math.floor(Math.random() * strips.length))}>Random</button>
        <button type="button" disabled={isLast} onClick={() => onStripChange(currentIndex + 1)}>Next</button>
        <button type="button" disabled={isLast} onClick={() => onStripChange(strips.length - 1)}>Latest</button>
      </nav>
    </main>
  )
}
