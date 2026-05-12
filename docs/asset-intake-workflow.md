# Asset Intake and Publishing Workflow

This is the lightweight operational workflow for public website assets.

## Workflow

```text
raw source file
intake batch folder
manifest
reviewed published location
runtime data path
```

## Intake batch folder

Use:

```text
public/intake/YYYY-MM-DD-series-or-purpose/
```

Each batch needs:

```text
manifest.txt
source file or files
```

Manifest template:

```text
public/intake/_templates/manifest-template.txt
```

Required fields:

```text
SERIES:
ASSET TYPE:
TARGET USE:
SOURCE FILE:
FINAL PATH:
NOTES:
```

## Approved asset types

- series-card
- hero
- hero-mobile
- social
- issue-cover
- reader-page
- logo
- brand
- misc-reference

## Canonical published repo paths

```text
public/images/brand/
public/images/covers/
public/images/pages/{series}/{release}/
public/images/series/{series}/
```

## Runtime path rule

Runtime data uses `/images/...` paths only.

Correct:

```text
/images/covers/azure-reach-issue-01-cover.jpg
```

Incorrect:

```text
/public/images/covers/azure-reach-issue-01-cover.jpg
/intake/2026-05-11-azure-reach-cover/source.png
```

## Manifest preservation

After publishing, preserve the completed manifest in:

```text
public/images/_manifests/
```

The temporary intake batch can then be cleared.

## Current runtime data files

Current runtime mapping lives in JavaScript data files:

```text
src/data/assets.js
src/data/homepageSeries.js
src/data/seriesPages.js
```

Do not create parallel TypeScript or JSON asset models unless a migration is explicitly scoped.

## No admin surface

This workflow is folder and manifest based. It does not include a CMS, uploader UI, database, or admin interface.
