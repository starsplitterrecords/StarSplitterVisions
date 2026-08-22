# Visions Catalogue IDs

Published and managed releases use a stable catalogue identifier:

`SER-TNNN-YYYY-NNN`

- `SER` — permanent three-character series code.
- `T` — publication type.
- first `NNN` — sequence within that publication type.
- `YYYY` — catalogue assignment year. It is not changed if a release date moves.
- final `NNN` — overall publication sequence within the series.

Catalogue IDs are management identifiers. They are stored with release metadata and may be used in manifests, filenames, tooling, browser reading-state keys, and production discussion, but they are not shown as reader-facing issue titles.

## Publication types

- `E` — regular issue
- `A` — annual
- `C` — compendium or collected edition
- `S` — set or bundle
- `P` — preview or production preview

Add new type codes deliberately and update the runtime data audit when doing so.

## Series codes

| Code | Series |
| --- | --- |
| `AZR` | Azure Reach |
| `BYR` | Backyard Rockets |
| `LTS` | Low Tide Signal |
| `REX` | Rex Fleet |
| `SDS` | Stardust Station |
| `SFO` | Sunforge Outlaw |
| `VIK` | Vikings 2026! |

Series codes are permanent after assignment, even if a public series title later changes.

## Examples

- `BYR-E001-2026-001` — Backyard Rockets, regular issue 1, first catalogue publication.
- `BYR-E002-2026-002` — Backyard Rockets, regular issue 2, second catalogue publication.
- `REX-A001-2027-003` — Rex Fleet, annual 1, third catalogue publication in the series.
- `VIK-S001-2027-006` — Vikings 2026!, set 1, sixth catalogue publication in the series.

The release JSON also stores `publicationType`, `publicationNumber`, `catalogSequence`, and `issueNumber` for regular issues so tooling never has to parse human-facing titles.
