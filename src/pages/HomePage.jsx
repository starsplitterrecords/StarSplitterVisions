import { useMemo } from 'react';
import MediaCard from '../components/MediaCard';
import ReleaseCard from '../components/ReleaseCard';
import { validateExtraList } from '../lib/contentValidation';
import { isVisibleRelease, sortReleasesByNewest } from '../lib/releaseVisibility';

function PageSection({ title, subtitle, children }) {
  return (
    <section className="home-section" aria-label={title}>
      <header className="home-section-header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

function ContinueReadingModule({ item, onClear }) {
  const title = item.releaseTitle || 'Continue Reading';
  return <section className="continue-module" aria-label="Continue reading"><div className="continue-module-art">{item.image ? <img src={item.image} alt={`${title} cover`} className="release-image" /> : <div className="visual-fallback">Continue Reading</div>}</div><div className="continue-module-content"><p className="release-date">Continue Reading</p>{item.seriesTitle ? <p className="release-eyebrow">{item.seriesTitle}</p> : null}<h2>{title}</h2>{item.issueNumber ? <p className="release-detail">Issue {item.issueNumber}</p> : null}{item.pageNumber && item.totalPages ? <p className="release-detail">Page {item.pageNumber} of {item.totalPages}</p> : null}<div className="continue-module-actions"><a className="primary-button" href={`/read/${item.releaseSlug}`}>Continue Reading</a><button type="button" className="text-button" onClick={onClear}>Clear</button></div></div></section>;
}

export default function HomePage({ series, releases, extras, continueReading, onClearContinueReading }) {
  const visibleReleases = useMemo(() => releases.map((item, index) => ({ item, index })).filter(({ item }) => isVisibleRelease(item)).sort((a, b) => sortReleasesByNewest(a.item, b.item, a.index, b.index)).map(({ item }) => item), [releases]);
  const seriesBySlug = useMemo(() => new Map(series.map((item) => [item.slug, item])), [series]);

  const featuredSeries = useMemo(() => series.slice(0, 6), [series]);
  const inDevelopmentSeries = useMemo(() => series.filter((item) => ['in development', 'in-development', 'announced'].includes((item.status || '').toLowerCase())), [series]);
  const latestReleases = useMemo(() => visibleReleases.slice(0, 6), [visibleReleases]);
  const homepageExtras = useMemo(() => validateExtraList(extras).slice(0, 6), [extras]);

  const heroSeries = featuredSeries[0] || null;
  const startReadingHref = latestReleases[0]?.id ? `/read/${latestReleases[0].id}` : heroSeries?.slug ? `/series/${heroSeries.slug}` : '/series';

  return (
    <main className="page page-home editorial-home">
      <section className="home-hero" aria-label="Star Splitter Visions overview">
        {heroSeries?.heroImage ? <img className="home-hero-image" src={heroSeries.heroImage} alt={`${heroSeries.title} featured art`} /> : <div className="home-hero-gradient" aria-hidden="true" />}
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="eyebrow">Star Splitter Visions</p>
          <h1>Stories, worlds, and new comic releases—built to be read in order.</h1>
          <p>Start with the newest issue, explore flagship series, and follow what is in development.</p>
          <div className="home-hero-actions">
            <a className="primary-button" href={startReadingHref}>Start Reading</a>
            <a className="secondary-button" href="/series">Browse Series</a>
          </div>
        </div>
      </section>

      {continueReading ? <ContinueReadingModule item={continueReading} onClear={onClearContinueReading} /> : null}

      <PageSection title="Featured Series" subtitle="Editorial picks from the Star Splitter slate.">
        {featuredSeries.length === 0 ? <div className="empty-rail">No series available yet.</div> : <ul className="home-grid">{featuredSeries.map((item) => <MediaCard key={item.slug} className="series-card" href={item.slug ? `/series/${item.slug}` : undefined} image={item.thumbnailImage || item.heroImage || item.image} alt={`${item.title} series art`} title={item.title} subtitle={item.shortDescription || item.tagline} description={item.status} badge="View Series" fallbackText={item.logoText || item.title} />)}</ul>}
      </PageSection>

      <PageSection title="Latest Releases" subtitle="Most recent published releases across all series.">
        {latestReleases.length === 0 ? <div className="empty-rail">No releases yet. Check back soon.</div> : <ul className="home-grid">{latestReleases.map((release) => <ReleaseCard key={release.id} release={release} seriesTitle={seriesBySlug.get(release.seriesSlug)?.title || release.seriesSlug} href={`/read/${release.id}`} />)}</ul>}
      </PageSection>

      <PageSection title="In Development" subtitle="Upcoming series currently being built.">
        {inDevelopmentSeries.length === 0 ? <div className="empty-rail">No in-development series right now.</div> : <ul className="home-grid">{inDevelopmentSeries.map((item) => <MediaCard key={item.slug} className="series-card" href={item.slug ? `/series/${item.slug}` : undefined} image={item.thumbnailImage || item.heroImage || item.image} alt={`${item.title} concept art`} title={item.title} description={item.shortDescription || item.tagline} badge="View Series" fallbackText={item.logoText || item.title} />)}</ul>}
      </PageSection>

      <PageSection title="Extras" subtitle="Behind-the-scenes material, references, and bonus content.">
        {homepageExtras.length === 0 ? <div className="empty-rail">No extras yet. Check back soon.</div> : <ul className="home-grid">{homepageExtras.map((item, idx) => <MediaCard key={item.id || `${item.seriesSlug || 'extra'}-${idx}`} href={item.url || '/extras'} image={item.image} title={item.title} subtitle={seriesBySlug.get(item.seriesSlug)?.title || item.seriesSlug} description={item.type || 'Extra'} badge="Behind the Scenes" fallbackText={item.title} />)}</ul>}
      </PageSection>

      <section className="follow-cta" aria-label="Follow Star Splitter Visions">
        <h2>Get updates on new releases and series.</h2>
        <p>Follow Star Splitter Visions for release drops, extras, and in-development updates.</p>
        <div className="follow-cta-actions">
          <input type="email" placeholder="Email address" aria-label="Email address" disabled />
          <button type="button" className="primary-button">Follow Star Splitter Visions</button>
        </div>
      </section>
    </main>
  );
}
