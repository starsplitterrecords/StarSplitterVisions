import { formatDate } from '../lib/dateUtils';

export default function ExtraDetailPage({ extra, series, release }) {
  return <main className="page page-release"><p className="eyebrow"><a href="/extras">← Back to Extras</a></p><article className="extra-detail"><img src={extra.image} alt={extra.alt || extra.title} className="extra-detail-image" /><div><p className={`release-eyebrow ${extra.type?.toLowerCase() === 'in-world' ? 'badge-in-world' : ''}`}>{extra.type || 'Extra'}</p><h1>{extra.title}</h1>{extra.date ? <p className="release-date">{formatDate(extra.date)}</p> : null}<p>{extra.description}</p>{extra.longDescription ? <p>{extra.longDescription}</p> : null}<p className="release-detail">Series: <a href={`/series/${series?.slug || extra.seriesSlug}`}>{series?.title || extra.seriesSlug}</a></p>{release?.id ? <p className="release-detail">Release: <a href={`/releases/${release.id}`}>{release.title || release.id}</a></p> : null}</div></article></main>;
}
