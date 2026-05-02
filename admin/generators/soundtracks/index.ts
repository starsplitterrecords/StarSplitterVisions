import { buildScaffoldPackage } from '../shared';
export const generateSoundtrackScaffoldAssets = (scope: { seriesSlug: string; soundtrackSlug: string }) => buildScaffoldPackage([scope.seriesSlug, scope.soundtrackSlug], [
  { id: 'soundtrack-cover', filename: 'cover.jpg', width: 1400, height: 1400, format: 'jpg', assetRole: 'scaffold' },
  { id: 'track-artwork', filename: 'track-artwork.jpg', width: 1400, height: 1400, format: 'jpg', assetRole: 'scaffold' },
  { id: 'mini-player-thumbnail', filename: 'mini-player-thumbnail.jpg', width: 400, height: 400, format: 'jpg', assetRole: 'scaffold' },
  { id: 'soundtrack-hero', filename: 'hero.jpg', width: 2400, height: 1350, format: 'jpg', assetRole: 'scaffold' },
  { id: 'soundtrack-social', filename: 'social.jpg', width: 1200, height: 630, format: 'jpg', assetRole: 'scaffold' },
], 'Soundtrack scaffold/interface assets only.');
