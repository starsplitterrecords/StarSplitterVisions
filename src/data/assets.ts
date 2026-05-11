export const brandAssets = {
  logo: '/images/brand/logo.png',
  icon: '/images/brand/icon.png',
} as const

export const coverAssets = {
  vikingsIssue01: '/images/covers/vikings-2026-issue-01.jpg',
  azureReachIssue01: '/images/covers/azure-reach-issue-01-cover.jpg',
  glassHourIssue01: '/images/covers/glass-hour-issue-01.png',
  rexOfTheSplittersIssue01: '/images/covers/rex-of-the-splitters-issue-01.png',
  sunforgeOutlawIssue01: '/images/covers/sunforge-outlaw-issue-01.png',
  signalAtlasIssue01: '/images/covers/signal-atlas-issue-01.png',
  stardustStationIssue01: '/images/covers/stardust-station-issue-01.png',
  hollowCreekIssue01: '/images/covers/hollow-creek-issue-01.png',
  theChoirArrayIssue01: '/images/covers/the-choir-array-issue-01.png',
  supersonicBeingIssue01: '/images/covers/supersonic-being-issue-01.png',
} as const

export const pageImageBases = {
  vikingsIssue01: '/images/pages/vikings-2026/issue-01',
} as const

export type BrandAssetKey = keyof typeof brandAssets
export type CoverAssetKey = keyof typeof coverAssets
export type PageImageBaseKey = keyof typeof pageImageBases
