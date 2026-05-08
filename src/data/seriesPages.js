import { buildDailyPagesFromReleaseConfig } from '../utils/dailyPages'
import { validateReleaseConfig } from '../utils/releaseValidation'

const vikingsIssue01ReleaseConfig = {
  seriesSlug: 'vikings-2026',
  releaseSlug: 'issue-01',
  pageCount: 15,
  startDate: '2026-05-01',
  cadence: 'daily',
  imagePathBase: '/images/pages/vikings-2026/issue-01',
}

const releaseConfigWarnings = validateReleaseConfig(vikingsIssue01ReleaseConfig)

if (releaseConfigWarnings.length > 0) {
  console.warn(
    `[Visions Release Config Warning] ${vikingsIssue01ReleaseConfig.releaseSlug}:`,
    releaseConfigWarnings
  )
}

const vikingsIssue01Cover = '/images/covers/vikings-2026-issue-01.jpg'

function createComingSoonSeries({
  slug,
  title,
  worldLabel,
  tagline,
  description,
  hero,
  accent,
  atmosphere,
}) {
  return {
    slug,
    title,
    worldLabel,
    tagline,
    description,
    hero,
    accent,
    atmosphere,
    currentRelease: 'Coming Soon',
    releaseConfigs: [],
    dailyPages: [],
    releases: [],
    purchaseLinks: ['Comixology', 'Kindle', 'Apple Books', 'Google Play Books'],
    status: 'coming-soon',
  }
}

export const seriesPages = {
  'vikings-2026': {
    slug: 'vikings-2026',
    title: 'Vikings 2026',
    worldLabel: 'Department of Temporal Integration // Field Office NYC',
    tagline: 'Norse legends displaced into modern New York.',
    description:
      'Ancient rivalries, bureaucratic absurdity, and displaced warriors collide inside the Department of Temporal Integration.',
    hero: vikingsIssue01Cover,
    accent: '#BAFF00',
    atmosphere: 'Civic bureaucracy meets temporal-collapse mythology.',
    currentRelease: 'Issue 01',
    releaseConfigs: [vikingsIssue01ReleaseConfig],
    dailyPages: buildDailyPagesFromReleaseConfig(vikingsIssue01ReleaseConfig),
    releases: [
      {
        slug: 'vikings-2026-issue-01',
        title: 'Issue 01',
        status: 'Now Reading',
        description: 'The first documented displacement event in the Vikings 2026 archive.',
        pageCount: 15,
        cover: vikingsIssue01Cover,
      },
      {
        slug: 'vikings-2026-issue-02',
        title: 'Issue 02',
        status: 'Coming Soon',
        description: 'Next release placeholder.',
        pageCount: 0,
      },
      {
        slug: 'vikings-2026-issue-03',
        title: 'Issue 03',
        status: 'Coming Soon',
        description: 'Future release placeholder.',
        pageCount: 0,
      },
    ],
    purchaseLinks: ['Comixology', 'Kindle', 'Apple Books', 'Google Play Books'],
    status: 'active',
  },
  'glass-hour': createComingSoonSeries({
    slug: 'glass-hour',
    title: 'Glass Hour',
    worldLabel: 'Temporal Market // Restricted Signal',
    tagline: 'Neon magenta conspiracies unfold through fractured time markets.',
    description: 'A coming Visions world about time, trade, memory, and impossible bargains.',
    hero: '/images/covers/glass-hour-issue-01.png',
    accent: '#FF4FD8',
    atmosphere: 'Luxury decay, impossible finance, and fractured chronology.',
  }),
  'rex-of-the-splitters': createComingSoonSeries({
    slug: 'rex-of-the-splitters',
    title: 'Rex of the Splitters',
    worldLabel: 'Frontier Jump Corridor // Outer Signal',
    tagline: 'Cyan frontier raids across unstable jump corridors.',
    description: 'A coming Visions world of unstable crossings, outlaw crews, and frontier myth.',
    hero: '/images/covers/rex-of-the-splitters-issue-01.png',
    accent: '#42D7FF',
    atmosphere: 'Frontier velocity, signal storms, and jump-gate violence.',
  }),
  'sunforge-outlaw': createComingSoonSeries({
    slug: 'sunforge-outlaw',
    title: 'Sunforge Outlaw',
    worldLabel: 'Ash Circuit // Solar Borderlands',
    tagline: 'Dust-choked worlds, hot steel, and outlaw dynasties.',
    description: 'A coming Visions world forged from heat, exile, inheritance, and rebellion.',
    hero: '/images/covers/sunforge-outlaw-issue-01.png',
    accent: '#FF8A2B',
    atmosphere: 'Solar furnaces, ash storms, and outlaw inheritance wars.',
  }),
  'signal-atlas': createComingSoonSeries({
    slug: 'signal-atlas',
    title: 'Signal Atlas',
    worldLabel: 'Cartographer Node // Deep Signal',
    tagline: 'Cartographers decode impossible maps hidden in starlight noise.',
    description: 'A coming Visions world about maps that should not exist and the people who follow them anyway.',
    hero: '/images/covers/signal-atlas-issue-01.png',
    accent: '#76FFE5',
    atmosphere: 'Astral mapping, impossible coordinates, and navigational obsession.',
  }),
  'stardust-station': createComingSoonSeries({
    slug: 'stardust-station',
    title: 'Stardust Station',
    worldLabel: 'Orbital Workplace // Public-Facing Signal',
    tagline: 'A workplace sci-fi comedy from the edges of the Visions signal.',
    description: 'A coming Visions world where corporate optimism, cosmic logistics, and bad signage collide.',
    hero: '/images/covers/stardust-station-issue-01.png',
    accent: '#FFD54A',
    atmosphere: 'Corporate hospitality, orbital retail, and existential customer service.',
  }),
  'hollow-creek': createComingSoonSeries({
    slug: 'hollow-creek',
    title: 'Hollow Creek',
    worldLabel: 'Local Archive // Dark Signal',
    tagline: 'A quiet signal from somewhere darker, stranger, and older.',
    description: 'A coming Visions world of small-town shadows, impossible memory, and local folklore.',
    hero: '/images/covers/hollow-creek-issue-01.png',
    accent: '#7D8EFF',
    atmosphere: 'Fog, silence, forgotten roads, and impossible local history.',
  }),
  'the-choir-array': createComingSoonSeries({
    slug: 'the-choir-array',
    title: 'The Choir Array',
    worldLabel: 'Vocal Relay // Cosmic Signal',
    tagline: 'A cosmic transmission assembled from impossible voices.',
    description: 'A coming Visions world built from resonance, signal, devotion, and scale.',
    hero: '/images/covers/the-choir-array-issue-01.png',
    accent: '#D8A6FF',
    atmosphere: 'Celestial resonance, impossible harmonics, and devotional machinery.',
  }),
  'supersonic-being': createComingSoonSeries({
    slug: 'supersonic-being',
    title: 'Supersonic Being',
    worldLabel: 'Velocity Event // Human Signal',
    tagline: 'Velocity, identity, and myth under pressure.',
    description: 'A coming Visions world about speed, pressure, selfhood, and becoming something else.',
    hero: '/images/covers/supersonic-being-issue-01.png',
    accent: '#FF5B5B',
    atmosphere: 'Impact physics, velocity trauma, and mythic acceleration.',
  }),
}
