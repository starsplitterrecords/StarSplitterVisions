# AGENTS.md

## Scope
These instructions apply to the entire repository.

## Project
- This is a minimal Vite + React homepage for Star Splitter Visions.
- Keep content-driven data in `public/content`.
- The admin area is a content-preparation and Codex package-generation tool, not a live publishing backend.

## Style
- Prefer small, readable React components.
- Keep dependencies minimal.
- Avoid unrelated refactors.
- Preserve existing public routes and layout unless explicitly asked to change them.

## Agent Workflow Rules

### Scope control
- Implement only the Linear issue or user task requested.
- Do not refactor unrelated files.
- Do not introduce new routes, schemas, deployment workflows, or dependencies unless explicitly requested.
- If a task reveals additional issues, leave a concise PR note instead of expanding scope.

### PR behavior
- Keep PRs small and reviewable.
- One PR should address one Linear issue unless explicitly instructed otherwise.
- Include a short summary of changed files and verification steps.
- Do not create follow-up PRs automatically unless assigned a new Linear issue.

### Vercel / deployment rules
- Do not add or modify GitHub Actions that run `vercel deploy` unless explicitly requested.
- Do not add deploy hooks, Vercel CLI deployment steps, Vercel tokens, or duplicate deployment triggers.
- Prefer Vercel’s Git integration as the single deployment path.
- Do not change production branch settings, preview deployment rules, or build-ignore logic unless the task is specifically about deployment configuration.

### Preview deployment budget
- Avoid force-pushing or repeated trivial commits that trigger unnecessary preview deployments.
- Batch related fixes into one commit when possible.
- For Codex-generated follow-up fixes, prefer one scoped PR per issue, not many micro PRs.

### Content schema enforcement
- Treat the JSON schema and README content rules as the source of truth.
- Preserve required fields exactly as defined.
- Do not invent new fields unless the schema is updated in the same PR.
- Keep image paths as public URLs such as `/images/...`, never `/public/images/...`.
- Keep content data in `public/content`.

### Admin/content package workflow
- The admin UI should generate Codex-ready content packages, not directly publish to GitHub or Vercel unless explicitly requested.
- Generated packages must include target repo paths, JSON paths, release/page metadata, and acceptance criteria.
- Codex may apply generated packages by adding image files, updating content JSON, running checks, and preparing a PR.
- Preserve existing public routes and layout unless the issue explicitly asks to change them.

### Review comments
- Codex review comments should focus on:
  - schema mismatches
  - broken data paths
  - missing required fields
  - runtime errors
  - failing tests
  - incomplete acceptance criteria
- Do not leave speculative refactor suggestions, style preferences, or nice-to-have comments unless directly relevant to the issue.

### Definition of done
Before opening a PR, verify:
- build passes
- tests pass if present
- affected JSON validates against schema
- no duplicate deployment workflow was added
- no unrelated files were changed
