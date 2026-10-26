# Released image-byte integrity

Run from the `sites/visions` project using `node scripts/audit-published-jpegs.cjs --json`, or use the GitHub Actions workflow. This reports each page and cover JPEG's byte length, JPEG start/end markers, native raster dimensions, a SHA-256 fingerprint, and a *nonbinding* illustrative PPI at 6.625-inch trim.

The previous source-path existence check cannot detect a truncated JPEG that retains a valid header. A proper JPEG must terminate with marker `FF D9`. Absent EOI is binary corruption regardless of whether a forgiving decoder draws part of the image. Auditing source bytes is distinct from inspecting visual art.

`--strict` fails on all incomplete JPEGs. The automated workflow deliberately runs report mode while inherited source corruption exists, so unrelated approved release work is not blocked; its JSON artifact and logs plainly list every bad file. Production-release tooling should require strict mode once originals are recovered. **Do not fix truncated files by appending fake EOI bytes or resizing:** recover verified original files and rebuild packages only after checking approved provenance. The script does not modify any artwork.
