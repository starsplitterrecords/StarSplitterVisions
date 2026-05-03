import NewsCard from '../components/NewsCard';

export default function NewsIndexPage({ news }) {
  return <main className="page page-news"><header className="home-header"><h1>News</h1><p>Updates, releases, and behind-the-scenes notes from Star Splitter Visions</p></header>{news.length === 0 ? <p className="empty-rail">No updates yet.</p> : <ul className="news-grid">{news.map((item) => <NewsCard key={item.slug} item={item} href={`/news/${item.slug}`} />)}</ul>}</main>;
}
