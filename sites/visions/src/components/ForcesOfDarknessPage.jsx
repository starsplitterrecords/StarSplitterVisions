import { useMemo } from 'react'
import ImageWithFallback from './shared/ImageWithFallback'
import { getEasternDateString, getReleasedPages } from '../utils/dailyPages'
import './ForcesOfDarknessPage.css'

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/New_York' })
    .format(new Date(date + 'T12:00:00-05:00'))
}

export default function ForcesOfDarknessPage({ series, onReadIssue }) {
  const today = getEasternDateString()
  const strips = useMemo(() => getReleasedPages(series.dailyPages, today), [series, today])
  const first = strips[0]
  const latest = strips.at(-1)
  const nextDate = (series.dailyPages || [])
    .filter((strip) => !['draft', 'hidden'].includes(strip.publicationState) && strip.releaseDate > today)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))[0]?.releaseDate

  return (
    <main className="fod-page">
      <section className="fod-hero hud-frame">
        <div className="fod-hero-copy">
          <p className="fod-kicker">STAR SPLITTER VISIONS / DAILY COMICS</p>
          <h1>The Forces of <span>Darkness, LLC.</span></h1>
          <p className="fod-tagline">{series.tagline}</p>
          <p className="fod-intro">{series.description}</p>
          <div className="fod-hero-actions">
            <button type="button" className="fod-button primary" onClick={() => latest && onReadIssue(latest.pageNumber)} disabled={!latest}>
              {latest ? "Read Today's Strip" : 'Daily Strips Coming Soon'}
            </button>
            {first && <button type="button" className="fod-button" onClick={() => onReadIssue(first.pageNumber)}>Start at Strip 001</button>}
          </div>
          <p className="fod-schedule">Daily comic · Eastern time · {strips.length} released</p>
        </div>
        <ImageWithFallback className="fod-hero-art" src={series.hero} alt="Forces of Darkness gold eye sigil and wordmark" fallbackText="FORCES OF DARKNESS" />
      </section>

      <section className="fod-daily" aria-label="Daily strip">
        <div className="fod-section-heading">
          <p className="fod-kicker">THE DAILY READER</p>
          <h2>{latest ? 'Latest strip from the office' : 'The daily strip is coming'}</h2>
          <p>{latest ? 'One complete three-panel comic each day. Read the latest, or browse past disasters.' : 'Published strips will appear automatically when their release dates arrive.'}</p>
        </div>
        {latest ? (
          <article className="fod-latest hud-frame">
            <button className="fod-cover-button" type="button" onClick={() => onReadIssue(latest.pageNumber)}>
              <ImageWithFallback src={latest.image} alt={'Strip ' + latest.pageNumber + ': ' + (latest.title || 'The Forces of Darkness')} fallbackText="STRIP ART" />
            </button>
            <div className="fod-latest-footer">
              <div><p className="fod-kicker">STRIP #{String(latest.pageNumber).padStart(3, '0')} · {formatDate(latest.releaseDate)}</p><h3>{latest.title || 'The latest strip'}</h3></div>
              <button className="fod-button primary" type="button" onClick={() => onReadIssue(latest.pageNumber)}>Open Reader</button>
            </div>
          </article>
        ) : (
          <div className="fod-empty hud-frame">
            <p>PUBLICATION PENDING</p>
            <h3>Not even darkness ships before release.</h3>
            <span>{nextDate ? 'First scheduled drop: ' + formatDate(nextDate) : 'The first strip has not been scheduled yet.'}</span>
          </div>
        )}
      </section>

      {strips.length > 0 && <section className="fod-archive" aria-label="Daily strip archive">
        <div className="fod-section-heading"><p className="fod-kicker">THE ARCHIVE</p><h2>Previously on the payroll</h2></div>
        <div className="fod-archive-grid">
          {[...strips].reverse().map((strip) => (
            <button className="fod-archive-tile hud-frame" type="button" key={strip.pageNumber} onClick={() => onReadIssue(strip.pageNumber)}>
              <strong>#{String(strip.pageNumber).padStart(3, '0')}</strong>
              <span>{strip.title || 'The daily strip'}</span>
              <small>{formatDate(strip.releaseDate)}</small>
            </button>
          ))}
        </div>
      </section>}

      <section className="fod-about hud-frame">
        <p className="fod-kicker">ABOUT THE COMPANY</p>
        <h2>Villages are being pillaged. Reports are due Friday.</h2>
        <p>{series.worldPremise}</p>
        <p>Meet Hork in operations, Grov the necromancer in HR, Smugesh (“Kevin”) the dragon manager, and Sir Eric — the knight whose culture hire has lasted longer than anyone expected.</p>
      </section>
    </main>
  )
}
