import { buildScaffoldPackage } from '../shared';
export const generateExtrasScaffoldAssets = (scope: { seriesSlug: string; releaseSlug?: string }) => buildScaffoldPackage([scope.seriesSlug, scope.releaseSlug || 'extras'], [
  { id: 'extra-thumbnail', filename: 'extra-thumbnail.jpg', width: 1200, height: 900, format: 'jpg', assetRole: 'scaffold' },
  { id: 'bts-image', filename: 'behind-the-scenes.jpg', width: 1600, height: 1200, format: 'jpg', assetRole: 'scaffold' },
  { id: 'prod-note-hero', filename: 'production-note-hero.jpg', width: 2400, height: 1350, format: 'jpg', assetRole: 'scaffold' },
  { id: 'concept-preview', filename: 'concept-preview.jpg', width: 1600, height: 2400, format: 'jpg', assetRole: 'reference' },
  { id: 'cover-process', filename: 'cover-process.jpg', width: 1800, height: 2700, format: 'jpg', assetRole: 'reference' },
  { id: 'editorial-graphic', filename: 'editorial-graphic.jpg', width: 1600, height: 2400, format: 'jpg', assetRole: 'scaffold' },
], 'Extras scaffold/support assets only.');
