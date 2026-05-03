import { formatDate } from '../lib/dateUtils';

export default function ReleasePage({ release, series, pages }) {
  const releasePages = pages.filter((page) => page.releaseSlug === release.id);
  return <main className="page page-release"><p className="eyebrow"><a href={`/series/${series.slug}`}>← Back to {series.title}</a></p><header className="series-hero"><img src={release.coverImage || release.image} alt="" className="series-hero-image" /><div className="series-hero-content"><p className="release-date">{formatDate(release.releaseDate)}</p><h1>{release.title}</h1><p>{release.description}</p>{releasePages.length > 0 ? <a className="primary-button" href={`/read/${release.id}`}>{release.ctaLabel || 'Read now'}</a> : null}</div></header></main>;
}
