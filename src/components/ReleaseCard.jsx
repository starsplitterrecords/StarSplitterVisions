import { formatDate } from '../lib/dateUtils';

export default function ReleaseCard({ release, seriesTitle, href, seriesHref, variant = 'default', showDescription = true, showDate = true, showSeries = true, className = '', showCta = false }) {
  const imageSrc = release.coverImage || release.heroImage || release.image;
  const releaseDate = formatDate(release.releaseDate);
  const cardClassName = variant === 'compact' ? 'release-card release-card-compact' : 'release-card';
  const cardHref = href || (release.id ? `/releases/${release.id}` : null);

  const body = (
    <>
      {imageSrc ? <img src={imageSrc} alt={`${release.title} cover`} className="release-image" /> : <div className="visual-fallback" aria-hidden="true"><span>{release.title}</span></div>}
      <div className="release-meta">
        {showSeries && seriesTitle ? <p className="release-eyebrow">{seriesHref ? <a href={seriesHref}>{seriesTitle}</a> : seriesTitle}</p> : null}
        <h3>{release.title}</h3>
        {release.issueNumber !== undefined ? <p className="release-detail">Issue #{release.issueNumber}</p> : null}
        {showDescription && release.description ? <p className="release-detail">{release.description}</p> : null}
        {showDate && releaseDate ? <p className="release-date">{releaseDate}</p> : null}
        {showCta ? <p className="release-card-cta">Read</p> : null}
      </div>
    </>
  );

  return <li className={`${cardClassName} ${className}`.trim()}>{cardHref ? <a href={cardHref}>{body}</a> : <div>{body}</div>}</li>;
}
