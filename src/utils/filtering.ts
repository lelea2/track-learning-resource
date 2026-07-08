import type { ArticleSource, Difficulty, LearningFocus, LearningRow, Priority, StudyStatus } from '../types';

export interface RowFilters {
  status: StudyStatus | 'All';
  topic: LearningFocus | 'All';
  difficulty: Difficulty | 'All';
  priority: Priority | 'All';
  source: ArticleSource | 'All';
  search: string;
}

export const DEFAULT_FILTERS: RowFilters = {
  status: 'All',
  topic: 'All',
  difficulty: 'All',
  priority: 'All',
  source: 'All',
  search: '',
};

export function filterRows(rows: LearningRow[], filters: RowFilters): LearningRow[] {
  const search = filters.search.trim().toLowerCase();

  return rows.filter(
    (row) =>
      (filters.status === 'All' || row.status === filters.status) &&
      (filters.topic === 'All' || row.topic === filters.topic) &&
      (filters.difficulty === 'All' || row.difficulty === filters.difficulty) &&
      (filters.priority === 'All' || row.priority === filters.priority) &&
      (filters.source === 'All' || row.source === filters.source) &&
      (search === '' || row.title.toLowerCase().includes(search)),
  );
}
