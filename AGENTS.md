# Star Splitter Visions Agent Workflow Rules

This repository uses AI-assisted development through ChatGPT, Linear, Codex, GitHub, Codespaces, and Vercel.

The primary risk is process drift: inferred state replacing verified state. These rules are mandatory for all future work.

## Core Rule

When reality is inspectable, do not infer.

Always inspect the real system before proposing or applying fixes:

- repository state
- branch state
- file paths
- runtime asset paths
- deployed preview
- build output
- console/network failures when available

Do not treat plausible explanations as verified facts.

## PR Rules

- One atomic objective per PR.
- Smallest possible diff.
- No speculative cleanup.
- No unrelated refactors.
- No architecture expansion during bugfixes.
- No admin/CMS work unless the issue is specifically about admin/CMS.
- No binary/image changes from Codex unless explicitly approved.
- If branch state becomes ambiguous, abandon the branch and restart from latest `main`.
- Do not repair contaminated branches.

## Asset Rules

- Runtime paths must use `/images/...`.
- Do not use `/public/images/...` in app/runtime code.
- Do not use `/intake/...` in app/runtime code.
- `public/intake/` is source-only.
- Curated assets belong under `public/images/...`.
- Before wiring an asset path, verify the file exists on the target branch.

## Verification Rules

Every change must be verified directly.

Before proceeding to the next task, verify:

1. The intended files changed.
2. No unrelated files changed.
3. Referenced assets exist on the branch being deployed.
4. The Vercel preview loads the expected CSS and image assets.
5. The visible behavior matches the intended objective.

Do not assume:

- assets exist
- branches are current
- deploys succeeded
- paths are correct
- a PR branch contains the same files as `main`

## Deployment Rules

Before any follow-up work:

- verify Vercel preview status
- verify CSS is loaded
- verify images are not 404ing
- verify the exact intended behavior changed
- stop if deployed output contradicts expectations

## Drift Prevention

Stop immediately when:

- assumptions enter the loop
- branch state becomes ambiguous
- deploy state is unclear
- observed behavior contradicts expectations
- a fix requires more than one unrelated change

Collapse uncertainty before continuing.

## Preferred Recovery Pattern

When a PR branch is stale, contaminated, or missing binary state:

1. Close/abandon the PR.
2. Start a fresh branch from latest `main`.
3. Reapply only the tiny intended text/code diff.
4. Verify the preview before merging.

Do not continue layering fixes onto uncertain state.
