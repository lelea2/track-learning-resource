import type { ArticleSource, LearningFocus } from '../../src/types';

export interface RawSuggestion {
  title: string;
  url: string;
  source: ArticleSource;
}

/**
 * Canned per-focus "search results" standing in for Hacker News top/best
 * stories, DEV.to tag queries, and Medium RSS. Each item is intentionally
 * only a title + url + source — the rest of the row is filled in by
 * parseArticleInput, same as a real fetch would hand raw results to the
 * content parser.
 */
export const SUGGESTION_SOURCES: Record<LearningFocus, RawSuggestion[]> = {
  'react-performance': [
    {
      title: 'Profiling React Renders with the DevTools Flamegraph',
      url: 'https://dev.to/some-author/profiling-react-renders-a1b2',
      source: 'DEV.to',
    },
    {
      title: 'Show HN: A visual diff tool for React re-renders',
      url: 'https://news.ycombinator.com/item?id=39820001',
      source: 'Hacker News',
    },
    {
      title: 'useMemo Is Not a Performance Hook',
      url: 'https://dev.to/some-author/usememo-is-not-a-performance-hook-c3d4',
      source: 'DEV.to',
    },
    {
      title: 'Virtualizing Large Lists Without Killing Scroll Feel',
      url: 'https://medium.com/@some-author/virtualizing-large-lists-e5f6',
      source: 'Medium',
    },
  ],
  'frontend-system-design': [
    {
      title: 'Designing a Notification System for the Frontend',
      url: 'https://dev.to/some-author/designing-notification-system-g7h8',
      source: 'DEV.to',
    },
    {
      title: 'Ask HN: How do you structure state across microfrontends?',
      url: 'https://news.ycombinator.com/item?id=39820123',
      source: 'Hacker News',
    },
    {
      title: 'Caching Strategies for Client-Rendered Dashboards',
      url: 'https://medium.com/@some-author/caching-strategies-i9j0',
      source: 'Medium',
    },
    {
      title: 'A Practical Guide to RSC Boundaries',
      url: 'https://dev.to/some-author/rsc-boundaries-k1l2',
      source: 'DEV.to',
    },
  ],
  typescript: [
    {
      title: 'Branded Types for Safer IDs in TypeScript',
      url: 'https://dev.to/some-author/branded-types-m3n4',
      source: 'DEV.to',
    },
    {
      title: 'Show HN: A type-safe router for React built on template literals',
      url: 'https://news.ycombinator.com/item?id=39820456',
      source: 'Hacker News',
    },
    {
      title: 'Narrowing Discriminated Unions Without Type Guards',
      url: 'https://medium.com/@some-author/narrowing-unions-o5p6',
      source: 'Medium',
    },
    {
      title: 'The TypeScript Generics Cheat Sheet I Wish I Had',
      url: 'https://dev.to/some-author/generics-cheat-sheet-q7r8',
      source: 'DEV.to',
    },
  ],
  'ai-coding-agents': [
    {
      title: 'How Coding Agents Decide What to Read Next',
      url: 'https://dev.to/some-author/how-coding-agents-decide-s9t0',
      source: 'DEV.to',
    },
    {
      title: 'Show HN: An open-source agent harness for terminal coding tasks',
      url: 'https://news.ycombinator.com/item?id=39820789',
      source: 'Hacker News',
    },
    {
      title: 'Prompt Caching and Tool-Call Ordering, Explained',
      url: 'https://medium.com/@some-author/prompt-caching-tool-calls-u1v2',
      source: 'Medium',
    },
    {
      title: 'Grading Agent Output Like a Code Reviewer',
      url: 'https://dev.to/some-author/grading-agent-output-w3x4',
      source: 'DEV.to',
    },
  ],
  accessibility: [
    {
      title: 'Focus Management Patterns Beyond the Obvious',
      url: 'https://dev.to/some-author/focus-management-y5z6',
      source: 'DEV.to',
    },
    {
      title: 'Ask HN: Best resources for learning ARIA in depth?',
      url: 'https://news.ycombinator.com/item?id=39821012',
      source: 'Hacker News',
    },
    {
      title: 'Screen Reader Testing Without a Screen Reader Habit',
      url: 'https://medium.com/@some-author/screen-reader-testing-a7b8',
      source: 'Medium',
    },
    {
      title: 'Keyboard-First Data Grids: Lessons from Airtable and Sheets',
      url: 'https://dev.to/some-author/keyboard-first-data-grids-c9d0',
      source: 'DEV.to',
    },
  ],
  'airtable-data-modeling': [
    {
      title: 'Rollups vs Lookups: When to Use Which',
      url: 'https://dev.to/some-author/rollups-vs-lookups-e1f2',
      source: 'DEV.to',
    },
    {
      title: 'Show HN: A schema designer for spreadsheet-style databases',
      url: 'https://news.ycombinator.com/item?id=39821345',
      source: 'Hacker News',
    },
    {
      title: 'Modeling Many-to-Many Without a Junction Table Headache',
      url: 'https://medium.com/@some-author/modeling-many-to-many-g3h4',
      source: 'Medium',
    },
    {
      title: 'Formula Fields Under the Hood: Dependency Graphs',
      url: 'https://dev.to/some-author/formula-fields-dependency-graphs-i5j6',
      source: 'DEV.to',
    },
  ],
};
