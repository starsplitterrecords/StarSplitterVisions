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
    slug: 'glass-hour',
    title: 'Glass Hour',
    issue: 'Pilot Drop',
    hook: 'Neon magenta conspiracies unfold through fractured time markets.',
    cover: coverAssets.glassHourIssue01,
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
  {
    slug: 'signal-atlas',
    title: 'Signal Atlas',
    issue: 'Nodebook 07',
    hook: 'Cartographers decode impossible maps hidden in starlight noise.',
    cover: coverAssets.signalAtlasIssue01,
  },
]

export const moreWorlds: MoreWorldItem[] = [
  {
    slug: 'stardust-station',
    title: 'Stardust Station',
    cover: coverAssets.stardustStationIssue01,
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
