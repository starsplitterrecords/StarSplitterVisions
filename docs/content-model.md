# Content Model Reference

This document describes the current content model used by the Star Splitter Visions app and admin helper.

## Series

- **Purpose**: Defines top-level series identity, branding, and homepage/series-page display content.
- **Canonical JSON file**: `public/content/series.json` under the `series` array.
- **Required fields (runtime validation)**:
  - `slug`
  - `title`
- **Optional fields (used by UI/admin but not hard-required by validator)**:
  - `logoText`, `status`, `format`
  - `genre`, `tone`
  - `tagline`, `shortDescription`, `longDescription`
  - `audiencePromise`, `coreConflict`, `worldPremise`, `seriesEngine`
  - `accentColor`, `secondaryColor`, `backgroundTone`
  - `heroImage`, `coverImage`, `thumbnailImage`
- **Derived fields**:
  - `title` fallback to `"Untitled Series"` when missing.
- **Display usage**:
  - Home and series UI consume title, descriptive copy, and image/color fields.
- **Validation behavior**:
  - Non-object entries are dropped.
  - Missing `slug` drops the row.
  - Missing `title` is warned and replaced by fallback.

## Release

- **Purpose**: Defines release/issue metadata and cards/routes for each series.
- **Canonical JSON file**: `public/content/releases.json` under the `releases` array.
- **Required fields (runtime validation)**:
  - `id` or `slug` (at least one; normalized to `id`)
  - `seriesSlug`
- **Conditionally required**:
  - `releaseDate` when `status` is `scheduled`.
- **Optional fields**:
  - `title`, `issueNumber`, `description`
  - `releaseDate`, `status`
  - `image`, `coverImage`, `heroImage`
  - `ctaLabel`
  - admin/scaffold fields produced by generator (`socialImage`, `thumbnailImage`, `mobileImage`, `assetRole`, `promptRules`)
- **Derived fields**:
  - `id` is derived from `id || slug`.
  - `title` fallback to `"Untitled Release"` when missing.
- **Display usage**:
  - Release cards/pages use title, description, date/status, CTA, and image fields.
- **Validation behavior**:
  - Non-object entries are dropped.
  - Missing `id/slug` or `seriesSlug` drops the row.
  - Unsupported `status` values log a warning.
  - Missing `title` warns and uses fallback.

## Page

- **Purpose**: Defines per-page reader content and sequencing inside a release.
- **Canonical JSON file**: `public/content/pages.json` under the `pages` array.
- **Required fields (runtime validation)**:
  - `releaseSlug`
  - `pageNumber`
  - `image`
- **Optional fields**:
  - `seriesSlug`, `releaseDate`, `title`, `caption`
- **Derived fields**:
  - `pageNumber` is coerced with `Number(...)` and stored as numeric (or `null` if invalid).
  - `releaseSlug` and `image` are trimmed.
- **Display usage**:
  - Reader route uses `releaseSlug`, `pageNumber`, and `image`; title/caption are display text.
- **Validation behavior**:
  - Non-object entries are dropped.
  - Missing `releaseSlug` drops the row.
  - Missing/invalid `pageNumber` or missing `image` triggers warning (row retained).

## Extra

- **Purpose**: Defines extra/bonus content cards and links.
- **Canonical JSON file**: `public/content/extras.json` under the `extras` array.
- **Required fields (runtime validation)**:
  - `title`
- **Optional fields**:
  - `id`, `seriesSlug`, `type`, `description`, `url`, `image`
- **Derived fields**:
  - `title` is trimmed.
- **Display usage**:
  - Public UI cards can show title plus metadata/link/image when provided.
- **Validation behavior**:
  - Non-object entries are dropped.
  - Missing `title` drops the row.

## Soundtrack

- **Purpose**: Defines soundtrack records used for companion listening.
- **Canonical JSON file**: `public/content/soundtracks.json` under the `soundtracks` array.
- **Required fields (runtime validation)**:
  - `title`
- **Optional fields**:
  - `id`, `seriesSlug`, `releaseSlug`
  - `subtitle`, `description`, `mood`
  - `playlistLinks[]`, `tracks[]`
  - `isPublished`, `coverImage`
- **Derived fields**:
  - `title` is trimmed.
- **Display usage**:
  - Reader/public soundtrack components consume list metadata, track data, and playlist links.
- **Validation behavior**:
  - Non-object entries are dropped.
  - Missing `title` drops the row.

## Reader Soundtrack

- **Purpose**: Runtime soundtrack entries filtered for reader use with strict identity requirements.
- **Canonical source**: Derived from soundtrack data loaded in app runtime.
- **Required fields (runtime validation)**:
  - `id`
  - `seriesSlug`
- **Optional fields**:
  - `title` (fallback applied), plus any supplemental soundtrack metadata.
- **Derived fields**:
  - `title` fallback to `"Untitled Soundtrack"` when missing.
- **Display usage**:
  - Reader-side mini audio player and soundtrack picker.
- **Validation behavior**:
  - Non-object entries are dropped.
  - Missing `id` or `seriesSlug` drops the row.
  - Missing `title` warns and fallback is applied.

## Asset

- **Purpose**: Defines image path conventions for series/release/page and scaffold assets.
- **Canonical location**:
  - Repository file path base: `public/images/...`
  - JSON/public URL base: `/images/...`
- **Required fields**:
  - Any content field that references an image must store a public path (`/images/...`) in JSON.
- **Optional/variant fields**:
  - Series images: `heroImage`, `coverImage`, `thumbnailImage`
  - Release images: `image`, `coverImage`, `heroImage`, plus scaffold variants
  - Page image: `image`
  - Extras/soundtrack images where used
- **Derived fields**:
  - Admin generator derives default release asset paths from `seriesSlug` + `slug/id`.
- **Display usage**:
  - Referenced directly by cards, heroes, release pages, reader pages.
- **Validation behavior**:
  - Admin generator warns when image fields do not start with `/images/`.
