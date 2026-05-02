# `/public/images` Media Library

This directory stores all series/release image assets that are referenced by content JSON files.

## Directory layout

Use this structure for every release:

```text
public/images/{seriesSlug}/{releaseSlug}/
```

Typical files:

- `cover.jpg`
- `page-001.jpg`, `page-002.jpg`, etc.

Example:

```text
public/images/vikings-2026/vikings-ep1/cover.jpg
public/images/vikings-2026/vikings-ep1/page-001.jpg
```

## JSON path rule (important)

When referencing images in JSON, omit `/public`.

- ✅ Correct: `/images/{seriesSlug}/{releaseSlug}/page-001.jpg`
- ❌ Incorrect: `/public/images/{seriesSlug}/{releaseSlug}/page-001.jpg`

## Naming conventions

- Keep release assets grouped in their own `{releaseSlug}` folder.
- Use stable lowercase slugs for folder names.
- Keep page numbering zero-padded (`page-001`, `page-002`, ...).
- Keep cover art named `cover.jpg` unless there is a documented reason otherwise.

## Before commit

- Confirm all referenced files exist in this directory.
- Confirm all image references in `public/content/*.json` use `/images/...` paths.
- Confirm page image sequence matches reading order.
