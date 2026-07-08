import type { LearningRow } from '../types';

export function makeRow(overrides: Partial<LearningRow> = {}): LearningRow {
  return {
    id: 'id-1',
    title: 'Title',
    source: 'Manual',
    url: '',
    topic: 'typescript',
    difficulty: 'Beginner',
    priority: 'Low',
    status: 'To Read',
    estimatedTime: 10,
    interviewRelevance: 50,
    keyTakeaway: '',
    nextAction: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
