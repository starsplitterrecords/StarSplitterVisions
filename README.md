# Star Splitter Visions

Star Splitter Visions is a Vite/React site deployed from this GitHub repository.

## Content management

Public content is stored as JSON under `src/content` and edited through Pages CMS.

- `src/content/site.json` — brand, navigation, hero, footer, and catalog copy
- `src/content/homepage.json` — homepage placement and feature panels
- `src/content/pages` — About, Contact, and Press
- `src/content/series` — one file per series, including releases, daily pages, artifacts, and audio links
- `public/images` — public artwork and page images

### Open the editor

1. Go to `https://app.pagescms.org`.
2. Sign in with the GitHub account that owns `starsplitterrecords/StarSplitterVisions`.
3. Install or authorize the Pages CMS GitHub App for this repository.
4. Open `StarSplitterVisions`.
5. Edit content or upload artwork and save.

Pages CMS commits the saved files to GitHub. Vercel then rebuilds and deploys the site from the repository automatically.

## Development

```bash
npm ci
npm run check
npm run build
npm run dev
```

`npm run check` validates the React source and audits the managed content, references, dates, and image paths.

## Publishing rules

- Store public images under `public/images`.
- Use runtime image paths beginning with `/images/`; never include `/public/`.
- Add new series through the Series collection. The Vite data loader discovers new JSON files automatically.
- Use the Homepage editor to choose which series appear in Featured Series and More Worlds.
- Keep URL slugs lowercase with hyphens.
