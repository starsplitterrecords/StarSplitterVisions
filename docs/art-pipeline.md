# Scaffold Asset Pipeline

## 1. Mental model
- COMICS = separate creative production.
- GENERATORS = scaffold/interface asset production.
- SYSTEM = delivery layer.

## 2. What the generators do
They generate manifest metadata and scaffold prompt manifests for interface/support images.

## 3. What the generators do not do
They do not generate comic pages, panel crops, reader pages, or sequential art.

## 4. Series scaffold workflow
1. Run series generator.
2. Review `asset-manifest.json` and `prompt-manifest.md`.
3. Run asset generation script into `_staging`.

## 5. Release scaffold workflow
1. Run release generator.
2. Verify only cover/hero/social/thumbnail/mobile are listed.
3. Generate into `_staging` and review.

## 6. Staging folder rules
- Always stage under `/public/images/_staging/...`.
- Keep `asset-manifest.json`, `prompt-manifest.md`, and `generation-results.json` together.

## 7. Codex install workflow
- Validate staged package.
- Copy reviewed files into final repo paths.
- Update JSON references and open PR.

## 8. Path conventions
- Repo filesystem paths begin with `public/images/...`.
- JSON/public paths begin with `/images/...`.
- Never use `/public/images/...` inside JSON data.

## 9. Common mistakes
- Including comic page filenames in manifests.
- Mismatched dimensions versus registry.
- Missing staged files before install.

## 10. Recovery steps
- Fix failing asset entries in manifest.
- Regenerate only missing/invalid scaffold assets.
- Re-run validation and re-open install PR.

## 11. If you forget everything, do this
Generate scaffold manifests, stage and review assets, then install only validated scaffold files.
