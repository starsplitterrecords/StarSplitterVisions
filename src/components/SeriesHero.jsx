export default function SeriesHero({ series }) {
  const logoText = series.logoText || series.title;
  const coverImage = series.coverImage || series.heroImage || series.image;

  return (
    <header className="series-hero">
      {coverImage ? (
        <img src={coverImage} alt={`${series.title} cover art`} className="series-hero-image" />
      ) : (
        <div className="series-hero-image visual-fallback series-logo-fallback" role="img" aria-label={`${series.title} cover placeholder`}>
          <span>{logoText}</span>
        </div>
      )}
      <div className="series-hero-content">
        <p className="eyebrow"><a href="/">← All series</a></p>
        <p className="series-logo-text">{logoText}</p>
        <h1>{series.title}</h1>
        {series.tagline ? <p className="tagline">{series.tagline}</p> : null}
        {series.shortDescription ? <p>{series.shortDescription}</p> : null}
      </div>
    </header>
  );
}
