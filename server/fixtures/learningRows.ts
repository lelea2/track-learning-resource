import type { LearningRow } from '../../src/types';

/**
 * Relative to "now" (not a fixed calendar date) so the seed data always
 * falls within a demoable recent window — including the last-14-days
 * progress chart — no matter when the app is actually run.
 */
function daysAgo(days: number, hour: number, minute: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

/**
 * Seed data for the in-memory repository. Trimmed to 5 rows for now.
 * statusUpdatedAt is staggered across the last 14 days for rows that have
 * progressed past "To Read" so the progress chart has a realistic, uneven
 * daily pattern out of the box; rows still at "To Read" have never changed
 * status, so statusUpdatedAt equals createdAt for those.
 */
export const learningRowFixtures: LearningRow[] = [
  {
    id: 'row-1',
    title: 'Why React Re-renders and How to Stop Them',
    source: 'dev.to',
    url: 'https://dev.to/some-author/why-react-re-renders-1a2b',
    topic: 'react-performance',
    difficulty: 'Intermediate',
    priority: 'High',
    status: 'To Read',
    estimatedTime: 25,
    interviewRelevance: 85,
    keyTakeaway: '',
    nextAction: 'Read and note render-cause checklist',
    createdAt: daysAgo(20, 9, 0),
    statusUpdatedAt: daysAgo(20, 9, 0),
  },
  {
    id: 'row-2',
    title: 'Designing a Frontend for 10M Concurrent Users',
    source: 'news.ycombinator.com',
    url: 'https://news.ycombinator.com/item?id=39812345',
    topic: 'frontend-system-design',
    difficulty: 'Advanced',
    priority: 'High',
    status: 'Reading',
    estimatedTime: 40,
    interviewRelevance: 90,
    keyTakeaway: 'CDN + edge caching reduces origin load significantly',
    nextAction: 'Diagram the caching layers discussed',
    createdAt: daysAgo(15, 9, 5),
    statusUpdatedAt: daysAgo(0, 16, 30),
  },
  {
    id: 'row-3',
    title: 'TypeScript Generics You Actually Need',
    source: 'dev.to',
    url: 'https://dev.to/some-author/typescript-generics-3c4d',
    topic: 'typescript',
    difficulty: 'Intermediate',
    priority: 'Medium',
    status: 'Summarized',
    estimatedTime: 20,
    interviewRelevance: 70,
    keyTakeaway: 'Constrain generics with extends rather than any',
    nextAction: 'Refactor one util function using this pattern',
    createdAt: daysAgo(16, 9, 10),
    statusUpdatedAt: daysAgo(2, 11, 15),
  },
  {
    id: 'row-4',
    title: 'Building a Coding Agent Loop from Scratch',
    source: 'news.ycombinator.com',
    url: 'https://news.ycombinator.com/item?id=39812999',
    topic: 'ai-coding-agents',
    difficulty: 'Advanced',
    priority: 'High',
    status: 'To Read',
    estimatedTime: 35,
    interviewRelevance: 95,
    keyTakeaway: '',
    nextAction: 'Read and compare against tool-use loop we built',
    createdAt: daysAgo(18, 9, 15),
    statusUpdatedAt: daysAgo(18, 9, 15),
  },
  {
    id: 'row-5',
    title: 'Accessible Modals Without a Library',
    source: 'dev.to',
    url: 'https://dev.to/some-author/accessible-modals-5e6f',
    topic: 'accessibility',
    difficulty: 'Beginner',
    priority: 'Medium',
    status: 'Practiced',
    estimatedTime: 15,
    interviewRelevance: 60,
    keyTakeaway: 'Trap focus and restore it to the trigger element on close',
    nextAction: 'Add regression test for focus return',
    createdAt: daysAgo(17, 9, 20),
    statusUpdatedAt: daysAgo(3, 14, 45),
  },
];
