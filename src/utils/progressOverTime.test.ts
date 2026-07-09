import { describe, expect, it } from 'vitest';
import { computeDailyProgress } from './progressOverTime';
import { makeRow } from '../test/factories';

const NOW = new Date('2026-01-15T12:00:00.000Z');

describe('computeDailyProgress', () => {
  it('returns one bucket per day, oldest first, ending on "now"', () => {
    const result = computeDailyProgress([], 14, NOW);
    expect(result).toHaveLength(14);
    expect(result[0].date).toBe('2026-01-02');
    expect(result[13].date).toBe('2026-01-15');
  });

  it('counts a Done row on the day it was marked done', () => {
    const rows = [
      makeRow({
        id: 'a',
        status: 'Done',
        createdAt: '2026-01-01T00:00:00.000Z',
        statusUpdatedAt: '2026-01-10T09:00:00.000Z',
      }),
    ];
    const result = computeDailyProgress(rows, 14, NOW);
    const bucket = result.find((b) => b.date === '2026-01-10');
    expect(bucket).toEqual({ date: '2026-01-10', completed: 1, progressed: 0 });
  });

  it('counts a non-Done status change as progressed, not completed', () => {
    const rows = [
      makeRow({
        id: 'a',
        status: 'Reading',
        createdAt: '2026-01-01T00:00:00.000Z',
        statusUpdatedAt: '2026-01-12T09:00:00.000Z',
      }),
    ];
    const result = computeDailyProgress(rows, 14, NOW);
    const bucket = result.find((b) => b.date === '2026-01-12');
    expect(bucket).toEqual({ date: '2026-01-12', completed: 0, progressed: 1 });
  });

  it('excludes rows that never changed status', () => {
    const rows = [
      makeRow({
        id: 'a',
        status: 'To Read',
        createdAt: '2026-01-10T00:00:00.000Z',
        statusUpdatedAt: '2026-01-10T00:00:00.000Z',
      }),
    ];
    const result = computeDailyProgress(rows, 14, NOW);
    expect(result.every((b) => b.completed === 0 && b.progressed === 0)).toBe(true);
  });

  it('excludes status changes outside the window', () => {
    const rows = [
      makeRow({
        id: 'a',
        status: 'Done',
        createdAt: '2025-12-01T00:00:00.000Z',
        statusUpdatedAt: '2025-12-20T00:00:00.000Z', // more than 14 days before NOW
      }),
    ];
    const result = computeDailyProgress(rows, 14, NOW);
    expect(result.every((b) => b.completed === 0 && b.progressed === 0)).toBe(true);
  });

  it('aggregates multiple rows landing on the same day', () => {
    const rows = [
      makeRow({
        id: 'a',
        status: 'Done',
        createdAt: '2026-01-01T00:00:00.000Z',
        statusUpdatedAt: '2026-01-05T08:00:00.000Z',
      }),
      makeRow({
        id: 'b',
        status: 'Done',
        createdAt: '2026-01-01T00:00:00.000Z',
        statusUpdatedAt: '2026-01-05T20:00:00.000Z',
      }),
      makeRow({
        id: 'c',
        status: 'Practiced',
        createdAt: '2026-01-01T00:00:00.000Z',
        statusUpdatedAt: '2026-01-05T12:00:00.000Z',
      }),
    ];
    const result = computeDailyProgress(rows, 14, NOW);
    const bucket = result.find((b) => b.date === '2026-01-05');
    expect(bucket).toEqual({ date: '2026-01-05', completed: 2, progressed: 1 });
  });
});
