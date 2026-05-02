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
    status: 'Package generator',
    action: 'Organize extras',
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
    title: 'Step 3 — Export a Codex-ready publishing handoff',
    body: 'Copy generated output into a Codex prompt so Codex can update the matching files in public/content while preserving valid JSON syntax.',
    details: [
      'Series JSON → public/content/series.json',
      'Release JSON → public/content/releases.json',
      'Page JSON → public/content/pages.json',
      'Extras and soundtrack data currently live in series.json if used.',
    ],
  },
  {
    title: 'Step 4 — Codex applies the package on a branch',
    body: 'Codex adds image files, updates content JSON files, and commits the requested changes on a branch from the latest main branch.',
    details: [],
  },
  {
    title: 'Step 5 — Codex opens a pull request',
    body: 'Codex opens a pull request so content changes can be reviewed before production.',
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
      <h2 id="admin-publishing-checklist-title">Admin Publishing Checklist</h2>
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
      <button type="button" className="primary-button" onClick={copyJson} disabled={!releaseJson}>Copy Codex JSON{copied ? ' ✓' : ''}</button>
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
      <button type="button" className="primary-button" onClick={copyJson} disabled={!seriesJson}>Copy Codex JSON{copied ? ' ✓' : ''}</button>
    </section>
  );
}


const IMAGE_TYPE_CONFIG = {
  seriesHero: { label: 'Series hero image', filenameBase: 'hero', requiresRelease: false, requiresPage: false, jsonField: 'heroImage' },
  seriesCover: { label: 'Series cover image', filenameBase: 'cover', requiresRelease: false, requiresPage: false, jsonField: 'coverImage' },
  seriesThumbnail: { label: 'Series thumbnail image', filenameBase: 'thumb', requiresRelease: false, requiresPage: false, jsonField: 'thumbnailImage' },
  releaseHero: { label: 'Release hero image', filenameBase: 'hero', requiresRelease: true, requiresPage: false, jsonField: 'heroImage' },
  releaseCover: { label: 'Release cover image', filenameBase: 'cover', requiresRelease: true, requiresPage: false, jsonField: 'coverImage' },
  releaseCard: { label: 'Release card image', filenameBase: 'card', requiresRelease: true, requiresPage: false, jsonField: 'image' },
  dailyPage: { label: 'Daily page image', filenameBase: 'page', requiresRelease: true, requiresPage: true, jsonField: 'image' },
};
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const normalizeImageFileName = (originalFilename, imageType, pageNumber) => {
  const config = IMAGE_TYPE_CONFIG[imageType] ?? IMAGE_TYPE_CONFIG.seriesHero;
  const trimmed = originalFilename.trim().toLowerCase();
  const match = trimmed.match(/\.([a-z0-9]+)$/);
  const extension = match && SUPPORTED_EXTENSIONS.includes(match[1]) ? match[1] : 'jpg';

  if (config.requiresPage) {
    const parsedPage = Number(pageNumber);
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    return `page-${padPageNumber(safePage)}.jpg`;
  }

  return `${config.filenameBase}.${extension}`;
};

