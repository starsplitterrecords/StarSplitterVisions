# Published issue audit (D3)

This release-validation lane checks **StarSplitterVisions public artifacts**; it is independent of RexPrompt's approved-but-unpublished draft state.

Run from `sites/visions`:

```bash
node scripts/audit-published-releases.js
node scripts/audit-published-releases.js --json
node scripts/audit-published-releases.js --live
```

`Audit Published Comic Releases` runs in GitHub Actions on relevant metadata and public assets. Manual dispatch may probe the deployed Vercel site. It inspects metadata references, deterministic URL prefixes, presence and file signatures of collected issue PDFs and cover images, reader-page assets, unique catalog IDs, and strictly increasing reader page numbers. It does not alter published files.

A release record with multiple editions may reuse a single reader-page list (e.g. Backyard Rockets combined edition); the audit warns instead of inventing a one-to-one PDF/page count contract. It does not treat an HTTP 200 with HTML as a valid image/PDF.

**Before preparing or merging a new publication:** require the existing static audit, the build, full-book completeness as defined in RexPrompt's curated inventory, actual visual and lettering QC, native-resolution and color-profile checks, and an explicit human review of book order and trim. The site audit only confirms repository integrity; it does not certify artwork quality, already-deployed behavior, or publication approval. Live probe is separately reported because a deployment can lag GitHub.
