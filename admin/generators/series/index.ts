import { buildScaffoldPackage } from '../shared';

export function generateSeriesScaffoldAssets(input: { seriesSlug: string; seriesTitle: string; tagline?: string; shortDescription?: string; visualIdentity?: string; tone?: string; genrePositioning?: string; }) {
  return buildScaffoldPackage([input.seriesSlug], [
    { id: 'series-card', filename: 'series-card.jpg', width: 1200, height: 1600, format: 'jpg', assetRole: 'scaffold' },
    { id: 'hero', filename: 'hero.jpg', width: 2400, height: 1350, format: 'jpg', assetRole: 'scaffold' },
    { id: 'hero-mobile', filename: 'hero-mobile.jpg', width: 1080, height: 1600, format: 'jpg', assetRole: 'scaffold' },
    { id: 'social', filename: 'social.jpg', width: 1200, height: 630, format: 'jpg', assetRole: 'scaffold' },
    { id: 'logo', filename: 'logo.png', width: 1600, height: 500, format: 'png', assetRole: 'scaffold' },
  ], `Series: ${input.seriesTitle}. ${input.tagline ?? ''} ${input.shortDescription ?? ''} ${input.visualIdentity ?? ''} ${input.tone ?? ''} ${input.genrePositioning ?? ''}`);
}
