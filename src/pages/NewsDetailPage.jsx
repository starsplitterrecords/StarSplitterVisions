import { formatDate } from '../lib/dateUtils';

function RelatedLink({ label, href }) {
  return <li><a href={href}>{label}</a></li>;
}

export default function NewsDetailPage({ item }) {
  const related = [
    item.relatedSeriesSlug ? { label: 'Related series', href: `/series/${item.relatedSeriesSlug}` } : null,
    item.relatedReleaseSlug ? { label: 'Related release', href: `/releases/${item.relatedReleaseSlug}` } : null,
    item.relatedExtraSlug ? { label: 'Related extra', href: item.relatedExtraSlug.startsWith('/') ? item.relatedExtraSlug : `/extras/${item.relatedExtraSlug}` } : null
  ].filter(Boolean);

  return <main className="page page-news"><p className="eyebrow"><a href="/news">← Back to News</a></p><article className="news-article"><p className="release-date">{formatDate(item.date)}</p><p className="news-category">{item.category}</p><h1>{item.title}</h1>{item.image ? <img src={item.image} alt={item.imageAlt || `${item.title} image`} className="series-hero-image" /> : null}<p>{item.body}</p>{related.length > 0 ? <section><h2>Related</h2><ul className="related-series">{related.map((link) => <RelatedLink key={link.href} {...link} />)}</ul></section> : null}</article></main>;
}
