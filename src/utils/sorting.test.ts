import { describe, expect, it } from 'vitest';
import { sortRows } from './sorting';
import { makeRow } from '../test/factories';

describe('sortRows', () => {
  const rows = [
    makeRow({ id: 'a', priority: 'Low', topic: 'typescript', estimatedTime: 30 }),
    makeRow({ id: 'b', priority: 'High', topic: 'accessibility', estimatedTime: 10 }),
    makeRow({ id: 'c', priority: 'Medium', topic: 'react-performance', estimatedTime: 20 }),
  ];

  it('returns rows unchanged when no field is set', () => {
    expect(sortRows(rows, { field: null, direction: 'asc' })).toEqual(rows);
  });

  it('sorts by priority descending (High first) by default direction', () => {
    const result = sortRows(rows, { field: 'priority', direction: 'desc' });
    expect(result.map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts by priority ascending (Low first)', () => {
    const result = sortRows(rows, { field: 'priority', direction: 'asc' });
    expect(result.map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });

  it('sorts by estimatedTime ascending', () => {
    const result = sortRows(rows, { field: 'estimatedTime', direction: 'asc' });
    expect(result.map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts by topic alphabetically', () => {
    const result = sortRows(rows, { field: 'topic', direction: 'asc' });
    expect(result.map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the input array', () => {
    const original = [...rows];
    sortRows(rows, { field: 'priority', direction: 'asc' });
    expect(rows).toEqual(original);
  });
});
