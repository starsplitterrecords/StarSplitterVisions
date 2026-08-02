import { coverAssets } from './assets'
import type { FeaturedSeriesItem, MoreWorldItem } from '../types/series'

export const featuredSeries: FeaturedSeriesItem[] = [
  {
    slug: 'vikings-2026',
    title: 'Vikings 2026',
    issue: 'Issue 01',
    hook: 'Municipal satire where Viking logistics meets city hall absurdity.',
    cover: coverAssets.vikingsIssue01,
  },
  {
    slug: 'azure-reach',
    title: 'Azure Reach',
    issue: 'Series Preview',
    hook: 'A workplace comedy-drama inside a luxury marine park built on spectacle, labor, and invisible care.',
    cover: coverAssets.azureReachIssue01,
  },
  {
    slug: 'stardust-station',
    title: 'Stardust Station',
    issue: 'Station Preview',
    hook: 'Corporate hospitality, cosmic logistics, and existential customer service collide in orbit.',
    cover: coverAssets.stardustStationIssue01,
  },
  {
    slug: 'rex-of-the-splitters',
    title: 'Rex of the Splitters',
    issue: 'Signal Run 03',
    hook: 'Cyan frontier raids across unstable jump corridors.',
    cover: coverAssets.rexOfTheSplittersIssue01,
  },
  {
    slug: 'sunforge-outlaw',
    title: 'Sunforge Outlaw',
    issue: 'Ash Circuit 02',
    hook: 'Dust-choked worlds, hot steel, and outlaw dynasties.',
    cover: coverAssets.sunforgeOutlawIssue01,
  },
]

export const moreWorlds: MoreWorldItem[] = [
  {
    slug: 'glass-hour',
    title: 'Glass Hour',
    cover: coverAssets.glassHourIssue01,
  },
  {
    slug: 'signal-atlas',
    title: 'Signal Atlas',
    cover: coverAssets.signalAtlasIssue01,
  },
  {
    slug: 'hollow-creek',
    title: 'Hollow Creek',
    cover: coverAssets.hollowCreekIssue01,
  },
  {
    slug: 'the-choir-array',
    title: 'The Choir Array',
    cover: coverAssets.theChoirArrayIssue01,
  },
  {
    slug: 'supersonic-being',
    title: 'Supersonic Being',
    cover: coverAssets.supersonicBeingIssue01,
  },
]
