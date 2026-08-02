# Star Splitter Records

This folder is the complete standalone Star Splitter Records website. It shares the repository, `main` branch, and Pages CMS configuration with Star Splitter Visions while retaining its own content, artwork, build, and Vercel project.

## Content and media

- `content/site.json` — homepage, navigation, story, licensing, journal, and featured releases
- `content/artists/*.json` — 23 CMS-managed artist/project records and their releases
- `public/images/records` — the 72 required artwork files
- `public/media/records` — motion media

## Build

From this directory:

```bash
npm ci
npm run check
npm run build
```

`npm run check` validates the complete content model without requiring the binary library. `npm run build` is the production build and deliberately fails if referenced artwork is missing.

The generated site is written to `dist`: one homepage, 23 artist pages, and 40 release pages.

## Vercel

Connect a second Vercel project to this repository using `main` as the production branch and `sites/records` as its root directory. The exact settings are recorded in `VERCEL_PROJECT.md`.
