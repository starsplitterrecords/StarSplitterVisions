# Page assets

This folder stores interior page images grouped by series and issue/release.

Folder convention:
- `public/images/pages/<series-slug>/issue-##/`

File naming convention:
- `page-001.jpg`, `page-002.jpg`, `page-003.jpg`, ...
- zero-padded page numbers

Example paths:
- `public/images/pages/vikings-2026/issue-01/page-001.jpg`
- `public/images/pages/vikings-2026/issue-01/page-002.jpg`
- `public/images/pages/vikings-2026/issue-01/page-003.jpg`

Runtime path example:
- `/images/pages/vikings-2026/issue-01/page-001.jpg`

Use `/images/...` in runtime code, **not** `/public/images/...`.
