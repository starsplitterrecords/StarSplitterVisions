# STA-62 PR Reconciliation Plan and Execution Log

## Status

Blocked in this Codex environment from completing the full reconciliation because GitHub PR metadata is not accessible from this checkout:

- `gh` CLI is not installed.
- `git remote -v` shows no configured remote, so there is no origin URL to query directly.

As a result, the required actions that target live PRs (audit all open PRs, decide merge/close/rebase per PR, and leave comments on each PR) cannot be executed from this repository alone.

## Required Reconciliation Order (Canonical)

When PR access is available, process open PRs in this order:

1. Canonical asset path helpers
2. Schema/content model changes
3. Admin generator changes
4. UI rendering changes

This order prevents upstream model/helper churn from invalidating downstream admin/UI changes.

## Per-PR Decision Checklist

For each open PR:

1. Classify primary area:
   - content model
   - admin generator logic
   - asset path helpers
   - README/docs
   - validation/schema work
2. Identify overlaps/conflicts with other open PRs.
3. Decide one outcome:
   - **Merge**: aligns with canonical direction and supersedes alternatives
   - **Close as obsolete**: duplicates or conflicts with chosen canonical implementation
   - **Rebase/update**: still needed but must be rebased/adapted after earlier canonical merges
4. Leave an explicit PR comment including:
   - overlap findings
   - canonical reference PR(s)
   - required follow-up (if any)

## Conflict-Specific Guardrails

Before final merge queue completion, confirm all of the following are true:

- No competing **extras** data model remains open.
- No competing **soundtrack** data model remains open.
- No competing canonical **path helper** implementation remains open.
- Schema and validation behavior match whichever canonical content model was selected.
- README/docs reflect the merged canonical model and helper behavior.

## Suggested PR Comment Template

```md
Reconciliation decision for STA-62:

- Area: <asset paths | schema/model | admin generator | UI | docs>
- Overlap found with: <PR #...>
- Canonical direction: <PR #... or summary>
- Decision: <merge | close obsolete | rebase/update>
- Rationale: <1-3 bullets>
- Follow-up: <issue link or none>
```

## Execution Commands (when GitHub access is available)

```bash
# list open PRs
gh pr list --state open --limit 100

# inspect each PR
gh pr view <number> --comments --files

# comment decision
gh pr comment <number> --body-file /tmp/pr-comment.md

# merge (if selected)
gh pr merge <number> --squash --delete-branch

# close (if obsolete)
gh pr close <number> --comment "Closed per STA-62 reconciliation: superseded by PR #..."
```

## Local Verification Captured in This Session

- Confirmed current branch and working tree state.
- Confirmed GitHub CLI unavailable.
- Confirmed no git remote configured in this checkout.

This log documents the reconciliation procedure and blocker so feature work can remain paused until PR access is restored.
