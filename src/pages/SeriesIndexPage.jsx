import { useMemo, useState } from 'react';
import SeriesCard, { normalizeStatus } from '../components/SeriesCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'in-development', label: 'In Development' },
  { key: 'completed', label: 'Completed' }
];

const STATUS_ORDER = {
  ongoing: 0,
  active: 0,
  'in-development': 1,
  announced: 2,
  hiatus: 2,
  completed: 3
};

function matchesFilter(series, filter) {
  const status = normalizeStatus(series.status);
  if (filter === 'all') return true;
  if (filter === 'active') return status === 'ongoing' || status === 'active';
  if (filter === 'in-development') return status === 'in-development';
  if (filter === 'completed') return status === 'completed';
  return true;
}

export default function SeriesIndexPage({ series }) {
  const [filter, setFilter] = useState('all');

  const sortedSeries = useMemo(() => [...series].sort((a, b) => {
    const statusDelta = (STATUS_ORDER[normalizeStatus(a.status)] ?? 99) - (STATUS_ORDER[normalizeStatus(b.status)] ?? 99);
    if (statusDelta !== 0) return statusDelta;
    return (a.title || '').localeCompare(b.title || '');
  }), [series]);

  const filteredSeries = useMemo(() => sortedSeries.filter((item) => matchesFilter(item, filter)), [sortedSeries, filter]);

  return (
    <main className="page page-series-index">
      <header className="home-header">
        <h1>Series</h1>
        <p>Explore all stories and worlds from Star Splitter Visions.</p>
      </header>

      <section className="series-filters" aria-label="Series filters">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`search-filter ${filter === item.key ? 'is-active' : ''}`}
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
          >
            {item.label}
          </button>
        ))}
      </section>

      {sortedSeries.length === 0 ? <p className="search-hint">No series available yet.</p> : null}
      {sortedSeries.length > 0 && filteredSeries.length === 0 ? <p className="search-hint">No series match this filter.</p> : null}

      <ul className="series-index-grid">
        {filteredSeries.map((item) => <SeriesCard key={item.slug || item.title} series={item} />)}
      </ul>
    </main>
  );
}
