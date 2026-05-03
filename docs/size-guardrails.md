# Size Guardrails

Recommended limits:

- JS/JSX files: under 250 lines
- CSS files: under 350 lines
- Functions/components: under 120 lines
- Files: under 20 KB

These are not strict architecture laws. They are warning thresholds to keep files Codex-editable and reduce blast radius.

When a file exceeds the threshold, prefer extracting:

- reusable UI
- feature hooks
- pure utilities
- config constants
- package builders
- CSS feature files
