import { buildScaffoldPackage } from '../shared';
export const generateSiteAssetScaffold = (brandContext = 'Star Splitter Visions brand system') => buildScaffoldPackage(['brand'], [
  { id: 'site-logo', filename: 'site-logo.svg', width: 1200, height: 300, format: 'svg', assetRole: 'scaffold' },
  { id: 'site-logo-png-fallback', filename: 'site-logo.png', width: 1600, height: 500, format: 'png', assetRole: 'scaffold' },
  { id: 'square-brand-mark', filename: 'brand-mark-square.png', width: 1024, height: 1024, format: 'png', assetRole: 'scaffold' },
  { id: 'og-default', filename: 'og-default.jpg', width: 1200, height: 630, format: 'jpg', assetRole: 'scaffold' },
  { id: 'site-hero-background', filename: 'site-hero-background.jpg', width: 2400, height: 1350, format: 'jpg', assetRole: 'scaffold' },
  { id: 'mobile-hero-crop', filename: 'mobile-hero-crop.jpg', width: 1080, height: 1600, format: 'jpg', assetRole: 'scaffold' },
  { id: 'texture-plate', filename: 'texture-plate.jpg', width: 2400, height: 1350, format: 'jpg', assetRole: 'scaffold' },
], `Site-wide scaffold assets. ${brandContext}`);
