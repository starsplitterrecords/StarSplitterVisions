import ContentRail from '../components/ContentRail';
import MediaCard from '../components/MediaCard';
import ReleaseCard from '../components/ReleaseCard';

export default function CollectionPage({ title, items, type }) {
  return <main className="page info-page"><header className="home-header"><h1>{title}</h1></header>{type === 'series' ? <ContentRail title="All Series" emptyMessage="No series available yet."><ul className="release-grid">{items.map((item) => <MediaCard key={item.slug} href={`/series/${item.slug}`} image={item.thumbnailImage || item.heroImage || item.image} title={item.title} description={item.tagline || item.shortDescription} fallbackText={item.title} />)}</ul></ContentRail> : null}{type === 'releases' ? <ContentRail title="All Releases" emptyMessage="No releases available yet."><ul className="release-grid">{items.map((item) => <ReleaseCard key={item.id} release={item} />)}</ul></ContentRail> : null}{type === 'extras' ? <ContentRail title="All Extras" emptyMessage="No extras available yet."><ul className="release-grid">{items.map((item, idx) => <MediaCard key={`${item.title}-${idx}`} href={item.url || item.href} image={item.image} eyebrow={item.type || 'Extra'} title={item.title} description={item.description} fallbackText={item.title || 'Extra'} />)}</ul></ContentRail> : null}</main>;
}
