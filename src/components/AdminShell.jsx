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
        <button type="button" className="text-button" onClick={() => copyText('json', jsonPath)}>Copy JSON path{copiedField === 'json' ? ' ✓' : ''}</button>
        <button type="button" className="text-button" onClick={() => copyText('snippet', jsonSnippet)}>Copy JSON snippet{copiedField === 'snippet' ? ' ✓' : ''}</button>
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
      <button type="button" className="primary-button" onClick={copyJson} disabled={!pageJson}>Copy JSON{copied ? ' ✓' : ''}</button>
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
      <CodexContentPackageGenerator />
      <ImageFilingHelper />

      <p>
        <a href="/">Back to site</a>
      </p>
    </main>
  );
}
