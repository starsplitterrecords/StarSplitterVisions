# Intake (raw drop zone)

`public/intake/` is a temporary source-only drop zone for raw uploads.

Rules:
- raw images may be uploaded here temporarily
- runtime code must **not** depend on intake paths
- manually copy/rename curated files into `public/images/...` folders before adding code references
- Codex should not move/copy/rename binary files from intake

Important path note:
- final runtime references must use `/images/...`, **not** `/public/images/...`
- `public/intake/` is not a final runtime asset path
