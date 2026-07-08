import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterRows } from './filtering';
import { makeRow } from '../test/factories';

describe('filterRows', () => {
  const rows = [
    makeRow({
      id: 'a',
      status: 'To Read',
      topic: 'typescript',
      title: 'TypeScript Generics',
      difficulty: 'Intermediate',
      priority: 'Medium',
      source: 'DEV.to',
    }),
    makeRow({
      id: 'b',
      status: 'Done',
      topic: 'accessibility',
      title: 'Accessible Modals',
      difficulty: 'Beginner',
      priority: 'Low',
      source: 'Medium',
    }),
    makeRow({
      id: 'c',
      status: 'Reading',
      topic: 'typescript',
      title: 'Type-safe Emitters',
      difficulty: 'Advanced',
      priority: 'High',
      source: 'Hacker News',
    }),
  ];

  it('returns all rows when filters are "All" and search is empty', () => {
    expect(filterRows(rows, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it('filters by status', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, status: 'Done' });
    expect(result.map((r) => r.id)).toEqual(['b']);
  });

  it('filters by topic', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, topic: 'typescript' });
    expect(result.map((r) => r.id)).toEqual(['a', 'c']);
  });

  it('filters by difficulty', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, difficulty: 'Advanced' });
    expect(result.map((r) => r.id)).toEqual(['c']);
  });

  it('filters by priority', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, priority: 'Low' });
    expect(result.map((r) => r.id)).toEqual(['b']);
  });

  it('filters by source', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, source: 'Hacker News' });
    expect(result.map((r) => r.id)).toEqual(['c']);
  });

  it('combines status and topic filters', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, status: 'Reading', topic: 'typescript' });
    expect(result.map((r) => r.id)).toEqual(['c']);
  });

  it('filters by title search, case-insensitively', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, search: 'type' });
    expect(result.map((r) => r.id).sort()).toEqual(['a', 'c']);
  });

  it('trims whitespace from the search term', () => {
    const result = filterRows(rows, { ...DEFAULT_FILTERS, search: '  accessible  ' });
    expect(result.map((r) => r.id)).toEqual(['b']);
  });

  it('combines every filter at once', () => {
    const result = filterRows(rows, {
      status: 'Reading',
      topic: 'typescript',
      difficulty: 'Advanced',
      priority: 'High',
      source: 'Hacker News',
      search: 'emitters',
    });
    expect(result.map((r) => r.id)).toEqual(['c']);
  });
});
