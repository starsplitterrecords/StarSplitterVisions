# Star Splitter Visions Artwork Requirements

## 1) Purpose

This document defines the standard artwork package for the Star Splitter Visions website. It serves as the canonical reference for art generation and asset setup across:

- Site-wide brand artwork
- Series-level artwork
- Release/issue artwork
- Comic reader artwork
- Extras artwork
- Soundtrack artwork
- Character artwork
- File path conventions
- Recommended default dimensions
- Recommended file formats

## 2) Core Site-Wide Artwork

| Asset | Use | Recommended Dimensions | Notes |
| -- | -- | -- | -- |
| Site logo / wordmark | Header, footer, branding | SVG preferred; PNG backup 1200 × 300 | Transparent background |
| Square brand mark | Favicon, app icon, social avatar | 1024 × 1024 | Should work small |
| Favicon | Browser tab | 512 × 512 PNG + ICO | Derived from brand mark |
| Open Graph default image | Link previews when no page image exists | 1200 × 630 | Safe text centered |
| Site hero background | Homepage hero | 2400 × 1350 | 16:9 cinematic |
| Mobile hero crop | Homepage mobile hero | 1080 × 1600 | Portrait crop, not just resized |
| Texture / background plate | Subtle section backgrounds | 2400 × 1350 | Low-detail, reusable |

## 3) Series-Level Artwork

| Asset | Use | Recommended Dimensions | Notes |
| -- | -- | -- | -- |
| Series logo / title treatment | Series page, cards, hero | SVG preferred; PNG 1600 × 500 | Transparent background |
| Series hero image | Series landing page | 2400 × 1350 | 16:9 widescreen |
| Series mobile hero | Mobile series page | 1080 × 1600 | Important subject centered |
| Series card image | Homepage / series grid | 1200 × 1600 | Poster/card format |
| Series banner | Horizontal promo modules | 1920 × 640 | Wide but shallow |
| Series social preview | Link sharing | 1200 × 630 | Include title if useful |
| Character lineup / ensemble | About page / pitch material | 2400 × 1350 | Optional but valuable |
| World/environment plate | Series page background | 2400 × 1350 | No text preferred |

## 4) Release / Issue Artwork

| Asset | Use | Recommended Dimensions | Notes |
| -- | -- | -- | -- |
| Cover image | Main release cover | 1800 × 2700 | 2:3 comic/book/poster ratio |
| Cover thumbnail | Grid/card thumbnail | 900 × 1350 | Can be generated from cover |
| Cover wide crop | Release hero banner | 2400 × 1350 | Alternate art or planned crop |
| Mobile cover crop | Mobile release page | 1080 × 1600 | Portrait framing |
| Open Graph image | Social/link preview | 1200 × 630 | Cover art adapted to wide |
| Preview panel/page | Marketing preview | 1600 × 2400 | Optional |
| Back-cover/editorial art | Editorial page or extras | 1800 × 2700 | Optional |

## 5) Reader / Comic Page Artwork

| Asset | Use | Recommended Dimensions | Notes |
| -- | -- | -- | -- |
| Comic page | Reader page image | 1600 × 2400 | Good web size, 2:3 ratio |
| High-res archive page | Future print/archive | 2400 × 3600 or 3300 × 5100 | Optional master file |
| Double-page spread | Reader spread | 3200 × 2400 | Landscape spread |
| Panel crop | Promo, thumbnails | Variable, minimum 1200 wide | Export from page if possible |
| Page thumbnail | Reader navigation | 400 × 600 | Generated derivative |

## 6) Extras Artwork

| Asset | Use | Recommended Dimensions | Notes |
| -- | -- | -- | -- |
| Extra thumbnail | Extras grid | 1200 × 900 | 4:3 works well |
| Behind-the-scenes image | Article/detail page | 1600 × 1200 | 4:3 |
| Concept art | Gallery | 1600 × 2400 or 2400 × 1350 | Depends on orientation |
| Production note hero | Long-form extra page | 2400 × 1350 | Wide |
| Character design sheet | Extras gallery | 2400 × 1350 | Landscape |
| Cover process image | Extras / making-of | 1800 × 2700 | Match cover ratio |
| Editorial page graphic | Bonus page | 1600 × 2400 | Same as comic page |

