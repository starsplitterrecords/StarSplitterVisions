# The Forces of Darkness, LLC. — daily publishing workflow

This series uses the existing Visions React website and Pages CMS. The public path is /series/forces-of-darkness-llc and each strip opens at /read/forces-of-darkness-llc/N.

## Source and art geometry

- The RexPrompt recipe uses IDs such as FOD_V01_S01.
- Full master: 3600 × 1800 pixels (2:1), including the 300-pixel masthead.
- Panels: three 1200 × 1500-pixel crops from x=0,1200,2400, y=300, in reading order.
- Canonical published art: sites/visions/public/images/pages/forces-of-darkness-llc/volume-01/strip-001.jpg and optional strip-001-panel-1.jpg through strip-001-panel-3.jpg.
- Browser image paths start at /images/...; never use /public/... in content JSON.
- The series JSON is at sites/visions/src/content/series/forces-of-darkness-llc.json.
- Approved poster and character images currently in the ChatGPT Library have not been uploaded into the repository; the included SVG wordmark is provisional.

## Record format

Each approved strip gets a dailyPages object with pageNumber, title (optional), releaseDate in YYYY-MM-DD form, publicationState, image, and optional panelImages of exactly three portrait crops.

Example JSON:

    {
      "pageNumber": 1,
      "title": "A Quarterly Review",
      "releaseDate": "2026-12-01",
      "publicationState": "scheduled",
      "image": "/images/pages/forces-of-darkness-llc/volume-01/strip-001.jpg",
      "panelImages": [
        "/images/pages/forces-of-darkness-llc/volume-01/strip-001-panel-1.jpg",
        "/images/pages/forces-of-darkness-llc/volume-01/strip-001-panel-2.jpg",
        "/images/pages/forces-of-darkness-llc/volume-01/strip-001-panel-3.jpg"
      ]
    }

States:

- draft or hidden: never appear in public daily reader, archive, or series preview.
- scheduled: appear only on/after releaseDate.
- published or absent (legacy pages): also require releaseDate to have arrived.
- The calendar uses America/New_York local dates.
- A direct /read URL is clamped to the released list; it cannot open future strips through reader navigation.

## Important confidentiality limit

This is a public GitHub repository and a static Vite site. Browser-based filtering is NOT an access-control mechanism. Even a future-dated image, if copied into public/images, is directly fetchable by URL. Branches and content files in public GitHub are also visible. Do not stage confidential or unapproved comics in public source control.

To keep strip art genuinely hidden before release, maintain all unreleased masters in private storage outside this repository. Each publication day, add only the approved due image and matching series JSON record and release through GitHub/Vercel. Fully automated secure daily publication would require a private asset store and server-side publishing job or authenticated media delivery; those are not implemented here.

## Test and merge checklist

1. Import approved poster from Library to public/images/series/forces-of-darkness-llc and update hero and homepage cover references in the series JSON.
2. Upload at least one approved 2:1 master plus optional panel crops.
3. Add its due releaseDate to dailyPages.
4. Verify desktop full-strip fit and enlargement, mobile panel-by-panel reading, archive, keyboard navigation, and direct future-number URL clamping.
5. Run npm run check and npm run build in sites/visions.
6. Review branch preview and PR diff. Do not merge unfinished art or staged sample data.
