import type { LearningFocus, LearningRow, StudyPlan } from '../types';

const PRACTICAL_CODING_TOPICS: LearningFocus[] = [
  'react-performance',
  'typescript',
  'ai-coding-agents',
];

const LEADERSHIP_SYSTEM_DESIGN_TOPICS: LearningFocus[] = [
  'frontend-system-design',
  'airtable-data-modeling',
];

const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 } as const;

function byPriorityThenRelevance(a: LearningRow, b: LearningRow): number {
  const priorityDiff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
  if (priorityDiff !== 0) return priorityDiff;
  return b.interviewRelevance - a.interviewRelevance;
}

function pickBest(
  pool: LearningRow[],
  usedIds: Set<string>,
  predicate: (row: LearningRow) => boolean = () => true,
): LearningRow | null {
  const candidates = pool
    .filter((row) => !usedIds.has(row.id) && predicate(row))
    .sort(byPriorityThenRelevance);
  return candidates[0] ?? null;
}

/**
 * Picks today's 3-item study plan: one high-priority article, one practical
 * coding topic, one leadership/system-design topic. Prefers unfinished rows;
 * falls back to any remaining row for a slot if nothing matches that
 * category, so the panel stays useful on small/lopsided datasets instead of
 * leaving a slot empty.
 */
export function generateStudyPlan(rows: LearningRow[]): StudyPlan {
  const incomplete = rows.filter((row) => row.status !== 'Done');
  const pool = incomplete.length > 0 ? incomplete : rows;
  const usedIds = new Set<string>();

  const highPriority = pickBest(pool, usedIds, (row) => row.priority === 'High');
  if (highPriority) usedIds.add(highPriority.id);

  let practicalCoding = pickBest(pool, usedIds, (row) =>
    PRACTICAL_CODING_TOPICS.includes(row.topic),
  );
  if (!practicalCoding) practicalCoding = pickBest(pool, usedIds);
  if (practicalCoding) usedIds.add(practicalCoding.id);

  let leadershipSystemDesign = pickBest(pool, usedIds, (row) =>
    LEADERSHIP_SYSTEM_DESIGN_TOPICS.includes(row.topic),
  );
  if (!leadershipSystemDesign) leadershipSystemDesign = pickBest(pool, usedIds);
  if (leadershipSystemDesign) usedIds.add(leadershipSystemDesign.id);

  const picks = [highPriority, practicalCoding, leadershipSystemDesign].filter(
    (row): row is LearningRow => row !== null,
  );
  const totalEstimatedMinutes = picks.reduce((sum, row) => sum + row.estimatedTime, 0);

  return { highPriority, practicalCoding, leadershipSystemDesign, totalEstimatedMinutes };
}