function ImageFilingHelper() {
  const [form, setForm] = useState({ imageType: 'seriesHero', seriesSlug: '', releaseSlug: '', pageNumber: '', originalFilename: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const config = IMAGE_TYPE_CONFIG[form.imageType] ?? IMAGE_TYPE_CONFIG.seriesHero;
  const normalizedFilename = normalizeImageFileName(form.originalFilename, form.imageType, form.pageNumber);
  const normalizedSeriesSlug = slugify(form.seriesSlug);
  const normalizedReleaseSlug = slugify(form.releaseSlug);
  const pathSegments = [normalizedSeriesSlug];
  if (config.requiresRelease) pathSegments.push(normalizedReleaseSlug);
  pathSegments.push(normalizedFilename);
  const jsonPath = `/images/${pathSegments.filter(Boolean).join('/')}`;
  const repoPath = `public${jsonPath}`;

  const warnings = useMemo(() => {
    const items = [];
    if (!normalizedSeriesSlug) items.push('seriesSlug is missing.');
    if (config.requiresRelease && !normalizedReleaseSlug) items.push('releaseSlug is missing for this image type.');
    if (config.requiresPage && !form.pageNumber.trim()) items.push('pageNumber is missing for daily pages.');
    if (config.requiresPage && form.pageNumber.trim() && !/^\d+$/.test(form.pageNumber.trim())) items.push('pageNumber must be numeric.');
    const extMatch = form.originalFilename.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
    if (form.originalFilename.trim() && extMatch && !SUPPORTED_EXTENSIONS.includes(extMatch[1])) items.push('original filename has unsupported extension. Use .jpg, .jpeg, .png, or .webp.');
    if (jsonPath.includes('/public/images')) items.push('generated JSON path should not include /public/images.');
    return items;
  }, [config.requiresPage, config.requiresRelease, form.originalFilename, form.pageNumber, jsonPath, normalizedReleaseSlug, normalizedSeriesSlug]);

  const jsonSnippet = JSON.stringify({ [config.jsonField]: jsonPath }, null, 2);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const copyText = async (key, value) => {
    if (!value || !navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      setTimeout(() => setCopiedField(''), 1200);
    } catch {
      setCopiedField('');
    }
  };

  return (
    <section className="admin-helper-card" aria-labelledby="image-filing-helper-title">
      <h2 id="image-filing-helper-title">Image Filing Helper</h2>
      <p className="admin-helper-note">This helper prepares correct image names and paths. It does not upload to GitHub or save files yet.</p>
      <p className="admin-helper-tip">This helper prepares the correct filename and paths for images. It does not save files. After generating the path, manually place the image in the repo at the shown repo path, then use the JSON path in the matching content file.</p>

      <div className="admin-form-grid">
        <label>
          <span>imageType</span>
          <select value={form.imageType} onChange={(event) => setField('imageType', event.target.value)}>
            {Object.entries(IMAGE_TYPE_CONFIG).map(([value, option]) => <option key={value} value={value}>{value} — {option.label}</option>)}
          </select>
        </label>
        <label><span>seriesSlug</span><input type="text" value={form.seriesSlug} onChange={(event) => setField('seriesSlug', event.target.value)} /></label>
        <label><span>releaseSlug</span><input type="text" value={form.releaseSlug} onChange={(event) => setField('releaseSlug', event.target.value)} disabled={!config.requiresRelease} /></label>
        <label><span>pageNumber</span><input type="text" value={form.pageNumber} onChange={(event) => setField('pageNumber', event.target.value)} disabled={!config.requiresPage} /></label>
        <label><span>originalFilename</span><input type="text" value={form.originalFilename} onChange={(event) => setField('originalFilename', event.target.value)} placeholder="My Cover Image.PNG" /></label>
        <label className="admin-field-full"><span>Select local image (preview only)</span><input type="file" accept="image/*" onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          setSelectedFile(file);
          setField('originalFilename', file?.name ?? form.originalFilename);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(file ? URL.createObjectURL(file) : '');
        }} /></label>
      </div>

      {warnings.length > 0 ? <ul className="admin-warnings">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}

      <div className="admin-output-grid">
        <p><strong>Normalized filename:</strong> {normalizedFilename}</p>
        <p><strong>Repo path:</strong> {repoPath}</p>
        <p><strong>JSON path:</strong> {jsonPath}</p>
      </div>

      <div className="admin-copy-row">
        <button type="button" className="text-button" onClick={() => copyText('name', normalizedFilename)}>Copy normalized filename{copiedField === 'name' ? ' ✓' : ''}</button>
        <button type="button" className="text-button" onClick={() => copyText('repo', repoPath)}>Copy repo path{copiedField === 'repo' ? ' ✓' : ''}</button>
        <button type="button" className="text-button" onClick={() => copyText('json', jsonPath)}>Copy Codex JSON path{copiedField === 'json' ? ' ✓' : ''}</button>
        <button type="button" className="text-button" onClick={() => copyText('snippet', jsonSnippet)}>Copy Codex JSON snippet{copiedField === 'snippet' ? ' ✓' : ''}</button>
      </div>

      <label className="admin-field-full"><span>JSON snippet preview</span><textarea className="admin-json-output" readOnly rows={4} value={jsonSnippet} /></label>

      {previewUrl ? <div className="admin-image-preview"><img src={previewUrl} alt="Selected preview" /><p>Original filename: {selectedFile?.name ?? '—'}</p><p>Normalized filename: {normalizedFilename}</p><p>Target repo path: {repoPath}</p><p>Target JSON path: {jsonPath}</p></div> : null}
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
      <button type="button" className="primary-button" onClick={copyJson} disabled={!pageJson}>Copy Codex JSON{copied ? ' ✓' : ''}</button>
    </section>
  );
}

