export default function SiteChrome({ children }) {
  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="/" className="site-brand">Star Splitter Visions</a>
          <div className="site-nav-links">
            <a href="/">Home</a>
            <a href="/series">Series</a>
          </div>
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <p>© Star Splitter Visions</p>
      </footer>
    </>
  );
}
