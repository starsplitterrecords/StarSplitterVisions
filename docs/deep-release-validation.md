# Released issue integrity and PDF source forensics

Read-only strict audit of all StarSplitterVisions collected editions, every reader page, every collected PDF and cover, all preview covers, and published route inventory.

Run from sites/visions after installing `pillow` and `pymupdf`:

```bash
node scripts/audit-published-releases.js --strict
python scripts/deep-release-audit.py --strict --report full-register.json
python scripts/deep-release-audit.py --expect-known --candidates /tmp/candidates --report /tmp/release.json
python scripts/deep-release-audit.py --expect-known --live --report /tmp/live.json
```

The strict health result must FAIL for all six currently known defective reader JPEGs. `--expect-known` is solely a regression control: it fails if the defect set changes or other anomalies arise; it does not certify historical artifacts as healthy.

The report maps each published reader page to the correct series, checks image decoder integrity, native dimensions and ICC presence, inspects every PDF page using PyMuPDF, and estimates monotonic reader-versus-PDF ordering by image similarity. Multiple-edition series deliberately do not assert a single shared reader sequence for each collected edition.

PDF embedded-image candidates are saved outside the published repository paths, with PDF xref, SHA256, native dimensions, similarity to the matching PDF page and exact binary prefix match to a truncated published JPEG. These are forensic candidates, **not** creative approvals or authorized replacements. Actual image pixels, identity, continuity, lettering, native quality and page context must be reviewed before a separate image-replacement PR. Do not upscale damaged JPEGs or automatically rewrite released canon.

CI also checks the site build and probes deployed reader and series routes plus image/PDF endpoints.
