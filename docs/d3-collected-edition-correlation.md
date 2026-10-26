# Collected-edition reader reconciliation

The deep release auditor checks every collected edition against the single series-wide reader registry without assuming the same reader pages belong to both Backyard Rockets PDFs.

- Combined issue: PDF interior coverage and reader coverage should both be near 100%, normally with a leading cover offset.
- Earlier standalone edition: PDF interior coverage may be high even though only a subset of the 47-page combined reader corresponds to it.
- Other editions: compare individual reader pages to the collected PDF in sequence and report outliers.
- Any healthy-but-different image, such as Vikings reader page 017, is a **content-consistency review item** not a damaged-file exception.

Candidate artwork for a PDF/reader mismatch may be extracted as an intact PDF-embedded image into the forensic artifact. It is not automatically substituted in the published reader or approved for canon.

This only extends diagnostic coverage. It does not revise released pages, PDF content, or release metadata.