const repoRootImagesPrefix = 'public/images';
const publicImagesPrefix = '/images';
const stagingRoot = '_staging';

const cleanSegment = (value: string) => value.trim().replace(/^\/+|\/+$/g, '');

const joinRepo = (...segments: string[]) => [repoRootImagesPrefix, ...segments.map(cleanSegment).filter(Boolean)].join('/');
const joinPublic = (...segments: string[]) => `/${[publicImagesPrefix.replace(/^\//, ''), ...segments.map(cleanSegment).filter(Boolean)].join('/')}`;

export const getSeriesAssetRepoPath = (seriesSlug: string, assetName: string) => joinRepo(seriesSlug, assetName);
export const getSeriesAssetPublicPath = (seriesSlug: string, assetName: string) => joinPublic(seriesSlug, assetName);

export const getReleaseAssetRepoPath = (seriesSlug: string, releaseSlug: string, assetName: string) =>
  joinRepo(seriesSlug, releaseSlug, assetName);
export const getReleaseAssetPublicPath = (seriesSlug: string, releaseSlug: string, assetName: string) =>
  joinPublic(seriesSlug, releaseSlug, assetName);

export const getStagingAssetRepoPath = (seriesSlug: string, releaseSlugOrBrand: string, assetName: string) =>
  joinRepo(stagingRoot, seriesSlug, releaseSlugOrBrand, assetName);
