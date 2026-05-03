const FALLBACK_IMAGE = '/images/series-card.jpg';

const STATUS_LABELS = {
  'in-development': 'In Development',
  announced: 'Announced',
  active: 'Active',
  ongoing: 'Ongoing',
  hiatus: 'Hiatus',
  completed: 'Completed'
};

function normalizeStatus(status) {
  if (typeof status !== 'string') return 'announced';
  const normalized = status.trim().toLowerCase().replace(/\s+/g, '-');
  return STATUS_LABELS[normalized] ? normalized : 'announced';
}

export default function SeriesCard({ series }) {
  const image = series.thumbnailImage || series.coverImage || series.heroImage || FALLBACK_IMAGE;
  const description = series.shortDescription || series.tagline || '';
  const status = normalizeStatus(series.status);

  return (
    <li className="series-index-card">
      <a href={`/series/${series.slug}`} className="series-index-link" aria-label={`View series ${series.title}`}>
        <img src={image} alt={`${series.title} series art`} className="series-index-image" loading="lazy" />
        <div className="series-index-meta">
          <div className="series-index-topline">
            <span className={`series-status-badge status-${status}`}>{STATUS_LABELS[status]}</span>
            {series.format ? <span className="series-format-tag">{series.format}</span> : null}
          </div>
          <h2>{series.title}</h2>
          {description ? <p>{description}</p> : null}
          <span className="series-index-cta">View Series</span>
        </div>
      </a>
    </li>
  );
}

export { normalizeStatus };