const DEFAULT_PAGE_FILENAMES = ['page-001.jpg', 'page-002.jpg', 'page-003.jpg'].join('\n');
const PACKAGE_STATUS_OPTIONS = ['published', 'scheduled', 'draft'];
const RELEASE_STATUS_OPTIONS = ['released', 'published', 'scheduled', 'draft'];

function CodexContentPackageGenerator() {
  const [form, setForm] = useState({
    seriesSlug: '',
    releaseId: '',
    releaseTitle: '',
    issueNumber: '',
    description: '',
    releaseDate: '',
    status: 'published',
    ctaLabel: 'Read',
    coverFilename: 'cover.jpg',
    heroFilename: 'hero.jpg',
    pageFilenames: DEFAULT_PAGE_FILENAMES,
  });
  const [copied, setCopied] = useState(false);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const clean = (value) => value.trim();
  const normalizedSeriesSlug = slugify(form.seriesSlug);
  const normalizedReleaseId = slugify(form.releaseId);
  const isFilenameOnly = (value) => value && !value.includes('/') && !value.includes('\\');
  const toRepoPath = (filename) => `public/images/${normalizedSeriesSlug}/${normalizedReleaseId}/${filename}`;
  const toJsonPath = (filename) => `/images/${normalizedSeriesSlug}/${normalizedReleaseId}/${filename}`;

  const parsedPageFiles = clean(form.pageFilenames).split('\n').map((line) => clean(line)).filter(Boolean);
  const parsePageNumber = (filename, fallback) => {
    const match = filename.match(/(\d+)/);
    if (!match) return { pageNumber: fallback, inferred: false };
    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed) || parsed < 1) return { pageNumber: fallback, inferred: false };
    return { pageNumber: parsed, inferred: true };
  };

  const pageRecords = parsedPageFiles.map((filename, index) => {
    const { pageNumber, inferred } = parsePageNumber(filename, index + 1);
    return { filename, pageNumber, inferred, repoPath: toRepoPath(filename), jsonPath: toJsonPath(filename) };
  }).sort((a, b) => a.pageNumber - b.pageNumber);

  const warnings = useMemo(() => {
    const items = [];
    if (!normalizedSeriesSlug) items.push('seriesSlug is missing.');
    if (!normalizedReleaseId) items.push('releaseId is missing.');
    if (!clean(form.releaseTitle)) items.push('releaseTitle is missing.');
    if (!clean(form.releaseDate)) items.push('releaseDate is missing.');
    if (parsedPageFiles.length === 0) items.push('No page image filenames are listed.');
    if (form.coverFilename && !isFilenameOnly(clean(form.coverFilename))) items.push('coverFilename should be a filename only, not a path.');
    if (form.heroFilename && !isFilenameOnly(clean(form.heroFilename))) items.push('heroFilename should be a filename only, not a path.');
    parsedPageFiles.forEach((filename) => {
      if (!isFilenameOnly(filename)) items.push(`Page filename "${filename}" should be a filename only, not a path.`);
      if (toJsonPath(filename).startsWith('/public/images/')) items.push('JSON paths must not start with /public/images/.');
      if (!parsePageNumber(filename, 1).inferred) items.push(`Could not infer page number from "${filename}" so line order will be used.`);
    });
    if (!PACKAGE_STATUS_OPTIONS.includes(form.status) && RELEASE_STATUS_OPTIONS.includes(form.status)) items.push(`Status "${form.status}" may not match the current visibility convention.`);
    return [...new Set(items)];
  }, [form, normalizedReleaseId, normalizedSeriesSlug, parsedPageFiles]);

  const releaseJsonObject = useMemo(() => {
    if (!normalizedSeriesSlug || !normalizedReleaseId || !clean(form.releaseTitle) || !clean(form.releaseDate)) return null;
    const parsedIssue = Number(form.issueNumber);
    const issueValue = clean(form.issueNumber) && Number.isFinite(parsedIssue) ? parsedIssue : clean(form.issueNumber);
    const output = {
      id: normalizedReleaseId,
      seriesSlug: normalizedSeriesSlug,
      title: clean(form.releaseTitle),
      issueNumber: issueValue,
      description: clean(form.description),
      releaseDate: clean(form.releaseDate),
      status: clean(form.status) || 'published',
      image: pageRecords[0]?.jsonPath ?? '',
      ctaLabel: clean(form.ctaLabel) || 'Read',
    };
    if (clean(form.coverFilename)) output.coverImage = toJsonPath(clean(form.coverFilename));
    if (clean(form.heroFilename)) output.heroImage = toJsonPath(clean(form.heroFilename));
    return output;
  }, [form, normalizedReleaseId, normalizedSeriesSlug, pageRecords]);

  const pageJsonArray = pageRecords.map((page) => ({
    seriesSlug: normalizedSeriesSlug,
    releaseSlug: normalizedReleaseId,
    pageNumber: page.pageNumber,
    releaseDate: clean(form.releaseDate),
    title: `Page ${page.pageNumber}`,
    caption: '',
    image: page.jsonPath,
  }));

  const imageEntries = [
    ...(clean(form.coverFilename) ? [{ filename: clean(form.coverFilename), repoPath: toRepoPath(clean(form.coverFilename)), jsonPath: toJsonPath(clean(form.coverFilename)) }] : []),
    ...(clean(form.heroFilename) ? [{ filename: clean(form.heroFilename), repoPath: toRepoPath(clean(form.heroFilename)), jsonPath: toJsonPath(clean(form.heroFilename)) }] : []),
    ...pageRecords,
  ];

  const packageOutput = useMemo(() => {
    if (!releaseJsonObject || pageJsonArray.length === 0) return '';
    const filesToAdd = imageEntries.map((entry) => `- Source file: \`${entry.filename}\`\n  Target repo path: \`${entry.repoPath}\`\n  JSON path: \`${entry.jsonPath}\``).join('\n\n');
    return `# Codex Content Publishing Package

## Task
Add release \`${normalizedReleaseId}\` for \`${normalizedSeriesSlug}\`.

## Files to add
Place these images:

${filesToAdd}

## Update releases.json
Add this object to \`public/content/releases.json\`:

\`\`\`json
${JSON.stringify(releaseJsonObject, null, 2)}
\`\`\`

## Update pages.json
Add these objects to \`public/content/pages.json\`:

\`\`\`json
${JSON.stringify(pageJsonArray, null, 2)}
\`\`\`

## Instructions
* Start from latest \`main\`.
* Create a new branch and PR.
* Place image files at the exact target repo paths listed above.
* Update \`public/content/releases.json\`.
* Update \`public/content/pages.json\`.
* If a new series section is included, update \`public/content/series.json\`.
* Do not change app code.
* Do not redesign.
* Do not change routes.
* Validate JSON references.
* Do not run \`npm run build\`.
`;
  }, [imageEntries, normalizedReleaseId, normalizedSeriesSlug, pageJsonArray, releaseJsonObject]);

  const resetForm = () => {
    setForm({
      seriesSlug: '', releaseId: '', releaseTitle: '', issueNumber: '', description: '', releaseDate: '', status: 'published', ctaLabel: 'Read', coverFilename: 'cover.jpg', heroFilename: 'hero.jpg', pageFilenames: DEFAULT_PAGE_FILENAMES,
    });
    setCopied(false);
  };

  const copyPackage = async () => {
    if (!packageOutput || !navigator?.clipboard?.writeText) return;
    try { await navigator.clipboard.writeText(packageOutput); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { setCopied(false); }
  };

  return (
    <section className="admin-helper-card" aria-labelledby="codex-package-generator-title">
      <h2 id="codex-package-generator-title">Codex Content Package Generator</h2>
      <p className="admin-helper-note">Use this helper to generate a complete Codex-ready publishing package. The admin page does not publish directly. Copy the package into Codex so Codex can update repo files and open a PR.</p>
      <p className="admin-helper-tip">This does not upload files, save JSON, call GitHub, or deploy the site.</p>
      <p className="admin-helper-tip">Admin prepares the package. Codex edits the repo. Vercel previews. You merge.</p>
      <p className="admin-helper-tip">Selecting files here only captures filenames for the package. It does not upload them.</p>
      <p className="admin-helper-tip">This generates a Codex package only. It does not upload images, save JSON, call GitHub, create PRs, or deploy the site.</p>
      <p className="admin-helper-tip">After copying this package, paste it into Codex along with the image files or after placing the image files where Codex can access them.</p>

      <div className="admin-form-grid">
        <label><span>seriesSlug</span><input type="text" value={form.seriesSlug} onChange={(event) => setField('seriesSlug', event.target.value)} /></label>
        <label><span>releaseId</span><input type="text" value={form.releaseId} onChange={(event) => setField('releaseId', event.target.value)} /></label>
        <label><span>releaseTitle</span><input type="text" value={form.releaseTitle} onChange={(event) => setField('releaseTitle', event.target.value)} /></label>
        <label><span>issueNumber</span><input type="text" value={form.issueNumber} onChange={(event) => setField('issueNumber', event.target.value)} /></label>
        <label><span>releaseDate</span><input type="date" value={form.releaseDate} onChange={(event) => setField('releaseDate', event.target.value)} /></label>
        <label><span>status</span><select value={form.status} onChange={(event) => setField('status', event.target.value)}>{PACKAGE_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        <label><span>ctaLabel</span><input type="text" value={form.ctaLabel} onChange={(event) => setField('ctaLabel', event.target.value)} /></label>
        <label><span>coverFilename</span><input type="text" value={form.coverFilename} onChange={(event) => setField('coverFilename', event.target.value)} /></label>
        <label><span>heroFilename</span><input type="text" value={form.heroFilename} onChange={(event) => setField('heroFilename', event.target.value)} /></label>
        <label className="admin-field-full"><span>description</span><textarea rows={3} value={form.description} onChange={(event) => setField('description', event.target.value)} /></label>
        <label className="admin-field-full"><span>page image filenames (one per line)</span><textarea rows={5} value={form.pageFilenames} onChange={(event) => setField('pageFilenames', event.target.value)} /></label>
      </div>

      {warnings.length > 0 ? <ul className="admin-warnings">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
      <div className="admin-copy-row">
        <button type="button" className="primary-button" disabled={!packageOutput} onClick={copyPackage}>Copy Package{copied ? ' ✓ Copied' : ''}</button>
        <button type="button" className="text-button" onClick={resetForm}>Reset</button>
      </div>
      <label className="admin-field-full">
        <span>Generated Codex Package</span>
        <textarea className="admin-json-output" rows={26} readOnly value={packageOutput} placeholder="Fill required fields and page filenames to generate the package." />
      </label>
    </section>
  );
}


const XTRA_TYPES = [
  'bonus-material','external-link','production-note','cover','cover-variant','editorial-note','behind-the-scenes','promo-asset','reference','creator-commentary','related-media','supplemental-document','other',
];
const XTRA_VISIBILITY = ['public','hidden','draft'];
const XTRA_ASSET_KINDS = ['image','cover','thumbnail','document','audio','video','other'];
const kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const normalizeFileName = (value) => value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '');
const deriveXtraId = (seriesSlug, releaseSlug, xtraSlug) => releaseSlug ? `${seriesSlug}__${releaseSlug}__${xtraSlug}` : `${seriesSlug}__${xtraSlug}`;
const deriveXtraBaseRepoPath = (seriesSlug, releaseSlug, xtraSlug) => releaseSlug ? `public/images/${seriesSlug}/${releaseSlug}/xtras/${xtraSlug}` : `public/images/${seriesSlug}/xtras/${xtraSlug}`;
const deriveXtraBasePublicPath = (seriesSlug, releaseSlug, xtraSlug) => releaseSlug ? `/images/${seriesSlug}/${releaseSlug}/xtras/${xtraSlug}` : `/images/${seriesSlug}/xtras/${xtraSlug}`;

function XtrasPackageGenerator() {
  const [form, setForm] = useState({ seriesSlug: '', releaseSlug: '', type: 'bonus-material', title: '', slug: '', description: '', displayTitle: '', shortLabel: '', sortOrder: '', visibility: 'draft', featured: false, tags: '', body: '', editorialNote: '', productionNote: '', creatorCommentary: '' });
  const [assets, setAssets] = useState([{ sourceFileName: '', targetFileName: '', kind: 'image', altText: '', caption: '', credit: '' }]);
  const [links, setLinks] = useState([{ url: '', label: '', provider: '', embedUrl: '' }]);
  const [copied, setCopied] = useState(false);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const seriesSlug = slugify(form.seriesSlug);
  const releaseSlug = slugify(form.releaseSlug);
  const xtraSlug = slugify(form.slug || form.title);
  const normalizedAssets = assets.filter((item) => item.sourceFileName.trim() || item.targetFileName.trim()).map((item) => {
    const targetFileName = normalizeFileName(item.targetFileName || item.sourceFileName);
    const repoPath = `${deriveXtraBaseRepoPath(seriesSlug, releaseSlug || undefined, xtraSlug)}/${targetFileName}`;
    const publicPath = `${deriveXtraBasePublicPath(seriesSlug, releaseSlug || undefined, xtraSlug)}/${targetFileName}`;
    return { sourceFileName: item.sourceFileName.trim(), targetFileName, kind: item.kind, repoPath, publicPath, altText: item.altText.trim() || undefined, caption: item.caption.trim() || undefined, credit: item.credit.trim() || undefined };
  });
  const normalizedLinks = links.filter((item) => item.url.trim()).map((item) => ({ url: item.url.trim(), label: item.label.trim() || undefined, provider: item.provider.trim() || undefined, embedUrl: item.embedUrl.trim() || undefined }));
  const entry = { id: deriveXtraId(seriesSlug, releaseSlug || undefined, xtraSlug), seriesSlug, releaseSlug: releaseSlug || undefined, type: form.type, title: form.title.trim(), slug: xtraSlug, displayTitle: form.displayTitle.trim() || undefined, shortLabel: form.shortLabel.trim() || undefined, description: form.description.trim() || undefined, body: form.body.trim() || undefined, editorialNote: form.editorialNote.trim() || undefined, productionNote: form.productionNote.trim() || undefined, creatorCommentary: form.creatorCommentary.trim() || undefined, visibility: form.visibility, featured: Boolean(form.featured), sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : undefined, tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean), assets: normalizedAssets, links: normalizedLinks };
  const warnings = [];
  if (!seriesSlug) warnings.push('seriesSlug is required.');
  if (!form.type) warnings.push('type is required.');
  if (!form.title.trim()) warnings.push('title is required.');
  if (!xtraSlug) warnings.push('slug is required.');
  if (seriesSlug && !kebabCasePattern.test(seriesSlug)) warnings.push('seriesSlug must be lowercase kebab-case.');
  if (releaseSlug && !kebabCasePattern.test(releaseSlug)) warnings.push('releaseSlug must be lowercase kebab-case.');
  if (xtraSlug && !kebabCasePattern.test(xtraSlug)) warnings.push('slug must be lowercase kebab-case.');
  if ((form.type === 'external-link' || form.type === 'related-media') && normalizedLinks.length === 0) warnings.push('external-link and related-media entries require at least one valid URL.');
  normalizedLinks.forEach((item) => { if (!/^https?:\/\//.test(item.url)) warnings.push(`URL must start with http:// or https:// (${item.url}).`); });
  normalizedAssets.forEach((item) => { if (!item.sourceFileName) warnings.push('asset sourceFileName is required.'); if (!item.targetFileName) warnings.push('asset targetFileName is required.'); if (!item.repoPath.startsWith('public/images/')) warnings.push('asset repoPath must start with public/images/.'); if (!item.publicPath.startsWith('/images/')) warnings.push('asset publicPath must start with /images/.'); if (item.publicPath.startsWith('/public/')) warnings.push('asset publicPath must not start with /public/.'); });
  const packageOutput = seriesSlug && xtraSlug ? `# Codex Xtras Content Package

## Task
Add xtras collateral for series \`${seriesSlug}\`.

Related release: \`${releaseSlug || 'Series-level extra'}\`.

## Context
This package was generated by the admin xtras organizer as a Codex handoff. The admin does not publish directly. Apply these changes in the repository and open a PR.

## Xtras to add

\`\`\`json
${JSON.stringify([entry], null, 2)}
\`\`\`

## Files to add

Place the following source files into the repo:

${normalizedAssets.length ? normalizedAssets.map((item) => `- Source file: \`${item.sourceFileName}\`
  Target repo path: \`${item.repoPath}\`
  JSON/public path: \`${item.publicPath}\``).join('\n\n') : '- No files required for link-only extra.'}

## Data files to update

Update the project’s xtras data source.

Preferred locations, in order:

1. Use the existing xtras/extras data file if one already exists.
2. If no file exists, create one following the project’s existing data conventions.

Likely acceptable file names:

- \`src/data/xtras.json\`
- \`src/data/extras.json\`
- \`public/data/xtras.json\`
- \`public/data/extras.json\`
- Existing series/release JSON file if the repo already nests extras there

Do not create duplicate competing data sources.

## Required implementation rules

- Do not include \`/public\` in JSON/public asset paths.
- Repo file paths should use \`public/images/...\`.
- JSON/public paths should use \`/images/...\`.

## Validation

Run:
\`\`\`bash
npm run lint
npm run typecheck
npm run build
\`\`\`
` : '';

  const copyPackage = async () => { if (!packageOutput || !navigator?.clipboard?.writeText) return; try { await navigator.clipboard.writeText(packageOutput); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { setCopied(false); } };

  return <section className="admin-helper-card" aria-labelledby="xtras-package-generator-title"><h2 id="xtras-package-generator-title">Xtras Package Generator</h2><p className="admin-helper-note">Organize xtras collateral and generate a Codex-ready package.</p><div className="admin-form-grid"><label><span>seriesSlug</span><input type="text" value={form.seriesSlug} onChange={(event) => setField('seriesSlug', event.target.value)} /></label><label><span>releaseSlug (optional)</span><input type="text" value={form.releaseSlug} onChange={(event) => setField('releaseSlug', event.target.value)} /></label><label><span>type</span><select value={form.type} onChange={(event) => setField('type', event.target.value)}>{XTRA_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label><span>title</span><input type="text" value={form.title} onChange={(event) => setField('title', event.target.value)} /></label><label><span>slug</span><input type="text" value={form.slug} onChange={(event) => setField('slug', event.target.value)} placeholder={slugify(form.title)} /></label><label><span>visibility</span><select value={form.visibility} onChange={(event) => setField('visibility', event.target.value)}>{XTRA_VISIBILITY.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label><span>sortOrder</span><input type="number" value={form.sortOrder} onChange={(event) => setField('sortOrder', event.target.value)} /></label><label><span>tags (comma-separated)</span><input type="text" value={form.tags} onChange={(event) => setField('tags', event.target.value)} /></label><label className="admin-field-full"><span>description</span><textarea rows={2} value={form.description} onChange={(event) => setField('description', event.target.value)} /></label></div><h3>Assets</h3>{assets.map((asset, index) => <div key={`asset-${index}`} className="admin-form-grid"><label><span>sourceFileName</span><input type="text" value={asset.sourceFileName} onChange={(event) => setAssets((current) => current.map((item, idx) => idx === index ? { ...item, sourceFileName: event.target.value } : item))} /></label><label><span>targetFileName</span><input type="text" value={asset.targetFileName} onChange={(event) => setAssets((current) => current.map((item, idx) => idx === index ? { ...item, targetFileName: event.target.value } : item))} /></label><label><span>kind</span><select value={asset.kind} onChange={(event) => setAssets((current) => current.map((item, idx) => idx === index ? { ...item, kind: event.target.value } : item))}>{XTRA_ASSET_KINDS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div>)}<button type="button" className="text-button" onClick={() => setAssets((current) => [...current, { sourceFileName: '', targetFileName: '', kind: 'image', altText: '', caption: '', credit: '' }])}>Add asset</button><h3>Links</h3>{links.map((link, index) => <div key={`link-${index}`} className="admin-form-grid"><label><span>url</span><input type="text" value={link.url} onChange={(event) => setLinks((current) => current.map((item, idx) => idx === index ? { ...item, url: event.target.value } : item))} /></label><label><span>label</span><input type="text" value={link.label} onChange={(event) => setLinks((current) => current.map((item, idx) => idx === index ? { ...item, label: event.target.value } : item))} /></label></div>)}<button type="button" className="text-button" onClick={() => setLinks((current) => [...current, { url: '', label: '', provider: '', embedUrl: '' }])}>Add link</button>{warnings.length > 0 ? <ul className="admin-warnings">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}<label className="admin-field-full"><span>Generated Codex Package</span><textarea className="admin-json-output" rows={24} readOnly value={packageOutput} /></label><button type="button" className="primary-button" onClick={copyPackage} disabled={!packageOutput}>Copy package{copied ? ' ✓' : ''}</button></section>;
}

export default function AdminShell() {
  return (
    <main className="page page-admin">
      <header className="admin-header">
        <p className="eyebrow">Admin</p>
        <h1>Static Publishing Helper</h1>
        <p>
          A local helper workspace for preparing Star Splitter Visions content updates.
          This page prepares Codex handoff packages and does not publish directly.
        </p>
      </header>

      <section className="admin-banner" role="status" aria-live="polite">
        <p className="admin-banner-label">Local helper only</p>
        <p>
          This is a static/local helper only. Authentication is not implemented,
          saving is not implemented, no backend is connected, and it does not write
          files, connect to GitHub, mutate the repository, or publish content.
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

      <XtrasPackageGenerator />

      <SeriesJsonGenerator />
      <ReleaseJsonGenerator />
      <PageJsonGenerator />
      <CodexContentPackageGenerator />
      <ImageFilingHelper />

      <p>
        <a href="/">Back to site</a>
      </p>
    </main>
  );
}
