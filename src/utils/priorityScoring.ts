import type { Difficulty, LearningFocus, Priority } from '../types';

const SYSTEM_DESIGN_TOPICS: LearningFocus[] = [
  'ai-coding-agents',
  'frontend-system-design',
];

/**
 * Deterministic priority heuristic standing in for an LLM relevance judgment.
 * Interview relevance dominates the score; advanced difficulty and
 * high-signal topics for this Airtable-style interview nudge it up further.
 */
export function scorePriority(input: {
  interviewRelevance: number;
  difficulty: Difficulty;
  topic: LearningFocus;
}): Priority {
  let score = input.interviewRelevance;

  if (input.difficulty === 'Advanced') score += 10;
  if (SYSTEM_DESIGN_TOPICS.includes(input.topic)) score += 5;

  if (score >= 80) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}
