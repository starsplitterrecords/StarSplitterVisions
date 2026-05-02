import fs from 'node:fs/promises';
import path from 'node:path';

interface ManifestAsset { id: string; filename: string; repoPath: string; assetRole: string; width: number; height: number; format: string; sourceAssetId?: string }
interface Manifest { stagingPath: string; assets: ManifestAsset[] }

const arg = process.argv.find((item) => item.startsWith('--manifest='));
if (!arg) throw new Error('Missing required --manifest=path/to/asset-manifest.json');
const manifestPath = arg.split('=')[1];

const EXCLUDED = ['comic-page', 'reader-page', 'panel-crop', 'sequential-art', 'page-001', 'page-002'];

const run = async () => {
  const raw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw) as Manifest;
  const results = [] as Array<{ assetId: string; file: string; status: 'generated' | 'derived' | 'skipped' | 'failed'; reason?: string; sourceAssetId?: string }>;

  for (const asset of manifest.assets) {
    try {
      if (EXCLUDED.some((blocked) => asset.id.includes(blocked) || asset.filename.includes(blocked))) {
        results.push({ assetId: asset.id, file: asset.repoPath, status: 'skipped', reason: 'unsupported or excluded asset type' });
        continue;
      }
      await fs.mkdir(path.dirname(asset.repoPath), { recursive: true });
      await fs.writeFile(asset.repoPath, `Placeholder for ${asset.id} (${asset.width}x${asset.height}, ${asset.format})\n`);
      results.push({ assetId: asset.id, file: asset.repoPath, status: asset.sourceAssetId ? 'derived' : 'generated', sourceAssetId: asset.sourceAssetId });
    } catch (error) {
      results.push({ assetId: asset.id, file: asset.repoPath, status: 'failed', reason: error instanceof Error ? error.message : 'unknown error' });
    }
  }

  const outputPath = path.join(manifest.stagingPath, 'generation-results.json');
  await fs.mkdir(manifest.stagingPath, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify({ manifestPath, results }, null, 2));
  console.log(`Wrote ${outputPath}`);
};

run();
