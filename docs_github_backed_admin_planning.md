# GitHub-Backed Admin Planning Document

## Purpose

This document reviews and clarifies how a future GitHub-backed admin flow should work for Star Splitter Visions, while preserving the current safety model.

## Current State (as of 2026-05-02)

- The current admin helper is intentionally **not** a GitHub publisher.
- The app generates a Codex-ready package; Codex applies repository changes.
- No frontend GitHub credentials or direct repository mutation are used.

## Why this matters

A direct GitHub-backed admin can improve editor convenience, but it introduces risk areas:

- Credential handling and secret storage.
- Permission scoping and audit trail.
- Branch/PR lifecycle management.
- Validation enforcement before merge.

## Recommended Architecture

1. Keep the browser UI as a content authoring and package-building layer.
2. Add a separate backend service (or serverless function) for GitHub operations.
3. Use a GitHub App (preferred) or tightly scoped fine-grained PAT for auth.
4. Perform all writes via branch + pull request (never commit directly to default branch).
5. Run schema validation and build checks before opening PR.

## Minimum Safe Flow

1. Admin user prepares release/page metadata.
2. Admin uploads/selects images.
3. Backend validates payload and image naming conventions.
4. Backend creates a branch.
5. Backend writes image files and JSON updates.
6. Backend runs validation/build in CI.
7. Backend opens PR with machine-generated summary.
8. Human reviews preview and merges.

## Guardrails

- Block `/public` prefixes in JSON image paths.
- Require cross-file integrity checks:
  - `releases[].seriesSlug` must exist in `series[].slug`.
  - `pages[].releaseSlug` must match `releases[].id`.
  - `pages[].seriesSlug` must match the parent release.
- Enforce deterministic image naming (`cover.jpg`, `page-001.jpg`, ...).
- Keep `draft` content hidden in public UI.

## Open Questions

- Should image uploads land in Git LFS or plain Git history?
- Should all PRs be user-attributed, bot-authored, or both?
- What rollback UX is needed for non-technical admins?
- Do we require per-series authorization boundaries?

## Milestone Plan

### Milestone 1: Hardening current Codex-assisted flow

- Add stronger package validation in admin helper.
- Add automated schema consistency checks in CI.
- Standardize PR template for content updates.

### Milestone 2: Backend write service prototype

- Build authenticated service endpoint for branch+PR writes.
- Implement least-privilege GitHub App permissions.
- Add idempotency keys for safe retries.

### Milestone 3: Full GitHub-backed admin

- Integrate UI with backend write service.
- Add progress/audit status in admin UI.
- Roll out with feature flag and limited editor cohort.

## Recommendation

Proceed incrementally: keep today’s Codex-assisted package model as the default path, and implement GitHub-backed publishing through a dedicated backend service with strict guardrails and PR-based workflows.
