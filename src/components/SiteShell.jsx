import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Series', href: '/series' },
  { label: 'Releases', href: '/releases' },
  { label: 'Extras', href: '/extras' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

function isActivePath(currentPath, href) {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function SiteShell({ path, children, hasExtras }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = hasExtras ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.href !== '/extras');

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <a className="site-brand" href="/">Star Splitter Visions</a>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-controls="global-nav">Menu</button>
          <nav id="global-nav" className={`global-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary">
            {navItems.map((item) => <a key={item.href} href={item.href} className={isActivePath(path, item.href) ? 'is-active' : ''}>{item.label}</a>)}
            <a className="primary-button nav-cta" href="/releases">Start Reading</a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-footer-grid">
          <section>
            <h2>Star Splitter Visions</h2>
            <p>Independent comics and illustrated story worlds from a creator-first publisher studio.</p>
          </section>
          <section>
            <h3>Explore</h3>
            <ul><li><a href="/series">Series</a></li><li><a href="/releases">Releases</a></li>{hasExtras ? <li><a href="/extras">Extras</a></li> : null}</ul>
          </section>
          <section>
            <h3>Company</h3>
            <ul><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li><li><a href="/press">Press</a></li></ul>
          </section>
          <section>
            <h3>Social</h3>
            <ul><li><a href="#">X / Twitter</a></li><li><a href="#">Instagram</a></li><li><a href="#">YouTube</a></li></ul>
          </section>
        </div>
        <div className="site-footer-meta">
          <p>© 2026 Star Splitter Visions. All rights reserved.</p>
          <p><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
        </div>
      </footer>
    </div>
  );
}
