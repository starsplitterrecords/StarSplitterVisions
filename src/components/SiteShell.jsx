export default function SiteShell({ children }) {
  return (
    <>
      <header className="site-header">
        <div className="site-shell-inner">
          <a className="site-brand" href="/">Star Splitter Visions</a>
          <nav aria-label="Primary">
            <a href="/read">Read</a>
            <a href="/">Home</a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-shell-inner">
          <p>© {new Date().getFullYear()} Star Splitter Visions</p>
          <a href="/read">Read</a>
        </div>
      </footer>
    </>
  );
}
