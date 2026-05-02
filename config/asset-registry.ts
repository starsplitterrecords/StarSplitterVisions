export type AssetRole = 'scaffold' | 'external-comic-art' | 'reference';
export type AssetFormat = 'jpg' | 'png' | 'webp' | 'svg';

export interface AssetDefinition {
  assetType: string;
  assetRole: AssetRole;
  width: number;
  height: number;
  format: AssetFormat;
  required: boolean;
}

export const ASSET_REGISTRY = {
  series: [
    { assetType: 'series-card', assetRole: 'scaffold', width: 1200, height: 1600, format: 'jpg', required: true },
    { assetType: 'hero', assetRole: 'scaffold', width: 2400, height: 1350, format: 'jpg', required: true },
    { assetType: 'hero-mobile', assetRole: 'scaffold', width: 1080, height: 1600, format: 'jpg', required: true },
    { assetType: 'social', assetRole: 'scaffold', width: 1200, height: 630, format: 'jpg', required: true },
    { assetType: 'logo', assetRole: 'scaffold', width: 1600, height: 500, format: 'png', required: true },
  ],
} as const satisfies Record<string, readonly AssetDefinition[]>;
