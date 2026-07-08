import { describe, expect, it } from 'vitest';
import { generateStudyPlan } from './studyPlan';
import { makeRow } from '../test/factories';

describe('generateStudyPlan', () => {
  it('picks a high-priority row, a practical-coding row, and a system-design row', () => {
    const rows = [
      makeRow({ id: 'high', priority: 'High', topic: 'accessibility', estimatedTime: 15 }),
      makeRow({ id: 'coding', priority: 'Medium', topic: 'react-performance', estimatedTime: 20 }),
      makeRow({
        id: 'design',
        priority: 'Low',
        topic: 'frontend-system-design',
        estimatedTime: 30,
      }),
    ];

    const plan = generateStudyPlan(rows);
    expect(plan.highPriority?.id).toBe('high');
    expect(plan.practicalCoding?.id).toBe('coding');
    expect(plan.leadershipSystemDesign?.id).toBe('design');
    expect(plan.totalEstimatedMinutes).toBe(65);
  });

  it('never picks the same row twice for two slots', () => {
    const rows = [
      makeRow({ id: 'only', priority: 'High', topic: 'react-performance', estimatedTime: 10 }),
    ];

    const plan = generateStudyPlan(rows);
    const picks = [plan.highPriority, plan.practicalCoding, plan.leadershipSystemDesign].filter(
      Boolean,
    );
    const uniqueIds = new Set(picks.map((row) => row!.id));
    expect(uniqueIds.size).toBe(picks.length);
  });

  it('excludes Done rows when incomplete rows exist', () => {
    const rows = [
      makeRow({ id: 'done', priority: 'High', status: 'Done', topic: 'typescript' }),
      makeRow({ id: 'todo', priority: 'High', status: 'To Read', topic: 'typescript' }),
    ];

    const plan = generateStudyPlan(rows);
    expect(plan.highPriority?.id).toBe('todo');
  });

  it('returns nulls without throwing on an empty dataset', () => {
    const plan = generateStudyPlan([]);
    expect(plan).toEqual({
      highPriority: null,
      practicalCoding: null,
      leadershipSystemDesign: null,
      totalEstimatedMinutes: 0,
    });
  });
});
