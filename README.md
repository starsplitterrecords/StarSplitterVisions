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

---

## Daily Publishing Workflow (for non-developers)

Use this workflow any time you want to publish a new release and/or add daily page images.

### 1) Naming conventions (use these everywhere)

Keep names simple and consistent:

- Use lowercase letters.
- Use hyphens (`-`) instead of spaces.
- Avoid punctuation and special characters.
- Keep slugs stable after publishing (do not rename old slugs).
- Use three-digit page image numbers: `001`, `002`, `003`, etc.

Examples:

- Series title: `Vikings 2026!` → series slug: `vikings-2026`
- Release title: `Issue #1 — Arrival Processing` → release slug: `vikings-2026-issue-1`
- Image file: `page-001.jpg`
- Page ID example: `vikings-2026-issue-1-page-001`

### 2) Image folder structure

Store daily reader images in this exact pattern:

- `/public/images/{seriesSlug}/{releaseSlug}/page-001.jpg`
- `/public/images/{seriesSlug}/{releaseSlug}/page-002.jpg`
- `/public/images/{seriesSlug}/{releaseSlug}/page-003.jpg`

What each part means:

- `{seriesSlug}`: URL-safe identifier for the series.
- `{releaseSlug}`: URL-safe identifier for the release/issue.
- `page-001.jpg`: one daily page image.

Concrete example:

- File path in repository: `/public/images/vikings-2026/vikings-2026-issue-1/page-001.jpg`
- Matching web path in JSON: `/images/vikings-2026/vikings-2026-issue-1/page-001.jpg`

Keep file names lowercase and exact.

### 3) How to add a new release (`public/content/releases.json`)

`releases.json` defines release cards/detail content and the reader entry point.

1. Open `public/content/releases.json`.
2. Add one new object inside the top-level `releases` array.
3. Fill in required fields using the repo's current schema:
   - `id`: release slug/identifier (used by reader routes).
   - `seriesSlug`: series identifier.
   - `title`: release title shown in the UI.
   - `description`: release summary text.
   - `issueNumber`: issue/episode number.
   - `releaseDate`: publish date (`YYYY-MM-DD`).
   - `image`: rail/hero image URL.
   - `coverImage`: release cover image path (typically `/images/.../page-001.jpg`).
   - `ctaLabel`: button label (example: `Read`, `Open station log`).

> Note: Some teams also track extra fields like `slug`, `heroImage`, or `status`. Use only fields supported by this repo unless your team also updates the app code.

Example release object (adapt values for your content):

```json
{
  "id": "vikings-2026-issue-1",
  "seriesSlug": "vikings-2026",
  "title": "Issue #1 — Arrival Processing",
  "description": "A displaced Viking crew collides with modern bureaucracy.",
  "issueNumber": 1,
  "releaseDate": "2026-05-01",
  "image": "https://example.com/hero-image.jpg",
  "coverImage": "/images/vikings-2026/vikings-2026-issue-1/page-001.jpg",
  "ctaLabel": "Read"
}
```

### 4) How to add daily page images

1. Create the release image folder (if it does not exist):
   - `/public/images/{seriesSlug}/{releaseSlug}/`
2. Add the next page file using three-digit names:
   - `page-001.jpg`, `page-002.jpg`, `page-003.jpg`, etc.
3. Confirm the file path is correct in the repo.
4. Use the matching web path in `pages.json` (`/images/...`, not `/public/images/...`).

Example:

- Repository file path: `/public/images/vikings-2026/vikings-2026-issue-1/page-001.jpg`
- JSON/web path: `/images/vikings-2026/vikings-2026-issue-1/page-001.jpg`

### 5) How to update `public/content/pages.json`

`pages.json` defines the individual pages inside each release.

1. Open `public/content/pages.json`.
2. Add one new object inside the top-level `pages` array.
3. Fill fields using current repo schema:
   - `seriesSlug`: series identifier.
   - `releaseSlug`: release identifier (must match release `id` in `releases.json`).
   - `pageNumber`: numeric order in reader (`1`, `2`, `3`, ...).
   - `releaseDate`: page publish date (`YYYY-MM-DD`).
   - `title`: page title.
   - `caption`: page caption text.
   - `image`: web path to image (`/images/...`).

> Optional team field: `id` (for tracking), e.g. `vikings-2026-issue-1-page-001`.

Example page object (current schema):

```json
{
  "seriesSlug": "vikings-2026",
  "releaseSlug": "vikings-2026-issue-1",
  "pageNumber": 1,
  "releaseDate": "2026-05-01",
  "title": "Page 1",
  "caption": "Arrival at the processing station.",
  "image": "/images/vikings-2026/vikings-2026-issue-1/page-001.jpg"
}
```

How fields relate:

- `releaseSlug` ties each page to the correct release.
- `pageNumber` controls reader order.
- `image` must exactly match the uploaded image path.
- `releaseDate` controls the date metadata used by the app.
- If your team adds a `status` field later, use it consistently across all pages/releases.

### 6) Relationship between `releases.json` and `pages.json`

- `releases.json` defines the release metadata and entry point.
- `pages.json` defines each individual page in that release.
- `pages[].releaseSlug` must match `releases[].id` exactly.

Before publishing, re-check release entry values for:

- Correct release identifier (`id`).
- Correct `seriesSlug`.
- Correct `description`.
- Correct `coverImage` path.
- Correct top image (`image`).
- Correct `ctaLabel`.
- Correct `releaseDate`.

### 7) Pull request workflow

1. Create a branch from the latest `main` branch.
2. Add image files under `/public/images/...`.
3. Update `public/content/pages.json`.
4. If adding a new release, update `public/content/releases.json`.
5. Commit your changes.
6. Push the branch.
7. Open a pull request (PR).
8. Review the Vercel preview.
9. Merge after verification.

### 8) Vercel preview verification checklist

Before merging, check:

- [ ] Homepage still loads.
- [ ] Release page loads.
- [ ] Release description appears.
- [ ] Cover/hero image appears.
- [ ] Read button works.
- [ ] Reader opens the correct release.
- [ ] Pages appear in the correct order.
- [ ] Previous/Next buttons work.
- [ ] Unreleased/scheduled content does not appear early (if scheduling is used by your team).
- [ ] Missing images do not break the page layout.
- [ ] Mobile layout is usable.

### 9) Merge-to-production guidance

After PR approval:

1. Merge into `main`.
2. If Vercel is connected to `main`, merging the PR should trigger production deployment automatically.
3. Open the production URL after deployment finishes.
4. Confirm the new release/page is live and displays correctly.

### 10) Troubleshooting

**Problem: Image does not appear**

Check:

- File exists under `/public/images/...`
- JSON `image` path starts with `/images/...`
- File name matches exactly
- File extension matches exactly (`.jpg` vs `.png`)

**Problem: Page appears in the wrong order**

Check:

- `pageNumber` is correct
- `pageNumber` is a number (not text)
- No duplicate `pageNumber` for the same release

**Problem: Page does not appear in reader**

Check:

- `releaseSlug` matches release `id`
- Page is in `public/content/pages.json`
- `releaseDate` is correct for your publish timing
- Image path is valid

**Problem: Release page does not appear**

Check:

- Release was added to `public/content/releases.json`
- Release `id` is unique
- Route uses the same release identifier (`/read/{releaseSlug}`)
- JSON syntax is valid (no trailing commas, missing quotes, etc.)
