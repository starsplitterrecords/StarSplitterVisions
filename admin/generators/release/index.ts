import { buildScaffoldPackage } from '../shared';

export function generateReleaseScaffoldAssets(input: { seriesSlug: string; releaseSlug: string; seriesTitle: string; releaseTitle: string; releaseDescription?: string; visualIdentity?: string; releasePositioning?: string; }) {
  return buildScaffoldPackage([input.seriesSlug, input.releaseSlug], [
    { id: 'cover', filename: 'cover.jpg', width: 1800, height: 2700, format: 'jpg', assetRole: 'scaffold' },
    { id: 'hero', filename: 'hero.jpg', width: 2400, height: 1350, format: 'jpg', assetRole: 'scaffold' },
    { id: 'social', filename: 'social.jpg', width: 1200, height: 630, format: 'jpg', assetRole: 'scaffold' },
    { id: 'thumbnail', filename: 'thumbnail.jpg', width: 900, height: 1350, format: 'jpg', assetRole: 'scaffold' },
    { id: 'mobile', filename: 'mobile.jpg', width: 1080, height: 1600, format: 'jpg', assetRole: 'scaffold' },
  ], `Series: ${input.seriesTitle}. Release: ${input.releaseTitle}. ${input.releaseDescription ?? ''} ${input.visualIdentity ?? ''} ${input.releasePositioning ?? ''}`);
}
