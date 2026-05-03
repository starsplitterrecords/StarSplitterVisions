import { formatDate } from '../lib/dateUtils';

export default function NewsCard({ item, href }) {
  return <li className="news-card"><a href={href} className="news-card-link"><div className="news-card-media">{item.image ? <img src={item.image} alt={item.imageAlt || `${item.title} image`} className="release-image" /> : <div className="visual-fallback">Update</div>}</div><div className="release-meta"><p className="release-date">{formatDate(item.date)}</p><p className="news-category">{item.category}</p><h3>{item.title}</h3><p>{item.excerpt}</p><span className="news-cta">Read More</span></div></a></li>;
}
