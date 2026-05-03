import MediaCard from '../components/MediaCard';

const publisherDescriptions = {
  short: 'Star Splitter Visions publishes cinematic, character-driven comic worlds across comedy, sci-fi, and frontier adventure. We build serialized stories designed for readers, collaborators, and adaptation partners.',
  medium: 'Star Splitter Visions is an independent comics publisher focused on high-concept, emotionally grounded worlds with strong visual identity. Our slate spans workplace comedy, speculative fiction, and frontier drama, with each series developed for serialized release, cross-format collaboration, and long-term worldbuilding.',
  long: [
    'Star Splitter Visions is an indie publisher creating cinematic comics designed to be discoverable, bingeable, and production-ready for media collaboration. We combine editorial structure with franchise-minded world design so every release can stand on its own while strengthening a larger library.',
    'Our series portfolio includes bold genre work—from satirical workplace stories to science-fiction ensembles and high-pressure frontier narratives. Each property is built with clear positioning, strong tonal identity, and reusable visual systems to support press coverage, audience growth, and licensing conversations.',
    'The press kit collects approved descriptions, brand marks, and artwork references in one place so journalists and partners can publish accurate information quickly. For interviews, screeners, and collaboration requests, please use the contact information below.'
  ]
};

const brandAssets = [
  { key: 'wordmark', label: 'Logo Wordmark', preview: '/images/press/star-splitter-visions-wordmark-preview.jpg', download: '/images/press/star-splitter-visions-wordmark.svg' },
  { key: 'square', label: 'Square Mark', preview: '/images/press/star-splitter-visions-square-mark-preview.jpg', download: '/images/press/star-splitter-visions-square-mark.png' }
];

const keyArt = [
  { title: 'Vikings 2026 Cover', image: '/images/press/vikings-2026-cover.jpg', download: '/images/press/vikings-2026-cover.jpg' },
  { title: 'Stardust Station Poster', image: '/images/press/stardust-station-poster.jpg', download: '/images/press/stardust-station-poster.jpg' },
  { title: 'Azure Reach Facility Sheet', image: '/images/press/azure-reach-facility-sheet.jpg', download: '/images/press/azure-reach-facility-sheet.jpg' }
];

export default function PressPage({ series }) {
  const featuredSeries = series.slice(0, 4);

  return <main className="page page-press"><header className="press-header"><p className="eyebrow">Media Resources</p><h1>Press Kit</h1><p>Official information, assets, and media resources for Star Splitter Visions</p></header><section className="press-section" aria-labelledby="publisher-description-heading"><h2 id="publisher-description-heading">Publisher Description</h2><div className="press-description-grid"><article><h3>Short Description (1–2 sentences)</h3><p>{publisherDescriptions.short}</p></article><article><h3>Medium Description (1 paragraph)</h3><p>{publisherDescriptions.medium}</p></article><article><h3>Long Description (2–3 paragraphs)</h3>{publisherDescriptions.long.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></div></section><section className="press-section" aria-labelledby="brand-assets-heading"><h2 id="brand-assets-heading">Brand Assets</h2><div className="press-asset-grid">{brandAssets.map((asset) => <article key={asset.key} className="press-asset-card"><img src={asset.preview} alt={`${asset.label} preview`} className="press-asset-preview" /><h3>{asset.label}</h3><p><a href={asset.download} download>Download {asset.label}</a></p></article>)}</div></section><section className="press-section" aria-labelledby="series-highlights-heading"><h2 id="series-highlights-heading">Series Highlights</h2><ul className="release-grid release-grid-compact">{featuredSeries.map((item) => <MediaCard key={item.slug} className="series-card" href={item.slug ? `/series/${item.slug}` : undefined} image={item.thumbnailImage || item.heroImage || item.coverImage} alt={`${item.title} featured series art`} eyebrow="Featured Series" title={item.title} description={item.tagline || item.shortDescription} fallbackText={item.title} />)}</ul></section><section className="press-section" aria-labelledby="key-art-heading"><h2 id="key-art-heading">Key Art</h2><div className="press-key-art-grid">{keyArt.map((item) => <figure key={item.title} className="press-key-art-item"><a href={item.image} target="_blank" rel="noreferrer"><img src={item.image} alt={`${item.title} key art`} /></a><figcaption><span>{item.title}</span><a href={item.download} download>Download image</a></figcaption></figure>)}</div></section><section className="press-section" aria-labelledby="press-contact-heading"><h2 id="press-contact-heading">Contact</h2><p>For press inquiries, contact: <a href="mailto:press@starsplittervisions.com">press@starsplittervisions.com</a></p><p>If you are unsure where to route your request, use the <a href="/contact">contact page</a> and include “Press Inquiry” in your subject line.</p></section></main>;
}
