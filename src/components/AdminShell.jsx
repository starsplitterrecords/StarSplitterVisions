import { useMemo, useState } from 'react';

const ADMIN_SECTIONS = [
  {
    title: 'Series',
    description:
      'Manage series identity, descriptions, artwork, colors, and publishing metadata.',
    status: 'Shell only',
    action: 'Edit series — coming soon',
  },
  {
    title: 'Releases',
    description:
      'Manage release records, issue numbers, descriptions, dates, cover art, hero art, and reader entry points.',
    status: 'Generator available',
    action: 'Use Release JSON Generator below',
  },
  {
    title: 'Pages',
    description:
      'Manage daily page entries, image paths, page numbers, release assignment, and publishing status.',
    status: 'Generator available',
    action: 'Use Page JSON Generator below',
  },
  {
    title: 'Extras',
    description:
      'Manage bonus materials, links, production notes, covers, editorial notes, and related collateral.',
    status: 'Not connected',
    action: 'Organize extras — coming soon',
  },
  {
    title: 'Soundtracks',
    description:
      'Manage soundtrack entries, track listings, playlist links, mood notes, and audio companion material.',
    status: 'Not connected',
    action: 'Manage soundtracks — coming soon',
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const padPageNumber = (value) => String(value).padStart(3, '0');

function AdminSectionCard({ title, description, status, action }) {
  return (
    <section className="admin-card" aria-labelledby={`admin-${title.toLowerCase()}-title`}>
      <div className="admin-card-header">
        <h2 id={`admin-${title.toLowerCase()}-title`}>{title}</h2>
        <span className="admin-status">{status}</span>
      </div>
      <p>{description}</p>
      <p className="admin-action-note">{action}</p>
    </section>
  );
}

function ReleaseJsonGenerator() {
  const [form, setForm] = useState({
    seriesSlug: '',
    slug: '',
    title: '',
    issueNumber: '',
    description: '',
    releaseDate: '',
    coverImage: '',
    heroImage: '',
    ctaLabel: 'Read',
  });
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(() => {
    const items = [];
    if (!form.seriesSlug.trim()) items.push('seriesSlug is missing.');
    if (!form.slug.trim()) items.push('slug / id is missing.');
    if (!form.title.trim()) items.push('title is missing.');
    if (!form.releaseDate.trim()) items.push('releaseDate is missing.');
    if (form.coverImage && !form.coverImage.startsWith('/images/')) items.push('coverImage should start with /images/.');
    if (form.heroImage && !form.heroImage.startsWith('/images/')) items.push('heroImage should start with /images/.');
    return items;
  }, [form]);

  const releaseJson = useMemo(() => {
    if (!form.seriesSlug.trim() || !form.slug.trim() || !form.title.trim() || !form.releaseDate.trim()) {
      return '';
    }

    const parsedIssueNumber = Number(form.issueNumber);
    const output = {
      id: form.slug.trim(),
      seriesSlug: form.seriesSlug.trim(),
      title: form.title.trim(),
      issueNumber: Number.isFinite(parsedIssueNumber) && form.issueNumber.trim() ? parsedIssueNumber : form.issueNumber.trim(),
      description: form.description.trim(),
      releaseDate: form.releaseDate,
      coverImage: form.coverImage.trim(),
      ctaLabel: form.ctaLabel.trim() || 'Read',
    };

    if (form.heroImage.trim()) output.heroImage = form.heroImage.trim();

    return JSON.stringify(output, null, 2);
  }, [form]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const onTitleBlur = () => {
    if (!form.slug.trim() && form.title.trim()) {
      setField('slug', slugify(form.title));
    }
  };

  const copyJson = async () => {
    if (!releaseJson || !navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(releaseJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="admin-helper-card" aria-labelledby="release-json-generator-title">
      <h2 id="release-json-generator-title">Release JSON Generator</h2>
      <p className="admin-helper-note">This only generates JSON. It does not save or publish changes. Copy this JSON and paste it into releases.json manually.</p>
      <p className="admin-helper-tip">Use public web paths beginning with /images/, not /public/images/.</p>

      <div className="admin-form-grid">
        {['seriesSlug', 'slug', 'title', 'issueNumber', 'releaseDate', 'coverImage', 'heroImage', 'ctaLabel'].map((field) => (
          <label key={field}>
            <span>{field === 'slug' ? 'slug / id' : field}</span>
            <input
              type={field === 'releaseDate' ? 'date' : 'text'}
              value={form[field]}
              onChange={(event) => setField(field, event.target.value)}
              onBlur={field === 'title' ? onTitleBlur : undefined}
            />
          </label>
        ))}
        <label className="admin-field-full">
          <span>description</span>
          <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} rows={3} />
        </label>
      </div>

      {warnings.length > 0 ? <ul className="admin-warnings">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}

      <label className="admin-field-full">
        <span>Generated JSON</span>
        <textarea className="admin-json-output" value={releaseJson} readOnly rows={14} placeholder="Fill required fields to generate JSON." />
      </label>
      <button type="button" className="primary-button" onClick={copyJson} disabled={!releaseJson}>Copy JSON{copied ? ' ✓' : ''}</button>
    </section>
  );
}

function PageJsonGenerator() {
  const [form, setForm] = useState({
    seriesSlug: '',
    releaseSlug: '',
    pageNumber: '1',
    title: '',
    caption: '',
    releaseDate: '',
    image: '',
  });
  const [imageOverride, setImageOverride] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const pageNumber = Number(form.pageNumber);
  const safePage = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const generatedImage = `/images/${form.seriesSlug.trim()}/${form.releaseSlug.trim()}/page-${padPageNumber(safePage)}.jpg`;
  const effectiveImage = imageOverride ? form.image : generatedImage;

  const warnings = useMemo(() => {
    const items = [];
    if (!form.seriesSlug.trim()) items.push('seriesSlug is missing.');
    if (!form.releaseSlug.trim()) items.push('releaseSlug is missing.');
    if (!form.pageNumber.trim() || !Number.isFinite(Number(form.pageNumber))) items.push('pageNumber must be numeric.');
    if (effectiveImage && !effectiveImage.startsWith('/images/')) items.push('image should start with /images/.');
    if (effectiveImage.startsWith('/public/images/')) items.push('Use /images/... paths, not /public/images/....');
    return items;
  }, [effectiveImage, form.pageNumber, form.releaseSlug, form.seriesSlug]);

  const pageJson = useMemo(() => {
    if (!form.seriesSlug.trim() || !form.releaseSlug.trim() || !form.pageNumber.trim() || !Number.isFinite(Number(form.pageNumber)) || !form.releaseDate.trim()) {
      return '';
    }

    const output = {
      seriesSlug: form.seriesSlug.trim(),
      releaseSlug: form.releaseSlug.trim(),
      pageNumber: Number(form.pageNumber),
      releaseDate: form.releaseDate,
      title: form.title.trim() || `Page ${Number(form.pageNumber)}`,
      caption: form.caption.trim(),
      image: effectiveImage,
    };

    return JSON.stringify(output, null, 2);
  }, [effectiveImage, form]);

  const copyJson = async () => {
    if (!pageJson || !navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(pageJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="admin-helper-card" aria-labelledby="page-json-generator-title">
      <h2 id="page-json-generator-title">Page JSON Generator</h2>
      <p className="admin-helper-note">This only generates JSON. It does not save or publish changes. Copy this JSON and paste it into pages.json manually.</p>
      <p className="admin-helper-tip">Image path pattern: /images/{'{seriesSlug}'}/{'{releaseSlug}'}/page-001.jpg (not /public/images/...)</p>

      <div className="admin-form-grid">
        {['seriesSlug', 'releaseSlug', 'pageNumber', 'title', 'releaseDate'].map((field) => (
          <label key={field}>
            <span>{field}</span>
            <input type={field === 'releaseDate' ? 'date' : field === 'pageNumber' ? 'number' : 'text'} value={form[field]} onChange={(event) => setField(field, event.target.value)} min={field === 'pageNumber' ? 1 : undefined} />
          </label>
        ))}
        <label className="admin-field-full">
          <span>caption</span>
          <textarea value={form.caption} onChange={(event) => setField('caption', event.target.value)} rows={2} />
        </label>
        <label className="admin-field-full">
          <span>image</span>
          <input
            type="text"
            value={imageOverride ? form.image : generatedImage}
            onChange={(event) => {
              setImageOverride(true);
              setField('image', event.target.value);
            }}
          />
          <button type="button" className="text-button" onClick={() => { setImageOverride(false); setField('image', generatedImage); }}>
            Use generated path
          </button>
        </label>
      </div>

      {warnings.length > 0 ? <ul className="admin-warnings">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}

      <label className="admin-field-full">
        <span>Generated JSON</span>
        <textarea className="admin-json-output" value={pageJson} readOnly rows={14} placeholder="Fill required fields to generate JSON." />
      </label>
      <button type="button" className="primary-button" onClick={copyJson} disabled={!pageJson}>Copy JSON{copied ? ' ✓' : ''}</button>
    </section>
  );
}

export default function AdminShell() {
  return (
    <main className="page page-admin">
      <header className="admin-header">
        <p className="eyebrow">Admin</p>
        <h1>Static Publishing Helper</h1>
        <p>
          A local helper workspace for preparing Star Splitter Visions content updates.
          This page does not save or publish changes yet.
        </p>
      </header>

      <section className="admin-banner" role="status" aria-live="polite">
        <p className="admin-banner-label">Local helper only</p>
        <p>
          This is a static/local helper only. Authentication is not implemented,
          saving is not implemented, no backend is connected, and it does not write
          files, connect to GitHub, or publish content.
        </p>
      </section>

      <ul className="admin-limitations" aria-label="Current admin limitations">
        <li>Authentication not implemented</li>
        <li>Saving disabled</li>
        <li>No backend connected</li>
        <li>No file or GitHub writes</li>
      </ul>

      <section className="admin-sections" aria-label="Admin content areas">
        {ADMIN_SECTIONS.map((section) => (
          <AdminSectionCard key={section.title} {...section} />
        ))}
      </section>

      <ReleaseJsonGenerator />
      <PageJsonGenerator />

      <p>
        <a href="/">Back to site</a>
      </p>
    </main>
  );
}
