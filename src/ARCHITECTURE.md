# Architecture Boundaries

- `src/app` coordinates app-level routing and data.
- `src/pages` composes route-level pages.
- `src/features` owns feature-specific UI, hooks, and logic.
- `src/admin` owns admin-only tools and package generation.
- `src/content` owns content loading, validation, indexing, and selectors.
- `src/ui` owns reusable visual primitives.
- `src/lib` owns generic utilities.
- Prefer importing from package `index.js` files outside a package.
- Avoid importing another feature’s internal hooks/components directly.
