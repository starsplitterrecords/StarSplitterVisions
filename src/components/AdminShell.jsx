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


const PUBLISHING_STEPS = [
  {
    title: 'Step 1 — Add image files in /public/images',
    body: 'Add new page and cover images directly in the repository under the public image folder before updating JSON.',
    details: [
      'Repo path example: public/images/{seriesSlug}/{releaseSlug}/page-001.jpg',
      'JSON path example: /images/{seriesSlug}/{releaseSlug}/page-001.jpg',
      'Do not use /public/images/... inside JSON fields.',
    ],
  },
  {
    title: 'Step 2 — Generate JSON snippets in this admin helper',
    body: 'Use the generators below to produce valid JSON snippets for content updates. Generation does not save anything.',
    details: [
      'Series generator output is for series.json',
      'Release generator output is for releases.json',
      'Page generator output is for pages.json',
    ],
  },
  {
    title: 'Step 3 — Paste JSON into the correct content file',
    body: 'Copy generated output and paste it into the matching file in public/content while keeping JSON syntax valid.',
    details: [
      'Series JSON → public/content/series.json',
      'Release JSON → public/content/releases.json',
      'Page JSON → public/content/pages.json',
      'Extras and soundtrack data currently live in series.json if used.',
    ],
  },
  {
    title: 'Step 4 — Commit changes on a branch',
    body: 'After image files and JSON files are updated, commit the changes on a branch created from the latest main branch.',
    details: [],
  },
  {
    title: 'Step 5 — Open a pull request',
    body: 'Open a pull request so content changes can be reviewed before production.',
    details: [],
  },
  {
    title: 'Step 6 — Verify the Vercel preview',
    body: 'Before merge, confirm the preview behaves correctly across key routes and reading flows.',
    details: [
      'Homepage loads',
      'Series page loads',
      'Release page loads',
      'Read button works',
      'Reader opens the correct release',
      'Page images appear',
      'Pages are ordered correctly',
      'Previous / Next controls work',
      'Mobile layout is usable',
      'No broken images appear',
      'No undefined/null text appears',
    ],
  },
  {
    title: 'Step 7 — Merge after verification',
    body: 'After preview checks pass, merge the PR. If Vercel deploys from main, production should update from the merged branch.',
    details: [],
  },
];

