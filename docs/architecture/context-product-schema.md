# ContextProduct Schema and Storage Model (CDC)

## Purpose

`ContextProduct` is the canonical CDC contract for preserving and serving derived creative context.
Domain objects (Character, Scene, Beat, Relationship, Location, Rule, PagePlan) produce context products.
Downstream systems consume context products by variant and safety profile.

CDC responsibilities:
- preserve source traceability
- derive and version context artifacts
- expose queryable context products
- mark products stale when upstream changes invalidate them

CDC non-responsibilities:
- choosing which variant a consumer should request
- production adaptation orchestration (PSB4 responsibility)
- raw PSB3 Show-object injection as a long-term contract boundary

---

## Type Contract (TypeScript)

See `src/data/schemas/contextProduct.ts` for canonical draft types.

Required top-level fields:
- `id`
- `projectId`
- `sourceRefs`
- `targetRef`
- `variant`
- `content`
- `generatedAt`
- `generatedFrom`
- `stale`
- `version`
- `invalidationRules`

Required variants:
- `short`
- `long`
- `visual`
- `voice`
- `editorial`
- `page-safe`
- `production-safe`
- `continuity-safe`

---

## Semantics

### Derivation lineage

`generatedFrom` records deterministic derivation lineage:
- `generator`: producer id (e.g., `cdc.context-refinery`)
- `generatorVersion`: producing algorithm/prompt pipeline version
- `schemaVersion`: ContextProduct schema version used
- `upstreamProductIds`: prior ContextProducts in chain
- `sourceSnapshotHash`: stable hash of resolved sourceRefs at generation time

### Source references

`sourceRefs` explicitly identify source artifacts contributing to content.
Each reference stores:
- source type
- source id
- optional revision/version
- optional span/range metadata
- optional checksum/hash

### Target reference

`targetRef` identifies the domain object this product describes (e.g., `Character:char_001`).
Only one target per ContextProduct to keep query and invalidation logic explicit.

### Stale/version behavior

- `version` increments for every newly materialized product for the same `(projectId, targetRef, variant)` key.
- `stale = true` means product is superseded or invalidated by source/contract drift.
- newest non-stale product is default read candidate.
- stale products remain retained for audit/debug unless lifecycle policy purges archival rows.

### Invalidation rules

`invalidationRules` declare what invalidates a product.
Triggers include:
- source revision change in `sourceRefs`
- target object revision change
- dependency product version bump in `generatedFrom.upstreamProductIds`
- schema version incompatibility
- package compatibility policy mismatch

---

## Storage Layout

Recommended logical model (document store or relational-equivalent):

- Partition key: `projectId`
- Uniqueness key: `id`
- Query key: `(projectId, targetRef.type, targetRef.id, variant, stale)`
- Sort key: `generatedAt desc, version desc`

Recommended indexes:
1. `byProjectTargetVariant`: `projectId + targetRef.type + targetRef.id + variant + stale + generatedAt`
2. `byProjectVariant`: `projectId + variant + stale + generatedAt`
3. `bySourceRef`: `projectId + sourceRefs[*].sourceType + sourceRefs[*].sourceId + stale`
4. `byLineageDependency`: `projectId + generatedFrom.upstreamProductIds[*] + stale`

Storage path convention (object/blob sidecar if needed):
`context-products/{projectId}/{targetType}/{targetId}/{variant}/v{version}.json`

---

## Query Contracts

CDC query surface should support:

1. Latest product by target + variant
   - input: `projectId`, `targetRef`, `variant`, optional `allowStale`
   - default: return latest `stale = false`

2. Variant set for target
   - input: `projectId`, `targetRef`
   - output: latest version per variant

3. Products impacted by source
   - input: `projectId`, `sourceRef`
   - output: all dependent product ids (stale + fresh optional filter)

4. Lineage traversal
   - input: `projectId`, `contextProductId`
   - output: upstream/downstream dependency graph

---

## Package Compatibility

`packageCompatibility` on each product declares compatibility for downstream consumers/packages.

Rules:
- additive extensions should remain backward compatible where possible
- breaking schema changes require `schemaVersion` major increment
- consumers declare accepted `schemaVersion` ranges
- CDC may serve transform adapters, but canonical stored artifact remains immutable per version

---

## Downstream Consumer Examples

### Character
- target: `Character:char_lyra`
- variant: `voice`
- consumer: dialogue planning engine

### Scene
- target: `Scene:scene_14`
- variant: `production-safe`
- consumer: PSB4 scene assembly

### Beat
- target: `Beat:beat_14c`
- variant: `short`
- consumer: outline rail UI/backend context fetch

### Relationship
- target: `Relationship:rel_lyra_orin`
- variant: `continuity-safe`
- consumer: continuity verifier

### Location
- target: `Location:loc_glass_harbor`
- variant: `visual`
- consumer: concept art prompting adapter

### Rule
- target: `Rule:rule_signal_conservation`
- variant: `editorial`
- consumer: editorial consistency checker

### PagePlan
- target: `PagePlan:pp_issue01_p014`
- variant: `page-safe`
- consumer: page composition planner

---

## Notes on Evolution

- Preserve inspectability: prefer explicit fields over opaque blobs.
- Preserve traceability: never drop sourceRefs in derived versions.
- Preserve isolation: keep CDC as context refinery, not downstream decision-maker.
