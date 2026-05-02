# Star Splitter Visions

Minimal Vite + React homepage project.

## Run locally

```bash
npm install
npm run dev
```

## Content files

Static content is served from `public/content`:

- `series.json`
- `releases.json`
- `pages.json`

## Content Schema

### 1) Series schema (`public/content/series.json`)

Each object in `series[]` should include:

- `slug` (string)
- `title` (string)
- `logoText` (string)
- `status` (string)
- `format` (string)
- `genre` (string[])
- `tone` (string[])
- `tagline` (string)
- `shortDescription` (string)
- `longDescription` (string)
- `audiencePromise` (string)
- `coreConflict` (string)
- `worldPremise` (string)
- `seriesEngine` (string)
- `accentColor` (hex color string)
- `secondaryColor` (hex color string)
- `backgroundTone` (string)
- `heroImage` (web path)
- `coverImage` (web path)
- `thumbnailImage` (web path)

Allowed `status` values:

- `ongoing`
- `in development`
- `complete`

### 2) Release schema (`public/content/releases.json`)

Each object in `releases[]` should include:

- `id` (string)
- `seriesSlug` (string)
- `title` (string)
- `issueNumber` (number)
- `description` (string)
- `releaseDate` (`YYYY-MM-DD`)
- `status` (string)
- `image` (web path)
- `coverImage` (web path)
- `heroImage` (web path)
- `ctaLabel` (string)

Allowed `status` values:

- `draft`
- `scheduled`
- `published`

Notes:

- `id` is the route slug used by `/releases/{id}` and `/read/{id}`.
- Public UI must not show `draft` releases.

### 3) Page schema (`public/content/pages.json`)

Each object in `pages[]` should include:

- `seriesSlug` (string)
- `releaseSlug` (string)
- `pageNumber` (number)
- `releaseDate` (`YYYY-MM-DD`)
- `title` (string)
- `caption` (string)
- `image` (web path)

Rules:

- `releaseSlug` must match an existing `releases[].id`.
- `seriesSlug` must match the same release object's `seriesSlug`.
- `pageNumber` should be numeric.
- Image path convention: `/images/{seriesSlug}/{releaseSlug}/page-001.jpg`.

## Slug and image path rules

- Use lowercase, hyphen-separated slugs.
- Keep slugs stable after publishing.
- Do not use `/public/images/...` in JSON.
- Use `/images/...` paths in content JSON.

## Relationship map

- `series.slug` ← canonical series identifier.
- `releases.seriesSlug` → must match `series.slug`.
- `releases.id` ← canonical release identifier and route slug.
- `pages.releaseSlug` → must match `releases.id`.
- `pages.seriesSlug` → must match the parent release's `seriesSlug`.

## Manual publishing workflow

1. Add image files in `/public/images/{seriesSlug}/{releaseSlug}/`.
2. Update `public/content/series.json`, `public/content/releases.json`, and/or `public/content/pages.json`.
3. Validate slug and relationship consistency.
4. Commit on a branch and open a pull request.
5. Verify Vercel preview before merge.
