# Content Path Rules

This project distinguishes **repository file paths** from **public JSON/web paths**.

## Core rules

1. **Repository asset path** must use:
   - `public/images/...`
2. **JSON/public image path** must use:
   - `/images/...`
3. **Never** store `/public/images/...` inside JSON fields.
4. **Content JSON files** live at:
   - `public/content/...`
5. **Public fetch paths** for those files use:
   - `/content/...`

## Required examples

- Repo asset file path:
  - `public/images/vikings-2026/hero.jpg`
- Matching JSON/public path:
  - `/images/vikings-2026/hero.jpg`

- Repo asset file path:
  - `public/images/vikings-2026/vikings-2026-issue-1/page-001.jpg`
- Matching JSON/public path:
  - `/images/vikings-2026/vikings-2026-issue-1/page-001.jpg`

- Content JSON file path in repo:
  - `public/content/series.json`
- Matching public fetch path:
  - `/content/series.json`

## Additional path guidance from app/admin

- Release image defaults are generated as:
  - `/images/{seriesSlug}/{releaseSlug}/cover.jpg`
  - `/images/{seriesSlug}/{releaseSlug}/hero.jpg`
- Admin warnings treat non-`/images/...` paths as invalid for image JSON fields.
- Path helper utilities intentionally provide:
  - repo paths rooted at `public/images`
  - public paths rooted at `/images`
