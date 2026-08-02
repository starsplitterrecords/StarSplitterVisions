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
sites/visions/public/images/brand/
sites/visions/public/images/covers/
sites/visions/public/images/pages/{series}/{release}/
sites/visions/public/images/series/{series}/
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
sites/visions/public/images/_manifests/
```

The temporary intake batch can then be cleared.

## Current runtime data files

Current runtime mapping lives in JavaScript data files:

```text
sites/visions/src/content/homepage.json
sites/visions/src/content/series/*.json
```

Do not create parallel content registries outside the managed JSON model.

## No admin surface

This workflow is folder and manifest based. It does not include a CMS, uploader UI, database, or admin interface.
