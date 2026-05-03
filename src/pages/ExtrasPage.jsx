import { useMemo, useState } from 'react';
import { formatDate } from '../lib/dateUtils';
import { getExtraHref, normalizeExtraType, sortExtras } from '../lib/extras';

export default function ExtrasPage({ extras, series }) {
  const params = new URLSearchParams(window.location.search);
  const [typeFilter, setTypeFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState(params.get('series') || 'all');
  const seriesBySlug = useMemo(() => new Map(series.map((item) => [item.slug, item.title])), [series]);
  const sortedExtras = useMemo(() => sortExtras(extras), [extras]);
  const types = useMemo(() => Array.from(new Set(sortedExtras.map((item) => normalizeExtraType(item.type)).filter(Boolean))), [sortedExtras]);
  const filtered = sortedExtras.filter((item) => (typeFilter === 'all' || normalizeExtraType(item.type) === typeFilter) && (seriesFilter === 'all' || item.seriesSlug === seriesFilter));

  return <main className="page page-extras"><header className="home-header"><h1>Extras</h1><p>Concept art, in-world documents, and behind-the-scenes materials</p></header><section className="extras-filters" aria-label="Extra filters"><label>Type<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label>Series<select value={seriesFilter} onChange={(event) => setSeriesFilter(event.target.value)}><option value="all">All</option>{series.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label></section>{filtered.length === 0 ? <p className="empty-rail">No extras available yet.</p> : <ul className="extras-grid">{filtered.map((extra) => <li key={extra.slug || extra.id} className="release-card series-card"><a href={getExtraHref(extra) || '#'}><img src={extra.image} alt={extra.alt || `${extra.title} preview`} className="release-image" loading="lazy" /><div className="release-meta"><p className={`release-eyebrow ${normalizeExtraType(extra.type) === 'in-world' ? 'badge-in-world' : ''}`}>{extra.type || 'Extra'}</p><h3>{extra.title}</h3><p className="release-detail">{seriesBySlug.get(extra.seriesSlug) || extra.seriesSlug}</p>{extra.date ? <p className="release-date">{formatDate(extra.date)}</p> : null}<p className="release-detail">View</p></div></a></li>)}</ul>}</main>;
}
