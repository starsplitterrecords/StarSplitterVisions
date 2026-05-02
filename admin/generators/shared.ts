import { withScaffoldRules } from '../../lib/promptTemplates';
import { toPublicImagePath, toStagingPath } from '../../lib/assetPaths';

export interface ScaffoldAsset {
  id: string;
  filename: string;
  width: number;
  height: number;
  format: string;
  assetRole: 'scaffold' | 'reference';
}

export function buildScaffoldPackage(scopeParts: string[], assets: ScaffoldAsset[], promptContext: string) {
  const stagingPath = toStagingPath(...scopeParts);
  const manifest = {
    stagingPath,
    assets: assets.map((asset) => ({
      ...asset,
      repoPath: `${stagingPath}/${asset.filename}`,
      publicPath: toPublicImagePath(...scopeParts.filter((part) => part !== '_staging'), asset.filename),
    })),
  };

  const promptManifest = assets
    .map((asset) => `## ${asset.filename} (${asset.width}x${asset.height})\n\n${withScaffoldRules(`${promptContext}\nAsset: ${asset.filename}`)}`)
    .join('\n\n');

  return { manifest, promptManifest };
}
