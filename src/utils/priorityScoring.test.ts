import { describe, expect, it } from 'vitest';
import { scorePriority } from './priorityScoring';

describe('scorePriority', () => {
  it('returns High for strong interview relevance', () => {
    expect(
      scorePriority({ interviewRelevance: 85, difficulty: 'Intermediate', topic: 'typescript' }),
    ).toBe('High');
  });

  it('returns Low for weak interview relevance on a non-boosted topic', () => {
    expect(
      scorePriority({ interviewRelevance: 30, difficulty: 'Beginner', topic: 'accessibility' }),
    ).toBe('Low');
  });

  it('returns Medium in the middle band', () => {
    expect(
      scorePriority({ interviewRelevance: 60, difficulty: 'Beginner', topic: 'typescript' }),
    ).toBe('Medium');
  });

  it('bumps a borderline score up via Advanced difficulty', () => {
    expect(
      scorePriority({ interviewRelevance: 72, difficulty: 'Advanced', topic: 'typescript' }),
    ).toBe('High');
    expect(
      scorePriority({ interviewRelevance: 72, difficulty: 'Beginner', topic: 'typescript' }),
    ).toBe('Medium');
  });

  it('bumps a borderline score up for system-design-relevant topics', () => {
    expect(
      scorePriority({
        interviewRelevance: 77,
        difficulty: 'Beginner',
        topic: 'frontend-system-design',
      }),
    ).toBe('High');
    expect(
      scorePriority({ interviewRelevance: 77, difficulty: 'Beginner', topic: 'typescript' }),
    ).toBe('Medium');
  });
});
