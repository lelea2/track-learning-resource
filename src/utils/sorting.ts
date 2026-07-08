import type { LearningRow, Priority } from '../types';

export type SortField = 'priority' | 'topic' | 'estimatedTime';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortState = { field: null, direction: 'desc' };

const PRIORITY_RANK: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };

export function sortRows(rows: LearningRow[], sort: SortState): LearningRow[] {
  if (!sort.field) return rows;

  const field = sort.field;
  const sorted = [...rows].sort((a, b) => {
    let comparison = 0;
    if (field === 'priority') {
      comparison = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    } else if (field === 'topic') {
      comparison = a.topic.localeCompare(b.topic);
    } else if (field === 'estimatedTime') {
      comparison = a.estimatedTime - b.estimatedTime;
    }
    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
