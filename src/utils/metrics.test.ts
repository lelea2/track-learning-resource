import { describe, expect, it } from 'vitest';
import { computeMetrics } from './metrics';
import { makeRow } from '../test/factories';
import type { StudyPlan } from '../types';

describe('computeMetrics', () => {
  const rows = [
    makeRow({ id: 'a', status: 'To Read', priority: 'High' }),
    makeRow({ id: 'b', status: 'Done', priority: 'Low' }),
    makeRow({ id: 'c', status: 'To Read', priority: 'Medium' }),
    makeRow({ id: 'd', status: 'Done', priority: 'High' }),
  ];

  const studyPlan: StudyPlan = {
    highPriority: null,
    practicalCoding: null,
    leadershipSystemDesign: null,
    totalEstimatedMinutes: 45,
  };

  it('tallies totals, statuses, and priority', () => {
    const metrics = computeMetrics(rows, studyPlan);
    expect(metrics).toEqual({
      total: 4,
      toReadCount: 2,
      completedCount: 2,
      highPriorityCount: 2,
      estimatedStudyMinutesToday: 45,
    });
  });
});
