function MediaCardInner({ title, subtitle, description, image, alt, eyebrow, badge, chips, fallbackText, accentColor }) {
  return (
    <>
      {image ? <img src={image} alt={alt || `${title} image`} className="release-image" /> : <div className="visual-fallback" aria-hidden="true"><span>{fallbackText || title}</span></div>}
      <div className="release-meta" style={accentColor ? { '--series-accent': accentColor } : undefined}>
        {eyebrow ? <p className="release-eyebrow">{eyebrow}</p> : null}
        <h3>{title}</h3>
        {subtitle ? <p className="release-detail">{subtitle}</p> : null}
        {description ? <p className="release-detail">{description}</p> : null}
        {badge ? <p className="release-date">{badge}</p> : null}
        {chips?.length ? <p className="release-detail">{chips.join(' · ')}</p> : null}
      </div>
    </>
  );
}

export default function MediaCard(props) {
  const { href, className = '' } = props;
  const card = <MediaCardInner {...props} />;

  return (
    <li className={`release-card ${className}`.trim()}>
      {href ? <a href={href}>{card}</a> : <div>{card}</div>}
    </li>
  );
}
