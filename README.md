# Star Splitter sites

This repository contains both public Star Splitter websites. `main` is the only permanent branch and the source of truth for both deployments.

| Website | Source folder | Vercel root directory |
| --- | --- | --- |
| Star Splitter Visions | `sites/visions` | `sites/visions` |
| Star Splitter Records | `sites/records` | `sites/records` |

## Content management

The root `.pages.yml` presents separate **Star Splitter Visions** and **Star Splitter Records** sections in Pages CMS. Saved content and media changes are committed to `main`; Vercel rebuilds the affected project from its site folder.

## Local validation

```bash
cd sites/visions
npm ci
npm run check
npm run build

cd ../records
npm ci
npm run check
npm run build
```

The Records production build intentionally requires its complete artwork library under `sites/records/public/images/records`. `npm run check` validates the Records content model before those binary files are present.

## Publishing rules

- Keep Visions content and assets inside `sites/visions`.
- Keep Records content and assets inside `sites/records`.
- Use public runtime paths beginning with `/images/` or `/media/`; never include `/public/`.
- Use short-lived feature branches only. Merge approved work into `main`, then delete the feature branch.

## Deployment efficiency

Both sites use `vercel.json` `ignoreCommand` rules tied to their own published
source and assets. Changes to audit scripts, documentation, or Visions staging
uploads do not rebuild either site. Errors in Git diff fail open, so a release
is built rather than silently missed.

Visions retains its unpublished `public/intake/` art in GitHub but excludes it
from Vite's deployed `dist/`. Published /images and /issues assets remain intact.
Validation is scoped to the changed website. Heavy published-book audits and
one-off repair workflows are manually triggered, not run on every commit.
The scheduled Records publisher remains enabled.

Vercel preview retention remains a per-project account setting, under
Settings > Security > Deployment Retention Policy. Confirm there are no review
URLs still needed before shortening that retention.
