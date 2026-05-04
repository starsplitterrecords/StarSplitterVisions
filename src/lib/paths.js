const repoRootImagesPrefix = 'public/images';
const publicImagesPrefix = '/images';

const cleanSegment = (value) => String(value ?? '').trim().replace(/^\/+|\/+$/g, '');

const joinRepo = (...segments) => [repoRootImagesPrefix, ...segments.map(cleanSegment).filter(Boolean)].join('/');
const joinPublic = (...segments) => `/${[publicImagesPrefix.replace(/^\//, ''), ...segments.map(cleanSegment).filter(Boolean)].join('/')}`;

export const getSeriesAssetRepoPath = (seriesSlug, assetName) => joinRepo(seriesSlug, assetName);
export const getSeriesAssetPublicPath = (seriesSlug, assetName) => joinPublic(seriesSlug, assetName);

export const getReleaseAssetRepoPath = (seriesSlug, releaseSlug, assetName) =>
  joinRepo(seriesSlug, releaseSlug, assetName);
export const getReleaseAssetPublicPath = (seriesSlug, releaseSlug, assetName) =>
  joinPublic(seriesSlug, releaseSlug, assetName);
