import type { LearningRow } from '../../src/types';

export interface ArticleRepository {
  list(): Promise<LearningRow[]>;
  get(id: string): Promise<LearningRow | null>;
  create(row: LearningRow): Promise<LearningRow>;
  update(id: string, patch: Partial<LearningRow>): Promise<LearningRow | null>;
  delete(id: string): Promise<boolean>;
}