## 7) Soundtrack Artwork

| Asset | Use | Recommended Dimensions | Notes |
| -- | -- | -- | -- |
| Soundtrack cover | Soundtrack page/card | 1400 × 1400 | Square album format |
| Track artwork | Track detail or player | 1400 × 1400 | Optional |
| Mini-player thumbnail | Reader mini player | 400 × 400 | Generated from cover |
| Soundtrack hero | Soundtrack detail page | 2400 × 1350 | Optional wide crop |
| Social preview | Link sharing | 1200 × 630 | Wide version of album art |

## 8) Character Artwork

| Asset | Use | Recommended Dimensions | Notes |
| -- | -- | -- | -- |
| Character portrait | Cast card | 1200 × 1600 | 3:4 portrait |
| Character full body | Bio/detail page | 1200 × 2400 | Transparent background useful |
| Character expression sheet | Extras/reference | 2400 × 1350 | Optional |
| Character social card | Marketing | 1200 × 630 | Optional |
| Transparent cutout | Layered web design | 1600 × 2400 PNG/WebP | Useful but larger file |

## 9) Path Conventions

Image files must live in the repository under:

```text
/public/images/
```

Standard series/release pattern:

```text
/public/images/{seriesSlug}/series-card.jpg
/public/images/{seriesSlug}/hero.jpg
/public/images/{seriesSlug}/hero-mobile.jpg
/public/images/{seriesSlug}/social.jpg
/public/images/{seriesSlug}/logo.png
/public/images/{seriesSlug}/{releaseSlug}/cover.jpg
/public/images/{seriesSlug}/{releaseSlug}/hero.jpg
/public/images/{seriesSlug}/{releaseSlug}/social.jpg
/public/images/{seriesSlug}/{releaseSlug}/page-001.jpg
/public/images/{seriesSlug}/{releaseSlug}/page-002.jpg
```

JSON/data references must use public URL paths:

```text
/images/{seriesSlug}/hero.jpg
/images/{seriesSlug}/{releaseSlug}/cover.jpg
/images/{seriesSlug}/{releaseSlug}/page-001.jpg
```

Do **not** use this path prefix inside JSON/data:

```text
/public/images/...
```

## 10) Minimum Viable Art Package Per Series

```text
/public/images/{seriesSlug}/series-card.jpg        1200 × 1600
/public/images/{seriesSlug}/hero.jpg               2400 × 1350
/public/images/{seriesSlug}/hero-mobile.jpg        1080 × 1600
/public/images/{seriesSlug}/social.jpg             1200 × 630
/public/images/{seriesSlug}/logo.png or logo.svg   1600 × 500
```

## 11) Minimum Viable Art Package Per Release

```text
/public/images/{seriesSlug}/{releaseSlug}/cover.jpg       1800 × 2700
/public/images/{seriesSlug}/{releaseSlug}/hero.jpg        2400 × 1350
/public/images/{seriesSlug}/{releaseSlug}/social.jpg      1200 × 630
/public/images/{seriesSlug}/{releaseSlug}/page-001.jpg    1600 × 2400
/public/images/{seriesSlug}/{releaseSlug}/page-002.jpg    1600 × 2400
```

## 12) Default Generation Presets

```text
Comic/page art:        1600 × 2400
Cover/poster art:      1800 × 2700
Hero/wide art:         2400 × 1350
Mobile hero art:       1080 × 1600
Social preview art:    1200 × 630
Square album art:      1400 × 1400
Card/poster image:     1200 × 1600
Thumbnail:             400 × 600 or 400 × 400
```

## 13) File Format Guidance

| Asset Type | Recommended Format |
| -- | -- |
| Photos / painted art | `.jpg` or `.webp` |
| Transparent logos / cutouts | `.png` or `.webp` |
| Logos / icons | `.svg` preferred |
| Final web delivery | `.webp` where possible |
| Archive masters | Larger `.png`, `.tif`, or high-quality `.jpg` outside the repo if needed |

Practical rule:

> Generate high-quality JPG/PNG masters, then place optimized `.webp` or `.jpg` versions in `/public/images`.
