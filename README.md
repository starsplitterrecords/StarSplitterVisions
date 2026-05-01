# Star Splitter Visions

Minimal Vite + React homepage project.

## Run locally

```bash
npm install
npm run dev
```

## Content

Static content is served from `public/content`:

- `series.json`
- `releases.json`
- `pages.json`

## Daily image folder structure

Daily reader images should be stored with this exact path pattern:

`/public/images/{seriesSlug}/{releaseSlug}/page-001.jpg`

Examples:

- `/public/images/vikings-2026/vikings-ep1/page-001.jpg`
- `/public/images/stardust-station/station-pilot/page-002.jpg`

## Add a new daily page

1. Add the image file into the correct folder using zero-padded numbering (`page-001.jpg`, `page-002.jpg`, etc.).
2. Open `public/content/pages.json`.
3. Add a new page object with:
   - `seriesSlug`
   - `releaseSlug`
   - `pageNumber`
   - `releaseDate`
   - `title`
   - `caption`
   - `image` (for example, `/images/{seriesSlug}/{releaseSlug}/page-003.jpg`)
4. Make sure `releaseSlug` matches an existing release `id` in `public/content/releases.json`.
5. The reader route `/read/{releaseSlug}` will automatically include the new page and sort by `pageNumber`.

## Publishing workflow

1. Add new page image(s) to `/public/images/{seriesSlug}/{releaseSlug}/` using zero-padded names like `page-001.jpg`.
2. Update `public/content/pages.json` with each new page record (`seriesSlug`, `releaseSlug`, `pageNumber`, `releaseDate`, `title`, `caption`, `image`).
3. If this is a new release, update `public/content/releases.json` with `id`, `seriesSlug`, metadata, and art links.
4. Commit your content update in Git and push your branch.
5. Open a Pull Request with a short summary of the content added.
6. Verify the Vercel Preview loads homepage rails, series rails, and `/read/{releaseSlug}` pages as expected.
7. After approval, merge the PR.
