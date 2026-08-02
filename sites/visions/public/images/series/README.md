# Series assets

This folder contains one subfolder per series slug.

Per-series folder rule:
- create `public/images/series/<series-slug>/`
- keep shared series visuals there (card, hero, logo, social)

Example files:
- `public/images/series/vikings-2026/card.png`
- `public/images/series/vikings-2026/hero.png`
- `public/images/series/vikings-2026/hero-mobile.png`
- `public/images/series/vikings-2026/logo.png`
- `public/images/series/vikings-2026/social.png`

Runtime path example:
- `/images/series/vikings-2026/card.png`

Use `/images/...` in runtime code, **not** `/public/images/...`.
