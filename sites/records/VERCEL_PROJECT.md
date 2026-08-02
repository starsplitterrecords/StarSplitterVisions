# Vercel deployment settings

| Setting | Value |
| --- | --- |
| Repository | `starsplitterrecords/StarSplitterVisions` |
| Production branch | `main` |
| Framework preset | Other |
| Root directory | `sites/records` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

The production build remains intentionally strict: all referenced artwork must exist before deployment succeeds.
