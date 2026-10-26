# Reader image restoration — review, not publication

This narrowly scoped workflow prepares a **draft PR only** from images originally embedded in current published collected PDFs. All six have exact source-PDF SHA256, embedded xref, original image SHA256, original dimensions, and current truncated Git blob SHA pinned in `prepare-reader-recovery-pr.py`.

The PR restores the **reader delivery copies**, not a new canonical design. The recovered pixels are exact PDF sources, not stretched or generatively reconstructed.

**Approval gate:** Inspect all six at original native size, verify characters/lettering/panel sequence against adjacent pages and the collected PDFs, and confirm final resolution policy. Rex Fleet source art is only 864 x 1296; that may be acceptable to repair broken web readers but **not certified as print master**. Stardust is 1600 x 2400. Never merge the draft PR without approval. Remove corresponding baseline exceptions only upon verified replacement, then rebuild/revalidate if collected issue content changes.