function AdminPublishingChecklist() {
  return (
    <section className="admin-checklist-card" aria-labelledby="admin-publishing-checklist-title">
      <h2 id="admin-publishing-checklist-title">Publishing Checklist</h2>
      <p className="admin-helper-note">Use the generators to create valid JSON, then copy and paste the output into the matching JSON file in the repo.</p>
      <p className="admin-helper-tip">This checklist is manual. The admin helper does not upload files, write JSON, open PRs, or deploy changes.</p>

      <ol className="admin-checklist-list">
        {PUBLISHING_STEPS.map((step) => (
          <li key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            {step.details.length > 0 ? (
              <ul>
                {step.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

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

const BACKGROUND_TONE_OPTIONS = ['dark', 'deep', 'ocean', 'cosmic', 'bureaucratic', 'sunforge', 'neutral'];
const SERIES_STATUS_OPTIONS = ['ongoing', 'in development', 'complete'];
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function SeriesJsonGenerator() {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    tagline: '',
    shortDescription: '',
    accentColor: '#facc15',
    secondaryColor: '#1e3a8a',
    backgroundTone: 'dark',
    heroImage: '',
    coverImage: '',
    thumbnailImage: '',
    status: 'ongoing',
  });
  const [copied, setCopied] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const updateSlugDependentImages = (slugValue) => {
    const trimmedSlug = slugValue.trim();
    const imageBase = `/images/${trimmedSlug}`;
    setForm((current) => ({
      ...current,
      heroImage: current.heroImage.trim() ? current.heroImage : `${imageBase}/hero.jpg`,
      coverImage: current.coverImage.trim() ? current.coverImage : `${imageBase}/cover.jpg`,
      thumbnailImage: current.thumbnailImage.trim() ? current.thumbnailImage : `${imageBase}/thumb.jpg`,
    }));
  };

  const onTitleChange = (value) => {
    if (!slugEdited) {
      const nextSlug = slugify(value);
      setForm((current) => ({ ...current, title: value, slug: nextSlug }));
      if (nextSlug) updateSlugDependentImages(nextSlug);
      return;
    }

    setField('title', value);
  };

  const onSlugChange = (value) => {
    const normalizedSlug = slugify(value);
    setSlugEdited(true);
    setForm((current) => ({ ...current, slug: normalizedSlug }));
    if (normalizedSlug) updateSlugDependentImages(normalizedSlug);
  };

  const warnings = useMemo(() => {
    const items = [];
    if (!form.title.trim()) items.push('title is missing.');
    if (!form.slug.trim()) items.push('slug is missing.');
    if (form.accentColor.trim() && !HEX_COLOR_PATTERN.test(form.accentColor.trim())) items.push('accentColor should be a hex color like #facc15.');
    if (form.secondaryColor.trim() && !HEX_COLOR_PATTERN.test(form.secondaryColor.trim())) items.push('secondaryColor should be a hex color like #1e3a8a.');

    ['heroImage', 'coverImage', 'thumbnailImage'].forEach((field) => {
      const value = form[field].trim();
      if (!value) return;
      if (value.startsWith('/public/images/')) items.push(`${field} should start with /images/, not /public/images/.`);
      else if (!value.startsWith('/images/')) items.push(`${field} should start with /images/.`);
    });

    return items;
  }, [form]);

  const seriesJson = useMemo(() => {
    if (!form.title.trim() || !form.slug.trim()) return '';

    const output = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      logoText: form.title.trim().toUpperCase(),
      tagline: form.tagline.trim(),
      shortDescription: form.shortDescription.trim(),
      accentColor: form.accentColor.trim(),
      secondaryColor: form.secondaryColor.trim(),
      backgroundTone: form.backgroundTone.trim() || 'dark',
      heroImage: form.heroImage.trim(),
      coverImage: form.coverImage.trim(),
      thumbnailImage: form.thumbnailImage.trim(),
      status: form.status.trim() || 'ongoing',
    };

    return JSON.stringify(output, null, 2);
  }, [form]);

  const copyJson = async () => {
    if (!seriesJson || !navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(seriesJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="admin-helper-card" aria-labelledby="series-json-generator-title">
      <h2 id="series-json-generator-title">Series JSON Generator</h2>
      <p className="admin-helper-note">This only generates JSON. It does not save or publish changes. Copy this JSON and paste it into series.json manually.</p>
      <p className="admin-helper-tip">Slug should be lowercase, hyphen-separated, and stable after publishing.</p>
      <p className="admin-helper-tip">Use hex colors like #facc15. Accent color is used for highlights, buttons, borders, and chips.</p>
      <p className="admin-helper-tip">Use public web paths beginning with /images/, not /public/images/. Example: /images/vikings-2026/hero.jpg</p>

      <div className="admin-form-grid">
        <label>
          <span>title</span>
          <input type="text" value={form.title} onChange={(event) => onTitleChange(event.target.value)} />
        </label>
        <label>
          <span>slug</span>
          <input type="text" value={form.slug} onChange={(event) => onSlugChange(event.target.value)} />
        </label>
        <label className="admin-field-full">
          <span>tagline</span>
          <input type="text" value={form.tagline} onChange={(event) => setField('tagline', event.target.value)} />
        </label>
        <label className="admin-field-full">
          <span>shortDescription</span>
          <textarea value={form.shortDescription} onChange={(event) => setField('shortDescription', event.target.value)} rows={4} />
        </label>
        <label>
          <span>accentColor</span>
          <input type="text" value={form.accentColor} onChange={(event) => setField('accentColor', event.target.value)} />
        </label>
        <label>
          <span>secondaryColor</span>
          <input type="text" value={form.secondaryColor} onChange={(event) => setField('secondaryColor', event.target.value)} />
        </label>
        <label>
          <span>backgroundTone</span>
          <select value={form.backgroundTone} onChange={(event) => setField('backgroundTone', event.target.value)}>
            {BACKGROUND_TONE_OPTIONS.map((tone) => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </label>
        <label>
          <span>status</span>
          <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
            {SERIES_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          <span>heroImage</span>
          <input type="text" value={form.heroImage} onChange={(event) => setField('heroImage', event.target.value)} />
        </label>
        <label>
          <span>coverImage</span>
          <input type="text" value={form.coverImage} onChange={(event) => setField('coverImage', event.target.value)} />
        </label>
        <label>
          <span>thumbnailImage</span>
          <input type="text" value={form.thumbnailImage} onChange={(event) => setField('thumbnailImage', event.target.value)} />
        </label>
      </div>

      {warnings.length > 0 ? <ul className="admin-warnings">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}

      <label className="admin-field-full">
        <span>Generated JSON</span>
        <textarea className="admin-json-output" value={seriesJson} readOnly rows={16} placeholder="Fill title and slug to generate JSON." />
      </label>
      <button type="button" className="primary-button" onClick={copyJson} disabled={!seriesJson}>Copy JSON{copied ? ' ✓' : ''}</button>
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

      <AdminPublishingChecklist />

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

      <SeriesJsonGenerator />
      <ReleaseJsonGenerator />
      <PageJsonGenerator />

      <p>
        <a href="/">Back to site</a>
      </p>
    </main>
  );
}
