# Star Splitter Records content model

Pages CMS edits the JSON files in this directory. The public website is generated from these records at build time. Do not edit `sites/records/dist`; it is build output.

## Artist records

Each file under `artists/` defines one public project. In addition to bios, images, listening links, and releases, every project includes:

- `catalogRole` — the short listener-facing heading shown under **Role in the catalog**
- `roleStatement` — the public explanation of what the project contributes to the larger catalog

These fields describe the creative function of the project. They should not invent a fictional biography or reduce the project to a genre label.

## Release records

Every release has its own URL slug and generated detail page. The release page exists even while credits and lineage remain hidden.

### Credits and lineage workflow

New and migrated releases start with:

```json
"lineage": {
  "display": "hidden",
  "compositionOrigin": "undocumented",
  "realizationMethod": "undocumented",
  "versionRelationship": "undocumented"
}
```

This is intentional. Do not infer or publish provenance that has not been confirmed.

1. Enter the known source work, composition origin, realization method, version relationship, and credits.
2. Write `publicSummary` in direct listener-facing language describing what actually happened.
3. Add a concise `publicLabel` when useful, such as **Original**, **New interpretation**, **Legacy recording**, **Remix**, or **Alternate version**.
4. Add related releases when another public version helps explain the lineage.
5. Change `display` to `summary` or `full` only after the visible information is accurate.

### Display modes

- `hidden` — no provenance text or label appears publicly; the release page still exists.
- `summary` — shows the public summary, relationship label, source work, and high-level origin/realization/version fields.
- `full` — also shows detailed credits, process notes, and related releases.

### Public writing standard

The public note should separate the origin of the work from its realization. Describe composition, lyrics, arrangement, performance, production, generation, recording, editing, selection, and curation only when they are known.

Avoid blanket language such as:

- “Made with AI”
- “AI-generated music”
- “Human-made with AI”
- “All music written by…” when that is not true for every release

Prefer specific language, for example:

> Written by [name]. Newly arranged for [project]. AI-assisted vocal and instrumental realization. Final arrangement, editing, and production direction by [name].

or:

> Developed from a generative starting point and shaped through selection, rewriting, arrangement, editing, and production by [name].

The purpose is neither to defend the process nor to make the tools the subject. It is to preserve accurate authorship and lineage.
