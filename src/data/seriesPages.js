import { buildDailyPages } from '../utils/dailyPages'

export const seriesPages = {
  'vikings-2026': {
    slug: 'vikings-2026',
    title: 'Vikings 2026',
    worldLabel: 'Department of Temporal Integration // Field Office NYC',
    tagline: 'Norse legends displaced into modern New York.',
    description:
      'Ancient rivalries, bureaucratic absurdity, and displaced warriors collide inside the Department of Temporal Integration.',
    hero: '/images/series/vikings-2026/card.png',
    currentRelease: 'Issue 01',
    currentPageCount: 15,
    pagePathBase: '/images/pages/vikings-2026/issue-01',
    dailyPages: buildDailyPages({
      count: 15,
      startDate: '2026-05-01',
      imagePathBase: '/images/pages/vikings-2026/issue-01',
    }),
    releases: [
      {
        slug: 'vikings-2026-issue-01',
        title: 'Issue 01',
        status: 'Now Reading',
        description: 'The first documented displacement event in the Vikings 2026 archive.',
        pageCount: 15,
        cover: '/images/series/vikings-2026/card.png',
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
  },
}
