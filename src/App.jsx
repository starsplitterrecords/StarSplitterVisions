import { featuredSeries, moreWorlds } from './data/homepageSeries'
import './styles.css'

const navLinks = ['Home', 'Series', 'Issues', 'Soundtracks', 'Extras', 'About']

function App() {
  return (
    <div className="site-shell">
      <header className="top-nav hud-frame">
        <div className="brand">STAR SPLITTER VISIONS</div>
        <nav>{navLinks.map((link, i) => <a key={link} className={i === 0 ? 'active' : ''} href="#">{link}</a>)}</nav>
        <div className="icon-row"><button>⌕</button><button>▶</button><button>☰</button></div>
      </header>

      <section className="hero hud-frame">
        <div className="hero-main">
          <p className="eyebrow">PUBLISHER SHELL // ONLINE</p>
          <h1>DAILY PAGES.<br />BOUNDLESS VISIONS.</h1>
          <p>Comics and soundtracks from the edges of time, space, and imagination.</p>
          <div className="cta-row">
            <button className="primary">Explore Series</button>
            <button>Learn More</button>
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
            {featuredSeries.map((series) => (
              <article className="series-card" key={series.title}>
                <img src={series.cover} alt={series.title} />
                <div className="card-copy">
                  <p>{series.issue}</p>
                  <h3>{series.title}</h3>
                  <span>{series.hook}</span>
                  <div><a href="#">Read Issue</a><a href="#">Play Soundtrack</a></div>
                </div>
              </article>
            ))}
          </div>

          <h2>More Worlds</h2>
          <div className="rail small-rail">
            {moreWorlds.map((world) => <article key={world} className="mini-card">{world}</article>)}
            <article className="mini-card view-all">View All Series →</article>
          </div>
        </section>

        <aside className="sidebar">
          <article className="panel hud-frame">
            <h3>Latest Release</h3>
            <p>Vikings 2026 — Issue 01</p>
            <img src="/images/vikings-2026/vikings-ep1/cover.jpg" alt="Vikings 2026 issue 1" />
          </article>
          <article className="panel hud-frame soundtrack">
            <h3>Soundtrack Spotlight</h3>
            <p>Sequence Drive // Vol. 01</p>
            <div className="wave" />
          </article>
        </aside>
      </main>

      <footer className="footer hud-frame">
        <strong>STAR SPLITTER VISIONS</strong>
        <div><a href="#">Subscribe</a><a href="#">Join Discord</a><a href="#">Follow Signal</a></div>
        <small>Story worlds. Daily pages. Boundless visions.</small>
      </footer>
    </div>
  )
}

export default App
