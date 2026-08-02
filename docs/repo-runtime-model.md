# Star Splitter Visions Runtime Model

This document records the active repository structure for the current public website implementation.

## Current implementation model

The live app is a Vite + React JavaScript app.

Runtime entry:

```text
src/main.jsx
src/App.jsx
```

Current routing is handled inside `src/App.jsx` with helper functions in:

```text
src/utils/routes.js
```

There is no active React Router layer in the current app.

## Active data source

The active public-site data model is static JavaScript modules under `src/data/`.

Current source-of-truth runtime files:

```text
src/data/assets.js
src/data/homepageSeries.js
src/data/seriesPages.js
src/data/vikingsExtras.js
src/data/vikingsAudio.js
```

Do not target `src/data/assets.ts` or other TypeScript data files unless a TypeScript migration has been explicitly scoped. The previous parallel `assets.ts` registry was removed because it created split-brain asset updates.

## Asset path rules

Runtime image paths must use:

```text
/images/...
```

Repository files live under:

```text
sites/visions/public/images/...
```

Do not use runtime paths beginning with:

```text
/public/images/...
```

Avoid runtime paths beginning with:

```text
/intake/...
```

Intake paths are staging only and should not be used by public app components.

## Current content model status

The current app is not reading from:

```text
public/content/series.json
public/content/releases.json
public/content/pages.json
```

Do not scope WEB implementation work against those JSON files unless a migration back to JSON-driven content has been explicitly approved and implemented.

## Package model

The app is currently JavaScript-first.

The package scripts are:

```text
npm run dev
npm run build
npm run check
npm run audit:data
npm run preview
```

`npm run check` runs ESLint and the runtime data audit.

The old TypeScript check/config path was removed from the active app model.

## Runtime data audit

A guard script exists at:

```text
scripts/audit-runtime-data.js
```

It verifies:

- required runtime modules exist
- stale parallel TypeScript data files do not reappear
- `tsconfig.json` does not reappear unless TypeScript migration is active
- runtime image paths use `/images/...`
- series slugs referenced by homepage data exist in `seriesPages`
- series keys match series slugs

Warnings may report missing optional image files. Errors should block cleanup/feature work.

## Future migration guidance

A future JSON- or TypeScript-driven system can be built, but it should be done as an explicit migration:

1. Add the new model.
2. Wire `App.jsx` or the router to read from it.
3. Move all active data into it.
4. Remove the old model in the same migration.
5. Update this document and the audit script.

Do not leave two active-looking data models in the repo.
